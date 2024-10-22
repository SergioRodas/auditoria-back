import { gql } from "apollo-server-express";

const typeDefs = gql`
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

export default typeDefs;
