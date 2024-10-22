import mysql, { Connection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 7696,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function dbConnection(): Promise<Connection> {
    try {
        const pool = await mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        if (isProtocolConnectionLostError(error)) {
            console.error("Error al conectar a la base de datos:", error);
            console.log("Reintentando conexión en 2 segundos...");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return dbConnection();
        } else {
            throw error;
        }
    }
}

function isProtocolConnectionLostError(error: any): boolean {
    return (
        error &&
        typeof error === "object" &&
        error.code === "PROTOCOL_CONNECTION_LOST"
    );
}

export default dbConnection;
