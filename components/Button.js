import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, } from 'react-native'
import Animated, { interpolate, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

import { SPRING_CONFIG } from '../utils/animation'

export default function Button({ action, label, containerStyles = [], textStyles = [], }) {
  const [pressed, setPressed] = useState(false)
  const animatedPressed = useSharedValue(pressed)
  const animatedPressedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedPressed.value, [0, 1], [1.0, 0.72]),
  }), [])

  useEffect(() => {
    animatedPressed.value = withSpring(pressed, SPRING_CONFIG.FAST.IN)
  }, [animatedPressed, pressed])

  function handlePress(e) {
    setPressed((value) => !value)
  }

  return (
    <Animated.View
      style={[styles.button, ...containerStyles, animatedPressedStyle]}
    >
      <Pressable
        style={styles.pressable}
        onPress={() => action()}
        onPressIn={handlePress}
        onPressOut={handlePress}
      >
        <Text style={[styles.label, ...textStyles]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingRight: 20,
    paddingBottom: 12,
    paddingLeft: 20,
  },
  label: {
    width: '100%',
    color: '#EEE',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },
})