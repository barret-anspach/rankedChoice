import { StyleSheet, View, } from 'react-native'
import Button from './Button'

export default function Footer({ prevLink, nextLink }) {
  return (
    <View style={styles.contestFooter}>
      <Button label={'Previous'} action={() => {}} />
      <Button label={'Next'} action={() => {}} />
    </View>
  )
}

const styles = StyleSheet.create({
  contestFooter: {
    flexShrink: 0,
    flexGrow: 0,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
    paddingTop: 12,
    paddingRight: 32,
    paddingLeft: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DDD',
    borderTopWidth: 1,
    borderColor: '#111',
    borderStyle: 'solid',
  }
})