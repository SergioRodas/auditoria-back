import { SrvRecord } from "dns";

export interface Data {
    fecha: string;
    hora: string;
    famDescripcion: string;
    fcadescripcion: string | null;
    fmedescripcion: string;
    fnodescripcion: string;
    fprdescripcion: string | null;
    ftmdescripcion: string;
    fcldescripcion: string;
    vacactor: number;
    captitulo: string;
    capduracion: string | null;
    vactendencia: string;
    categoria: string;
    vacsubtemaxml: number;
    captipocosto: string;
    ejedescripcion: string;
    ejedescripcionh: string;
    actor: string;
}

export interface ResultsMentions extends Mention, TendenciaMentions {
    Actor: string;
    PorcentajeTotal: number;
}

export interface TotalMentions {
    TotalRadio: number;
    TotalTelevision: number;
    TotalPeriodico: number;
    TotalMedios: number;
}
export interface Mention {
    Radio: number;
    Television: number;
    Periodico: number;
    Total: number;
}
export interface TendenciaMentions {
    Positivas: number;
    Negativas: number;
    Neutras: number;
}

export interface AccountantData extends Mention {
    Total: number;
    Positiva: number;
    Negativa: number;
    Neutra: number;
}

export interface ArrayActors {
    claudiaSheinbaumMentions: Data[];
    xochitlGalvezMentions: Data[];
    jorgeAlvarezMentions: Data[];
}

export interface TopicStats extends TotalTendencies {
    mentions: any[];
}

export interface TopTopicsResult {
    claudiaSheinbaum: TopicStats;
    xochitlGalvez: TopicStats;
    jorgeAlvarez: TopicStats;
}

export interface TopicMentions {
    topic: string;
    frequency: number;
    tendencies: { [key: string]: number };
    actors: string[];
}

export interface ProcessedMentions extends TotalTendencies {
    mentions: TopicMentions[];
}

export interface TotalTendencies {
    totalPositivas: number;
    totalNeutras: number;
    totalNegativas: number;
    totalTendencies: number;
}
export interface TotalTendenciesByActor {
    totalPositivas: number;
    totalNeutras: number;
    totalNegativas: number;
}

export interface Frequency {
    frequency: number;
    tendencies: { [key: string]: number };
    actors: Set<string>;
}

export interface ResponseTotalMentions {
    menciones: ResultsMentions[];
    totalMentions: TotalMentions;
}

export interface MentionData {
    [key: string]: any;
    FECHA: string;
    HORA: string;
    FAMDESCRIPCION: string;
    FESDESCRIPCION: string;
    FNODESCRIPCION: string;
    FNOTIRAJE: string;
    FTECONDUCTOR: string;
    FNOMEDIO: string;
    FNODIASEMISION: string;
    FCADESCRIPCION: string;
    MUNNOMMUNICIPIO: string;
    FMEDESCRIPCION: string;
    FREBANDA: string;
    FREFRECUENCIA: string;
    FREHORARIO: string;
    FMECLAVE: string;
    FMEDISTRIBUCION: string;
    FTMDESCRIPCION: string;
    FCLDESCRIPCION: string;
    VACACTOR: string;
    CAPTITULO: string;
    CAPDURACION: string;
    CAPCLAVE: string;
    CAPCM: string;
    CAPFRACCION: string;
    CAPCOSTOCM: string;
    TEXNOMBRE: string;
    QUENOMBRE: string;
    TEVDESCRIPCION: string;
    ACTOR: string;
    VACPARTICIPACION: string;
    VACCATEGORIA: string;
    VACTENDENCIA: string;
    VACFODA: string;
    VACSUBTEMAXML: string;
    VACFVALORACION: string;
    USRNOMBRE: string;
    CAADIST8A12: number;
    CAADIST13A17: number;
    CAADIST18A24: number;
    CAADIST25A34: number;
    CAADIST35A44: number;
    CAADIST45A54: number;
    CAADIST55AMAS: number;
    CAADISTALTO: number;
    CAADISTMEDIO: number;
    CAADISTBAJO: number;
    CAADISTHOMBRE: number;
    CAADISTMUJER: number;
    CAABANDA: string;
    CAAFRECUENCIA: string;
    CAAALCANCEREAL: number;
    TOPDESCRIPCION: string;
    PAGINA: string;
    AUTOR: string;
    CAPNOMBRE: string;
    CAPMEDIO: string;
    FPRDESCRIPCION: string;
    FRESIGLAS: string;
    CAPTIPOCOSTO: number;
    CAPTEXTCOMP: string;
    CIMNOMBREARCHIVO: string;
    URL: string;
    EJEDESCRIPCION: string;
    EJEDESCRIPCIONH: string;
    VACCLAVE: string;
}
