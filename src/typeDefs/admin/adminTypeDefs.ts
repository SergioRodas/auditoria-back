import { Balance } from "./../../interfaces/balance/balanceInterface";
import { gql } from "apollo-server-express";

const typeDefs = gql`
    type NegativeMention {
        captexcomp: String
        capclave: Int
        autor: String
        testigo: String
        programa: String
        programGroup: String
        auditoria_id: Int
        auditoria_mencion: String
        fecha: String
    }

    type MentionData {
        CAPCLAVE: String
        FECHA: String
        HORA: String
        FAMDESCRIPCION: String
        FESDESCRIPCION: String
        FNODESCRIPCION: String
        FNODIASEMISION: String
        FREHORARIO: String
        FREFRECUENCIA: String
        FREBANDA: String
        FTECONDUCTOR: String
        FCADESCRIPCION: String
        FPRDESCRIPCION: String
        FRESIGLAS: String
        MUNNOMMUNICIPIO: String
        FMEDESCRIPCION: String
        FTMDESCRIPCION: String
        FCLDESCRIPCION: String
        PAGINA: String
        FNOTIRAJE: String
        AUTOR: String
        CAPTITULO: String
        CAPTEXTCOMP: String
        CAPDURACION: String
        CAPCM: String
        CAPFRACCION: String
        CAPCOSTOCM: String
        TEXNOMBRE: String
        QUENOMBRE: String
        TEVDESCRIPCION: String
        ACTOR: String
        VACPARTICIPACION: String
        CATEGORIA: String
        VACTENDENCIA: String
        VACFODA: String
        USRNOMBRE: String
        CAADIST8A12: String
        CAADIST13A17: String
        CAADIST18A24: String
        CAADIST25A34: String
        CAADIST35A44: String
        CAADIST45A54: String
        CAADIST55AMAS: String
        CAADISTALTO: String
        CAADISTMEDIO: String
        CAADISTBAJO: String
        CAADISTHOMBRE: String
        CAADISTMUJER: String
        CAAALCANCEREAL: String
        EJEDESCRIPCION: String
        EJEDESCRIPCIONH: String
        CAPNOMBRE: String
        VACSUBTEMAXML: String
        URL: String
        CIMNOMBREARCHIVO: String
        CAPTIPOCOSTO: String
        VACCLAVE: String
    }

    type BalanceData {
        balance: String
        fecha: String
    }

    type Query {
        getNegativeMentionsForAdmin(
            fecha: String!
            tipoMedio: String!
            semanal:Boolean
        ): [NegativeMention]
        getDataForTable(fecha: String! semanal:Boolean): [MentionData]!
        getBalanceByFecha(fecha: String!): BalanceData
    }
    type Mutation {
        createOrUpdateMentionNegative(
            id: ID
            capsula: String!
            tipoMedio: String!
            cadena: String!
            programa: String!
            autor: String!
            mencion: String!
            fecha: String!
        ): String!
        deleteMentionNegative(id: ID!): String!
        generateExcel(fecha: String!, semanal:Boolean): String!
        createOrUpdateBalance(balance: String!, fecha: String!): String!
        deleteBalance(fecha: String!): String!
        deleteMention(id: ID!): String!
    }
`;

export default typeDefs;
