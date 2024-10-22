import { gql } from "apollo-server";

const typeDefs = gql`
    type Mention {
        Actor: String!
        Positivas: Int!
        Negativas: Int!
        Neutras: Int!
        Total: Int!
        PorcentajeTotal: Float!
        Radio: Int!
        Television: Int!
        Periodico: Int!
    }

    type TotalMentions {
        TotalRadio: Int!
        TotalTelevision: Int!
        TotalPeriodico: Int!
        TotalMedios: Int!
    }

    type TotalMentionsAndMentions {
        menciones: [Mention]
        totalMentions: TotalMentions
    }

    type GeneralTopTopicsResponse {
        claudiaSheinbaum: ActorStats!
        xochitlGalvez: ActorStats!
        jorgeAlvarez: ActorStats!
    }

    type ActorStats {
        mentions: [TopicFrequency!]!
        totalPositivas: Int!
        totalNeutras: Int!
        totalNegativas: Int!
        totalTendencies: Int!
    }

    type TopicFrequency {
        topic: String!
        frequency: Int!
        tendencies: TendencyStats!
    }

    type TendencyStats {
        Positiva: Int!
        Neutra: Int!
        Negativa: Int!
    }

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

    type Query {
        TotalMentionsCountResolver(
            fecha: String!
            semanal: Boolean
        ): TotalMentionsAndMentions
        GeneralTopTopicsResolve(
            fecha: String!
            semanal: Boolean
        ): GeneralTopTopicsResponse!
    }
`;

export default typeDefs;
