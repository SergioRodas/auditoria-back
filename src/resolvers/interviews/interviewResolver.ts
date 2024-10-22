import { interviewsByCandidate } from "../../interfaces/interviews/interviewInterface";
import interviewService from "../../services/interviews/interviewService";
const interviewResolver = {
    Query: {
        interviewResolver: async (
            _: any,
            { fecha, semanal }: { fecha: string, semanal?: boolean},
            _context: any
        ): Promise<interviewsByCandidate[]> => {
            try {
                const rows = await interviewService.getInterviews(fecha, semanal);

                const interviewsByCandidate = await interviewService.processInterviews(
                    rows
                );
                return interviewsByCandidate;
            } catch (error) {
                throw new Error(
                    `Error al ejecutar la consulta: ${(error as Error).message}`
                );
            }
        },
    },
};

export default interviewResolver;
