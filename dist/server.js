"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const auth_1 = require("./auth/auth");
const schema_1 = require("@graphql-tools/schema");
const merge_1 = require("@graphql-tools/merge");
const loginTypeDefs_1 = __importDefault(require("./typeDefs/loginTypeDefs"));
const loginResolver_1 = __importDefault(require("./resolvers/loginResolver"));
const typeDefs = (0, merge_1.mergeTypeDefs)([loginTypeDefs_1.default]);
const schema = (0, schema_1.makeExecutableSchema)({
    typeDefs,
    resolvers: loginResolver_1.default,
});
const server = new apollo_server_1.ApolloServer({
    schema,
    context: ({ req }) => {
        const token = req.headers.authorization || "";
        const isLoginQuery = req.body.query.includes("login");
        if (isLoginQuery) {
            return {};
        }
        const user = (0, auth_1.authenticate)(token);
        return { user };
    },
});
server.listen(process.env.PORT).then(({ url }) => {
    console.log(`Servidor GraphQL listo en ${url}`);
});
