import { Address, ClientAddressInput, CreateData } from "./api";

export enum ClientDataFields {
  name = 'name',
  phone = 'phone',
  comment = 'comment',
  addresses = 'addresses',
}

export type ClientDataRow = {
  [ClientDataFields.name]: string;
  [ClientDataFields.phone]: string;
  [ClientDataFields.comment]: string;
  [ClientDataFields.addresses]: string;
}

const buildingDefaults: Address['buildingAddress'] = {
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

/**Формат: "Имя" или "Имя" и "Фамилия" и/или "(Отчество)" */
function parseUserName(userNameStr: string) {
  let user: CreateData['user'] = {firstName: '', lastName: ''};
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

function parsePhones(str: string) {
  return str.split('\n').map(it => '+' + it);
}

const rusCapitalLetters = 'АБВГДЕЁЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
const buildingRegex = /[0-9]{1,}(\/[0-9]{1,})?/;

function parseBuildingAddress(str: string){
  console.log('\n', str);
  str = str.replace(/\\/g, '/');
  const result: Partial<Address['buildingAddress']> = {};
  const cityEndIndex = str.indexOf(',');
  if ( cityEndIndex > -1) {
    const cityParts = str.substr(0, cityEndIndex).split(' ');
    console.log(str.substr(0, cityEndIndex), cityParts);
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
    result.cityType = result.cityType?.trimEnd();
    result.cityName = result.cityName?.trimEnd();
  }
  const partsAfterCity = str.substr(cityEndIndex > -1 ? cityEndIndex + 1 : 0).split(' ');
  let nameIndexFound = false;
  let buildingIndexFound = false;
  let buildingPart = '';
  for (const part of partsAfterCity) {
   if (rusCapitalLetters.indexOf(part[0]) > -1) {
      nameIndexFound = true;
    } else {
      const matches = part.match(buildingRegex);
      if (matches && matches[0] === part) {

        if (nameIndexFound) {
          buildingIndexFound = true;
        }

        if (!buildingIndexFound && !nameIndexFound) {
          nameIndexFound = true;
        }
        
      } else if (matches) {
        nameIndexFound = true;
      }
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
  result.streetName = result.streetName?.trimEnd();
  result.streetType = result.streetType?.trim();
  if (!result.streetType) {
    delete result.streetType;
  }
  const buildingParts = buildingPart.trimEnd().split(' ')
  if (buildingParts.length > 1) {
    result.buildingName = buildingParts[0] + '/' + buildingParts[2];
  } else {
    result.buildingName = buildingParts[0];
  }
  console.log(result, '\n');
  return {...buildingDefaults, ...result};
}


function parseClientAddress(str: string){
  const result: ClientAddressInput = {};
  const parts = str.split('/');
  result.entrance = parts[0] ? parts[0] : undefined;
  result.floor = parts[1] ? parts[1] : undefined;
  result.unit = parts[2] ? parts[2] : undefined;
  return result;
}

function parseAddresses(addressesStr: string) {
  const parsed: CreateData['addresses'] = [];
  const addresses = addressesStr.replace(/[' ']{1,}/g, ' ').split('\n');
  addresses.forEach(addrStr => {
    console.log(addrStr);
    let clientPartStart = addrStr.indexOf('(');
    clientPartStart = clientPartStart > -1 ? clientPartStart : addrStr.length + 1;
    let clientPartEnd = addrStr.indexOf(')');
    clientPartEnd = clientPartEnd > -1 ? clientPartEnd : addrStr.length;
    const buildingPart = addrStr.substr(0, clientPartStart - 1).trimEnd();
    const clientPart = addrStr.substr(clientPartStart + 1, clientPartEnd - clientPartStart - 1);
    const comment = addrStr.substr(clientPartEnd + 1).trimStart();
    console.log(`\n${buildingPart}\n${clientPart}\n${comment}\n`);

    const buildingAddress = parseBuildingAddress(buildingPart);
    const clientAddress = parseClientAddress(clientPart);
    clientAddress.comment = comment ? comment.trimEnd() : undefined;

    parsed.push({
      buildingAddress,
      clientAddress,
    })
  })
  return parsed;
}

export function parseColumns(data: ClientDataRow[]): CreateData[] {
  const results: CreateData[] = [];

  data.forEach((row, i) => {
    const user = parseUserName(row.name);
    const phones = parsePhones(row.phone);
    user.contactValues = phones;
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