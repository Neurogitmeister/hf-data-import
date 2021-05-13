import { gql } from 'graphql-request';

export const GET_OR_CREATE_CLIENT_ADDRESS = gql`
  mutation GetOrCreateClientAddress($data: ClientAddressUidInput!) {
    getOrCreateClientAddressBy(uid: $data) {
      id
    }
  }
`;
