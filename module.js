/**
 * Calculates the age of a person based on their birth date in years.
 * 
 * @param {object} p An object representing a person with a birthDate property of type Date 
 * @returns {number} The age of the person in years
 */


function calculateAge(p) {
  let dateDiff = new Date(Date.now() - p.birthDate.getTime());
  let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
  return age;
}

export { calculateAge };