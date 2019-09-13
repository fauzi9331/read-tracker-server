// ### Extending the schema definition
// In general, when adding a new feature to the API, the process will look pretty similar every time:

// Extend the GraphQL schema definition with a new root field (and new data types, if needed)
// Implement corresponding resolver functions for the added fields
// This process is also referred to as schema-driven or schema-first development.

const { GraphQLServer } = require("graphql-yoga");
// First, import the prisma client instance into index.js. At the top of the file, add the following import statement:
const { prisma } = require('./generated/prisma-client')

// The resolvers object is the actual implementation of the GraphQL schema. Notice how
// its structure is identical to the structure of the type definition inside typeDefs: Query.info.

// Previously, the feed resolver didn’t take any arguments - now it receives four. In fact, the 
// first two and the fourth are not needed for this particular resolver. But the third one, 
// called context, is.

// Remember how we said earlier that all GraphQL resolver functions always receive four arguments. 
// Now you’re getting to know another one, so what is context used for?

// The context argument is a plain JavaScript object that every resolver in the resolver chain 
// can read from and write to - it thus basically is a means for resolvers to communicate. As 
// you’ll see in a bit, it’s also possible to already write to it at the moment when the GraphQL 
// server itself is being initialized. So, it’s also a way for you to pass arbitrary data or 
// functions to the resolvers. In this case, you’re going to attach this prisma client instance 
// to the context - more about that soon.
const resolvers = {
    Query: {
        info: () => `This is the API of a Hackernews Clone`,
        feed: (root, args, context, info) => {
            // It accesses a prisma object on context. As you will see in a bit, this prisma 
            // object actually is a Prisma client instance that’s imported from the generated 
            // prisma-client library.

            // This Prisma client instance effectively lets you access your database through the Prisma 
            // API. It exposes a number of methods that let you perform CRUD operations for your models.
            return context.prisma.links();
        },
    },

    Mutation: {
        post: (root, args, context) => {
            // You’re sending the createLink method from the Prisma client API. As arguments, 
            // you’re passing the data that the resolvers receive via the args parameter.
            return context.prisma.createLink({
                url: args.url,
                description: args.description,
            });
        },
    },
};

// Finally, the schema and resolvers are bundled and passed to the GraphQLServer which is imported
// from graphql-yoga. This tells the server what API operations are accepted and how they should be
// resolved.
const server = new GraphQLServer({
    typeDefs: "./src/schema.graphql",
    resolvers,
    // Now you can attach it to the context when the GraphQLServer is being initialized.
    context: { prisma }
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
