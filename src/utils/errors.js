/**
 * Custom error class for Kirb library
 */
export class KirbError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Additional error details
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
 */
export const ErrorCodes = {
  INVALID_CURVE: "INVALID_CURVE",
  INVALID_PARAMETER: "INVALID_PARAMETER",
  OUT_OF_RANGE: "OUT_OF_RANGE",
  COMPUTATION_FAILED: "COMPUTATION_FAILED",
  INVALID_INPUT: "INVALID_INPUT",
};
