import { useEffect } from 'react'
import { interpolateColor, Layout, useSharedValue, useAnimatedStyle, withSpring, } from 'react-native-reanimated'

export const SPRING_CONFIG = {
  SLOW: {
    // 500ms
    IN: {
      stiffness: 115.2,
      damping: 24,
      mass: 1,
    },
    // 800ms
    OUT: {
      stiffness: 45,
      damping: 15,
      mass: 1,
    }
  },
  MEDIUM: {
    // 375ms
    IN: {
      stiffness: 204.8,
      damping: 32,
      mass: 1,
    },
    // 600ms
    OUT: {
      stiffness: 80,
      damping: 20,
      mass: 1,
    }
  },
  FAST: {
    // 300ms
    IN: {
      stiffness: 320,
      damping: 40,
      mass: 1,
    },
    // 500ms
    OUT: {
      stiffness: 155.2,
      damping: 24,
      mass: 1,
    }
  },
}

export const LIST_ITEM_ANIMATION = Layout.springify()
  .stiffness(SPRING_CONFIG.MEDIUM.OUT.stiffness)
  .damping(SPRING_CONFIG.MEDIUM.OUT.damping)
  .mass(SPRING_CONFIG.MEDIUM.OUT.mass)

export function useColorAnimation({
  value,
  params,
  speed = 'FAST',
}) {
  const animated = useSharedValue(value)
  const animatedStyle = useAnimatedStyle(() => {
    let interpolationResult = {}
    params.forEach(param => {
      interpolationResult[param.styleProp] = interpolateColor(
        animated.value,
        param.inputRange,
        param.outputRange,
        'RGB'
      )
    })
    return interpolationResult
  }, [animated])

  useEffect(() => {
    animated.value = withSpring(
      value,
      SPRING_CONFIG[speed][value ? 'OUT' : 'IN']
    )
  }, [animated, value])

  return animatedStyle
}
