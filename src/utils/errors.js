/**
 * Custom error class for Kirb library
 * @class KirbError
 * @extends Error
 */
export class KirbError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Record<string, any>} details - Additional error details
   */
  constructor(message, code, details = {}) {
    super(message);
    this.name = "KirbError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Error codes used throughout the library
 * @enum {string}
 */
export const ErrorCodes = {
  INVALID_CURVE: "INVALID_CURVE",
  INVALID_PARAMETER: "INVALID_PARAMETER",
  OUT_OF_RANGE: "OUT_OF_RANGE",
  COMPUTATION_FAILED: "COMPUTATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",
};
