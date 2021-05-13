import { KladrErrors } from './utils-kladr';
import {
  BuildingAddressDeliveryData,
  GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_geoPointOptions as GeoPointOption,
  GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_location as AddressLocation,
  JobStatus
} from '../graphql/types'

export enum DeliveryPriceStatus {
  loading = 'loading',
  unset = 'unset',
  calculated = 'calculated',
}

type DeliveryAddressErrors = KladrErrors & {
  geoPoint?: { message: string };
};

type DeliveryAddressData = {
  buildingAddressId: string;
  location: AddressLocation;
};

export type DeliveryAddress = {
  data?: DeliveryAddressData;
  errors?: DeliveryAddressErrors;
  geoPointOptions?: GeoPointOption[];
  priceStatus: DeliveryPriceStatus;
};

export const getDeliveryAddressData = (
  buildingAddress: BuildingAddressDeliveryData['buildingAddress'],
): DeliveryAddress['data'] => {
  if (buildingAddress && buildingAddress.deliveryPrice && buildingAddress.location) {
    return {
      buildingAddressId: buildingAddress.id,
      location: buildingAddress.location,
    };
  }
};

export const getDeliveryAddressErrors = (
  buildingAddress: BuildingAddressDeliveryData['buildingAddress'],
): DeliveryAddressErrors | undefined => {
  const errors: DeliveryAddressErrors = {};

  if (buildingAddress) {
    if (buildingAddress.invalidPart) {
      switch (buildingAddress.invalidPart) {
        case 'city': {
          errors.city = { message: '' };
          break;
        }
        case 'street': {
          errors.street = { message: '' };
          break;
        }
        case 'building': {
          errors.building = { message: '' };
          break;
        }
      }
    }
    if (!buildingAddress.location) {
      errors.geoPoint = { message: '' };
    }
  }

  if (Object.keys(errors).length) {
    return errors;
  }
};

export const getDeliveryPriceStatus = (
  buildingAddress: BuildingAddressDeliveryData['buildingAddress'],
) => {
  const jobStatus = buildingAddress?.processJobStatus ?? undefined;
  let priceStatus = DeliveryPriceStatus.unset;
  if (jobStatus) {
    switch (jobStatus) {
      case JobStatus.Completed: {
        priceStatus = buildingAddress?.deliveryPrice
          ? DeliveryPriceStatus.calculated
          : DeliveryPriceStatus.unset;
        break;
      }
      case JobStatus.Failed: {
        priceStatus = DeliveryPriceStatus.unset;
        break;
      }
      case JobStatus.Running: {
        priceStatus = DeliveryPriceStatus.loading;
        break;
      }
    }
  }
  return priceStatus;
};

export const isValidationFinished = (
  buildingAddress: BuildingAddressDeliveryData['buildingAddress'],
): boolean => {
  const status = buildingAddress?.processJobStatus;
  if (status) {
    switch (status) {
      case JobStatus.Completed: {
        return true;
      }
      case JobStatus.Failed: {
        return true;
      }
    }
  }
  return false;
};
