import { calculateAge } from './module.js';

/**
 * Helper function to validate string input
 * @param {any} value
 * @param {string} fieldName
 * @returns {object|null} Error object if invalid, null if valid
 */
function validateStringInput(value, fieldName) {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: {
        code: `MISSING_${fieldName.toUpperCase()}`,
        message: `${fieldName} is missing`
      }
    };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: {
        code: 'INVALID_TYPE',
        message: `${fieldName} must be a string`
      }
    };
  }

  const trimmed = value.trim();
  if (trimmed === '') {
    return {
      valid: false,
      error: {
        code: `EMPTY_${fieldName.toUpperCase()}`,
        message: `${fieldName} cannot be empty`
      }
    };
  }

  return null;
}

/**
 * Validates if a person is at least 18 years old
 * 
 * @param {object} person An object representing a person with a birthDate property of type Date
 * @returns {object} An object with validation result: { valid: boolean, age?: number, error?: { code: string, message: string } }
 */
function validateAge(person) {
  try {
    const age = calculateAge(person);
    
    // Vérifie si la date n'est pas trop ancienne (plus de 150 ans)
    if (age > 150) {
      return {
        valid: false,
        age: age,
        error: {
          code: 'AGE_TOO_OLD',
          message: 'Birth date is not valid'
        }
      };
    }
    
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

/**
 * Validates a French postal code
 * 
 * @param {string} postalCode
 * @returns {object} An object with validation result
 */
function validatePostalCode(postalCode) {
  const validationError = validateStringInput(postalCode, 'POSTAL_CODE');
  if (validationError) {
    return validationError;
  }

  const trimmed = postalCode.trim();

  // Vérifie le format : exactement 5 chiffres
  if (!/^\d{5}$/.test(trimmed)) {
    // Vérifie si c'est un problème de longueur ou de format
    if (/^\d+$/.test(trimmed)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_POSTAL_CODE_LENGTH',
          message: 'Postal code must be exactly 5 digits'
        }
      };
    }
    
    return {
      valid: false,
      error: {
        code: 'INVALID_POSTAL_CODE_FORMAT',
        message: 'Postal code must contain digits only'
      }
    };
  }

  return {
    valid: true,
    sanitized: trimmed
  };
}

/**
 * Validates a name (first name or last name)
 * 
 * @param {string} name
 * @returns {object} An object with validation result
 */
function validateName(name) {
  const validationError = validateStringInput(name, 'NAME');
  if (validationError) {
    return validationError;
  }

  const trimmed = name.trim();

  // Protection XSS : détecte les balises HTML et javascript:
  if (/<[^>]*>/.test(trimmed) || /javascript:/i.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'XSS_DETECTED',
        message: 'Potential XSS attack detected'
      }
    };
  }

  // Vérifie qu'il n'y a pas de chiffres
  if (/\d/.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_NAME_FORMAT',
        message: 'Name cannot contain numbers'
      }
    };
  }

  // Vérifie qu'il n'y a pas de caractères spéciaux (sauf accents et tirets)
  if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_NAME_FORMAT',
        message: 'Name cannot contain special characters'
      }
    };
  }

  return {
    valid: true,
    sanitized: trimmed
  };
}

/**
 * Validates an email address
 * 
 * @param {string} email
 * @returns {object}
 */
function validateEmail(email) {
  const validationError = validateStringInput(email, 'EMAIL');
  if (validationError) {
    return validationError;
  }

  const trimmed = email.trim();

  // Vérifie la longueur maximale
  if (trimmed.length > 254) {
    return {
      valid: false,
      error: {
        code: 'EMAIL_TOO_LONG',
        message: 'Email is too long'
      }
    };
  }

  // Regex pour valider le format email
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_EMAIL_FORMAT',
        message: 'Email format is invalid. Expected format: local@domain.tld'
      }
    };
  }

  // Vérifie qu'il n'y a pas de points consécutifs
  if (/\.\./.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_EMAIL_FORMAT',
        message: 'Email cannot contain consecutive dots'
      }
    };
  }

  return {
    valid: true,
    sanitized: trimmed
  };
}

/**
 * Validates a city name
 * 
 * @param {string} city
 * @returns {object} An object with validation result
 */
function validateCity(city) {
  const validationError = validateStringInput(city, 'CITY');
  if (validationError) {
    return validationError;
  }

  const trimmed = city.trim();

  // Protection XSS : détecte les balises HTML et javascript:
  if (/<[^>]*>/.test(trimmed) || /javascript:/i.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'XSS_DETECTED',
        message: 'Potential XSS attack detected'
      }
    };
  }

  // Vérifie qu'il n'y a pas de chiffres
  if (/\d/.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_CITY_FORMAT',
        message: 'City name cannot contain numbers'
      }
    };
  }

  // Vérifie qu'il n'y a pas de caractères spéciaux (sauf accents, tirets et espaces)
  if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_CITY_FORMAT',
        message: 'City name cannot contain special characters'
      }
    };
  }

  return {
    valid: true,
    sanitized: trimmed
  };
}

export { validateAge, validatePostalCode, validateName, validateEmail, validateCity };
