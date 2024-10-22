import {
    ConsultaParams,
    NegativeMentionForColum,
    NegativeMentionForRadioOrTelevision,
} from "../../interfaces/negativeMention/negativeMention";
import negativeMentionService from "../../services/negativeMention/negativeMentionService";

const negativeMentionResolver = {
    Query: {
        getNegativeMentionsforColumnsResolver: async (
            _: any,
            { fecha, semanal }: { fecha: string; semanal?: boolean },
            _context: any
        ): Promise<NegativeMentionForColum[] | null> => {
            try {
                const rows =
                    await negativeMentionService.getNegativeMentionsforColumns(
                        fecha,
                        semanal
                    );

                const negativeMention =
                    await negativeMentionService.processNegativeMentionsforColumns(
                        rows
                    );

                return negativeMention;
            } catch (error) {
                throw new Error(
                    `Error al ejecutar la consulta: ${(error as Error).message}`
                );
            }
        },

        getNegativeMentionsforRadioOrTelevision: async (
            _: any,
            { fecha, tipoMedio, semanal }: ConsultaParams,
            _context: any
        ): Promise<NegativeMentionForRadioOrTelevision[] | null> => {
            try {
                const negativeMention =
                    await negativeMentionService.getNegativeMentionsForRadioOrTelevision(
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
    },
};

export default negativeMentionResolver;
