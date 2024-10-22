"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("../../config/mysql"));
const he_1 = __importDefault(require("he"));
const candidates_1 = require("../../constants/candidates/candidates");
function getInterviews(fecha, semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield (0, mysql_1.default)();
        let sql;
        let params;
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
            const fechaHaceUnaSemana = new Date(fechaActual.getTime() - 7 * 24 * 60 * 60 * 1000);
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
        }
        else {
            sql = `
            ${selectClause}
            AND DATE(S.FECHA) = ?;
        `;
            params = [fecha];
        }
        const [rows, _fields] = yield connection.execute(sql, params);
        return rows;
    });
}
function processInterviews(rows) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idSintesisArray = rows.map((row) => row.ID_SINTESIS);
            let interviewsResponse = [];
            if (idSintesisArray.length <= 0)
                return interviewsResponse;
            const sourceRows = yield getSourceRows(idSintesisArray);
            const interviewsArray = rows
                .map((row) => buildInterview(row, sourceRows))
                .filter((interview) => interview !== null);
            const interviewsByCandidate = {};
            interviewsArray.forEach((interview) => {
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
        }
        catch (error) {
            throw new Error("Ocurrió un error al procesar las entrevistas");
        }
    });
}
function getSourceRows(idSintesisArray) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield (0, mysql_1.default)();
        const placeholders = idSintesisArray.map(() => "?").join(",");
        const [sourceRows, _fields] = yield connection.execute(`
        SELECT
            F.MEDIO,
            F.URL,
            R.ID_SINTESIS
        FROM
            EDITOR_FUENTES F
            INNER JOIN EDITOR_REFERENCIAS R ON R.ID_REFERENCIA = F.ID_REFERENCIA
        WHERE
            R.ID_SINTESIS IN (${placeholders})
        `, idSintesisArray);
        return sourceRows;
    });
}
function buildInterview(row, sourceRows) {
    const sourceRow = sourceRows.find((source) => source.ID_SINTESIS === row.ID_SINTESIS);
    if (!sourceRow) {
        return null;
    }
    const interview = {
        titulo: row.TITULO,
        sintesis: extractTextWithoutTags(correctTextWithEntitiesHTML(row.SINTESIS)),
        nombre_seccion: row.NOMBRE_SECCION,
        cvcapsula: row.CVECAPSULA,
        id_sintesis: row.ID_SINTESIS,
        nombre_testigo: sourceRow.MEDIO,
        url: sourceRow.URL,
    };
    if (![candidates_1.JORGE_ALVAREZ_MAYNEZ, candidates_1.CLAUDIA_SHEINBAUM, candidates_1.XOCHITL_GALVEZ].includes(interview.nombre_seccion)) {
        return null;
    }
    return interview;
}
function extractTextWithoutTags(html) {
    return html.replace(/<[^>]*>/g, "");
}
function correctTextWithEntitiesHTML(texto) {
    return he_1.default.decode(texto);
}
exports.default = {
    getInterviews,
    processInterviews,
};
