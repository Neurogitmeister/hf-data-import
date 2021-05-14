import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { request } from 'graphql-request'
import { BUILDING_ADDRESS_DELIVERY_DATA } from './graphql/queries/address-delivery-data';
import { CLIENT_ADDRESSES } from './graphql/queries/client-addresses';
import { CREATE_CLIENT_ADDRESS } from './graphql/queries/create-client-address'
import { GET_OR_CREATE_BUILDING_ADDRESS } from './graphql/queries/get-or-create-building-address'
import { SIGN_UP } from './graphql/queries/sign-up'
import { UPDATE_PROFILE } from './graphql/queries/update-profile';
import { UPDATE_CLIENT_ADDRESS } from './graphql/queries/update-client-address';
import {
  BuildingAddressDeliveryData,
  BuildingAddressDeliveryDataVariables,
  BuildingAddressDeliveryData_buildingAddress,
  BuildingAddressUidInput,
  BuildingAddressUidPart,
  ClientAddressCreateData,
  GetOrCreateBuildingAddress,
  GetOrCreateBuildingAddressVariables,
  CreateClientAddress,
  CreateClientAddressVariables,
  ClientAddresses,
  ClientAddressesVariables,
  ProfileUpdateData,
  SignUp,
  SignUpVariables,
  UpdateProfile,
  UpdateProfileVariables,
  UserCreateData,
  UpdateClientAddress,
  UpdateClientAddressVariables
} from './graphql/types';
import { ClientAddressInput } from './utils/api';
import { ClientDataFields, ClientDataRow, parseColumns } from './utils/parsing';

const CSV_PATH = path.resolve('./data/client-data.csv');
const API_URL = 'https://mono-happyfood-api-staging.herokuapp.com/api/graphql'

const POLLING_TIMEOUT = 60 * 1000;
const POLLING_INTERVAL = 500;

async function createAddress(buildingAddress: BuildingAddressUidInput, clientAddress: ClientAddressInput, userId: string ) {
  const result: { error?: string } = {};

  try {
    const res = await request<GetOrCreateBuildingAddress, GetOrCreateBuildingAddressVariables>(API_URL, GET_OR_CREATE_BUILDING_ADDRESS, {
      buildingAddress
    });
    const id = res.getOrCreateBuildingAddressBy.id;
    const addresses = await request<ClientAddresses, ClientAddressesVariables>(API_URL, CLIENT_ADDRESSES, {
      floor: clientAddress.floor,
      unit: clientAddress.unit,
      entrance: clientAddress.entrance,
    })
    if (addresses.clientAddresses.length) {
      await request<UpdateClientAddress, UpdateClientAddressVariables>(API_URL, UPDATE_CLIENT_ADDRESS, {       
        id: addresses.clientAddresses[0].id,
        data: {
          comment: clientAddress.comment,
        }
      })
    } else {
      await request<CreateClientAddress, CreateClientAddressVariables>(API_URL, CREATE_CLIENT_ADDRESS, {
        data: {...clientAddress, buildingAddressIdentifier: {id}, userIdentifier: {id: userId}}
      })
    }
  } catch(err) {
    result.error = err.message;
  }
  return result;
}



async function createUser(userData: UserCreateData, profileData: ProfileUpdateData) {
  const result: {id?: string, error?: string} = {};
  try {
    const res = await request<SignUp, SignUpVariables>(API_URL, SIGN_UP, {
      data: userData
    })
    result.id = res.signUp.user.id;
    await request<UpdateProfile, UpdateProfileVariables>(API_URL, UPDATE_PROFILE, {
      id: result.id,
      data: profileData,
    })
  } catch (err) {
    result.error = err.message;
  }
  return result;

}


async function processRows(rows: ClientDataRow[]) {
  console.log(rows);
  const parsed = parseColumns(rows);
  parsed.forEach(it => console.log(it, it.addresses));
  /*
  const errTableUsers: string[] = [];
  let rowNum = 0;
  for (const data of parsed) {
    const row = data;
    const userRes = await createUser(data.user);
    if (userRes.id){
      const errTableAddrRows: string[] = [];
      const addrRes = await Promise.all(data.addresses.map(address =>
        createAddress(address.buildingAddress, address.clientAddress, userRes.id)
      ))
      addrRes.forEach((res, i) => {
        if(res.error) {
          errTableAddrRows.push(`"${rows[rowNum].addresses[i]}","${JSON.stringify(data.addresses[i])}","${res.error}"`);
        }
      })
      errTableAddrRows.join('\n');
      if (errTableAddrRows.length) {
        errTableUsers.push(`"${rows[rowNum].phone}","${rows[rowNum].name}","${errTableAddrRows}"`)
      }
    }
    rowNum++;
  }
  */

}

const rows: ClientDataRow[] = [];
fs.createReadStream(CSV_PATH)
  .pipe(csv({
    headers: [
      ClientDataFields.phone,
      ClientDataFields.name,
      ClientDataFields.comment,
      ClientDataFields.addresses
    ]
  }))
  .on('data', (data) => rows.push(data))
  .on('end', () => processRows(rows));

console.log('pipe end');
