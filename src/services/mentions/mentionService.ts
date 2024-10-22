import { RowDataPacket } from "mysql2";
import dbConnection from "../../config/mysql";
import {
    Data,
    ResultsMentions,
    AccountantData,
    Mention,
    TotalMentions,
    ArrayActors,
    ProcessedMentions,
    TopicMentions,
    TotalTendenciesByActor,
    Frequency,
    MentionData,
} from "../../interfaces/mentions/mentionInterface";
import {
    CLAUDIA_SHEINBAUM_ID,
    JORGE_ALVAREZ_MAYNEZ_ID,
    XOCHITL_GALVEZ_ID,
} from "../../constants/candidates/candidates";
import { decode } from "he";

async function getDataMentions(fecha: Date, semanal?: boolean): Promise<Data[]> {
    try {
        let condition;

        if (semanal) {
            const fechaActual = new Date(fecha);
            const fechaHaceUnaSemana = new Date(
                fechaActual.getTime() - 7 * 24 * 60 * 60 * 1000
            );
            const fechaRestada = new Date(fecha);
            fechaRestada.setDate(fechaRestada.getDate() - 1);
            condition = ` VACSUBTEMAXML IN (200620, 200621, 200622)
                AND EJEDESCRIPCION != "Eliminada"
                AND CAPFCAPSULA BETWEEN STR_TO_DATE('${fechaHaceUnaSemana
                    .toISOString()
                    .slice(0, 10)}', '%Y-%m-%d')
                AND STR_TO_DATE('${fechaRestada
                    .toISOString()
                    .slice(0, 10)}', '%Y-%m-%d')`;
        } else {
            condition = ` VACSUBTEMAXML IN (200620, 200621, 200622)
                AND EJEDESCRIPCION != "Eliminada"
                AND CAPFCAPSULA BETWEEN STR_TO_DATE('${fecha
                    .toISOString()
                    .slice(0, 10)}', '%Y-%m-%d')
                AND DATE_ADD(STR_TO_DATE('${fecha
                    .toISOString()
                    .slice(0, 10)}', '%Y-%m-%d'), INTERVAL 1 DAY)`;
        }

        const connection = await dbConnection();
        const [rows, _fields] = await connection.execute<RowDataPacket[]>(
            `SELECT DISTINCT
            DATE_FORMAT(CAPFCAPSULA, '%Y-%m-%d') AS fecha,
            DATE_FORMAT(CAPFCAPSULA, '%H:%i:%s') AS hora,
            FMEDESCRIPCION AS fmedescripcion,
            FNODESCRIPCION AS fnodescripcion,
            VACACTOR AS vacactor,
            CASE
                WHEN (VACTENDENCIA = 1) THEN 'Positiva'
                WHEN (VACTENDENCIA = 2) THEN 'Negativa'
                WHEN (VACTENDENCIA = 3) THEN 'Neutra'
                ELSE ' '
            END AS vactendencia,
            EJEDESCRIPCIONH AS ejedescripcionh,
            VACCAPSULA,
            EJEDESCRIPCION, ejedescripcionh,
            CAPTEXTCOMP AS captexcomp,
            INTELITE_IVECTOR1.VC1NOMBRE AS actor
                FROM
                    INTELITE_IVALORACAPSULAS
                LEFT JOIN
                    INTELITE_ICAPSULA ON VACCAPSULA = CAPCLAVE
                LEFT JOIN
                    INTELITE_IFTEAMBITO ON CAPAMBITO = FAMCLAVE
                LEFT JOIN
                    INTELITE_IFTEESTADO ON CAPESTADO = FESCLAVE
                LEFT JOIN
                    INTELITE_IFTENOMBRE ON CAPNOMBRE = FNOCLAVE
                LEFT JOIN
                    INTELITE_IFTEPROGRAMA ON FPRCLAVE = FNOGPOPROGRAMA
                LEFT JOIN
                    INTELITE_IFRECUEMISORA ON FREFNOCLAVE = FNOCLAVE AND FNOFRECUENCIA = FREFRECUENCIA AND FRESTATUS = 'A'
                LEFT JOIN
                    INTELITE_IFTECADENA ON FCACLAVE = FNOCADENA
                LEFT JOIN
                    INTELITE_IFTEMEDIO ON CAPMEDIO = FMECLAVE
                LEFT JOIN
                    INTELITE_IFTETIPOMEDIO ON CAPTIPOMEDIO = FTMCLAVE
                LEFT JOIN
                    INTELITE_IFTECLASIFICACION ON CAPCLASIFICACION = FCLCLAVE
                LEFT JOIN
                    INTELITE_IEJETEMATICO ON VACEJE = EJECLAVE
                LEFT JOIN
                    INTELITE_IEJETEMATICOHIJO ON VACEJE = EJECLAVEPAPA AND VACEJEHIJO = EJECLAVEH
                LEFT JOIN
                    INTELITE_IVECTOR1 ON VC1CLAVE = VACACTOR
            WHERE
            ${condition}`
        );
        return mapRowsToData(rows);
    } catch (error) {
        throw error;
    }
}

function mapRowsToData(rows: RowDataPacket[]): Data[] {
    return rows.map((row: RowDataPacket) => ({
        fecha: row.fecha,
        hora: row.hora,
        famDescripcion: row.famDescripcion,
        fcadescripcion: row.fcadescripcion,
        fmedescripcion: row.fmedescripcion,
        fnodescripcion: row.fnodescripcion,
        fprdescripcion: row.fprdescripcion,
        ftmdescripcion: row.ftmdescripcion,
        fcldescripcion: row.fcldescripcion,
        vacactor: row.vacactor,
        captitulo: row.captitulo,
        capduracion: row.capduracion,
        vactendencia: row.vactendencia,
        categoria: row.categoria,
        vacsubtemaxml: row.vacsubtemaxml,
        captipocosto: row.captipocosto,
        ejedescripcion: row.ejedescripcion,
        ejedescripcionh: row.ejedescripcionh,
        actor: row.actor,
        captextcomp: row.captexcomp,
    }));
}

export async function getMentionsByActor(data: Data[]): Promise<ResultsMentions[]> {
    const accountantsByActor = initializeCountersByActor();

    countMentions(data, accountantsByActor);

    const results = calculateResults(accountantsByActor, data.length);

    return results;
}

function initializeCountersByActor(): Record<string, AccountantData> {
    return {
        "Claudia Sheinbaum Pardo": {
            Positiva: 0,
            Negativa: 0,
            Neutra: 0,
            Total: 0,
            Radio: 0,
            Television: 0,
            Periodico: 0,
        },
        "Xóchitl Gálvez": {
            Positiva: 0,
            Negativa: 0,
            Neutra: 0,
            Total: 0,
            Radio: 0,
            Television: 0,
            Periodico: 0,
        },
        "Jorge Álvarez Máynez": {
            Positiva: 0,
            Negativa: 0,
            Neutra: 0,
            Total: 0,
            Radio: 0,
            Television: 0,
            Periodico: 0,
        },
    };
}

function countMentions(
    data: Data[],
    accountantsByActor: Record<
        string,
        {
            Positiva: number;
            Negativa: number;
            Neutra: number;
            Total: number;
            Radio: number;
            Television: number;
            Periodico: number;
        }
    >
) {
    for (const dato of data) {
        const actor = getActorName(dato.vacactor.toString());
        const fmeDescripcion = dato.fmedescripcion;

        if (actor && accountantsByActor[actor]) {
            if (
                dato.vactendencia === "Positiva" ||
                dato.vactendencia === "Negativa" ||
                dato.vactendencia === "Neutra"
            ) {
                accountantsByActor[actor][dato.vactendencia]++;
                accountantsByActor[actor].Total++;
            }
            if (fmeDescripcion) {
                if (fmeDescripcion.includes("Radio")) {
                    accountantsByActor[actor].Radio++;
                } else if (fmeDescripcion.includes("Televisión")) {
                    accountantsByActor[actor].Television++;
                } else if (fmeDescripcion.includes("Periódicos")) {
                    accountantsByActor[actor].Periodico++;
                }
            }
        }
    }
}

function calculateResults(
    accountantsByActor: Record<string, AccountantData>,
    totalMentions: number
): ResultsMentions[] {
    const results: ResultsMentions[] = [];

    for (const [actor] of Object.entries(accountantsByActor)) {
        const { Positiva, Negativa, Neutra, Total, Radio, Television, Periodico } =
            accountantsByActor[actor];
        const porcentajeTotal = calculatePercentage(Total, totalMentions);

        results.push({
            Actor: actor,
            Positivas: Positiva,
            Negativas: Negativa,
            Neutras: Neutra,
            Total: Total,
            PorcentajeTotal: porcentajeTotal,
            Radio: Radio,
            Television: Television,
            Periodico: Periodico,
        });
    }

    return results;
}

function calculatePercentage(value: number, total: number): number {
    return parseFloat(((value / total) * 100).toFixed(2));
}

function getActorName(id: string): string | undefined {
    switch (id) {
        case CLAUDIA_SHEINBAUM_ID:
            return "Claudia Sheinbaum Pardo";
        case XOCHITL_GALVEZ_ID:
            return "Xóchitl Gálvez";
        case JORGE_ALVAREZ_MAYNEZ_ID:
            return "Jorge Álvarez Máynez";
        default:
            return undefined;
    }
}

async function calculateTotalMentions(menciones: Mention[]): Promise<TotalMentions> {
    try {
        const { TotalRadio, TotalTelevision, TotalPeriodico, TotalMedios } =
            menciones.reduce(
                (acc, mencion) => {
                    const { Radio, Television, Periodico, Total } = mencion;
                    return {
                        TotalRadio: acc.TotalRadio + Radio,
                        TotalTelevision: acc.TotalTelevision + Television,
                        TotalPeriodico: acc.TotalPeriodico + Periodico,
                        TotalMedios: acc.TotalMedios + Total,
                    };
                },
                {
                    TotalRadio: 0,
                    TotalTelevision: 0,
                    TotalPeriodico: 0,
                    TotalMedios: 0,
                }
            );

        return { TotalRadio, TotalTelevision, TotalPeriodico, TotalMedios };
    } catch (error) {
        console.error("Error en calculateTotalMentions:", error);
        throw error;
    }
}

async function processArrayOfActors(data: Data[]): Promise<ArrayActors> {
    try {
        if (!Array.isArray(data)) {
            throw new Error("El argumento 'data' debe ser un arreglo.");
        }

        const claudiaSheinbaumMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) ===
                "Claudia Sheinbaum Pardo"
        );

        const xochitlGalvezMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) === "Xóchitl Gálvez"
        );

        const jorgeAlvarezMentions = data.filter(
            (mention) =>
                getActorName(mention.vacactor.toString()) === "Jorge Álvarez Máynez"
        );

        return {
            claudiaSheinbaumMentions,
            xochitlGalvezMentions,
            jorgeAlvarezMentions,
        };
    } catch (error) {
        console.error("Error en processArrayOfActors:", error);
        throw error;
    }
}

async function processMentionsForTopics(
    mentions: Data[]
): Promise<ProcessedMentions> {
    const topicFrequencyMap = createTopicFrequencyMap(mentions);
    const topNineTopics = getTopNineTopics(topicFrequencyMap);
    const { totalPositivas, totalNeutras, totalNegativas } =
        calculateTotalTendencies(topNineTopics);

    return {
        mentions: topNineTopics,
        totalPositivas,
        totalNeutras,
        totalNegativas,
        totalTendencies: totalPositivas + totalNeutras + totalNegativas,
    };
}

function createTopicFrequencyMap(mentions: Data[]): Map<string, Frequency> {
    const topicFrequencyMap = new Map<string, Frequency>();

    mentions.forEach((mention) => {
        const topic = mention.ejedescripcionh;
        const tendency = mention.vactendencia;
        const actor = mention.actor;

        let mentionObj = topicFrequencyMap.get(topic);
        if (!mentionObj) {
            mentionObj = {
                frequency: 0,
                tendencies: { Neutra: 0, Positiva: 0, Negativa: 0 },
                actors: new Set<string>(),
            };
            topicFrequencyMap.set(topic, mentionObj);
        }

        mentionObj.frequency++;
        mentionObj.tendencies[tendency]++;
        mentionObj.actors.add(actor);
    });

    return topicFrequencyMap;
}

function getTopNineTopics(
    topicFrequencyMap: Map<string, Frequency>
): TopicMentions[] {
    const topicFrequencyArray = Array.from(topicFrequencyMap.entries())
        .filter(([topic, _]) => topic !== null)
        .map(([topic, { frequency, tendencies, actors }]) => ({
            topic,
            frequency,
            tendencies,
            actors: Array.from(actors),
        }));

    return topicFrequencyArray.sort((a, b) => b.frequency - a.frequency).slice(0, 9);
}

function calculateTotalTendencies(
    topNineTopics: TopicMentions[]
): TotalTendenciesByActor {
    let totalPositivas = 0;
    let totalNeutras = 0;
    let totalNegativas = 0;

    topNineTopics.forEach(({ tendencies }) => {
        totalPositivas += tendencies.Positiva || 0;
        totalNeutras += tendencies.Neutra || 0;
        totalNegativas += tendencies.Negativa || 0;
    });

    return { totalPositivas, totalNeutras, totalNegativas };
}

async function getDataForTable(
    fecha: string,
    semanal?: boolean
): Promise<MentionData[]> {
    try {
        let condition;
        if (semanal) {
            const fechaActual = new Date(fecha);
            const fechaHaceUnaSemana = new Date(
                fechaActual.getTime() - 7 * 24 * 60 * 60 * 1000
            );
            const fechaRestada = new Date(fecha);
            fechaRestada.setDate(fechaRestada.getDate() - 1);
            condition = ` VACSUBTEMAXML IN (200620, 200621, 200622)
                AND EJEDESCRIPCION != "Eliminada"
                AND CAPFCAPSULA BETWEEN STR_TO_DATE('${fechaHaceUnaSemana
                    .toISOString()
                    .slice(0, 10)}', '%Y-%m-%d')
                AND STR_TO_DATE('${fechaRestada
                    .toISOString()
                    .slice(0, 10)}', '%Y-%m-%d')`;
        } else {
            condition = ` VACSUBTEMAXML IN (200620, 200621, 200622)
                AND EJEDESCRIPCION != "Eliminada"
                AND CAPFCAPSULA BETWEEN STR_TO_DATE('${fecha}', '%Y-%m-%d')
                AND DATE_ADD(STR_TO_DATE('${fecha}', '%Y-%m-%d'), INTERVAL 1 DAY)`;
        }

        const connection = await dbConnection();
        const [rows, _fields] = await connection.execute<RowDataPacket[]>(
            `SELECT DISTINCT DATE_FORMAT(CAPFCAPSULA, '%Y-%m-%d') AS FECHA,
            DATE_FORMAT(CAPFCAPSULA, '%H:%i:%s') AS HORA, FAMDESCRIPCION,FESDESCRIPCION,
            FNOMEDIO, FNODESCRIPCION,FNOTIRAJE, FTECONDUCTOR, FNODIASEMISION, FCADESCRIPCION,
            MUNNOMMUNICIPIO, FREBANDA, FREFRECUENCIA, FREHORARIO, FMECLAVE, FMEDESCRIPCION,
            FTMDESCRIPCION,FCLDESCRIPCION, VACACTOR, CAPTITULO,
            DATE_FORMAT(CAPDURACION, '%H:%i:%s') AS CAPDURACION, CAPCLAVE, CAPCM, CAPFRACCION,
            CAPCOSTOCM, TEXNOMBRE, QUENOMBRE, TEVDESCRIPCION, VACPARTICIPACION,
            CASE WHEN (VACTENDENCIA = 1) THEN 'Positiva'
            WHEN (VACTENDENCIA = 2) THEN 'Negativa'
            WHEN (VACTENDENCIA = 3) THEN 'Neutra' ELSE ' ' END AS VACTENDENCIA,
            VACCATEGORIA, VACCLAVE,
            CASE WHEN (VACCATEGORIA = 1) THEN 'Política'
            WHEN (VACCATEGORIA = 2) THEN 'Económica'
            WHEN (VACCATEGORIA = 3) THEN 'Jurídica'
            WHEN (VACCATEGORIA = 4) THEN 'Social'
            WHEN (VACCATEGORIA = 5) THEN 'Actos Personales'
            WHEN (VACCATEGORIA = 6) THEN 'Actos de Gobierno'
            WHEN (VACCATEGORIA = 7) THEN 'Conferencia Matutina'
            WHEN (VACCATEGORIA = 8) THEN 'Boletin'
            WHEN (VACCATEGORIA = 9) THEN 'Reporte de Avances'
            WHEN (VACCATEGORIA = 10) THEN 'Nota Aclaratoria'
            WHEN (VACCATEGORIA = 11) THEN 'Estrategia'
            WHEN (VACCATEGORIA = 12) THEN 'Comunicados'
            WHEN (VACCATEGORIA = 13) THEN 'Envio de Informacion'
            WHEN (VACCATEGORIA = 14) THEN 'Nota'
            WHEN (VACCATEGORIA = 15) THEN 'Informacion'
            WHEN (VACCATEGORIA = 16) THEN 'Nota color'
            WHEN (VACCATEGORIA = 17) THEN 'Entrevista'
            WHEN (VACCATEGORIA = 18) THEN 'Gira' ELSE ' ' END AS CATEGORIA, VACFODA,
            VACSUBTEMAXML, DATE_FORMAT(VACFVALORACION,'%d/%m/%Y') AS VACFVALORACION,
            USRNOMBRE, IFNULL(CAADIST8A12, 0) AS CAADIST8A12,
            IFNULL(CAADIST13A17,0) CAADIST13A17, IFNULL(CAADIST18A24, 0) CAADIST18A24,
            IFNULL(CAADIST25A34, 0) CAADIST25A34, IFNULL(CAADIST35A44,0) CAADIST35A44,
            IFNULL(CAADIST45A54, 0) CAADIST45A54, IFNULL(CAADIST55AMAS,0) CAADIST55AMAS,
            IFNULL(CAADISTALTO,0) CAADISTALTO, IFNULL(CAADISTMEDIO,0)  CAADISTMEDIO,
            IFNULL(CAADISTBAJO,0) CAADISTBAJO, IFNULL(CAADISTHOMBRE,0) CAADISTHOMBRE,
            IFNULL(CAADISTMUJER,0) CAADISTMUJER, IFNULL(CAABANDA,' ') CAABANDA,
            CAAFRECUENCIA, IFNULL(CAAALCANCEREAL,0) CAAALCANCEREAL,
            IFNULL(TOPDESCRIPCION,'') AS TOPDESCRIPCION, IFNULL(CAPNPAGINA,' ') AS PAGINA,
            IFNULL(CAPCOMENTARIO,' ') AS AUTOR,CAPNOMBRE,CAPMEDIO,VACCAPSULA,FPRDESCRIPCION,
            FRESIGLAS, IFNULL(CAPTIPOCOSTO,0) AS CAPTIPOCOSTO,EJEDESCRIPCION, EJEDESCRIPCIONH,
            CAPTEXTCOMP AS CAPTEXTCOMP, TRIM(CONCAT(substr(CIMNOMBREARCHIVO,5,4), '/',
            substr(CIMNOMBREARCHIVO,3,2),
            CASE substr(CIMNOMBREARCHIVO, 3,2) WHEN '01' THEN 'Enero'
            WHEN substr(CIMNOMBREARCHIVO, 3,2) = '02' THEN 'Febrero'
            WHEN substr(CIMNOMBREARCHIVO, 3,2) = '03' THEN 'Marzo'
            WHEN  '04' THEN 'Abril'
            WHEN '05' THEN 'Mayo'
            WHEN  '06' THEN 'Junio'
            WHEN  '07' THEN 'Julio'
            WHEN  '08' THEN 'Agosto'
            WHEN  '09' THEN 'Septiembre'
            WHEN  '10' THEN 'Octubre'
            WHEN  '11' THEN 'Noviembre'
            WHEN  '12' THEN 'Diciembre' ELSE 'Sin mes' END,
            substr(CIMNOMBREARCHIVO,7,2), '/Imagenes_',
            substr(CIMNOMBREARCHIVO,1,8), '/',
            trim(CIMNOMBREARCHIVO))) AS URLTESTIGO, CIMNOMBREARCHIVO,
            INTELITE_IVECTOR1.VC1NOMBRE AS ACTOR
            FROM INTELITE_IVALORACAPSULAS
            left join INTELITE_ICAPSULA on VACCAPSULA=CAPCLAVE
            left join INTELITE_IFTEAMBITO on CAPAMBITO = FAMCLAVE
            left join INTELITE_IFTEESTADO on CAPESTADO = FESCLAVE
            left join INTELITE_IFTENOMBRE on CAPNOMBRE = FNOCLAVE
            left join INTELITE_IFTEPROGRAMA on FPRCLAVE = FNOGPOPROGRAMA
            LEFT JOIN INTELITE_IFTECONDUCTOR ON CAPCONDUCTOR = FTECLAVE
            LEFT JOIN INTELITE_IFRECUEMISORA on FREFNOCLAVE = FNOCLAVE and FNOFRECUENCIA = FREFRECUENCIA and FRESTATUS = 'A'
            LEFT JOIN INTELITE_IFTECADENA on FCACLAVE = FNOCADENA
            LEFT JOIN INTELITE_IFTEMUNICIPIO on MUNESTADO = FNOESTADO and MUNCVEMUNICIPIO = FNOPLAZA
            left join INTELITE_IFTEMEDIO on CAPMEDIO = FMECLAVE
            left join INTELITE_IFTETIPOMEDIO on CAPTIPOMEDIO = FTMCLAVE
            left join INTELITE_IFTECLASIFICACION on CAPCLASIFICACION = FCLCLAVE
            left join INTELITE_ITEMAXML on VACTEMAXML = TEXCLAVE
            left join INTELITE_IQUERYXML on VACSUBTEMAXML =QUECLAVE
            left join INTELITE_IUSUARIO on VACUSUARIO = USRCLAVE
            left join INTELITE_ITEMASVALORA on VACTEMA=TEVCLAVE
            left join INTELITE_ICAPSULAALCANCE on CAPCLAVE = CAACAPSULA
            left join INTELITE_ITOPICOS on VACTOPICO = TOPCLAVE
            left join INTELITE_IEJETEMATICO on VACEJE = EJECLAVE
            left join INTELITE_IEJETEMATICOHIJO on VACEJE = EJECLAVEPAPA and VACEJEHIJO = EJECLAVEH
            LEFT JOIN CLIPPING_ICLIPPINGPLUTEM  ON CAPCLAVE = CPTCAPTEMA
            LEFT JOIN CLIPPING_ICLIPPINGIMAGEN ON CPTCLIPPING = CIMCLIPPING
            LEFT JOIN INTELITE_IVECTOR1 ON VC1CLAVE = VACACTOR
            WHERE
            ${condition}`
        );

        return mapData(rows);
    } catch (error) {
        throw error;
    }
}

function mapData(rows: RowDataPacket[]): MentionData[] {
    const datosTransformados: MentionData[] = rows.map((row) => {
        const cleanCaptextcomp = row.CAPTEXTCOMP
            ? stripHtmlAndDecode(row.CAPTEXTCOMP)
            : "";
        const urlBase =
            "http://intelicast.net/inteliteApp/escritorioOk/jsptestigos/testigo.jsp?cveNota=";
        const url = `${urlBase}${row.CAPCLAVE || ""}`;
        return {
            FECHA: row.FECHA || "",
            HORA: row.HORA || "",
            FAMDESCRIPCION: row.FAMDESCRIPCION || "",
            FESDESCRIPCION: row.FESDESCRIPCION || "",
            FNODESCRIPCION: row.FNODESCRIPCION || "",
            FNOTIRAJE: row.FNOTIRAJE !== null ? row.FNOTIRAJE.toString() : "",
            FNODIASEMISION:
                row.FNODIASEMISION !== null ? row.FNODIASEMISION.toString() : "",
            FTECONDUCTOR: row.FTECONDUCTOR || "",
            FNOMEDIO: row.FNOMEDIO || "",
            FCADESCRIPCION: row.FCADESCRIPCION || "",
            MUNNOMMUNICIPIO: row.MUNNOMMUNICIPIO || "",
            FMEDESCRIPCION: row.FMEDESCRIPCION || "",
            FREBANDA: row.FREBANDA || "",
            FREFRECUENCIA: row.FREFRECUENCIA || "",
            FREHORARIO: row.FREHORARIO || "",
            FMECLAVE: row.FMECLAVE || "",
            FMEDISTRIBUCION: row.FMEDISTRIBUCION || "",
            FTMDESCRIPCION: row.FTMDESCRIPCION || "",
            FCLDESCRIPCION: row.FCLDESCRIPCION || "",
            VACACTOR: row.VACACTOR || "",
            CAPTITULO: row.CAPTITULO || "",
            CAPDURACION: row.CAPDURACION || "",
            CAPCLAVE: row.CAPCLAVE || "",
            CAPCM: row.CAPCM || "",
            CAPFRACCION: row.CAPFRACCION || "",
            CAPCOSTOCM: row.CAPCOSTOCM || "",
            TEXNOMBRE: row.TEXNOMBRE || "",
            QUENOMBRE: row.QUENOMBRE || "",
            TEVDESCRIPCION: row.TEVDESCRIPCION || "",
            ACTOR: row.ACTOR || "",
            VACPARTICIPACION: row.VACPARTICIPACION || "",
            VACCATEGORIA: row.VACCATEGORIA || "",
            VACTENDENCIA: row.VACTENDENCIA || "",
            VACFODA: row.VACFODA || "",
            VACSUBTEMAXML: row.VACSUBTEMAXML || "",
            VACFVALORACION: row.VACFVALORACION || "",
            USRNOMBRE: row.USRNOMBRE || "",
            CAADIST8A12: row.CAADIST8A12 || 0,
            CAADIST13A17: row.CAADIST13A17 || 0,
            CAADIST18A24: row.CAADIST18A24 || 0,
            CAADIST25A34: row.CAADIST25A34 || 0,
            CAADIST35A44: row.CAADIST35A44 || 0,
            CAADIST45A54: row.CAADIST45A54 || 0,
            CAADIST55AMAS: row.CAADIST55AMAS || 0,
            CAADISTALTO: row.CAADISTALTO || 0,
            CAADISTMEDIO: row.CAADISTMEDIO || 0,
            CAADISTBAJO: row.CAADISTBAJO || 0,
            CAADISTHOMBRE: row.CAADISTHOMBRE || 0,
            CAADISTMUJER: row.CAADISTMUJER || 0,
            CAABANDA: row.CAABANDA || "",
            CAAFRECUENCIA: row.CAAFRECUENCIA || "",
            CAAALCANCEREAL: row.CAAALCANCEREAL || 0,
            PAGINA: row.PAGINA || "",
            AUTOR: row.AUTOR || "",
            CAPNOMBRE: row.CAPNOMBRE || "",
            CAPMEDIO: row.CAPMEDIO || "",
            FPRDESCRIPCION: row.FPRDESCRIPCION || "",
            FRESIGLAS: row.FRESIGLAS || "",
            CAPTIPOCOSTO: row.CAPTIPOCOSTO || "",
            CIMNOMBREARCHIVO: row.CIMNOMBREARCHIVO || "",
            CAPTEXTCOMP: cleanCaptextcomp || "",
            URL: url,
            TOPDESCRIPCION: row.TOPDESCRIPCION || "",
            EJEDESCRIPCION: row.EJEDESCRIPCION || "",
            EJEDESCRIPCIONH: row.EJEDESCRIPCIONH || "",
            VACCLAVE: row.VACCLAVE || "",
        };
    });

    return datosTransformados;
}

function stripHtmlAndDecode(html: string): string {
    const cleanText = html.replace(/<[^>]*>/g, "");

    const decodedText = decode(cleanText);

    return decodedText;
}

async function deleteMention(VACCLAVE: number): Promise<string> {
    try {
        const connection = await dbConnection();

        const [mention]: any = await connection.execute(
            `
            SELECT VACCLAVE
            FROM INTELITE_IVALORACAPSULAS
            WHERE VACCLAVE = ?
            `,
            [VACCLAVE]
        );

        if (mention && mention.length > 0) {
            await connection.execute(
                `
                UPDATE INTELITE_IVALORACAPSULAS
                SET VACEJE = 2
                WHERE VACCLAVE = ?
                `,
                [VACCLAVE]
            );
            return `Mención con VACCLAVE ${VACCLAVE} eliminada correctamente.`;
        } else {
            return `No se encontró ninguna mención con VACCLAVE ${VACCLAVE}.`;
        }
    } catch (error) {
        throw new Error("Error al eliminar la mención.");
    }
}

export default {
    getDataMentions,
    getMentionsByActor,
    calculateTotalMentions,
    processArrayOfActors,
    processMentionsForTopics,
    getDataForTable,
    deleteMention,
};
