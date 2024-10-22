import { TotalTendencies } from "../mentions/mentionInterface";

export interface MediumMentions {
    medium?: string;
    frequency: number;
    tendencies: { [key: string]: number };
    actors: string[];
}

export interface ProcessedMentionsMedium extends TotalTendencies {
    mentions: MediumMentions[];
}

export interface MediumStats extends TotalTendencies {
    mentions: any[];
}

export interface MediumResult {
    claudiaSheinbaum: MediumStats;
    xochitlGalvez: MediumStats;
    jorgeAlvarez: MediumStats;
}

export interface MediumGroups {
    radioGroups: string[];
    televisionGroups: string[];
    periodicosGroups: string[];
}

export interface MediumItem {
    fmedescripcion: string;
    fnodescripcion: string;
}

export interface MentionMedius {
    fmedescripcion: string;
    fnodescripcion: string;
}
