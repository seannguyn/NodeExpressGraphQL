const express = require('express')
const app = express()
const expressGraphQL = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList
} = require('graphql')

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name:"book",
    description: "This is Book Type",
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (parent) => {
                return authors.find(x => x.id === parent.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "author",
    description: "This is an Author Type",
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        book: {
            type: GraphQLList(BookType),
            resolve: (parent) => {
                return books.filter(x => x.authorId === parent.id)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: "Root",
    description: "This is the root query",
    fields: {
        books:{
            name: "books",
            description: "A Collection of Books",
            type: GraphQLList(BookType),
            resolve: () => books
        },
        book:{
            name: "book",
            type: BookType,
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                return books.find(x => x.id === args.id)
            }
        },
        authors: {
            name: "authors",
            description: "A Collection of Authors",
            type: GraphQLList(AuthorType),
            resolve: () => {
                return authors
            }
        },
        author: {
            name: "author",
            description: "Get a single author",
            type: AuthorType,
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                return authors.find( x => x.id === args.id)
            }
        }
    }
})

const mutationQuery = new GraphQLObjectType({

    name: "mutation",
    description: "This is a mutation query",
    fields: {
        addBook:{
            name: "Add a book",
            type: BookType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const newBook = {
                    id: books.length+1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(newBook)
                return newBook
            }
        },
        addAuthor: {
            name: "Add an author",
            type: AuthorType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const newAuthor = {
                    id: authors.length+1,
                    name: args.name
                }
                authors.push(newAuthor);
                return newAuthor;
            }
        }
    }
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: mutationQuery
})

app.use('/graphql', new expressGraphQL({
    graphiql: true,
    schema: schema
}))

app.listen(5000,() =>{
    console.log("Server stated on port 5000");
})