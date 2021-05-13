import { request } from 'graphql-request'
import { BUILDING_ADDRESS_DELIVERY_DATA } from './graphql/queries/address-delivery-data';
import { GET_OR_CREATE_BUILDING_ADDRESS } from './graphql/queries/get-or-create-building-address'
import { GET_OR_CREATE_CLIENT_ADDRESS } from './graphql/queries/get-or-create-client-address'
import { SIGN_UP } from './graphql/queries/sign-up'
import {
  BuildingAddressDeliveryData,
  BuildingAddressDeliveryDataVariables,
  BuildingAddressDeliveryData_buildingAddress,
  BuildingAddressUidInput,
  BuildingAddressUidPart,
  ClientAddressUidInput,
  GetOrCreateBuildingAddress,
  GetOrCreateBuildingAddressVariables,
  GetOrCreateClientAddress,
  GetOrCreateClientAddressVariables,
  ProfileUpdateData,
  SignUp,
  SignUpVariables,
  UpdateProfile,
  UpdateProfileVariables,
  UserCreateData
} from './graphql/types';

import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { UPDATE_PROFILE } from './graphql/queries/update-profile';

const CSV_PATH = path.resolve('./data/client-data.csv');
const API_URL = 'https://mono-happyfood-api-staging.herokuapp.com/api/graphql'

const POLLING_TIMEOUT = 60 * 1000;
const POLLING_INTERVAL = 500;

type ClientAddressInput = Omit<Omit<ClientAddressUidInput, 'buildingAddressIdentifier'>, 'userIdentifier'>

const buildingDefaults: BuildingAddressUidInput = {
  regionType: "Область",
  regionName: "Новосибирская",
  cityType: "город",
  cityName: "Новосибирск",
  streetType: "улица",
  streetName: "",
  buildingType: "дом",
  buildingName: "",
  buildingPostalCodeNumber: ""
}

const building: BuildingAddressUidInput = {
  regionType: "Область",
  regionName: "Новосибирская",
  cityType: "город",
  cityName: "Новосибирск",
  streetType: "улица",
  streetName: "Курчатова",
  buildingType: "дом",
  buildingName: "15",
  buildingPostalCodeNumber: "630129"
}

const clientAddr: ClientAddressInput = {
  floor: '3',
  unit: '2',
  entrance: '1 с улицы'
}

const userConst: UserCreateData = {
  firstName: 'Галина Матвеевна',
  lastName: 'Пёрышкина',
  contactValues: ['+79130001122']
}

type ClientDataRow = {
  name: string;
  phone: string;
  comment: string;
  addresses: string;
}

const testRow: ClientDataRow  = {
  name: 'Елена Жевтушко',
  phone: '+79130001122',
  comment: '',
  addresses: 'Республиканская 41 (/1/12) Поле 21:00 \nГоголя 180 (1-ый от арки/4/12) До 21:00 (маленький ребенок)'
}

type CreateData = {
  addresses: {
    buildingAddress: BuildingAddressUidInput,
    clientAddress: ClientAddressInput,
  }[]
  user: UserCreateData,
  profile: ProfileUpdateData,
}


async function createAddress(buildingAddress: BuildingAddressUidInput, clientAddress: ClientAddressInput, userId: string ) {
  const result: { error?: string } = {};

  try {
    const res = await request<GetOrCreateBuildingAddress, GetOrCreateBuildingAddressVariables>(API_URL, GET_OR_CREATE_BUILDING_ADDRESS, {
      buildingAddress
    });
    const id = res.getOrCreateBuildingAddressBy.id;
    await request<GetOrCreateClientAddress, GetOrCreateClientAddressVariables>(API_URL, GET_OR_CREATE_CLIENT_ADDRESS, {
      data: {...clientAddress, buildingAddressIdentifier: {id}, userIdentifier: {id: userId}}
    })
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

/**Формат: "Имя" или "Имя" и "Фамилия" и/или "(Отчество)" */
function parseUserName(userNameStr: string) {
  let user: UserCreateData = {firstName: '', lastName: ''};
    const parts = userNameStr.replace(/[' ']{1,}/g, ' ').split(' ');
    if (parts.length === 3) {
      if (parts[1].startsWith('(')) {
        user.firstName = parts[0] + ' ' + parts[1].substr(1, parts[1].length - 2);
        user.lastName = parts[2];
      } else if (parts[2].startsWith('(')) {
        user.firstName = parts[0] + ' ' + parts[2].substr(1, parts[2].length - 2);
        user.lastName = parts[1];
      }
    } else if (parts.length === 2) {
      if (parts[1].startsWith('(')) {
        user.firstName = parts[0] + ' ' + parts[1].substr(1, parts[1].length - 2);
      } else {
        user.firstName = parts[0];
        user.lastName = parts[1];
      }
    } else {
      user.firstName = parts[0];
    }
    return user;
}

const rusCapitalLetters = 'АБВГДЕЁЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
const buildingRegex = /[0-9]{1,}(\/[0-9]{1,})?/;

function parseBuildingAddress(str: string){
  console.log('\n', str);
  const result: Partial<BuildingAddressUidInput> = {};
  const cityEndIndex = str.indexOf(',');
  if ( cityEndIndex > -1) {
    const cityParts = str.substr(0, cityEndIndex - 1).split(' ');
    let nameIndexFound = false;
    for (const part of cityParts) {
      if (rusCapitalLetters.indexOf(part[0]) > -1) {
        nameIndexFound = true;
      }
      if (nameIndexFound) {
        result.cityName = result.cityName ?? '';
        result.cityName += part + ' ';
      } else {
        result.cityType = result.cityType ?? '';
        result.cityType += part + ' ';
      }
    }
    result.cityType?.trimEnd();
    result.cityName?.trimEnd();
  }
  const partsAfterCity = str.substr(cityEndIndex > -1 ? cityEndIndex : 0).split(' ');
  let nameIndexFound = false;
  let buildingIndexFound = false;
  let buildingPart = '';
  for (const part of partsAfterCity) {
   if (rusCapitalLetters.indexOf(part[0]) > -1) {
      nameIndexFound = true;
    } else if (part.match(buildingRegex)?.length) {
      buildingIndexFound = true;
    }
    if (buildingIndexFound) {
      buildingPart += part + ' ';
    } else if (nameIndexFound) {
      result.streetName = result.streetName ?? '';
      result.streetName += part + ' ';
    } else {
      result.streetType = result.streetType ?? '';
      result.streetType += part + ' ';
    } 
  }
  const buildingParts = buildingPart.trimEnd().split(' ')
  if (buildingParts.length > 1) {
    result.buildingName = buildingParts[0] + '/' + buildingParts[2];
  } else {
    result.buildingName = buildingParts[0];
  }
  // console.log(result, '\n');
  return {...buildingDefaults, ...result};
}


function parseClientAddress(str: string){
  const result: ClientAddressInput = {};
  const parts = str.split('/');
  result.entrance = parts[0];
  result.floor = parts[1];
  result.unit = parts[2];
  return result;
}

function parseAddresses(addressesStr: string) {
  const parsed: CreateData['addresses'] = [];
  const addresses = addressesStr.replace(/[' ']{1,}/g, ' ').split('\n');
  addresses.forEach(addrStr => {
    // console.log(addrStr);
    let clientPartStart = addrStr.indexOf('(');
    clientPartStart = clientPartStart > -1 ? clientPartStart : addrStr.length + 1;
    let clientPartEnd = addrStr.indexOf(')');
    clientPartEnd = clientPartEnd > -1 ? clientPartEnd : addrStr.length;
    const buildingPart = addrStr.substr(0, clientPartStart - 1).trimEnd();
    const clientPart = addrStr.substr(clientPartStart + 1, clientPartEnd - clientPartStart - 1);
    const comment = addrStr.substr(clientPartEnd + 1).trimStart();
    // console.log(`\n${buildingPart}\n${clientPart}\n${comment}\n`);

    const buildingAddress = parseBuildingAddress(buildingPart);
    const clientAddress = parseClientAddress(clientPart);

    parsed.push({
      buildingAddress,
      clientAddress,
    })
  })
  return parsed;
}

function parseColumns(data: ClientDataRow[]): CreateData[] {
  const results: CreateData[] = [];

  data.forEach((row, i) => {
    const user = parseUserName(row.name);
    user.contactValues = ['+' + row.phone];
    const addresses = parseAddresses(row.addresses);
    results[i] = {
      user,
      profile: {
        comment: row.comment
      },
      addresses
    };
    results
  })
  return results;
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
  .pipe(csv())
  .on('data', (data) => rows.push(data))
  .on('end', () => processRows(rows));

console.log('pipe end');
