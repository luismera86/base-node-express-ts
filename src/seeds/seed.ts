import { prisma } from "../config/prisma.config";
import { LoggerService } from "../common/utils/logger.util";
import { sembrarUsuario } from "./usuario.seed";

const logger = new LoggerService("Seed");

const ejecutarSeeds = async () => {
    await prisma.$connect();
    logger.info("Base de datos conectada para el sembrado");

    try {
        await sembrarUsuario(prisma);
        logger.info("Seed de usuario ejecutado");

        logger.info("Todos los seeds se ejecutaron correctamente");
    } catch (error) {
        logger.error("Error durante el sembrado", (error as Error).message);
        throw error;
    } finally {
        await prisma.$disconnect();
        logger.info("Conexión a la base de datos cerrada");
    }
};

ejecutarSeeds().catch((error) => {
    logger.error("Error fatal durante el sembrado", error.message);
    process.exit(1);
});
