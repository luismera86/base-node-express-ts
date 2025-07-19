export enum TherapistVerticalsEnum {
    CLINIC = "CLINIC",
    ONLINE = "ONLINE",
    WORKSHOPS = "WORKSHOPS",
    SCHOOLS = "SCHOOLS",
    RESEARCH = "RESEARCH",
    NEW_PROJECTS = "NEW_PROJECTS",
}

export const TherapistVerticalsLabels: Record<TherapistVerticalsEnum, string> = {
    [TherapistVerticalsEnum.CLINIC]: "Clinic",
    [TherapistVerticalsEnum.ONLINE]: "Online",
    [TherapistVerticalsEnum.WORKSHOPS]: "Workshops",
    [TherapistVerticalsEnum.SCHOOLS]: "Schools",
    [TherapistVerticalsEnum.RESEARCH]: "Research",
    [TherapistVerticalsEnum.NEW_PROJECTS]: "New Projects",
};
