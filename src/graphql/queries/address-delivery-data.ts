import { gql } from 'graphql-request';

export const BUILDING_ADDRESS_DELIVERY_DATA_FRAGMENT = gql`
  fragment BuildingAddressDeliveryDataFragment on BuildingAddress {
    id
    invalidPart
    location {
      geoPoint {
        latitude
        longitude
      }
    }
    geoPointOptions {
      longitude
      latitude
      doubtful
    }
    deliveryPrice
    processJobStatus
  }
`;

export const BUILDING_ADDRESS_DELIVERY_DATA = gql`
  ${BUILDING_ADDRESS_DELIVERY_DATA_FRAGMENT}
  query BuildingAddressDeliveryData($id: String) {
    buildingAddress(identifier: { id: $id }) {
      ...BuildingAddressDeliveryDataFragment
    }
  }
`;
