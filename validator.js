import { calculateAge } from './module.js';

/**
 * Validates if a person is at least 18 years old
 * 
 * @param {object} person An object representing a person with a birthDate property of type Date
 * @returns {object} An object with validation result: { valid: boolean, age?: number, error?: { code: string, message: string } }
 */
function validateAge(person) {
  try {
    const age = calculateAge(person);
    
    // Vérifie si la personne a au moins 18 ans
    if (age < 18) {
      return {
        valid: false,
        age: age,
        error: {
          code: 'AGE_UNDER_18',
          message: 'You must be at least 18 years old'
        }
      };
    }
    
    // Personne majeure
    return {
      valid: true,
      age: age
    };
    
  } catch (error) {
    return {
      valid: false,
      error: {
        code: 'INVALID_PARAMETER',
        message: error.message
      }
    };
  }
}

export { validateAge };
