import { StyleSheet, Text, View, } from 'react-native'

export default function Header() {
  return (
    <View style={styles.contestHeader}>
      <Text style={styles.contestNumber}>Contest 1 of 3</Text>
      <Text style={styles.contestHeading}>President of the United States</Text>
      <Text style={styles.contestInstructions}>Rank your top 3 candidates. Tap in order of preference. Tap again to deselect. Use arrows to raise or lower a candidate's rank.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  contestHeader: {
    padding: 12,
    paddingTop: 60,
    backgroundColor: '#BBB',
    borderBottomColor: '#111',
    borderBottomWidth: 1,
  },
  contestNumber: {
    fontSize: 16,
    marginBottom: 8,
  },
  contestHeading: {
    fontSize: 24,
    marginBottom: 8,
  },
  contestInstructions: {
    fontSize: 14,
  },
})
