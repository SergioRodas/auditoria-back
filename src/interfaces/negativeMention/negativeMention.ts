export interface SourceRow {
    MEDIO: string;
    URL: string;
    ID_SINTESIS: number;
}

interface Testigo {
    url: string;
    medio: string;
}

export interface NegativeMentionForColum {
    titulo: string;
    sintesis: string;
    idSeccion: number;
    cveCapsula: number;
    idSintesis: number;
    nombreSeccion: string;
    testigo: Testigo[];
}
export interface ConsultaParams {
    fecha: string;
    tipoMedio: "RADIO" | "TELEVISIÓN";
    semanal?:boolean
}

export interface NegativeMentionForRadioOrTelevision {
    id: number;
    tipo_medio: string;
    cadena: string;
    programa: string;
    autor: string;
    mencion: string;
}

export interface NegativeMentionAdmin {
    captexcomp: string;
    capclave: number;
    autor: string;
    testigo: string;
    programa: string;
    programGroup: string | undefined;
    auditoria_id: number | undefined;
    auditoria_mencion: string | undefined;
    fecha: string;
}

export interface MentionNegativeData {
    id: number | null;
    capsula: string;
    tipoMedio: "RADIO" | "TELEVISIÓN";
    cadena: string;
    programa: string;
    autor: string;
    mencion: string;
    fecha: string;
}

export interface MentionListData {
    mentionList: MentionNegativeData[];
}

export interface AuditLogEntry {
    campo: string;
    valorAnterior: string;
    valorNuevo: string;
}
