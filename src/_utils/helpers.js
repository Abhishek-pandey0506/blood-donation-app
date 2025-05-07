/**
 * Check if an object is empty (i.e., has no own enumerable properties).
 * @param {Object} obj - The object to check.
 * @returns {boolean} - Returns true if the object is empty, false otherwise.
 */
export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Check if all values in an object are null
 * @param {Object} obj - The object to check
 * @returns {boolean} - Returns true if all values are null, false otherwise
 */
export const areAllValuesNull = (obj) => {
  // Check if obj is an object and not null or undefined
  if (obj === null || typeof obj !== "object") {
    return true; // Return false if obj is null or not an object
  }

  return Object.values(obj).every((value) => value === null);
};



export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Converts a snake_case string to a human-readable format.
 *
 * @param {string} str - The input string in snake_case format.
 * @returns {string} - The converted string in human-readable format.
 */
export const snakeCaseToNormal = (str) => {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export const capitalizeWord = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
export const convertHyphenToTitleCase = (input) => {
  if (!input) return "";
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

