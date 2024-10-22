"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const typeDefs = (0, apollo_server_express_1.gql) `
    type testigo {
        url: String
        medio: String
    }
    type MentionNegativeForColumns {
        titulo: String
        sintesis: String
        cveCapsula: String
        idSintesis: String
        nombreSeccion: String
        testigo: [testigo]
    }

    type NegativeMentionForRadioOrTelevision {
        id: Int!
        tipo_medio: String!
        cadena: String!
        programa: String!
        autor: String!
        mencion: String!
    }

    type Query {
        getNegativeMentionsforColumnsResolver(
            fecha: String!
            semanal: Boolean
        ): [MentionNegativeForColumns]
        getNegativeMentionsforRadioOrTelevision(
            fecha: String!
            tipoMedio: String!
            semanal: Boolean
        ): [NegativeMentionForRadioOrTelevision]!
    }
`;
exports.default = typeDefs;
