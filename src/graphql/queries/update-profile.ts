import { gql } from 'graphql-request';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($data: ProfileUpdateData!, $id: String!) {
    updateProfile(data: $data, identifier: {id: $id}) {
      user {
        id
        contacts(type: PHONE) {
          confirmationCodeSent
          value
        }
        profile {
          id
        }
      }
    }
  }
`;
