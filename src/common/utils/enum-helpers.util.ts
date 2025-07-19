import {
  PopulationAgeRangeEnum,
  PopulationAgeRangeLabels,
  PopulationAgeRanges,
} from "../enums/population-age-range.enum";
import {
  TherapistSpecialtyEnum,
  TherapistSpecialtyLabels,
} from "../enums/therapist-specialty.enum";
import {
  TherapistVerticalsEnum,
  TherapistVerticalsLabels,
} from "../enums/therapist-verticals.enum";
import { TherapyTypeEnum, TherapyTypeLabels } from "../enums/therapy-type.enum";

/**
 * Helper class to get display labels for enum values
 */
export class EnumHelpers {
  /**
   * Gets the display label for a PopulationAgeRangeEnum value
   * @param value The enum value
   * @returns The display label
   */
  static getPopulationAgeRangeLabel(value: PopulationAgeRangeEnum): string {
    return PopulationAgeRangeLabels[value] || value;
  }

  /**
   * Gets the display labels for an array of PopulationAgeRangeEnum values
   * @param values Array of enum values
   * @returns Array of display labels
   */
  static getPopulationAgeRangeLabels(values: PopulationAgeRangeEnum[]): string[] {
    return values.map((value) => this.getPopulationAgeRangeLabel(value));
  }

  /**
   * Gets the display label for a TherapistSpecialtyEnum value
   * @param value The enum value
   * @returns The display label
   */
  static getTherapistSpecialtyLabel(value: TherapistSpecialtyEnum): string {
    return TherapistSpecialtyLabels[value] || value;
  }

  /**
   * Gets the display labels for an array of TherapistSpecialtyEnum values
   * @param values Array of enum values
   * @returns Array of display labels
   */
  static getTherapistSpecialtyLabels(values: TherapistSpecialtyEnum[]): string[] {
    return values.map((value) => this.getTherapistSpecialtyLabel(value));
  }

  /**
   * Gets the display label for a TherapistVerticalsEnum value
   * @param value The enum value
   * @returns The display label
   */
  static getTherapistVerticalsLabel(value: TherapistVerticalsEnum): string {
    return TherapistVerticalsLabels[value] || value;
  }

  /**
   * Gets the display labels for an array of TherapistVerticalsEnum values
   * @param values Array of enum values
   * @returns Array of display labels
   */
  static getTherapistVerticalsLabels(values: TherapistVerticalsEnum[]): string[] {
    return values.map((value) => this.getTherapistVerticalsLabel(value));
  }

  /**
   * Gets the display label for a TherapyTypeEnum value
   * @param value The enum value
   * @returns The display label
   */
  static getTherapyTypeLabel(value: TherapyTypeEnum): string {
    return TherapyTypeLabels[value] || value;
  }

  /**
   * Gets the display labels for an array of TherapyTypeEnum values
   * @param values Array of enum values
   * @returns Array of display labels
   */
  static getTherapyTypeLabels(values: TherapyTypeEnum[]): string[] {
    return values.map((value) => this.getTherapyTypeLabel(value));
  }

  /**
   * Gets the age ranges a person belongs to based on their age
   * @param age Person's age in years
   * @param includeGroups Whether to include group categories (default: false)
   * @returns Array of PopulationAgeRangeEnum values
   */
  static getAgeRangesForAge(age: number, includeGroups = false): PopulationAgeRangeEnum[] {
    return PopulationAgeRanges.filter(
      (range) => (includeGroups || !range.isGroup) && age >= range.min && age <= range.max,
    ).map((range) => range.key);
  }
}
