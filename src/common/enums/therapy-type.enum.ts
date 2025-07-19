export enum TherapyTypeEnum {
    INDIVIDUAL = "INDIVIDUAL",
    COUPLES = "COUPLES",
    FAMILY = "FAMILY",
    PARENTAL = "PARENTAL",
    WORKSHOP = "WORKSHOP",
}

export const TherapyTypeLabels: Record<TherapyTypeEnum, string> = {
    [TherapyTypeEnum.INDIVIDUAL]: "Individual",
    [TherapyTypeEnum.COUPLES]: "Couples",
    [TherapyTypeEnum.FAMILY]: "Family",
    [TherapyTypeEnum.PARENTAL]: "Parental",
    [TherapyTypeEnum.WORKSHOP]: "Workshop",
};
