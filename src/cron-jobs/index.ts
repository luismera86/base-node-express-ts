import { LoggerService } from "../common/utils/logger.util";

export class CronJobManager {
    private static instance: CronJobManager;
    private jobs: Map<string, () => void>;
    private readonly logger: LoggerService = new LoggerService(CronJobManager.name);

    private constructor() {
        this.jobs = new Map();
        this.initializeJobs();
    }

    private initializeJobs() {
        // Registrar todos los jobs aquí.
        // Ejemplo (importar exampleJob desde "./example.job" y descomentar):
        // this.jobs.set("example", exampleJob);
    }

    public static getInstance(): CronJobManager {
        if (!CronJobManager.instance) {
            CronJobManager.instance = new CronJobManager();
        }
        return CronJobManager.instance;
    }

    public startAllJobs(): void {
        this.logger.info("Starting all cron jobs...");
        this.jobs.forEach((job, name) => {
            this.logger.info(`Job ${name} in progress`);
            job();
        });
    }

    public addJob(name: string, job: () => void): void {
        this.jobs.set(name, job);
    }

    public removeJob(name: string): boolean {
        return this.jobs.delete(name);
    }

    public getJob(name: string): (() => void) | undefined {
        return this.jobs.get(name);
    }
}

// Instancia única del manager.
export const cronJobManager = CronJobManager.getInstance();

// Exportar los jobs individuales por si se necesitan usar por separado.
export * from "./example.job";
