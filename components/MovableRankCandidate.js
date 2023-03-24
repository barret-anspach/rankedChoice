import { useCallback, useState } from "react";
import { useWindowDimensions } from "react-native";
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, { cancelAnimation, runOnJS, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming, } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CANDIDATE } from "../utils/dimensions";
import RankCandidate from "./RankCandidate";
import { objectMove } from "../utils/list";

export default function MovableRankCandidate({
  actions,
  candidate,
  candidateCount,
  contractIsMet,
  currentRank,
  id,
  index,
  lowestRank,
  moveType,
  positions,
  rankedItemIndices,
  scrollY,
}) {
  const dimensions = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [moving, setMoving] = useState(false)
  const top = useSharedValue(positions.value[id] * CANDIDATE.HEIGHT)

  useAnimatedReaction(
    () => positions.value[id],
    (currentPosition, previousPosition) => {
      if (currentPosition !== previousPosition && !moving) {
        top.value = withSpring(currentPosition * CANDIDATE.HEIGHT)
      }
    }
  )

  const handleActive = useCallback((event) => {
      const positionY = event.absoluteY + scrollY.value
      if (positionY <= scrollY.value + CANDIDATE.HEIGHT) {
        scrollY.value = withTiming(0, { duration: 1500, })
      } else if (positionY >= scrollY.value + dimensions.height - CANDIDATE.HEIGHT) {
        const contentHeight = candidateCount * CANDIDATE.HEIGHT
        const containerHeight = dimensions.height - insets.top - insets.bottom
        const maxScroll = contentHeight - containerHeight
        scrollY.value = withTiming(maxScroll, { duration: 1500, })
      } else {
        cancelAnimation(scrollY)
      }
      top.value = withTiming(positionY - CANDIDATE.HEIGHT, { duration: 16, })
      const newPosition = Math.max(Math.floor(positionY / CANDIDATE.HEIGHT), Math.min(0, candidateCount - 1))
      if (newPosition !== positions.value[id]) {
        positions.value = objectMove(
          positions.value,
          positions.value[id],
          newPosition,
        )
      }    
  }, [candidateCount, dimensions, insets, scrollY])

  const gestureHandler = useAnimatedGestureHandler({
    onStart() {
      runOnJS(setMoving)(true)
    },
    onActive(event) {
      runOnJS(handleActive)(event)
    },
    onFinish() {
      top.value = positions.value[id] * CANDIDATE.HEIGHT
      runOnJS(setMoving)(false)
    }
  })

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: top.value,
    zIndex: moving ? 1 : 0,
  }), [moving])

  return (
    <Animated.View style={animatedStyle}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View>
          <RankCandidate
            actions={actions}
            candidate={candidate}
            contractIsMet={contractIsMet}
            currentRank={currentRank}
            index={index}
            lowestRank={lowestRank}
            moveType={moveType}
            rankedItemIndices={rankedItemIndices}
          />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  )
}