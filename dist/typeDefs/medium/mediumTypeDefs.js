"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const typeDefs = (0, apollo_server_1.gql) `
    type MediumResponse {
        claudiaSheinbaum: ActorStatsMedium!
        xochitlGalvez: ActorStatsMedium!
        jorgeAlvarez: ActorStatsMedium!
    }

    type ActorStatsMedium {
        mentions: [MediumFrequency!]!
        totalPositivas: Int!
        totalNeutras: Int!
        totalNegativas: Int!
        totalTendencies: Int!
    }

    type MediumFrequency {
        medium: String!
        frequency: Int!
        tendencies: TendencyStats!
    }

    type Medium {
        radio: [String!]!
        television: [String!]!
        periodico: [String!]!
    }

    type ActorMentions {
        claudiaSheinbaum: Medium!
        xochitlGalvez: Medium!
        jorgeAlvarez: Medium!
    }

    type Query {
        MediumMayorRelevanceResolver(
            fecha: String!
            medium: String
            semanal: Boolean
        ): MediumResponse!
        MediumTrendResolver(
            fecha: String!
            trend: String
            semanal: Boolean
        ): ActorMentions!
    }
`;
exports.default = typeDefs;
