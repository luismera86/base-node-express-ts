/**
 * Utility functions to help with Swagger documentation
 */

/**
 * Helper function that creates a Swagger example for enum values
 * This ensures that the enums are represented as string values in Swagger docs
 * while maintaining the type safety and dynamic references to the actual enums.
 *
 * @param enumValues Array of enum values
 * @returns A plain array of enum values as strings for Swagger display
 *
 * @example
 * // In a Swagger path file:
 * import { enumExample } from '../../../common/utils/swagger-helpers.util';
 *
 * // Usage:
 * example: {
 *   verticals: enumExample([TherapistVerticalsEnum.CLINIC, TherapistVerticalsEnum.SCHOOL])
 * }
 */
export const enumExample = <T extends string | number>(enumValues: T[]): T[] => {
  return enumValues;
};

/**
 * Helper function that creates a Swagger example for a single enum value
 *
 * @param enumValue Single enum value
 * @returns The enum value as string for Swagger display
 *
 * @example
 * // In a Swagger path file:
 * import { singleEnumExample } from '../../../common/utils/swagger-helpers.util';
 *
 * // Usage:
 * example: {
 *   vertical: singleEnumExample(TherapistVerticalsEnum.CLINIC)
 * }
 */
export const singleEnumExample = <T extends string | number>(enumValue: T): T => {
  return enumValue;
};
