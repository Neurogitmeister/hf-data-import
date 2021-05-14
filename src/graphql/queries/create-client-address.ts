import { gql } from 'graphql-request';

export const CREATE_CLIENT_ADDRESS = gql`
  mutation CreateClientAddress($data: ClientAddressCreateData!) {
    createClientAddress(data: $data) {
      id
    }
  }
`;
