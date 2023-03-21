import { Layout, } from 'react-native-reanimated'

export const SPRING_CONFIG = {
  ELEMENT: {
    stiffness: 80,
    damping: 20,
    mass: 1,
  }
}

export const LIST_ITEM_ANIMATION = Layout.springify()
  .mass(SPRING_CONFIG.ELEMENT.mass)
  .stiffness(SPRING_CONFIG.ELEMENT.stiffness)
  .damping(SPRING_CONFIG.ELEMENT.damping)
