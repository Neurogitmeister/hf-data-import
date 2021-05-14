import { gql } from 'graphql-request';

export const CLIENT_ADDRESSES = gql`
  query ClientAddresses($unit: String, $floor: String, $entrance: String) {
    clientAddresses(
      where: { unit: { eq: $unit }, floor: { eq: $floor }, entrance: { eq: $entrance } }
    ) {
      id
      floor
      entrance
    }
  }
`;
