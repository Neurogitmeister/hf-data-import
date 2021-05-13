import { gql } from 'graphql-request';
import { BUILDING_ADDRESS_DELIVERY_DATA_FRAGMENT } from './address-delivery-data';

export const GET_OR_CREATE_BUILDING_ADDRESS = gql`
  ${BUILDING_ADDRESS_DELIVERY_DATA_FRAGMENT}
  mutation GetOrCreateBuildingAddress($buildingAddress: BuildingAddressUidInput!) {
    getOrCreateBuildingAddressBy(uid: $buildingAddress) {
      ...BuildingAddressDeliveryDataFragment
    }
  }
`;
