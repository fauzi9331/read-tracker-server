const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");

async function signup(parent, args, context, info) {
    // In the signup mutation, the first thing to do is encrypting the User’s password using
    // the bcryptjs library which you’ll install soon.
    const password = await bcrypt.hash(args.password, 10);
    // The next step is to use the prisma client instance to store the new User in the database.
    const user = await context.prisma.createUser({ ...args, password });

    // You’re then generating a JWT which is signed with an APP_SECRET. You still need to
    // create this APP_SECRET and also install the jwt library that’s used here.
    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    // Finally, you return the token and the user in an object that adheres to the shape of
    // an AuthPayload object from your GraphQL schema.
    return {
        token,
        user,
    };
}

async function login(parent, args, context, info) {
    // Instead of creating a new User object, you’re now using the prisma client instance
    // to retrieve the existing User record by the email address that was sent along as
    // an argument in the login mutation. If no User with that email address was found,
    // you’re returning a corresponding error.
    const user = await context.prisma.user({ email: args.email });
    if (!user) {
        throw new Error("No such user found");
    }

    // The next step is to compare the provided password with the one that is stored in the
    // database. If the two don’t match, you’re returning an error as well.
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET);

    // In the end, you’re returning token and user again.
    return {
        token,
        user,
    };
}

function post(parent, args, context, info) {
    // You’re now using the getUserId function to retrieve the ID of the User. This ID is
    // stored in the JWT that’s set at the Authorization header of the incoming HTTP request.
    // Therefore, you know which User is creating the Link here. Recall that an unsuccessful
    // retrieval of the userId will lead to an exception and the function scope is exited
    // before the createLink mutation is invoked. In that case, the GraphQL response will just
    // contain an error indicating that the user was not authenticated.
    const userId = getUserId(context);
    return context.prisma.createLink({
        url: args.url,
        description: args.description,
        // You’re then also using that userId to connect the Link to be created with the User
        // who is creating it. This is happening through a nested object write.
        postedBy: { connect: { id: userId } },
    });
}

async function vote(parent, args, context, info) {
    // Similar to what you’re doing in the post resolver, the first step is to validate the 
    // incoming JWT with the getUserId helper function. If it’s valid, the function will return 
    // the userId of the User who is making the request. If the JWT is not valid, the function 
    // will throw an exception.
    const userId = getUserId(context);

    // The prisma.$exists.vote(...) function call is new for you. The prisma client instance 
    // not only exposes CRUD methods for your models, it also generates one $exists function 
    // per model. The $exists function takes a where filter object that allows to specify 
    // certain conditions about elements of that type. Only if the condition applies to at 
    // least one element in the database, the $exists function returns true. In this case, 
    // you’re using it to verify that the requesting User has not yet voted for the Link that’s 
    // identified by args.linkId.
    const linkExists = await context.prisma.$exists.vote({
        user: { id: userId },
        link: { id: args.LinkId },
    });
    if (linkExists) {
        throw new Error(`Already voted for link: ${args.linkId}`);
    }

    // If exists returns false, the createVote method will be used to create a new Vote that’s 
    // connected to the User and the Link.
    return context.prisma.createVote({
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } },
    });
}

module.exports = {
    signup,
    login,
    post,
    vote
};
