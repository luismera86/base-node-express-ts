import cron from "node-cron";
import { LoggerService } from "../../common/utils/logger.util";
import AppDataSource from "../../config/datasource.config";
import { Event } from "../event/entities/event.entity";
import { NotificationTypeEnum } from "../../common/enums/notificationTypeEnum.enum";
import { Notifications } from "../notifications/entities/notifications.entity";
import { notificationTemplate } from "../email/templates/notification/notification.template";
import { sendEmail } from "../email/utils/email.util";

export const notificationsJob = () => {
    const logger = new LoggerService("NotificationsJob");

    cron.schedule("0 7 * * *", async () => {
        logger.info("Notifications job initialized");
        try {
            const events = await AppDataSource.getRepository(Event).find({
                where: {
                    date: new Date().toISOString().split("T")[0],
                },
                relations: {
                    patients: true,
                    therapists: true,
                },
            });

            for (const event of events) {
                for (const therapist of event.therapists) {
                    // Enviar notificación al terapeuta
                    const newTherapistNotification = AppDataSource.getRepository(Notifications).create({
                        type: NotificationTypeEnum.EVENT,
                        messageEs: "Tienes un evento programado para hoy",
                        messageEn: "You have a scheduled event for today",
                        receiver: therapist.user,
                    });
                    await AppDataSource.getRepository(Notifications).save(newTherapistNotification);
                    // Enviar correo electrónico al terapeuta
                    const therapistEmailTemplate = notificationTemplate({
                        title: "Tienes un evento programado para hoy",
                        message: `Ya se registró un nuevo evento el día ${event.date} a las ${event.startHour} con el paciente ${event.patients[0]?.user?.fullName} hasta las ${event.endHour}`,
                        userName: therapist.user.fullName,
                        motive: "Tienes un evento programado para hoy",
                    });
                    await sendEmail(
                        therapist.user.email,
                        "Tienes un evento programado para hoy",
                        therapistEmailTemplate,
                    );
                }

                for (let i = 0; i < event.patients.length; i++) {
                    const patient = event.patients[i];
                    // Enviar notificación al paciente
                    const newPatientNotification = AppDataSource.getRepository(Notifications).create({
                        type: NotificationTypeEnum.EVENT,
                        messageEs: "Tienes un evento programado para hoy",
                        messageEn: "You have a scheduled event for today",
                        receiver: patient.user,
                    });
                    await AppDataSource.getRepository(Notifications).save(newPatientNotification);
                    // Enviar correo electrónico al paciente
                    const patientEmailTemplate = notificationTemplate({
                        title: "Tienes un evento programado para hoy",
                        message: `Ya se registró un nuevo evento el día ${event.date} a las ${event.startHour} con el terapeuta ${event.therapists[0].user.fullName} hasta las ${event.endHour}`,
                        userName: patient.user.fullName,
                        motive: "Tienes un evento programado para hoy",
                    });
                    await sendEmail(patient.user.email, "Tienes un evento programado para hoy", patientEmailTemplate);
                }
            }
        } catch (error: any) {
            logger.error("Error in notifications job", error.message);
        }
    });
};
