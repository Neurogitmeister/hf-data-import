module.exports = {
  client: {
    service: {
      name: 'HappyFood',
      localSchemaFile: './graphql/schema.gql',
    },
    includes: ['./graphql/queries/*.ts'],
  },
};
