import { gql } from 'graphql-request';

export const SIGN_UP = gql`
  mutation SignUp($data: UserCreateData!) {
    signUp(data: $data) {
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
      jwt
    }
  }
`;
