import { StyleSheet, Text, View, } from 'react-native'

export default function Header() {
  return (
    <View style={styles.contestHeader}>
      <Text style={styles.contestHeading}>President of the United States</Text>
      <Text style={styles.contestInstructions}>Rank your top 3 candidates. Tap in order of preference. Tap again to deselect. Use arrows to raise or lower a candidate's rank.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  contestHeader: {
    padding: 12,
    paddingTop: 60,
    backgroundColor: '#BBBBBB',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
  },
  contestHeading: {
    fontSize: 24,
  },
  contestInstructions: {
    fontSize: 14,
  },
})
