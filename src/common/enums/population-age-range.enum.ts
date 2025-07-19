export enum PopulationAgeRangeEnum {
    EARLY_CHILDHOOD = "EARLY_CHILDHOOD",
    MIDDLE_CHILDHOOD = "MIDDLE_CHILDHOOD",
    ADOLESCENTS = "ADOLESCENTS",
    ADULTS = "ADULTS",
}

export const PopulationAgeRangeLabels: Record<PopulationAgeRangeEnum, string> = {
    [PopulationAgeRangeEnum.EARLY_CHILDHOOD]: "0-6 years",
    [PopulationAgeRangeEnum.MIDDLE_CHILDHOOD]: "7-12 years",
    [PopulationAgeRangeEnum.ADOLESCENTS]: "12-17 years",
    [PopulationAgeRangeEnum.ADULTS]: "Adults",
};

export interface AgeRange {
    key: PopulationAgeRangeEnum;
    min: number;
    max: number;
    isGroup?: boolean;
}

export const PopulationAgeRanges: AgeRange[] = [
    { key: PopulationAgeRangeEnum.EARLY_CHILDHOOD, min: 0, max: 6 },
    { key: PopulationAgeRangeEnum.MIDDLE_CHILDHOOD, min: 7, max: 12 },
    { key: PopulationAgeRangeEnum.ADOLESCENTS, min: 12, max: 17 },
    { key: PopulationAgeRangeEnum.ADULTS, min: 18, max: 130 },
];

/**
 * Helper function to find which age range(s) a patient belongs to based on their age
 * @param age Patient's age in years
 * @returns Array of PopulationAgeRangeEnum values the patient belongs to
 */
export const getAgeRanges = (age: number): PopulationAgeRangeEnum[] => {
    return PopulationAgeRanges.filter((range) => age >= range.min && age <= range.max).map((range) => range.key);
};
