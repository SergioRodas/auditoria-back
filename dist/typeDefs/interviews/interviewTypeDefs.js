"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const typeDefs = (0, apollo_server_express_1.gql) `
    type Interview {
        titulo: String
        sintesis: String
        cvcapsula: String
        id_sintesis: String
        nombre_testigo: String
        url: String
    }

    type interviewsByCandidate {
        candidate: String
        interviews: [Interview]
    }

    type Query {
        interviewResolver(fecha: String!, semanal: Boolean): [interviewsByCandidate]
    }
`;
exports.default = typeDefs;
