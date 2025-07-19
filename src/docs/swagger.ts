// src/docs/swagger.ts
import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import envConfig from "../config/env.config";

// Imports de schemas
import { CenterSchema } from "../modules/center/schemas/center.schema";
import { EventSchema } from "../modules/event/schemas/event.schema";
import { NotificationsSchema } from "../modules/notifications/schemas/notifications.schema";
import { PatientContactSchema } from "../modules/patient-contact/schemas/patient-contact.schema";
import { PatientDocsSchema } from "../modules/patient-docs/schemas/patient-docs.schema";
import { PatientGrantSchema } from "../modules/patient-grant/schemas/patient-grant.schema";
import { PatientHistorySchema } from "../modules/patient-history/schemas/patient-history.schema";
import { PatientNoteSchema } from "../modules/patient-note/schemas/patient-note.schema";
import { PatientObservationSchema } from "../modules/patient-observation/schemas/patient-observation.schema";
import { PatientSchema } from "../modules/patient/schemas/patient.schema";
import { PatientTherapistSchema } from "../modules/patient-therapist/schemas/patient-therapist.schema";
import { RoleSchema } from "../modules/role/schemas/role.schema";
import { TaskSchema } from "../modules/task/schemas/task.schema";
import { TherapistAvailabilitySchema } from "../modules/therapist-availability/schemas/therapist-availability.schema";
import { TherapistSchema } from "../modules/therapist/schemas/therapist.schema";
import { UserSchema } from "../modules/user/schemas/user.schema";
import { VacationSchema } from "../modules/vacation/schemas/vacation.schema";
import { UserRoleSchema } from "../modules/user-role/schemas/user-role.schema";
import { CenterContactSchema } from "../modules/center-contact/schemas/center-contact.schema";

// Imports de paths
import { AuthPaths } from "./paths/auth/auth.paths";
import { CenterPaths } from "./paths/center/center.paths";
import { EventPaths } from "./paths/event/event.paths";
import { PatientContactPaths } from "./paths/patient-contact/patient-history.paths";
import { PatientDocPaths } from "./paths/patient-docs/patient-doc.paths";
import { PatientGrantPaths } from "./paths/patient-grant/patient-grant.paths";
import { PatientHistoryPaths } from "./paths/patient-history/patient-history.paths";
import { PatientNotePaths } from "./paths/patient-note/patient-note.paths";
import { PatientObservationPaths } from "./paths/patient-observation/patient-observation.paths";
import { PatientPaths } from "./paths/patients/patient.paths";
import { PatientTherapistPaths } from "./paths/patient-therapist/patient-therapist.paths";
import { RolePaths } from "./paths/role/role.paths";
import { TaskPaths } from "./paths/task/task.paths";
import { TherapistAvailabilityPaths } from "./paths/therapist-availability/therapist-availability.paths";
import { TherapistPaths } from "./paths/therapists/therapist.paths";
import { UserPaths } from "./paths/users/user.paths";
import { VacationPaths } from "./paths/vacations/vacation.paths";
import { UserRolePaths } from "./paths/user-role/user-role.paths";
import { NotificationsPath } from "./paths/notifications/notifications.path";
import { EventInvitationPaths } from "./paths/event-invitations/event-invitation.paths";
import { CenterContactPaths } from "./paths/center-contacts/patient-center.paths";
import { TherapistDocPaths } from "./paths/therapist-docs/therapist-doc.paths";
import { TherapistDocsSchema } from "../modules/therapist-docs/schemas/therapist-docs.schema";

extendZodWithOpenApi(z); // Habilita `.openapi()` en esquemas de Zod

export const registry = new OpenAPIRegistry();

// Registrar schemas
registry.register("Center", CenterSchema);
registry.register("Event", EventSchema);
registry.register("Notification", NotificationsSchema);
registry.register("Patient", PatientSchema);
registry.register("PatientContact", PatientContactSchema);
registry.register("PatientDoc", PatientDocsSchema);
registry.register("PatientGrant", PatientGrantSchema);
registry.register("PatientHistory", PatientHistorySchema);
registry.register("PatientNote", PatientNoteSchema);
registry.register("PatientObservation", PatientObservationSchema);
registry.register("PatientTherapist", PatientTherapistSchema);
registry.register("Role", RoleSchema);
registry.register("Task", TaskSchema);
registry.register("Therapist", TherapistSchema);
registry.register("TherapistAvailability", TherapistAvailabilitySchema);
registry.register("User", UserSchema);
registry.register("Vacation", VacationSchema);
registry.register("UserRole", UserRoleSchema);
registry.register("Notification", NotificationsSchema);
registry.register("CenterContact", CenterContactSchema);
registry.register("TherapistDoc", TherapistDocsSchema);

// Registrar paths
new AuthPaths().register();
new CenterPaths().register();
new EventPaths().register();
new PatientContactPaths().register();
new PatientDocPaths().register();
new PatientGrantPaths().register();
new PatientHistoryPaths().register();
new PatientNotePaths().register();
new PatientObservationPaths().register();
new PatientPaths().register();
new PatientTherapistPaths().register();
new RolePaths().register();
new TaskPaths().register();
new TherapistAvailabilityPaths().register();
new TherapistPaths().register();
new UserPaths().register();
new VacationPaths().register();
new UserRolePaths().register();
new NotificationsPath().register();
new EventInvitationPaths().register();
new CenterContactPaths().register();
new TherapistDocPaths().register();

const generator = new OpenApiGeneratorV3(registry.definitions);

const baseDoc = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "API Emooti",
        version: "1.0.0",
        description: "API de Emooti con autenticación JWT",
    },
    servers: [
        {
            url: envConfig.API_URL || "http://localhost:3000/api",
            description: "API Server Emooti",
        },
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
});

export const openApiDoc = {
    ...baseDoc,
    components: {
        ...(baseDoc.components || {}),
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Insert the JWT token in the format: Bearer <token>",
            },
        },
    },
};
