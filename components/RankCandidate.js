import { useEffect, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View, } from 'react-native'
import Animated, {
  CurvedTransition,
  interpolateColor,
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated'

import { CANDIDATE } from './../utils/dimensions'
import { SPRING_CONFIG, useColorAnimation } from './../utils/animation'

export default function RankCandidate({
  actions,
  candidate,
  contractIsMet,
  currentRank,
  disabled,
  handleLongPress,
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

  // Rank container
  
  const animatedRank = useSharedValue(isRanked.not)
  const animatedRankStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animatedRank.value,
      [1, 0],
      ['rgba(17, 17, 17, 0)', 'rgba(17, 17, 17, 1)'],
      'RGB'
    ),
    borderStyle: animatedRank.value ? 'dashed' : 'solid',
  }), [animatedRank])
  const rankStyles = [
    styles.rank,
    animatedRankStyle,
  ]
  useEffect(() => {
    animatedRank.value = withSpring(
      isRanked.not,
      SPRING_CONFIG.MEDIUM[isRanked.not ? 'OUT' : 'IN']
    )
  }, [animatedRank, candidate.rank, isRanked.not])

  // Rank Text

  const rankTextStyles = [
    styles.rankText,
    useColorAnimation({
      value: isRanked.not,
      params: [
        { styleProp: 'color', inputRange: [1, 0], outputRange: ['rgb(17, 17, 17)', 'rgb(238, 238, 238)'], }
      ],
      speed: 'FAST',
    }),
  ]

  // Arrow Up

  const upArrowStyles = [
    styles.control,
    useColorAnimation({
      value: should.hideArrowUp,
      params: [
        { styleProp: 'backgroundColor', inputRange: [1, 0], outputRange: ['rgb(204,204,204)', 'rgb(255,255,255)'], }
      ],
      speed: 'FAST',
    })
  ]

  // Arrow Down

  const downArrowStyles = [
    styles.control,
    useColorAnimation({
      value: should.hideArrowDown,
      params: [
        { styleProp: 'backgroundColor', inputRange: [1, 0], outputRange: ['rgb(204,204,204)', 'rgb(255,255,255)'], }
      ],
      speed: 'FAST',
    }),
  ]


  // Candidate/Rank container

  const candidateAndRankStyles = [
    styles.candidateAndRank,
    useColorAnimation({
      value: should.disableTap,
      params: [
        { styleProp: 'backgroundColor', inputRange: [1, 0], outputRange: ['rgb(204,204,204)', 'rgb(238,238,238)'], },
        { styleProp: 'borderColor', inputRange: [1, 0], outputRange: ['rgb(51, 51, 51)', 'rgb(17, 17, 17)'], },
      ],
      speed: 'FAST',
    }),
    useColorAnimation({
      value: !isRanked.not,
      params: [
        { styleProp: 'backgroundColor', inputRange: [0, 1], outputRange: ['rgb(238, 238, 238)', 'rgb(255, 255, 255)'], }
      ],
    })
  ]

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={candidateAndRankStyles}
      >
        <Pressable
          style={styles.candidateAndRankPressable}
          onPress={() => actions.select(index)}
          onLongPress={handleLongPress}
          disabled={disabled}
        >
          <Animated.View
            layout={CurvedTransition}
            style={rankStyles}
          >
            <Animated.Text
              style={rankTextStyles}
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
      </Animated.View>

      <View style={styles.controls}>
        <Animated.View
          style={upArrowStyles}
        >
          <Pressable 
            style={styles.controlPressable}
            onPress={() => handleArrowUp({ index, rank: candidate.rank })}
          >
            <Text style={styles.controlIcon}>⬆︎</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={downArrowStyles}
        >
          <Pressable 
            style={styles.controlPressable}
            onPress={() => handleArrowDown({ index, rank: candidate.rank })}
          >
            <Text style={styles.controlIcon}>⬇︎</Text>
          </Pressable>
        </Animated.View>
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
    marginBottom: 10,
  },
  candidateAndRank: {
    flex: 1,
    minHeight: CANDIDATE.HEIGHT,
    backgroundColor: '#EEE',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#111',
  },
  candidateAndRankPressable: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
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
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderColor: '#111',
    borderWidth: 2,
    borderRadius: 4,
  },
  controlPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 12,
  },
  controlIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
})