import { BuildingAddressUidInput, ClientAddressCreateData, ProfileUpdateData, UserCreateData } from "../graphql/types"

export type ClientAddressInput = Omit<Omit<ClientAddressCreateData, 'buildingAddressIdentifier'>, 'userIdentifier'>

export type Address = {
  buildingAddress: BuildingAddressUidInput,
  clientAddress: ClientAddressInput,
}

export type CreateData = {
  addresses: Address[],
  user: UserCreateData,
  profile: ProfileUpdateData,
}
