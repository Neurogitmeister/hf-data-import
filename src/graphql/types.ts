/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BuildingAddressDeliveryData
// ====================================================

export interface BuildingAddressDeliveryData_buildingAddress_location_geoPoint {
  __typename: "GeoPoint";
  latitude: number;
  longitude: number;
}

export interface BuildingAddressDeliveryData_buildingAddress_location {
  __typename: "Location";
  geoPoint: BuildingAddressDeliveryData_buildingAddress_location_geoPoint;
}

export interface BuildingAddressDeliveryData_buildingAddress_geoPointOptions {
  __typename: "GeoPointOption";
  longitude: number;
  latitude: number;
  doubtful: boolean;
}

export interface BuildingAddressDeliveryData_buildingAddress {
  __typename: "BuildingAddress";
  id: string;
  invalidPart: BuildingAddressUidPart | null;
  location: BuildingAddressDeliveryData_buildingAddress_location | null;
  geoPointOptions: BuildingAddressDeliveryData_buildingAddress_geoPointOptions[] | null;
  deliveryPrice: any | null;
  processJobStatus: JobStatus | null;
}

export interface BuildingAddressDeliveryData {
  buildingAddress: BuildingAddressDeliveryData_buildingAddress | null;
}

export interface BuildingAddressDeliveryDataVariables {
  id?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: GetOrCreateBuildingAddress
// ====================================================

export interface GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_location_geoPoint {
  __typename: "GeoPoint";
  latitude: number;
  longitude: number;
}

export interface GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_location {
  __typename: "Location";
  geoPoint: GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_location_geoPoint;
}

export interface GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_geoPointOptions {
  __typename: "GeoPointOption";
  longitude: number;
  latitude: number;
  doubtful: boolean;
}

export interface GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy {
  __typename: "BuildingAddress";
  id: string;
  invalidPart: BuildingAddressUidPart | null;
  location: GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_location | null;
  geoPointOptions: GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy_geoPointOptions[] | null;
  deliveryPrice: any | null;
  processJobStatus: JobStatus | null;
}

export interface GetOrCreateBuildingAddress {
  getOrCreateBuildingAddressBy: GetOrCreateBuildingAddress_getOrCreateBuildingAddressBy;
}

export interface GetOrCreateBuildingAddressVariables {
  buildingAddress: BuildingAddressUidInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: GetOrCreateClientAddress
// ====================================================

export interface GetOrCreateClientAddress_getOrCreateClientAddressBy {
  __typename: "ClientAddress";
  id: string;
}

export interface GetOrCreateClientAddress {
  getOrCreateClientAddressBy: GetOrCreateClientAddress_getOrCreateClientAddressBy;
}

export interface GetOrCreateClientAddressVariables {
  data: ClientAddressUidInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SignUp
// ====================================================

export interface SignUp_signUp_user_contacts {
  __typename: "Contact";
  confirmationCodeSent: boolean;
  value: string;
}

export interface SignUp_signUp_user_profile {
  __typename: "Profile";
  id: string;
}

export interface SignUp_signUp_user {
  __typename: "User";
  id: string;
  contacts: SignUp_signUp_user_contacts[];
  profile: SignUp_signUp_user_profile;
}

export interface SignUp_signUp {
  __typename: "UserAuth";
  user: SignUp_signUp_user;
  jwt: string;
}

export interface SignUp {
  /**
   * Creates a user and authenticates it.
   * 
   * Each user always has one or more identifiers and must have authentication data.
   * 
   * Identifiers are intended to uniquely identify users.
   * Types of identifiers:
   * - id (required; defaults to a random cuid)
   * - nickname
   * - contacts (emails, phones; todo: identifiers of social networks and messengers)
   * 
   * Authentication data is intended to authenticate users.
   * Different types of authentication data may be used with different types of identifiers:
   * - password may be used with id, nickname or a confirmed contact (see logIn mutation)
   * - confirmation code may be used with any contact (see requestContactConfirmation mutation)
   * 
   * Anyway, user cannot be created without a valid data to be authenticated with.
   */
  signUp: SignUp_signUp;
}

export interface SignUpVariables {
  data: UserCreateData;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpdateProfile
// ====================================================

export interface UpdateProfile_updateProfile_user_contacts {
  __typename: "Contact";
  confirmationCodeSent: boolean;
  value: string;
}

export interface UpdateProfile_updateProfile_user_profile {
  __typename: "Profile";
  id: string;
}

export interface UpdateProfile_updateProfile_user {
  __typename: "User";
  id: string;
  contacts: UpdateProfile_updateProfile_user_contacts[];
  profile: UpdateProfile_updateProfile_user_profile;
}

export interface UpdateProfile_updateProfile {
  __typename: "Profile";
  user: UpdateProfile_updateProfile_user;
}

export interface UpdateProfile {
  updateProfile: UpdateProfile_updateProfile;
}

export interface UpdateProfileVariables {
  data: ProfileUpdateData;
  id: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: BuildingAddressDeliveryDataFragment
// ====================================================

export interface BuildingAddressDeliveryDataFragment_location_geoPoint {
  __typename: "GeoPoint";
  latitude: number;
  longitude: number;
}

export interface BuildingAddressDeliveryDataFragment_location {
  __typename: "Location";
  geoPoint: BuildingAddressDeliveryDataFragment_location_geoPoint;
}

export interface BuildingAddressDeliveryDataFragment_geoPointOptions {
  __typename: "GeoPointOption";
  longitude: number;
  latitude: number;
  doubtful: boolean;
}

export interface BuildingAddressDeliveryDataFragment {
  __typename: "BuildingAddress";
  id: string;
  invalidPart: BuildingAddressUidPart | null;
  location: BuildingAddressDeliveryDataFragment_location | null;
  geoPointOptions: BuildingAddressDeliveryDataFragment_geoPointOptions[] | null;
  deliveryPrice: any | null;
  processJobStatus: JobStatus | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum BuildingAddressUidPart {
  building = "building",
  city = "city",
  district = "district",
  region = "region",
  street = "street",
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
  UNKNOWN = "UNKNOWN",
}

export enum JobStatus {
  Completed = "Completed",
  Failed = "Failed",
  Running = "Running",
}

/**
 * Unique by:
 * - regionType, regionName, districtType, districtName, cityType, cityName, streetOwnerType, streetOwnerName, streetType, streetName, buildingType, buildingName, buildingPostalCodeNumber
 */
export interface BuildingAddressIdentifier {
  buildingName?: string | null;
  buildingPostalCodeNumber?: string | null;
  buildingType?: string | null;
  cityName?: string | null;
  cityType?: string | null;
  districtName?: string | null;
  districtType?: string | null;
  id?: string | null;
  regionName?: string | null;
  regionType?: string | null;
  streetName?: string | null;
  streetOwnerName?: string | null;
  streetOwnerType?: string | null;
  streetType?: string | null;
}

export interface BuildingAddressUidInput {
  buildingName: string;
  buildingPostalCodeNumber: string;
  buildingType: string;
  cityName: string;
  cityType: string;
  districtName?: string | null;
  districtType?: string | null;
  regionName: string;
  regionType: string;
  streetName: string;
  streetOwnerName?: string | null;
  streetOwnerType?: string | null;
  streetType: string;
}

export interface ClientAddressUidInput {
  buildingAddressIdentifier: BuildingAddressIdentifier;
  entrance?: string | null;
  floor?: string | null;
  unit?: string | null;
  userIdentifier: UserIdentifier;
}

export interface ProfileUpdateData {
  comment?: string | null;
  userIdentifier?: UserIdentifier | null;
}

export interface UserCreateData {
  birthday?: string | null;
  contactValues?: string[] | null;
  firstName: string;
  gender?: Gender | null;
  lastName?: string | null;
  nickname?: string | null;
  password?: string | null;
}

/**
 * Unique by:
 * - nickname
 */
export interface UserIdentifier {
  id?: string | null;
  nickname?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
