import { useMemo, useState, } from 'react';
import { Button, Pressable, StyleSheet, Text, View, } from "react-native";
import Animated, { CurvedTransition } from 'react-native-reanimated';

import RankCandidate from "./RankCandidate";
import { LIST_ITEM_ANIMATION } from '../utils/animation'

export default function CandidateList({ candidates, controlType = 'adjudicated', maxCandidates, }) {
  const [listItems, setListItems] = useState(candidates)
  // const _rankedValues = useMemo(() =>
  //   listItems
  //     .filter(i => i.rank !== null)
  //     .map(i => i.rank),
  //   [listItems])
  // const _unrankedValues = useMemo(() =>
  //   Array(maxCandidates)
  //     .fill()
  //     .map((_, i) => i)
  //     .filter(r => !_rankedValues.includes(r)),
  //   [_rankedValues, maxCandidates])
  // const memoizedCurrentRank = useMemo(() =>
  //   _unrankedValues.length === 0
  //     ? maxCandidates
  //     : Math.min(..._unrankedValues),
  //   [_unrankedValues, maxCandidates])
  
  // console.log(_rankedValues, _unrankedValues, memoizedCurrentRank)

  const [currentRank, setCurrentRank] = useState(0)
  // moveType: ['index', 'rank', 'none]
  // Describes the type of candidate sorting mechanism in use
  //    'index': use actions.moveUp/moveDown; arrows disabled on first and last listItems, and on unranked candidates
  //    'rank': use actions.raiseRank/lowerRank; arrows disabled on highest- and lowest-ranked listItems, and on unranked candidates
  //    'none': don't change candidate positions in list; otherwise the same as 'rank'
  const [moveType, setMoveType] = useState('rank')

  const contractIsMet = useMemo(() => currentRank === maxCandidates, [currentRank, maxCandidates])
  const lowestRank = useMemo(() => Math.max(...listItems.map(item => item.rank)), [listItems])
  const highestRank = useMemo(() => Math.min(...listItems.map(item => item.rank)), [listItems])
  const rankedItemIndices = useMemo(() => ({
    list: listItems.map((item, index) => item.rank !== null ? index : -1),
    lowestRank: listItems.findIndex(item => item.rank === lowestRank),
    highestRank: listItems.findIndex(item => item.rank === highestRank),
    first: listItems.findIndex(item => item.rank !== null),
    last: listItems.findLastIndex(item => item.rank !== null),
  }), [listItems])
  const isSorted = useMemo(() =>
    // returns true when all contiguous items' ranks match their index
    listItems.filter(i => i.rank !== null).every((item, index) => item.rank === index),
    [listItems, rankedItemIndices]
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
          const currentItem = listItems[index]
          const rankedItemAfterIndex = listItems[nextClosestRankedItemIndex]
          let newListItems = [...listItems]
          newListItems[index] = { ...rankedItemAfterIndex, rank, }
          newListItems[nextClosestRankedItemIndex] = { ...currentItem, rank: rankedItemAfterIndex.rank, }
          setListItems(newListItems)
        }
      }
    },
    raiseRank(index, rank) {
      if (rank > 0) {
        const currentItem = listItems[index]
        // This breaks if there's a gap in ranked values, e.g. `[0, 2, 3, 4]` and `item.rank` === 2
        const nextHighestRankedItemIndex = listItems.findIndex(item => item.rank === rank - 1)
        let newListItems = [...listItems]
        newListItems[index] = { ...listItems[nextHighestRankedItemIndex], rank, }
        newListItems[nextHighestRankedItemIndex] = { ...currentItem, rank: rank - 1, }
        setListItems(newListItems)
      }
    },
    lowerRank(index, rank) {
      if (rank < lowestRank) {
        const currentItem = listItems[index]
        const nextLowestRankedItemIndex = listItems.findIndex(item => item.rank === rank + 1)
        let newListItems = [...listItems]
        newListItems[index] = { ...listItems[nextLowestRankedItemIndex], rank, }
        newListItems[nextLowestRankedItemIndex] = { ...currentItem, rank: rank + 1, }
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
      const rankedValues = newListItems
        .filter(i => i.rank !== null)
        .map(i => i.rank)
      const unsetRankValues =
        Array(maxCandidates)
          .fill()
          .map((_, i) => i)
          .filter(r => !rankedValues.includes(r))
      setCurrentRank(
        unsetRankValues.length === 0
          ? maxCandidates
          : Math.min(...unsetRankValues)
      )
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

  return (
    <View
      style={styles.wrapper}
      contentContainerStyle={ styles.candidateList}
    >
      <View style={styles.menu}>
        <View style={[styles.menuRow, isSorted && styles.menuHidden]}>
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
        </View>

        <View style={styles.menuRow}>
          <Pressable
            style={styles.button}
            onPress={() => actions.sort()}
          >
            <Text style={[styles.buttonText, styles.buttonDefaultText]}>
              Put in rank order
            </Text>
          </Pressable>
        </View>
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
    </View>
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
  menuHidden: {
    display: 'none',
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
    color: 'white',
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonDefaultText: {
    color: 'white',
  },
  buttonOutlineText: {
    color: 'black',
  },
  candidateList: {
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    padding: 32,
  },
})
