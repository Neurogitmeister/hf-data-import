import axios, { AxiosResponse } from 'axios';
import jsonpAdapter from 'axios-jsonp';
import ru from 'convert-layout/ru';
import { Subtype } from './subtype';

const config = {
  apiUrl: 'https://kladr-api.ru/api.php',
  apiToken: '',
};

export const defaultKladrObjectNoParents = {
  region: {
    id: '5400000000000',
    name: 'Новосибирская',
    type: 'Область',
    typeShort: 'обл',
  },
  city: {
    id: '',
    name: 'Новосибирск',
    type: 'Город',
    typeShort: 'г',
  },
};

export const defaultKladrQueryOptions = {
  regionId: defaultKladrObjectNoParents.region.id,
  cityId: defaultKladrObjectNoParents.city.id,
  limit: 20,
  withParent: true,
};

export enum KladrEntityTypes {
  region = 'region',
  district = 'district',
  city = 'city',
  street = 'street',
  building = 'building',
  streetOwner = 'streetOwner',
}

export enum KladrEntitySearchTypes {
  region = 'region',
  district = 'district',
  city = 'city',
  street = 'street',
  building = 'building',
}

export type KladrEntityType = keyof typeof KladrEntityTypes;
export type KladrEntitySearchType = keyof typeof KladrEntitySearchTypes;

export type KladrObjectNoParents<T extends KladrEntityType> = {
  id: string;
  name: string;
  type: string;
  typeShort: string;
  contentType: T;
  zip: T extends 'building' ? number : number | null;
};

export type KladrObject<T extends KladrEntityType> = KladrObjectNoParents<T> & {
  parents: KladrObjectNoParents<KladrEntityType>[];
};

export type KladrSearchResultObject<T extends KladrEntitySearchType> = KladrObject<T>;

export const findKladrObjectParent = <T extends KladrEntityType>(
  object: KladrObject<KladrEntityType>,
  type: T,
) => {
  return object.parents.find(it => it.contentType === type) as KladrObject<T> | undefined;
};

type KladrResponse<T extends KladrEntitySearchType> = KladrSearchResultObject<T>[];

export interface OptionsData<T extends KladrEntitySearchType> {
  values: KladrResponse<T>;
  query: string;
}

export type Address = {
  region?: KladrObject<'region'>;
  city?: KladrObject<'city'>;
  street?: KladrObject<'street'>;
  building?: KladrObject<'building'>;
};

export interface KladrOptions {
  regionId?: string | null;
  cityId?: string | null;
  streetId?: string | null;
  buildingId?: string | null;
  withParent?: boolean | null;
  limit?: number | null;
}

export interface KladrFields extends KladrOptions {
  contentType: KladrEntitySearchType;
  query: string;
}

export const kladrRequestSender = async <T extends KladrEntitySearchType>(
  args: KladrFields,
): Promise<KladrResponse<T>> => {
  let response: AxiosResponse<{ result: KladrResponse<T> }>;
  Object.keys(args)
    .filter(key => args[key] === undefined)
    .forEach(key => delete args[key]);
  try {
    response = await axios.get(config.apiUrl, {
      params: args,
      adapter: jsonpAdapter,
    });
  } catch (error) {
    throw Error('Kladr request failed with error: ' + error.message);
  }
  if (response.status !== 200) {
    throw Error('Kladr request failed with status: ' + response.status);
  }
  return response.data.result.filter(item => item.id !== 'Free');
};

export const kladrRequestBuilder = async <T extends KladrEntitySearchType>(
  query: string,
  contentType: T,
  options?: KladrOptions,
) => {
  let allowRequest = true;
  const normalizedOptions = options ?? {};

  options &&
    Object.keys(options).forEach(key => {
      if (options[key] === null) {
        normalizedOptions[key] = undefined;
      } else if (options[key] === undefined) {
        delete normalizedOptions[key];
      }
    });

  switch (contentType) {
    case 'city': {
      normalizedOptions.cityId = undefined;
      normalizedOptions.buildingId = undefined;
      normalizedOptions.streetId = undefined;
      break;
    }
    case 'street': {
      if (normalizedOptions.cityId) {
        normalizedOptions.streetId = undefined;
        normalizedOptions.buildingId = undefined;
      } else {
        allowRequest = false;
      }
      break;
    }
    case 'building': {
      if (normalizedOptions.cityId && normalizedOptions.streetId) {
        normalizedOptions.buildingId = undefined;
      } else {
        allowRequest = false;
      }
      break;
    }
  }

  if (allowRequest) {
    const res = await kladrRequestSender<typeof contentType>({
      ...defaultKladrQueryOptions,
      ...normalizedOptions,
      contentType,
      query,
    });
    return mapResultsToOptions<typeof contentType>(query, res);
  }
};

export type KladrFormKey = Subtype<KladrEntitySearchType, 'city' | 'street' | 'building'>;

type FormAddressTemplate = {
  [key in KladrFormKey]?: unknown;
};

export interface KladrFormFields extends FormAddressTemplate {
  city?: Address['city'];
  street?: Address['street'];
  building?: Address['building'];
}

export interface KladrErrors extends FormAddressTemplate {
  city?: { message: string };
  street?: { message: string };
  building?: { message: string };
}

export const kladrMatchError: KladrErrors = {
  building: { message: '' },
  street: { message: '' },
};

export enum KladrChildSearchType {
  district = 'street',
  region = 'city',
  city = 'street',
  street = 'building',
}

export const getDisplayedKladrParent = <T extends KladrEntitySearchType>(
  kladrObj: KladrSearchResultObject<T>,
) => {
  switch (kladrObj.contentType) {
    case 'street':
      return kladrObj.contentType === 'street'
        ? kladrObj.parents?.find(it => it.contentType === 'streetOwner')
        : undefined;
    default:
      return undefined;
  }
};

export const mismatch = <T extends KladrEntitySearchType>(
  child?: KladrObject<T>,
  parent?: KladrObject<KladrEntityType>,
) => {
  if (child && parent) {
    const parentId = child.parents?.find(it => it.contentType === parent.contentType)?.id;
    return parentId !== parent.id;
  }
  return false;
};

export const syncWithKladr = async (
  city?: Address['city'],
  street?: Address['street'],
  building?: Address['building'],
) => {
  const updates: KladrFormFields = {};
  const options: {
    street?: OptionsData<'street'>;
    building?: OptionsData<'building'>;
  } = {};
  const errors: KladrErrors = {};

  const cityId = city?.id;
  const streetId = street?.id;

  if (mismatch(street, city)) {
    if (street) {
      const streets = await kladrRequestBuilder(street.name, 'street', { cityId });
      const foundStreet = streets?.values.find(
        it => it.typeShort + it.name === street.typeShort + street.name,
      );
      if (foundStreet) {
        updates.street = foundStreet;

        if (building) {
          const buildings = await kladrRequestBuilder(building.name, 'building', {
            cityId,
            streetId: updates.street.id,
          });
          const foundBuilding = buildings?.values.find(
            it => it.typeShort + it.name === building.typeShort + building.name,
          );

          if (foundBuilding) {
            updates.building = foundBuilding;
          } else {
            errors.building = kladrMatchError.building;
          }
        }
      } else {
        errors.street = kladrMatchError.street;
      }
    }
  } else if (mismatch(building, street)) {
    if (building) {
      const buildings = await kladrRequestBuilder(building.name, 'building', {
        cityId,
        streetId,
      });
      const foundBuilding = buildings?.values.find(
        it => it.typeShort + it.name === building.typeShort + building.name,
      );

      if (foundBuilding) {
        updates.building = foundBuilding;
      } else {
        errors.building = kladrMatchError.building;
      }
    }
  }
  return { updates, errors, options };
};

const filterKladrKeys = <T extends KladrEntitySearchType>(
  res: KladrResponse<T>,
): KladrResponse<T> =>
  res.map(it => ({
    id: it.id,
    name: it.name,
    type: it.type,
    typeShort: it.typeShort,
    contentType: it.contentType,
    zip: it.zip,
    parents: it.parents.map(par => ({
      id: par.id,
      name: par.name,
      type: par.type,
      typeShort: par.typeShort,
      contentType: par.contentType,
      zip: par.zip,
    })),
  }));

export const mapResultsToOptions = <T extends KladrEntitySearchType>(
  query: string,
  res: KladrResponse<T>,
): OptionsData<T> | undefined =>
  res.length
    ? {
        values: filterKladrKeys(res),
        query: ru.fromEn(query).replace(/\./g, '/'),
      }
    : undefined;

export default kladrRequestBuilder;
