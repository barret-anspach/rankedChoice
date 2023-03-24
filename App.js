import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import CandidateList from './components/CandidateList';
import Header from './components/Header';
import Footer from './components/Footer';

const candidates = [
  {
    id: 'candidate-0',
    name: 'Bandit Heeler',
    party: 'Bluey Party',
    rank: null,
  },
  {
    id: 'candidate-1',
    name: 'Egon Targarian',
    party: 'House of Dragons Party',
    rank: null,
  },
  {
    id: 'candidate-2',
    name: 'Jennifer Coolidge',
    party: 'White Lotus Party',
    rank: null,
  },
  {
    id: 'candidate-3',
    name: 'Cat Stevens',
    party: 'Harold and Maude Party',
    rank: null,
  },
  {
    id: 'candidate-4',
    name: 'Lucille Bluth',
    party: 'Arrested Development Party',
    rank: null,
  }
]

/* 
controlType ['adjudicated', 'uncontrolled']
`controlType` tells the system whether or not to automate/make decisions for the voter.

Examples:
  - Raise/lower rank
    - "adjudicated"
        If there's a candidate already set to the new rank, swap ranks.
    - "uncontrolled"
        If there's a candidate already set to the new rank, unrank the
        matching candidate, and set current candidate to new rank.
        --> Or would you disallow raising or lowering rank until the
            candidate at that rank value were deselected?

  - Deselect candidate
    - "adjudicated"
        If there are ranks lower than the deselected candidate's rank,
        raise the lower ranks by 1; `currentRank` is next lowest rank.
    - "uncontrolled"
        `currentRank` is set to deselected candidate's rank value or
        highest unset rank value, whichever is the smaller number
        (remember: for a rank-4 contest, 1 is high, 4 is low).

*/
          
const controlType = 'adjudicated'

export default function App() {
  return (
    <View style={styles.container}>
      <Header />
      <CandidateList
        candidates={candidates}
        maxCandidates={3}
        controlType={controlType}
      />
      <StatusBar style="auto" />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEE',
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
  },
});
