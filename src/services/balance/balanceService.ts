import { ResultSetHeader, RowDataPacket } from "mysql2";
import dbConnection from "../../config/mysql";
import { Balance } from "../../interfaces/balance/balanceInterface";

export async function createOrUpdateBalance(
    balance: string,
    fecha: string
): Promise<string> {
    try {
        if (!balance || !fecha) {
            throw new Error("Balance y fecha son obligatorios.");
        }

        const connection = await dbConnection();

        const [rows] = await connection.execute<RowDataPacket[]>(
            "SELECT * FROM AUDITORIA_BALANCES WHERE fecha = ?",
            [fecha]
        );

        if (rows.length > 0) {
            await connection.execute(
                "UPDATE AUDITORIA_BALANCES SET balance = ? WHERE fecha = ?",
                [balance, fecha]
            );
            return "Balance actualizado con éxito";
        } else {
            await connection.execute(
                "INSERT INTO AUDITORIA_BALANCES (balance, fecha) VALUES (?, ?)",
                [balance, fecha]
            );
            return "Balance creado con éxito";
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(
                `Error al crear o actualizar el balance: ${error.message}`
            );
        } else {
            throw new Error("Error desconocido al crear o actualizar el balance.");
        }
    }
}

export async function deleteBalance(fecha: string): Promise<string> {
    try {
        const connection = await dbConnection();
        const [result] = await connection.execute<ResultSetHeader>(
            "DELETE FROM AUDITORIA_BALANCES WHERE fecha = ?",
            [fecha]
        );

        if (result.affectedRows === 0) {
            return `No se encontró ningún balance para la fecha ${fecha}`;
        }

        return "Balance eliminado con éxito";
    } catch (error) {
        throw new Error("Ocurrió un error al eliminar el balance");
    }
}

export async function getBalanceByFecha(fecha: string): Promise<Balance | []> {
    try {
        const connection = await dbConnection();
        const [rows] = await connection.execute<RowDataPacket[]>(
            "SELECT balance , fecha FROM AUDITORIA_BALANCES WHERE fecha = ?",
            [fecha]
        );

        if (rows.length === 0) {
            return [];
        }
        const fechaDate: Date = new Date(rows[0].fecha);

        const formattedFecha: string = fechaDate.toLocaleDateString();
        return { balance: rows[0].balance, fecha: formattedFecha };
    } catch (error) {
        throw new Error("Ocurrió un error al obtener el balance por fecha");
    }
}
