import { gql } from 'apollo-boost';

export const CountersQuery = gql`
  query {
    counters
  }
`;

export interface ICountersQueryResponse {
  counters: number[]
}

export const SaveCountersMutation = gql`
  mutation saveCounters( $counters: [Int]! ) {
    saveCounters( counters: $counters )
  }
`;

export interface ISaveCountersVariables {
  counters: number[]
}
