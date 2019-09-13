// the feed resolver receives four arguments.
function feed(root, args, context, info) {
    // This Prisma client instance effectively lets you access your database through the Prisma 
    // API. It exposes a number of methods that let you perform CRUD operations for your models.
    return context.prisma.links();
}

function users(root, args, context, info) {
    return context.prisma.users()
}

module.exports = {
    feed,
    users,
};
