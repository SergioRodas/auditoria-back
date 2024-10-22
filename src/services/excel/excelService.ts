import { FillPattern, Workbook, Worksheet } from "exceljs";
import { MentionData } from "../../interfaces/mentions/mentionInterface";
import path from "path";
import { Registro } from "../../interfaces/excel/excelInterface";

export const generateExcelForSubtopics = async (data: any[]): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
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
            const filePath = path.resolve(__dirname, fileName);

            await writeFile(workbook, filePath);

            resolve(filePath);
        } catch (error) {
            reject(error);
        }
    });
};

const createWorkbook = (): Workbook => {
    return new Workbook();
};

const addColumnNames = (worksheet: Worksheet) => {
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

const setColumnWidths = (worksheet: Worksheet) => {
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

const applyHeaderStyle = (worksheet: any) => {
    const headerStyle = {
        font: { color: { argb: "FFFFFF" }, bold: true },
        fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "338AFF" },
        } as FillPattern,
    };
    worksheet
        .getRow(1)
        .eachCell(
            (cell: {
                font: { color: { argb: string }; bold: boolean };
                fill: FillPattern;
            }) => {
                cell.font = headerStyle.font;
                cell.fill = headerStyle.fill;
            }
        );
};

const setDefaultRowHeight = (worksheet: Worksheet) => {
    worksheet.properties.defaultRowHeight = 60;
};

const addDataRows = (worksheet: Worksheet, queryResult: any[]) => {
    if (queryResult) {
        queryResult.forEach((row: MentionData, index: number) => {
            const urlBase =
                "http://intelicast.net/inteliteApp/escritorioOk/jsptestigos/testigo.jsp?cveNota=";
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

const writeFile = async (workbook: Workbook, fileName: string) => {
    await workbook.xlsx.writeFile(fileName);
};
