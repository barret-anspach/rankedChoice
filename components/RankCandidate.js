import { useEffect, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View, } from 'react-native'

import Animated, { CurvedTransition, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring, } from 'react-native-reanimated'

import { CANDIDATE } from './../utils/dimensions'
import { SPRING_CONFIG } from './../utils/animation'

export default function RankCandidate({
  actions,
  candidate,
  contractIsMet,
  currentRank,
  index,
  moveType,
  rankedItemIndices,
}) {
  const isRanked = useMemo(() => ({
    not: candidate.rank === null,
    highest: index === rankedItemIndices.highestRank,
    lowest: index === rankedItemIndices.lowestRank,
    first: index === rankedItemIndices.first,
    last: index === rankedItemIndices.last,
  }), [candidate.rank, index, rankedItemIndices])

  const should = useMemo(() => ({
    disableTap: contractIsMet && isRanked.not,
    hideArrowUp:
      (moveType === 'rank' ? isRanked.highest : isRanked.first)
      || (isRanked.not),
    hideArrowDown:
      (moveType === 'rank' ? isRanked.lowest : isRanked.last)
      || (isRanked.not),
  }), [contractIsMet, isRanked, moveType])

  function handleArrowUp({ index, rank }) {
    !should.hideArrowUp && actions[moveType === 'rank' ? 'raiseRank' : 'moveUp'](index, rank)
  }

  function handleArrowDown({ index, rank }) {
    !should.hideArrowDown && actions[moveType === 'rank' ? 'lowerRank' : 'moveDown'](index, rank)
  }
  
  const animatedRank = useSharedValue(candidate.rank)

  useEffect(() => {
    animatedRank.value = withSpring(candidate.rank, SPRING_CONFIG.ELEMENT)
  }, [animatedRank, candidate.rank])

  const candidateAndRankStyles = 
    should.disableTap
    ? [styles.candidateAndRank, styles.disabled]
    : styles.candidateAndRank
  const upArrowStyles =
    should.hideArrowUp
    ? [styles.control, styles.disabled]
    : styles.control
  const downArrowStyles =
    should.hideArrowDown
    ? [styles.control, styles.disabled]
      : styles.control
  
  return (
    <View
      style={styles.wrapper}
    >
      <Pressable
        style={[candidateAndRankStyles, !isRanked.not && styles.selected]}
        onPress={() => actions.select(index)}
      >
        <Animated.View
          layout={CurvedTransition}
          style={[
            styles.rank,
            isRanked.not && styles.unranked,
            should.disableTap && styles.disabled,
            isRanked.not && should.disableTap && styles.unrankedAndDisabled
          ]}
        >
          <Animated.Text
            layout={CurvedTransition}
            entering={FadeIn}
            exiting={FadeOut}
            style={[styles.rankText, isRanked.not && styles.unranked, should.disableTap && styles.disabled]}
          >
            {isRanked.not
              ? !contractIsMet ? currentRank + 1 : '—'
              : candidate.rank + 1}
          </Animated.Text>
        </Animated.View>

        <View style={styles.candidate}>
          <Text style={styles.fieldValue}>
            {candidate.name}
          </Text>
          {candidate.party && (
            <Text style={styles.fieldLabel}>
              {candidate.party}
            </Text>)
          }
        </View>
      </Pressable>

      <View style={styles.controls}>
        <Pressable 
          style={upArrowStyles}
          onPress={() => handleArrowUp({ index, rank: candidate.rank })}
        >
          <Text style={styles.controlIcon}>⬆︎</Text>
        </Pressable>

        <Pressable 
          style={[downArrowStyles, styles.controlDown]}
          onPress={() => handleArrowDown({ index, rank: candidate.rank })}
        >
          <Text style={styles.controlIcon}>⬇︎</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  candidateAndRank: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: CANDIDATE.HEIGHT,
    padding: 12,
    backgroundColor: '#EEE',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
  },
  candidate: {
    flexBasis: 100,
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    marginLeft: 10,
  },
  selected: {
    backgroundColor: '#FFF',
  },
  fieldValue: {
    fontSize: 19,
    fontWeight: 500,
  },
  fieldLabel: {
    fontSize: 17,
  },
  rank: {
    alignSelf: 'stretch',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
    width: 60,
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#111',
    borderStyle: 'solid',
  },
  unranked: {
    backgroundColor: '#EEE',
    color: '#111',
    borderStyle: 'dashed',
  },
  unrankedAndDisabled: {
    borderWidth: 0,
  },
  rankLabel: {
    alignSelf: 'flex-start',
    width: '100%',
    fontSize: 12,
    fontWeight: 700,
    color: '#EEE',
    textAlign: 'center',
  },
  rankText: {
    width: '100%',
    fontSize: 24,
    fontWeight: 600,
    color: '#EEE',
    textAlign: 'center',
  },
  controls: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: 10,
  },
  control: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderColor: '#111',
    borderWidth: 2,
    borderRadius: 4,
    padding: 12,
  },
  controlDown: {
    // marginTop: 10,
  },
  controlIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  disabled: {
    color: '#333',
    backgroundColor: '#CCC',
    borderColor: '#333',
    pointerEvents: 'none',
    userSelect: 'none',
  }
})