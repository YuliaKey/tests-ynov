import { calculateAge } from "./module";

/**
 * @function calculateAge
 * @description Tests for the calculateAge function that calculates the age of a person based on their birth date in years.
 */
describe('calculateAge Unit Test Suits', () => {
  it('should return the correct age for a given birth date', () => {
    const loise = { birthDate: new Date('11/07/1991') };
    expect(calculateAge(loise)).toBe(34);
  });

  // Aucun argument n'a été envoyé
 it('should throw a "missing param p" error if the parameter is not provided', () => {
    expect(() => calculateAge()).toThrow('missing param p');
  });

  // Le format envoyé n'est pas un objet
  it('should throw an error if the argument is not an object', () => {
    expect(() => calculateAge('not an object')).toThrow('param p must be an object');
  });

  it('should throw an error if the argument is a number', () => {
    expect(() => calculateAge(123)).toThrow('param p must be an object');
  });

  it('should throw an error if the argument is null', () => {
    expect(() => calculateAge(null)).toThrow('missing param p');
  });

  // L'objet ne contient pas un champ birthDate
  it('should throw an error if the object does not contain birthDate property', () => {
    expect(() => calculateAge({})).toThrow('birthDate property is required');
  });

  it('should throw an error if the object has other properties but not birthDate', () => {
    expect(() => calculateAge({ name: 'John' })).toThrow('birthDate property is required');
  });

  // Le champ birthDate n'est pas une date
  it('should throw an error if birthDate is not a Date object', () => {
    expect(() => calculateAge({ birthDate: 'not a date' })).toThrow('birthDate must be a Date object');
  });

  it('should throw an error if birthDate is a number', () => {
    expect(() => calculateAge({ birthDate: 123456789 })).toThrow('birthDate must be a Date object');
  });

  // La date envoyée est fausse (invalide)
  it('should throw an error if birthDate is an invalid Date', () => {
    expect(() => calculateAge({ birthDate: new Date('invalid') })).toThrow('birthDate is not a valid date');
  });

  // La date est dans le futur
  it('should throw an error if birthDate is in the future', () => {
    const futureDate = new Date('01-01-2027');
    expect(() => calculateAge({ birthDate: futureDate })).toThrow('birthDate cannot be in the future');
  });

  // Test pour s'assurer que le calcul fonctionne pour différentes années
  it('should calculate age correctly regardless of current year', () => {
    const birthDate = new Date('01-01-2000');
    const age = calculateAge({ birthDate });
    expect(age).toBeGreaterThanOrEqual(0);
    expect(typeof age).toBe('number');
  });
  
});