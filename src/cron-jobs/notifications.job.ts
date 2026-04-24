import cron from "node-cron";
import { LoggerService } from "../common/utils/logger.util";

export const notificationsJob = () => {
    const logger = new LoggerService("NotificationsJob");

    cron.schedule("0 7 * * *", async () => {
        logger.info("Notifications job initialized");
        // TODO: implement notification logic when notification module is created
    });
};
