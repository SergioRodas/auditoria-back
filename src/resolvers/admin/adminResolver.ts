import { Balance } from "../../interfaces/balance/balanceInterface";
import { MentionData } from "../../interfaces/mentions/mentionInterface";
import {
    ConsultaParams,
    NegativeMentionAdmin,
} from "../../interfaces/negativeMention/negativeMention";
import { User } from "../../interfaces/users/userInterface";
import {
    createOrUpdateBalance,
    deleteBalance,
    getBalanceByFecha,
} from "../../services/balance/balanceService";

import { generateExcelForSubtopics } from "../../services/excel/excelService";
import mentionService from "../../services/mentions/mentionService";
import negativeMentionService from "../../services/negativeMention/negativeMentionService";

const adminResolver = {
    Query: {
        getNegativeMentionsForAdmin: async (
            _: any,
            { fecha, tipoMedio, semanal }: ConsultaParams,
            _context: any
        ): Promise<NegativeMentionAdmin[] | null> => {
            try {
                const negativeMention =
                    await negativeMentionService.getNegativeMentionAdmin(
                        fecha,
                        tipoMedio,
                        semanal
                    );

                return negativeMention || [];
            } catch (error) {
                throw new Error(
                    `Error al ejecutar la consulta: ${(error as Error).message}`
                );
            }
        },
        getDataForTable: async (
            _: any,
            { fecha, semanal }: { fecha: string; semanal?: boolean },
            _context: any
        ): Promise<MentionData[] | null> => {
            try {
                const data = await mentionService.getDataForTable(fecha, semanal);

                return data || [];
            } catch (error) {
                throw new Error(
                    `Error al ejecutar la consulta: ${(error as Error).message}`
                );
            }
        },
        getBalanceByFecha: async (
            _: any,
            { fecha }: { fecha: string },
            _context: any
        ): Promise<Balance | []> => {
            try {
                const balance = await getBalanceByFecha(fecha);

                return balance;
            } catch (error) {
                console.error("Error al procesar la solicitud:", error);
                throw new Error("Ocurrió un error al procesar la solicitud");
            }
        },
    },
    Mutation: {
        createOrUpdateMentionNegative: async (
            _: any,
            {
                id,
                capsula,
                tipoMedio,
                cadena,
                programa,
                autor,
                mencion,
                fecha,
            }: {
                id: number;
                capsula: string;
                tipoMedio: "RADIO" | "TELEVISIÓN";
                cadena: string;
                programa: string;
                autor: string;
                mencion: string;
                fecha: string;
            },
            _context: any
        ): Promise<string> => {
            try {
                const currentUser: User | undefined = _context.user;

                const resultMessage =
                    await negativeMentionService.createOrUpdateMentionNegative(
                        {
                            id,
                            capsula,
                            tipoMedio,
                            cadena,
                            programa,
                            autor,
                            mencion,
                            fecha,
                        },
                        currentUser
                    );

                return resultMessage;
            } catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        },
        deleteMentionNegative: async (
            _: any,
            { id }: { id: number },
            _context: any
        ): Promise<string> => {
            try {
                const resultMessage =
                    await negativeMentionService.deleteMentionNegative(id);
                return resultMessage;
            } catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        },
        generateExcel: async (
            _: any,
            { fecha, semanal }: { fecha: string; semanal?: boolean },
            _context: any
        ) => {
            try {
                if (!fecha) {
                    throw new Error("Fecha no proporcionada.");
                }

                const data = await mentionService.getDataForTable(fecha, semanal);

                if (data && data.length > 0) {
                    const filePath = await generateExcelForSubtopics(data);
                    return filePath;
                } else {
                    throw new Error(
                        "No se encontraron datos para generar el Excel."
                    );
                }
            } catch (error) {
                throw new Error(`Error generando el archivo Excel: ${error}`);
            }
        },
        createOrUpdateBalance: async (
            _: any,
            { balance, fecha }: { balance: string; fecha: string },
            _context: any
        ): Promise<string> => {
            try {
                const result = await createOrUpdateBalance(balance, fecha);
                return result;
            } catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        },
        deleteBalance: async (
            _: any,
            { fecha }: { fecha: string },
            _context: any
        ): Promise<string> => {
            try {
                const result = await deleteBalance(fecha);
                return result;
            } catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        },
        deleteMention: async (
            _: any,
            { id }: { id: number },
            _context: any
        ): Promise<string> => {
            try {
                const resultMessage = await mentionService.deleteMention(id);
                return resultMessage;
            } catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        },
    },
};

export default adminResolver;
