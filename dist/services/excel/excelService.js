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
exports.generateExcelForSubtopics = void 0;
const exceljs_1 = require("exceljs");
const path_1 = __importDefault(require("path"));
const generateExcelForSubtopics = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const workbook = createWorkbook();
            const worksheet = workbook.addWorksheet("Resultados");
            addColumnNames(worksheet);
            setColumnWidths(worksheet);
            applyHeaderStyle(worksheet);
            setDefaultRowHeight(worksheet);
            if (data) {
                addDataRows(worksheet, data);
            }
            const fileName = "notas.xlsx";
            const filePath = path_1.default.resolve(__dirname, fileName);
            yield writeFile(workbook, filePath);
            resolve(filePath);
        }
        catch (error) {
            reject(error);
        }
    }));
});
exports.generateExcelForSubtopics = generateExcelForSubtopics;
const createWorkbook = () => {
    return new exceljs_1.Workbook();
};
const addColumnNames = (worksheet) => {
    const columnNames = [
        "No. Reg",
        "CAPSULA",
        "FECHA NOTA",
        "HORA NOTA",
        "AMBITO",
        "ESTADO",
        "NOMBRE",
        "DIAS DE EMISION",
        "HORARIO",
        "FRECUENCIA",
        "BANDA",
        "CONDUCTOR",
        "CADENA",
        "GRUPO",
        "SIGLAS",
        "MUNICIPIO",
        "MEDIO",
        "TIPOMEDIO",
        "CLASIFICACION",
        "PAGINA",
        "TIRAJE",
        "AUTOR",
        "Titulo de la Nota",
        "CONTENIDO",
        "DURACION",
        "CM",
        "FRACCION",
        "COSTO x CM",
        "Nombre Query",
        "Nombre Query Hijo",
        "TEMA",
        "ACTOR",
        "PARTICIPACION",
        "CATEGORIA",
        "TENDENCIA",
        "FODA",
        "VALORADOR",
        "8 a 12",
        "13 a 17",
        "18 a 24",
        "25 a 34",
        "35 a 44",
        "45 a 54",
        "55 a MAS",
        "ALTO",
        "MEDIO",
        "BAJO",
        "MUJER",
        "HOMBRE",
        "ALCANCE REAL",
        "EJE PAPA",
        "EJE HIJO",
        "CAPNOMBRE",
        "CVESUBTEMA",
        "LIGA ORIGINAL",
        "TESTIGO",
        "Real/Estimado",
    ];
    worksheet.addRow(columnNames);
};
const setColumnWidths = (worksheet) => {
    worksheet.columns = [
        { key: "A", width: 8 },
        { key: "B", width: 25 },
        { key: "C", width: 13 },
        { key: "D", width: 13 },
        { key: "E", width: 30 },
        { key: "F", width: 30 },
        { key: "G", width: 35 },
        { key: "H", width: 25 },
        { key: "I", width: 30 },
        { key: "J", width: 15 },
        { key: "K", width: 15 },
        { key: "L", width: 30 },
        { key: "M", width: 30 },
        { key: "N", width: 20 },
        { key: "O", width: 15 },
        { key: "P", width: 15 },
        { key: "Q", width: 40 },
        { key: "R", width: 40 },
        { key: "S", width: 20 },
        { key: "T", width: 20 },
        { key: "U", width: 20 },
        { key: "V", width: 25 },
        { key: "W", width: 40 },
        { key: "X", width: 150 },
        { key: "Y", width: 15 },
        { key: "Z", width: 20 },
        { key: "AA", width: 20 },
        { key: "AB", width: 15 },
        { key: "AC", width: 40 },
        { key: "AD", width: 40 },
        { key: "AE", width: 20 },
        { key: "AF", width: 20 },
        { key: "AG", width: 20 },
        { key: "AH", width: 20 },
        { key: "AI", width: 20 },
        { key: "AJ", width: 7 },
        { key: "AK", width: 20 },
        { key: "AL", width: 20 },
        { key: "AM", width: 10 },
        { key: "AN", width: 20 },
        { key: "AO", width: 20 },
        { key: "AP", width: 20 },
        { key: "AQ", width: 20 },
        { key: "AR", width: 20 },
        { key: "AS", width: 20 },
        { key: "AT", width: 15 },
        { key: "AU", width: 15 },
        { key: "AV", width: 15 },
        { key: "AW", width: 15 },
        { key: "AX", width: 15 },
        { key: "AY", width: 15 },
        { key: "AZ", width: 15 },
        { key: "BA", width: 15 },
        { key: "BB", width: 15 },
        { key: "BC", width: 15 },
        { key: "BD", width: 15 },
        { key: "BE", width: 15 },
        { key: "BF", width: 30 },
        { key: "BG", width: 10 },
    ];
    worksheet.columns.forEach((column) => {
        column.alignment = { wrapText: true };
    });
};
const applyHeaderStyle = (worksheet) => {
    const headerStyle = {
        font: { color: { argb: "FFFFFF" }, bold: true },
        fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "338AFF" },
        },
    };
    worksheet
        .getRow(1)
        .eachCell((cell) => {
        cell.font = headerStyle.font;
        cell.fill = headerStyle.fill;
    });
};
const setDefaultRowHeight = (worksheet) => {
    worksheet.properties.defaultRowHeight = 60;
};
const addDataRows = (worksheet, queryResult) => {
    if (queryResult) {
        queryResult.forEach((row, index) => {
            const urlBase = "http://intelicast.net/inteliteApp/escritorioOk/jsptestigos/testigo.jsp?cveNota=";
            const url = `${urlBase}${row.CAPCLAVE}`;
            const rowData = [
                index + 1,
                row.CAPCLAVE || "",
                row.FECHA || "",
                row.HORA || "",
                row.FAMDESCRIPCION || "",
                row.FESDESCRIPCION || "",
                row.FNODESCRIPCION || "",
                row.FNODIASEMISION || "",
                row.FREHORARIO || "",
                row.FREFRECUENCIA || "",
                row.FREBANDA || "",
                row.FTECONDUCTOR || "",
                row.FCADESCRIPCION || "",
                row.FPRDESCRIPCION || "",
                row.FRESIGLAS || "",
                row.MUNNOMMUNICIPIO || "",
                row.FMEDESCRIPCION || "",
                row.FTMDESCRIPCION || "",
                row.FCLDESCRIPCION || "",
                row.PAGINA || "",
                row.FNOTIRAJE || "",
                row.AUTOR || "",
                { text: row.CAPTITULO || "", hyperlink: url },
                row.CAPTEXTCOMP || "",
                row.CAPDURACION || "",
                row.CAPCM || "",
                row.CAPFRACCION || "",
                row.CAPCOSTOCM || "",
                row.TEXNOMBRE,
                row.QUENOMBRE,
                row.TEVDESCRIPCION,
                row.ACTOR,
                row.VACPARTICIPACION,
                row.CATEGORIA,
                row.VACTENDENCIA,
                row.VACFODA,
                row.USRNOMBRE,
                row.CAADIST8A12,
                row.CAADIST13A17,
                row.CAADIST18A24,
                row.CAADIST25A34,
                row.CAADIST35A44,
                row.CAADIST45A54,
                row.CAADIST55AMAS,
                row.CAADISTALTO,
                row.CAADISTMEDIO,
                row.CAADISTBAJO,
                row.CAADISTHOMBRE,
                row.CAADISTMUJER,
                row.CAAALCANCEREAL,
                row.EJEDESCRIPCION,
                row.EJEDESCRIPCIONH,
                row.CAPNOMBRE,
                row.VACSUBTEMAXML,
                url,
                row.CIMNOMBREARCHIVO,
                row.CAPTIPOCOSTO,
            ];
            worksheet.addRow(rowData);
            const lastCell = worksheet.getCell(`BC${index + 2}`);
            lastCell.value = { text: url, hyperlink: url };
        });
    }
};
const writeFile = (workbook, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    yield workbook.xlsx.writeFile(fileName);
});
