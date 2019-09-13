// ### Extending the schema definition
// In general, when adding a new feature to the API, the process will look pretty similar every time:
// Extend the GraphQL schema definition with a new root field (and new data types, if needed)
// Implement corresponding resolver functions for the added fields
// This process is also referred to as schema-driven or schema-first development.

const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./generated/prisma-client");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Subscription = require("./resolvers/Subscription");
const Vote = require("./resolvers/Vote");

const resolvers = {
    Query,
    Mutation,
    User,
    Link,
    Subscription,
    Vote,
};

// the schema and resolvers are bundled and passed to the GraphQLServer which is imported
// from graphql-yoga. This tells the server what API operations are accepted and how they should be
// resolved.
const server = new GraphQLServer({
    typeDefs: "./src/schema.graphql",
    // The resolvers object is the actual implementation of the GraphQL schema. Notice how
    // its structure is identical to the structure of the type definition inside typeDefs: Query.info.
    resolvers,
    // Instead of attaching an object directly, you’re now creating the context as a function
    // which returns the context. The advantage of this approach is that you can attach the HTTP
    // request that carries the incoming GraphQL query (or mutation) to the context as well.
    // This will allow your resolvers to read the Authorization header and validate if the user
    // who submitted the request is eligible to perform the requested operation.
    context: request => {
        return {
            ...request,
            prisma,
        };
    },
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
