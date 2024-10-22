"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const typeDefs = (0, apollo_server_1.gql) `
    type User {
        id: Int
        email: String
        rol: String
        username: String
        token: String
    }

    type ResetPasswordResponse {
        message: String!
        success: Boolean!
    }

    type Query {
        login(username: String!, password: String!): User
    }

    type Mutation {
        requestPasswordReset(email: String!): ResetPasswordResponse!
        resetPassword(token: String!, newPassword: String!): ResetPasswordResponse!
    }
`;
exports.default = typeDefs;
