import { gql } from "apollo-server";

const typeDefs = gql`
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

export default typeDefs;
