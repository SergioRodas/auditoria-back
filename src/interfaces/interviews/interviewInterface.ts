export interface Interview {
    titulo: string;
    sintesis: string;
    cvcapsula: string;
    id_sintesis: string;
    nombre_testigo:string;
    url:string;
    nombre_seccion:string;
}
export interface interviewsByCandidate {
    candidate: string;
    interviews: Interview[];
}
