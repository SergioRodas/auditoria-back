import { RowDataPacket } from "mysql2";
import dbConnection from "../../config/mysql";
import he from "he";
import {
    CLAUDIA_SHEINBAUM,
    JORGE_ALVAREZ_MAYNEZ,
    XOCHITL_GALVEZ,
} from "../../constants/candidates/candidates";
import {
    Interview,
    interviewsByCandidate,
} from "../../interfaces/interviews/interviewInterface";

async function getInterviews(
    fecha: string,
    semanal?: boolean
): Promise<RowDataPacket[]> {
    const connection = await dbConnection();
    let sql: string;
    let params: any[];

    const selectClause = `
        SELECT
            S.TITULO,
            S.SINTESIS,
            S.ID_SECCION,
            S.CVECAPSULA,
            S.ID_SINTESIS,
            ES.NOMBRE_SECCION
        FROM
            EDITOR_SINTESIS S
        LEFT JOIN
            EDITOR_SECCIONES ES ON S.ID_SECCION = ES.ID_SECCION
        WHERE
            S.ID_DOCUMENTO = 1000147
            AND S.FLG_ELIMINADO = 0
    `;

    if (semanal) {
        const fechaActual = new Date(fecha);
        const fechaHaceUnaSemana = new Date(
            fechaActual.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        const fechaRestada = new Date(fecha);
        fechaRestada.setDate(fechaRestada.getDate() - 1);

        sql = `
            ${selectClause}
            AND DATE(S.FECHA) BETWEEN ? AND ?;
        `;

        params = [
            fechaHaceUnaSemana.toISOString().slice(0, 10),
            fechaRestada.toISOString().slice(0, 10),
        ];
    } else {
        sql = `
            ${selectClause}
            AND DATE(S.FECHA) = ?;
        `;
        params = [fecha];
    }

    const [rows, _fields] = await connection.execute<RowDataPacket[]>(sql, params);
    return rows;
}

async function processInterviews(
    rows: RowDataPacket[]
): Promise<interviewsByCandidate[]> {
    try {
        const idSintesisArray = rows.map((row) => row.ID_SINTESIS);
        let interviewsResponse: any = [];
        if (idSintesisArray.length <= 0) return interviewsResponse;
        const sourceRows = await getSourceRows(idSintesisArray);

        const interviewsArray: Interview[] = rows
            .map((row) => buildInterview(row, sourceRows))
            .filter((interview) => interview !== null) as Interview[];

        const interviewsByCandidate: { [key: string]: Interview[] } = {};
        interviewsArray.forEach((interview: Interview) => {
            const candidate = interview.nombre_seccion;
            if (!interviewsByCandidate[candidate]) {
                interviewsByCandidate[candidate] = [];
            }
            interviewsByCandidate[candidate].push(interview);
        });

        for (const candidate in interviewsByCandidate) {
            const interviews = interviewsByCandidate[candidate];
            interviewsResponse.push({
                candidate: candidate,
                interviews: interviews,
            });
        }
        return interviewsResponse;
    } catch (error) {
        throw new Error("Ocurrió un error al procesar las entrevistas");
    }
}

async function getSourceRows(idSintesisArray: number[]): Promise<RowDataPacket[]> {
    const connection = await dbConnection();

    const placeholders = idSintesisArray.map(() => "?").join(",");

    const [sourceRows, _fields] = await connection.execute<RowDataPacket[]>(
        `
        SELECT
            F.MEDIO,
            F.URL,
            R.ID_SINTESIS
        FROM
            EDITOR_FUENTES F
            INNER JOIN EDITOR_REFERENCIAS R ON R.ID_REFERENCIA = F.ID_REFERENCIA
        WHERE
            R.ID_SINTESIS IN (${placeholders})
        `,
        idSintesisArray
    );

    return sourceRows;
}

function buildInterview(
    row: RowDataPacket,
    sourceRows: RowDataPacket[]
): Interview | null {
    const sourceRow = sourceRows.find(
        (source) => source.ID_SINTESIS === row.ID_SINTESIS
    );

    if (!sourceRow) {
        return null;
    }

    const interview: Interview = {
        titulo: row.TITULO,
        sintesis: extractTextWithoutTags(correctTextWithEntitiesHTML(row.SINTESIS)),
        nombre_seccion: row.NOMBRE_SECCION,
        cvcapsula: row.CVECAPSULA,
        id_sintesis: row.ID_SINTESIS,
        nombre_testigo: sourceRow.MEDIO,
        url: sourceRow.URL,
    };

    if (
        ![JORGE_ALVAREZ_MAYNEZ, CLAUDIA_SHEINBAUM, XOCHITL_GALVEZ].includes(
            interview.nombre_seccion
        )
    ) {
        return null;
    }

    return interview;
}

function extractTextWithoutTags(html: string): string {
    return html.replace(/<[^>]*>/g, "");
}

function correctTextWithEntitiesHTML(texto: string): string {
    return he.decode(texto);
}

export default {
    getInterviews,
    processInterviews,
};
