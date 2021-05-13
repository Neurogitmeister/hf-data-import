module.exports = {
  client: {
    service: {
      name: 'HappyFood',
      localSchemaFile: 'src/graphql/schema.gql',
    },
    includes: ['src/graphql/queries/*.ts'],
  },
};
