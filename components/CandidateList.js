import { useEffect, useMemo, useState, } from 'react';
import { Pressable, StyleSheet, Text, View, } from "react-native";
import Animated, { CurvedTransition, Keyframe, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, Easing } from 'react-native-reanimated';

import RankCandidate from "./RankCandidate";
import { LIST_ITEM_ANIMATION } from '../utils/animation'

export default function CandidateList({ candidates, controlType = 'adjudicated', maxCandidates, }) {
  const [listItems, setListItems] = useState(candidates)

  const rankedValues = useMemo(() =>
    listItems
      .filter(i => i.rank !== null)
      .map(i => i.rank)
      .sort(),
    [listItems])

  const unsetRankValues = useMemo(() =>
    Array(maxCandidates)
      .fill()
      .map((_, i) => i)
      .filter(r => !rankedValues.includes(r))
      .sort(),
    [rankedValues, maxCandidates])

  const currentRank = useMemo(() =>
    unsetRankValues.length === 0
      ? maxCandidates
      : Math.min(...unsetRankValues),
    [unsetRankValues, maxCandidates])
  
  const contractIsMet = useMemo(() =>
    currentRank === maxCandidates,
    [currentRank, maxCandidates])
  
  const lowestRank = useMemo(() =>
    Math.max(...rankedValues),
    [listItems, rankedValues])

  const highestRank = useMemo(() =>
    Math.min(...rankedValues),
    [listItems, rankedValues])

  const rankedItemIndices = useMemo(() => ({
    list: listItems.map((item, index) => item.rank !== null ? index : -1),
    lowestRank: listItems.findIndex(item => item.rank === lowestRank),
    highestRank: listItems.findIndex(item => item.rank === highestRank),
    first: listItems.findIndex(item => item.rank !== null),
    last: listItems.findLastIndex(item => item.rank !== null),
  }), [highestRank, listItems, lowestRank])

  const animated = useSharedValue(0)

  const isSorted = useMemo(() => 
    listItems
      .filter(i => i.rank !== null)
      .every((item, index) => item.rank === index),
    [listItems]
  )

  const actions = {
    moveUp(index, rank) {
      const previousClosestRankedItemIndex = listItems
        .slice(0, index)
        .findLastIndex(i => i.rank !== null)
      if (index > 0 && previousClosestRankedItemIndex > -1) {
        const currentItem = listItems[index]
        const rankedItemBeforeIndex = listItems[previousClosestRankedItemIndex]
        let newListItems = [...listItems]
        newListItems[index] = { ...rankedItemBeforeIndex, rank, }
        newListItems[previousClosestRankedItemIndex] = { ...currentItem, rank: rankedItemBeforeIndex.rank, }
        setListItems(newListItems)
      }
    },
    moveDown(index, rank) {
      if (index < (listItems.length - 1)) {
        const hasRankedItemAfterIndex = listItems
          .slice(index + 1)
          .findIndex(i => i.rank !== null)
        const nextClosestRankedItemIndex = hasRankedItemAfterIndex > -1
          ? hasRankedItemAfterIndex + index + 1
          : -1
        if (nextClosestRankedItemIndex > -1) {
          const rankedItemAfterIndex = listItems[nextClosestRankedItemIndex]
          let newListItems = [...listItems]
          newListItems[index] = { ...rankedItemAfterIndex, rank, }
          newListItems[nextClosestRankedItemIndex] = { ...listItems[index], rank: rankedItemAfterIndex.rank, }
          setListItems(newListItems)
        }
      }
    },
    raiseRank(index, rank) {
      if (rank > 0) {
        const nextHighestRankedItemRank = rankedValues[rankedValues.indexOf(rank) - 1]
        const nextHighestRankedItemIndex = listItems.findIndex(item => item.rank === nextHighestRankedItemRank)
        let newListItems = [...listItems]
        newListItems[index] = { ...listItems[nextHighestRankedItemIndex], rank, }
        newListItems[nextHighestRankedItemIndex] = { ...listItems[index], rank: nextHighestRankedItemRank, }
        setListItems(newListItems)
      }
    },
    lowerRank(index, rank) {
      if (rank < lowestRank) {
        const nextLowestRankedItemRank = rankedValues[rankedValues.indexOf(rank) + 1]
        const nextLowestRankedItemIndex = listItems.findIndex(item => item.rank === nextLowestRankedItemRank)
        let newListItems = [...listItems]
        newListItems[index] = { ...listItems[nextLowestRankedItemIndex], rank, }
        newListItems[nextLowestRankedItemIndex] = { ...listItems[index], rank: nextLowestRankedItemRank, }
        setListItems(newListItems)
      }
    },
    select(index) {
      let newListItems = [...listItems]
      if (listItems[index].rank === null) {
        if (currentRank < maxCandidates) {
          newListItems[index] = { ...newListItems[index], rank: currentRank, }
        }
      } else {
        newListItems = newListItems.map((item, listItemIndex) => {
          let newRank
          if (listItemIndex === index) {
            newRank = null
          } else {
            newRank = item.rank
          }
          return {
            ...item,
            rank: newRank,
          }
        })
        newListItems[index] = { ...newListItems[index], rank: null, }
      }
      setListItems(newListItems)
    },
    sort() {
      setListItems([...listItems].sort((a, b) => {
        if (a.rank !== null && b.rank !== null) {
          return a.rank - b.rank
        } else if (a.rank === null && b.rank !== null) {
          return 1
        } else if (a.rank !== null && b.rank === null) {
          return -1
        } else if (a.rank === null && b.rank === null) {
          return 0
        }
      }))
    }
  }

  const menuRowEnteringAnimation = new Keyframe({
    0: {
      transform: [{ translateY: -20 }],
      opacity: 0,
      easing: Easing.inOut,
    },
    100: {
      transform: [{ translateY: 0 }],
      opacity: 1,
    },
  }).duration(300)

  const menuRowExitingAnimation = new Keyframe({
    0: {
      transform: [{ translateY: 0 }],
      opacity: 1,
      easing: Easing.inOut,
    },
    100: {
      transform: [{ translateY: -20 }],
      opacity: 0,
    },
  }).duration(300)

  // moveType: ['index', 'rank', 'none]
  // Describes the type of candidate sorting mechanism in use
  //    'index': use actions.moveUp/moveDown; arrows disabled on first and last listItems, and on unranked candidates
  //    'rank': use actions.raiseRank/lowerRank; arrows disabled on highest- and lowest-ranked listItems, and on unranked candidates
  //    'none': don't change candidate positions in list; otherwise the same as 'rank'
  const [moveType, setMoveType] = useState('rank')

  return (
    <Animated.View
      style={styles.wrapper}
      layout={CurvedTransition}
      itemLayoutAnimation={LIST_ITEM_ANIMATION}
      contentContainerStyle={ styles.candidateList}
    >
      <View 
        style={styles.menu}
        layout={CurvedTransition}
        itemLayoutAnimation={LIST_ITEM_ANIMATION}
      >
        {!isSorted && (
          <Animated.View
            style={[styles.menuRow]}
            itemLayoutAnimation={LIST_ITEM_ANIMATION}
            entering={menuRowEnteringAnimation}
            exiting={menuRowExitingAnimation}
          >
            <Text style={[styles.buttonText]}>Update rank by</Text>
            <Pressable
              style={[styles.button, styles.outline, moveType === 'rank' && styles.active]}
              onPress={() => setMoveType('rank')}>
              <Text style={[styles.buttonText, styles.buttonOutlineText, moveType === 'rank' && styles.active]}>
                Ranking
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.outline, moveType === 'index' && styles.active]}
              onPress={() => setMoveType('index')}>
              <Text style={[styles.buttonText, styles.buttonOutlineText, moveType === 'index' && styles.active]}>
                Position
              </Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          style={styles.menuRow}
          layout={CurvedTransition}
          itemLayoutAnimation={LIST_ITEM_ANIMATION}
        >
          <Pressable
            style={styles.button}
            onPress={() => actions.sort()}
          >
            <Text style={[styles.buttonText, styles.buttonDefaultText]}>
              Put in rank order
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.FlatList
        layout={CurvedTransition}
        itemLayoutAnimation={LIST_ITEM_ANIMATION}
        contentContainerStyle={styles.candidateList}
        data={listItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RankCandidate
            key={item.id}
            actions={actions}
            candidate={item}
            contractIsMet={contractIsMet}
            currentRank={currentRank}
            index={index}
            lowestRank={lowestRank}
            moveType={moveType}
            rankedItemIndices={rankedItemIndices}
          />
        )}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  menu: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    borderBottomStyle: 'solid',
    gap: 10,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  button: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#111',
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#111',
    borderWidth: 2,
  },
  active: {
    backgroundColor: '#111',
    color: '#EEE',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonDefaultText: {
    color: '#EEE',
  },
  buttonOutlineText: {
    color: '#111',
  },
  candidateList: {
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: '#EEE',
    padding: 32,
  },
})
