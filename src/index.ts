import { request } from 'graphql-request'
import { GET_OR_CREATE_BUILDING_ADDRESS } from './graphql/queries/get-or-create-building-address'
import { GET_OR_CREATE_CLIENT_ADDRESS } from './graphql/queries/get-or-create-client-address'
import { SIGN_UP } from './graphql/queries/sign-up'
import {
  GetOrCreateBuildingAddress,
  GetOrCreateBuildingAddressVariables,
  GetOrCreateClientAddress,
  GetOrCreateClientAddressVariables
} from './graphql/types';

const CSV_PATH = '../data/client-data.csv'
const API_URL = 'https://mono-happyfood-api-staging.herokuapp.com/api/graphql'

async function main() {
  const res = await request<GetOrCreateBuildingAddress, GetOrCreateBuildingAddressVariables>(API_URL, GET_OR_CREATE_BUILDING_ADDRESS, {
    buildingAddress: {
      regionType: "Область",
      regionName: "Новосибирская",
      cityType: "город",
      cityName: "Новосибирск",
      streetType: "Улица",
      streetName: "Курчатова",
      buildingType: "Дом",
      buildingName: "15",
      buildingPostalCodeNumber: "630129"
    }
  });
  console.log(res.getOrCreateBuildingAddressBy.id);
}

main();
