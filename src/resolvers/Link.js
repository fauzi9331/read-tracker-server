// In the postedBy resolver, you’re first fetching the Link using the prisma client
// instance and then invoke postedBy on it. Notice that the resolver needs to be called
// postedBy because it resolves the postedBy field from the Link type in schema.graphql.
function postedBy(parent, args, context, info) {
    return context.prisma.link({ id: parent.id }).postedBy();
}

function votes(parent, args, context, info) {
    return context.prisma.link({ id: parent.id }).votes();
}

module.exports = {
    postedBy,
    votes
};
