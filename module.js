/**
 * Calculates the age of a person based on their birth date in years.
 * 
 * @param {object} p An object representing a person with a birthDate property of type Date 
 * @returns {number} The age of the person in years
 */


function calculateAge(p) {
  // Aucun argument n'a été envoyé
  if (!p) {
    throw new Error('missing param p');
  }

  // Le format envoyé n'est pas un objet
  if (typeof p !== 'object' || Array.isArray(p)) {
    throw new Error('param p must be an object');
  }

  // L'objet ne contient pas un champ birthDate
  if (!p.hasOwnProperty('birthDate')) {
    throw new Error('birthDate property is required');
  }

  // Le champ birthDate n'est pas une date
  if (!(p.birthDate instanceof Date)) {
    throw new Error('birthDate must be a Date object');
  }

  // La date envoyée est fausse (invalide)
  if (isNaN(p.birthDate.getTime())) {
    throw new Error('birthDate is not a valid date');
  }

  // La date est dans le futur
  if (p.birthDate.getTime() > Date.now()) {
    throw new Error('birthDate cannot be in the future');
  }

  let dateDiff = new Date(Date.now() - p.birthDate.getTime());
  let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
  return age;
}

export { calculateAge };