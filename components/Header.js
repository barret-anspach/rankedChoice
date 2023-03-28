import { StyleSheet, Text, View, } from 'react-native'

export default function Header({ maxCandidates }) {
  return (
    <View style={styles.contestHeader}>
      <Text style={styles.contestNumber}>Contest 1 of 3</Text>
      <Text style={styles.contestHeading}>President of the United States</Text>
      <Text style={styles.contestInstructions}>Tap your top {maxCandidates} candidates in order of preference. Tap again to deselect. Use arrows to raise or lower a candidate's rank. Long tap to adjust candidate ranks.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  contestHeader: {
    padding: 12,
    paddingTop: 24,
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
