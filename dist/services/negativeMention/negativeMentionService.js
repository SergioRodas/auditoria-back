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
const mediumService_1 = require("../medium/mediumService");
function getNegativeMentionsforColumns(fecha, semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        let condition, fechaConsulta;
        if (semanal) {
            const fechaActual = new Date(fecha);
            const fechaHaceUnaSemana = new Date(fechaActual.getTime() - 7 * 24 * 60 * 60 * 1000);
            const fechaRestada = new Date(fecha);
            fechaRestada.setDate(fechaRestada.getDate() - 1);
            condition = `  WHERE
            DATE(S.FECHA) BETWEEN ? AND ?
            AND S.ID_DOCUMENTO = 1000129
            AND S.FLG_ELIMINADO = 0;`;
            fechaConsulta = [
                fechaHaceUnaSemana.toISOString().slice(0, 10),
                fechaRestada.toISOString().slice(0, 10),
            ];
        }
        else {
            condition = `  WHERE
            DATE(S.FECHA) = ?
            AND S.ID_DOCUMENTO = 1000129
            AND S.FLG_ELIMINADO = 0;`;
            fechaConsulta = [fecha];
        }
        const connection = yield (0, mysql_1.default)();
        let query = `SELECT
                S.TITULO,
                S.SINTESIS,
                S.ID_SECCION,
                S.CVECAPSULA,
                S.ID_SINTESIS,
                ES.NOMBRE_SECCION
            FROM
                EDITOR_SINTESIS S
            LEFT JOIN
                EDITOR_SECCIONES ES ON S.ID_SECCION = ES.ID_SECCION`;
        query += condition;
        const [rows, _fields] = yield connection.execute(query, fechaConsulta);
        return rows;
    });
}
function cleanText(text) {
    const textWithoutTags = stripHTMLTags(text);
    const decodedText = decodeHTMLEntities(textWithoutTags);
    return decodedText;
}
function stripHTMLTags(html) {
    return html.replace(/<[^>]*>/g, "");
}
function decodeHTMLEntities(text) {
    return he_1.default.decode(text);
}
function processNegativeMentionsforColumns(rows) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const idSintesisArray = rows.map((row) => row.ID_SINTESIS);
            if (idSintesisArray.length === 0) {
                return [];
            }
            const sourceRows = yield getSourceRows(idSintesisArray);
            const negativeMentions = rows.map(({ TITULO, SINTESIS, ID_SECCION, CVECAPSULA, ID_SINTESIS, NOMBRE_SECCION, }) => {
                const filteredSources = sourceRows.filter(({ ID_SINTESIS: sourceId }) => sourceId === ID_SINTESIS);
                const sintesisCleaned = cleanText(SINTESIS);
                const testigo = filteredSources.map(({ URL, MEDIO }) => ({
                    url: URL,
                    medio: MEDIO,
                }));
                return {
                    titulo: TITULO,
                    sintesis: sintesisCleaned,
                    idSeccion: ID_SECCION,
                    cveCapsula: CVECAPSULA,
                    idSintesis: ID_SINTESIS,
                    nombreSeccion: NOMBRE_SECCION,
                    testigo,
                };
            });
            return negativeMentions;
        }
        catch (error) {
            console.error("Error al procesar las menciones negativas:", error);
            throw new Error("Ocurrió un error al procesar las menciones negativas.");
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
function getNegativeMentionsForRadioOrTelevision(fecha, tipoMedio, semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sql;
            const params = [tipoMedio];
            if (semanal) {
                const fechaActual = new Date(fecha);
                const fechaHaceUnaSemana = new Date(fechaActual.getTime() - 7 * 24 * 60 * 60 * 1000);
                const fechaRestada = new Date(fecha);
                fechaRestada.setDate(fechaRestada.getDate() - 1);
                sql = `
                SELECT id, tipo_medio, cadena, programa, autor, mencion
                FROM AUDITORIA_MENCION_NEGATIVA
                WHERE tipo_medio = ? AND fecha BETWEEN ? AND ?
            `;
                params.push(fechaHaceUnaSemana.toISOString().slice(0, 10));
                params.push(fechaRestada.toISOString().slice(0, 10));
            }
            else {
                sql = `
                SELECT id, tipo_medio, cadena, programa, autor, mencion
                FROM AUDITORIA_MENCION_NEGATIVA
                WHERE tipo_medio = ? AND fecha = ?
            `;
                params.push(fecha);
            }
            const connection = yield (0, mysql_1.default)();
            const [rows] = yield connection.execute(sql, params);
            const mencionesNegativas = rows.map((row) => ({
                id: row.id,
                tipo_medio: row.tipo_medio,
                cadena: row.cadena,
                programa: row.programa,
                autor: row.autor,
                mencion: row.mencion,
            }));
            return mencionesNegativas;
        }
        catch (error) {
            throw error;
        }
    });
}
function getNegativeMentionAdmin(fecha, tipoMedio, semanal) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            let sql = `
            SELECT
                CAPTEXTCOMP AS captexcomp,
                CAPCLAVE AS capclave,
                FMEDESCRIPCION AS fnodescripcion,
                CASE
                    WHEN VACTENDENCIA = 2 THEN 'Negativa'
                    ELSE ' '
                END AS vactendencia,
                FNODESCRIPCION AS fnodescripcion,
                IFNULL(CAPCOMENTARIO, ' ') AS autor,
                AMN.id AS auditoria_id,
                AMN.autor AS auditoria_autor,
                AMN.programa AS auditoria_programa,
                AMN.cadena AS auditoria_cadena,
                AMN.mencion AS auditoria_mencion
            FROM
                INTELITE_IVALORACAPSULAS
            LEFT JOIN
                INTELITE_ICAPSULA ON VACCAPSULA = CAPCLAVE
            LEFT JOIN
                INTELITE_IFTENOMBRE ON CAPNOMBRE = FNOCLAVE
            LEFT JOIN
                INTELITE_IFTECADENA ON FCACLAVE = FNOCADENA
            LEFT JOIN
                INTELITE_IFTEMEDIO ON CAPMEDIO = FMECLAVE
            LEFT JOIN
                AUDITORIA_MENCION_NEGATIVA AMN ON CAPCLAVE = AMN.capsula
            WHERE
                VACSUBTEMAXML IN (200620)
                AND VACTENDENCIA = 2
                AND FMEDESCRIPCION = ?

        `;
            let rows;
            if (typeof semanal === "boolean" && semanal) {
                const fechaActual = new Date(fecha);
                fechaActual.setDate(fechaActual.getDate() - 7);
                const fechaHaceUnaSemana = fechaActual.toISOString().split("T")[0];
                const fechaRestada = new Date(fecha);
                fechaRestada.setDate(fechaRestada.getDate() - 1);
                sql += `AND DATE(CAPFCAPSULA) BETWEEN DATE(?) AND DATE(?)`;
                [rows] = yield connection.execute(sql, [
                    tipoMedio,
                    fechaHaceUnaSemana,
                    fechaRestada,
                ]);
            }
            else {
                sql += `AND DATE(CAPFCAPSULA) = ?`;
                [rows] = yield connection.execute(sql, [
                    tipoMedio,
                    fecha,
                ]);
            }
            const result = rows.map((row) => {
                const captexcompClear = he_1.default
                    .decode(row.captexcomp)
                    .replace(/<[^>]*>/g, "");
                const testigoURL = `http://intelicast.net/inteliteApp/escritorioOk/jsptestigos/testigo.jsp?cveNota=${row.capclave}`;
                const programGroup = (0, mediumService_1.getProgramGroup)(row.fnodescripcion, tipoMedio);
                return {
                    captexcomp: captexcompClear,
                    capclave: row.capclave,
                    autor: row.auditoria_autor || row.autor,
                    testigo: testigoURL,
                    programa: row.auditoria_programa || row.fnodescripcion,
                    programGroup: row.auditoria_cadena || programGroup,
                    auditoria_id: row.auditoria_id,
                    auditoria_mencion: row.auditoria_mencion,
                    fecha,
                };
            });
            return result;
        }
        catch (error) {
            throw new Error("Error al obtener menciones negativas.");
        }
    });
}
function createOrUpdateMentionNegative(mentionData, currentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, capsula, tipoMedio, cadena, programa, autor, mencion, fecha } = mentionData;
            const connection = yield (0, mysql_1.default)();
            if (id != null) {
                const [existingMentions] = yield connection.execute(`
                SELECT *
                FROM AUDITORIA_MENCION_NEGATIVA
                WHERE id = ?
                `, [id]);
                if (existingMentions && existingMentions.length > 0) {
                    const updatedFields = [];
                    if (cadena !== null && cadena !== existingMentions[0].cadena) {
                        updatedFields.push({
                            campo: "cadena",
                            valorAnterior: existingMentions[0].cadena,
                            valorNuevo: cadena,
                        });
                    }
                    if (programa !== null && programa !== existingMentions[0].programa) {
                        updatedFields.push({
                            campo: "programa",
                            valorAnterior: existingMentions[0].programa,
                            valorNuevo: programa,
                        });
                    }
                    if (autor !== null && autor !== existingMentions[0].autor) {
                        updatedFields.push({
                            campo: "autor",
                            valorAnterior: existingMentions[0].autor,
                            valorNuevo: autor,
                        });
                    }
                    for (const { campo, valorAnterior, valorNuevo } of updatedFields) {
                        yield insertAuditLogEntry(connection, campo, valorNuevo, valorAnterior, currentUser.id);
                    }
                    yield updateMention(connection, id, capsula, tipoMedio, cadena, programa, autor, mencion, fecha);
                    return "Mención negativa actualizada correctamente.";
                }
            }
            yield createNewMention(connection, capsula, tipoMedio, cadena, programa, autor, mencion, fecha);
            return "Nueva mención negativa creada correctamente.";
        }
        catch (error) {
            throw new Error("Error al crear o actualizar la mención negativa.");
        }
    });
}
function insertAuditLogEntry(connection, nombreCampo, valorActual, valorAnterior, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield connection.execute(`
        INSERT INTO AUDITORIA_REGISTRO_CAMBIOS (nombre_campo, valor_actual, valor_anterior, fecha_hora_modificacion, id_usuario)
        VALUES (?, ?, ?, NOW(), ?)
        `, [nombreCampo, valorActual, valorAnterior, userId]);
    });
}
function updateMention(connection, id, capsula, tipoMedio, cadena, programa, autor, mencion, fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        yield connection.execute(`
        UPDATE AUDITORIA_MENCION_NEGATIVA
        SET capsula = ?, tipo_medio = ?, cadena = ?, programa = ?, autor = ?, mencion = ?, fecha = ?
        WHERE id = ?
        `, [capsula, tipoMedio, cadena, programa, autor, mencion, fecha, id]);
    });
}
function createNewMention(connection, capsula, tipoMedio, cadena, programa, autor, mencion, fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        yield connection.execute(`
        INSERT INTO AUDITORIA_MENCION_NEGATIVA (capsula, tipo_medio, cadena, programa, autor, mencion, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [capsula, tipoMedio, cadena, programa, autor, mencion, fecha]);
    });
}
function deleteMentionNegative(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const [mention] = yield connection.execute(`
            SELECT id
            FROM AUDITORIA_MENCION_NEGATIVA
            WHERE id = ?
            `, [id]);
            if (mention && mention.length > 0) {
                yield connection.execute(`
                DELETE FROM AUDITORIA_MENCION_NEGATIVA
                WHERE id = ?
                `, [id]);
                return `Mención negativa con ID ${id} eliminada correctamente.`;
            }
            else {
                return `No se encontró ninguna mención negativa con ID ${id}.`;
            }
        }
        catch (error) {
            throw new Error("Error al eliminar la mención negativa.");
        }
    });
}
exports.default = {
    getNegativeMentionsforColumns,
    processNegativeMentionsforColumns,
    getNegativeMentionsForRadioOrTelevision,
    getNegativeMentionAdmin,
    createOrUpdateMentionNegative,
    deleteMentionNegative,
};
