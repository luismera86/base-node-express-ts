export enum TherapistSpecialtyEnum {
    PSYCHOLOGY = "PSYCHOLOGY",
    NEUROPSYCHOLOGY = "NEUROPSYCHOLOGY",
    SPEECH_THERAPY = "SPEECH_THERAPY",
    PSYCHIATRY = "PSYCHIATRY",
    OCCUPATIONAL_THERAPY = "OCCUPATIONAL_THERAPY",
    NUTRITION_DIETETICS = "NUTRITION_DIETETICS",
    PHYSICAL_THERAPY = "PHYSICAL_THERAPY",
    OSTEOPATHY = "OSTEOPATHY",
}

export const TherapistSpecialtyLabels: Record<TherapistSpecialtyEnum, string> = {
    [TherapistSpecialtyEnum.PSYCHOLOGY]: "Psychology",
    [TherapistSpecialtyEnum.NEUROPSYCHOLOGY]: "Neuropsychology",
    [TherapistSpecialtyEnum.SPEECH_THERAPY]: "Speech Therapy",
    [TherapistSpecialtyEnum.PSYCHIATRY]: "Psychiatry",
    [TherapistSpecialtyEnum.OCCUPATIONAL_THERAPY]: "Occupational Therapy",
    [TherapistSpecialtyEnum.NUTRITION_DIETETICS]: "Nutrition and Dietetics",
    [TherapistSpecialtyEnum.PHYSICAL_THERAPY]: "Physical Therapy",
    [TherapistSpecialtyEnum.OSTEOPATHY]: "Osteopathy",
};
