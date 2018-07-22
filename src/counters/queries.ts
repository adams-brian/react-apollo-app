import { gql } from 'apollo-boost';
import { MutationFunc } from 'react-apollo';

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
export interface ISaveCountersResponse {
  saveCounters: number[]
}
export type TSaveCountersFunc = MutationFunc<ISaveCountersResponse, ISaveCountersVariables>;
