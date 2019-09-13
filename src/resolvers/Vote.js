function link(parent,args,context,info){
    return context.prisma.votes({id: parent.id}).link()
}

function user(parent,args,context,info){
    return context.prisma.votes({id: parent.id}).user()
}

module.exports = {
    link,
    user,
}