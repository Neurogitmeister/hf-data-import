import { gql } from 'graphql-request';

export const UPDATE_CLIENT_ADDRESS = gql`
  mutation UpdateClientAddress($data: ClientAddressUpdateData!, $id: String!) {
    updateClientAddress(data: $data, identifier: {id: $id}) {
      id
    }
  }
`;
