import { useMemo, useState, } from 'react';
import { StyleSheet, Text, View, } from "react-native";
import Animated, { CurvedTransition, Easing, FadeIn, FadeOut, Keyframe, } from 'react-native-reanimated';
import DraggableFlatList, { OpacityDecorator } from 'react-native-draggable-flatlist';

import Button from "./Button";
import RankCandidate from './RankCandidate'
import { LIST_ITEM_ANIMATION, SPRING_CONFIG } from '../utils/animation'

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
    [rankedValues])

  const highestRank = useMemo(() =>
    Math.min(...rankedValues),
    [rankedValues])

  const rankedItemIndices = useMemo(() => ({
    list: listItems.map((item, index) => item.rank !== null ? index : -1),
    lowestRank: listItems.findIndex(item => item.rank === lowestRank),
    highestRank: listItems.findIndex(item => item.rank === highestRank),
    first: listItems.findIndex(item => item.rank !== null),
    last: listItems.findLastIndex(item => item.rank !== null),
  }), [highestRank, listItems, lowestRank])

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
        // TODO: scroll to candidate if offscreen
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
          // TODO: scroll to candidate if offscreen
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
        // TODO: scroll to candidate if offscreen
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
        // TODO: scroll to candidate if offscreen
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
  //    'rank': use actions.raiseRank/lowerRank; arrows disabled on highest- and lowest-ranked listItems, as well as unranked candidates
  //    'none': don't change candidate positions in list; otherwise the same as 'rank'
  const [moveType, setMoveType] = useState('rank')

  const handleDragEnd = ({ data }) => {
    setListItems(data)
    const newListItems = data.map((item, index) =>
      Object.assign({}, item, { rank: listItems[index].rank })
    )
    setListItems(newListItems)
  }

  const [placeholderRank, setPlaceholderRank] = useState(null)

  const handlePlaceholderIndexChange = (index) => {
    setPlaceholderRank(listItems[index].rank ?? currentRank)
  }

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
            <Button
              label="Ranking"
              action={() => setMoveType('rank')}
              containerStyles={[
                styles.outline,
                moveType === 'rank' && styles.active,
              ]}
              textStyles={[
                styles.buttonText,
                styles.buttonOutlineText,
                moveType === 'rank' && styles.active,
              ]}
            />
            <Button
              label="Position"
              action={() => setMoveType('index')}
              containerStyles={[
                styles.outline,
                moveType === 'index' && styles.active,
              ]}
              textStyles={[
                styles.buttonText,
                styles.buttonOutlineText,
                moveType === 'index' && styles.active,
              ]}
            />
          </Animated.View>
        )}

        <Animated.View
          style={styles.menuRow}
          layout={CurvedTransition}
          itemLayoutAnimation={LIST_ITEM_ANIMATION}
        >
          <Button
            label="Put in rank order"
            action={actions.sort}
          />
        </Animated.View>
      </View>

      <DraggableFlatList
        layout={CurvedTransition}
        enableLayoutAnimationExperimental={true}
        itemLayoutAnimation={LIST_ITEM_ANIMATION}
        containerStyle={styles.candidateListContainer}
        contentContainerStyle={styles.candidateList}
        data={listItems}
        keyExtractor={(item) => item.id}
        animationConfig={SPRING_CONFIG.SLOW.IN}
        onDragBegin={handlePlaceholderIndexChange}
        onDragEnd={handleDragEnd}
        onPlaceholderIndexChange={handlePlaceholderIndexChange}
        renderPlaceholder={() => (
          <View style={styles.candidatePlaceholder}>
            <View style={styles.candidateRankPlaceholder}>
              <Text style={styles.candidatePlaceholderText}>
                {placeholderRank + 1}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ drag, getIndex, isActive, item, }) => (
          <OpacityDecorator>
            <RankCandidate
              key={item.id}
              actions={actions}
              candidate={item}
              candidatesLength={listItems.length}
              contractIsMet={contractIsMet}
              currentRank={currentRank}
              disabled={isActive}
              handleLongPress={drag}
              index={getIndex()}
              moveType={moveType}
              rankedItemIndices={rankedItemIndices}
            />
          </OpacityDecorator>
        )}
      />
      {/* FYI If we don't want drag-drop, the below should suffice */}
      {/* <Animated.FlatList
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
      /> */}
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
  candidateListContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  candidateList: {
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 32,
  },
  candidatePlaceholder: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 12,
    backgroundColor: '#CCC',
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
    marginRight: 90,
    marginBottom: 10,
    marginLeft: 32,
  },
  candidateRankPlaceholder: {
    width: 60,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidatePlaceholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#CCC',
  }
})
