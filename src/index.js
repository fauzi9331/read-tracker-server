// ### Extending the schema definition
// In general, when adding a new feature to the API, the process will look pretty similar every time:

// Extend the GraphQL schema definition with a new root field (and new data types, if needed)
// Implement corresponding resolver functions for the added fields
// This process is also referred to as schema-driven or schema-first development.


const { GraphQLServer } = require('graphql-yoga')

// The typeDefs constant defines your GraphQL schema (more about this in a bit). 
// Here, it defines a simple Query type with one field called info. This field has 
// the type String!. The exclamation mark in the type definition means that this 
// field can never be null.
const typeDefs = `
type Query {
  info: String!
  feed: [Link]!
}

type Link{
  id: ID!
  description: String!
  url: String!
}
`

// The resolvers object is the actual implementation of the GraphQL schema. Notice how 
// its structure is identical to the structure of the type definition inside typeDefs: Query.info.

// The links variable is used to store the links at runtime. For now, everything is stored only 
// in-memory rather than being persisted in a database.
let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    // You’re adding a new resolver for the feed root field. Notice that a resolver always has to 
    // be named after the corresponding field from the schema definition.
    feed: () => links,
  },

  // Finally, you’re adding three more resolvers for the fields on the Link type from the schema 
  // definition. We’ll discuss in a bit what the parent argument is that’s passed into the resolver here.
  Link: {
    id: (parent) => parent.id,
    description: (parent) => parent.description,
    url: (parent) => parent.url,
  }
}

// Finally, the schema and resolvers are bundled and passed to the GraphQLServer which is imported 
// from graphql-yoga. This tells the server what API operations are accepted and how they should be 
// resolved.
const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))