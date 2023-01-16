import { gql } from '@apollo/client';

export const TRANSACTION_DETAIL = gql`
  query ($hash: String) {
    transactions(where: { transaction_hash: { _eq: $hash } }) {
      block_timestamp
      transaction_hash
    }
  }
`;
