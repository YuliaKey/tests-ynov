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
  
});