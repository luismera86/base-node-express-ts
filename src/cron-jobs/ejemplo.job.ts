import cron from "node-cron";
import { LoggerService } from "../common/utils/logger.util";

/**
 * Cron job de ejemplo.
 *
 * Plantilla base para crear jobs propios: copiá este archivo como
 * `<nombre>.job.ts`, ajustá la expresión cron y registralo en
 * `initializeJobs()` dentro de `src/cron-jobs/index.ts`.
 *
 * Sintaxis cron: "minuto hora día-del-mes mes día-de-la-semana"
 * Ejemplo: "0 7 * * *" → todos los días a las 07:00.
 */
export const exampleJob = () => {
    const logger = new LoggerService("ExampleJob");

    // Cada minuto (cambiar/eliminar según necesidad).
    cron.schedule("* * * * *", () => {
        logger.info("Cron job de ejemplo ejecutado");
    });
};
