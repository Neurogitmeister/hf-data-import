type StringEnumType = Record<string, string>;
type NumberEnumType = Record<string | number, string | number>;

export const stringEnumKeys = (stringEnumType: StringEnumType): string[] => {
  return Object.keys(stringEnumType);
};

export const numberEnumKeys = (numberEnumType: NumberEnumType): string[] => {
  return Object.values(numberEnumType).filter(it => typeof it === 'string') as string[];
};

export const stringEnumValues = (stringEnumType: StringEnumType): string[] => {
  return stringEnumKeys(stringEnumType).map(key => stringEnumType[key]);
};

export const numberEnumValues = (numberEnumType: NumberEnumType): number[] => {
  return numberEnumKeys(numberEnumType).map(key => numberEnumType[key]) as number[];
};
