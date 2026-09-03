const typeDefs = /* GraphQL */ `
  type User {
    name: String!
    username: String!
    passwordHash: String!
    about: String
    profilePicture: String
  }

  type Query {
    allUsers: [User!]!
  }
`;

export default typeDefs;
