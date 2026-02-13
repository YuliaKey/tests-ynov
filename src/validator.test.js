import { validateAge, validateName, validatePostalCode, validateEmail } from "./validator";

/**
 * @function validateAge
 * @description Tests for the validateAge function that validates if a person is at least 18 years old
 * Note: Detailed parameter validation is tested in module.test.js (calculateAge)
 */
describe('validateAge Unit Test Suits', () => {
  
  // Cas valide : personne majeure (>= 18 ans)
  it('should return valid result for person who is exactly 18 years old', () => {
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    
    const person = { birthDate: eighteenYearsAgo };
    const result = validateAge(person);
    
    expect(result.valid).toBe(true);
    expect(result.age).toBe(18);
  });

  it('should return valid result for person who is over 18 years old', () => {
    const person = { birthDate: new Date('1991-11-07') };
    const result = validateAge(person);
    
    expect(result.valid).toBe(true);
    expect(result.age).toBe(34);
  });

  it('should return valid result for person who is 25 years old', () => {
    const twentyFiveYearsAgo = new Date();
    twentyFiveYearsAgo.setFullYear(twentyFiveYearsAgo.getFullYear() - 25);
    
    const person = { birthDate: twentyFiveYearsAgo };
    const result = validateAge(person);
    
    expect(result.valid).toBe(true);
    expect(result.age).toBe(25);
  });

  // Cas invalide : personne mineure (< 18 ans)
  it.each([
    [17, 'seventeen years old'],
    [10, 'ten years old'],
    [5, 'five years old'],
    [0, 'newborn']
  ])('should reject person who is %i years old (%s)', (yearsAgo, description) => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - yearsAgo);
    
    const person = { birthDate };
    const result = validateAge(person);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('AGE_UNDER_18');
    expect(result.error.message).toBe('You must be at least 18 years old');
    expect(result.age).toBe(yearsAgo);
  });

  // Vérification que les erreurs de calculateAge sont propagées
  it('should propagate errors from calculateAge with INVALID_PARAMETER code', () => {
    const result = validateAge();
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('INVALID_PARAMETER');
  });

});

/**
 * @function validatePostalCode
 * @description Tests for the validatePostalCode function that validates French postal codes
 * Rules: Exactly 5 digits, no more, no less
 */
describe('validatePostalCode Unit Test Suits', () => {
  
  // Cas valides : codes postaux corrects (5 chiffres)
  it('should accept valid 5-digit postal code', () => {
    const result = validatePostalCode('75001');
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('75001');
  });

  it('should accept postal code starting with 0', () => {
    const result = validatePostalCode('01000');
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('01000');
  });

  it('should accept postal code with all zeros except last digit', () => {
    const result = validatePostalCode('00001');
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('00001');
  });

  // Cas invalides : moins de 5 chiffres
  it.each([
    ['7500', 4],
    ['750', 3],
    ['75', 2],
    ['7', 1]
  ])('should reject postal code with %s (%i digits)', (code, length) => {
    const result = validatePostalCode(code);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('INVALID_POSTAL_CODE_LENGTH');
    expect(result.error.message).toContain('5 digits');
  });

  // Cas invalides : plus de 5 chiffres
  it.each([
    ['750001', 6],
    ['7500012', 7],
    ['75000123', 8]
  ])('should reject postal code with %s (%i digits)', (code, length) => {
    const result = validatePostalCode(code);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_POSTAL_CODE_LENGTH');
  });

  // Cas invalides : contient des lettres
  it.each([
    ['75A01', 'letter in middle'],
    ['75001A', 'letter at end'],
    ['A7501', 'letter at start'],
    ['ABCDE', 'all letters'],
    ['7a0B1', 'mixed case letters']
  ])('should reject postal code with %s (%s)', (code) => {
    const result = validatePostalCode(code);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_POSTAL_CODE_FORMAT');
    expect(result.error.message).toContain('digits only');
  });

  // Cas invalides : caractères spéciaux
  it.each([
    ['75 001', 'space'],
    ['75-001', 'hyphen'],
    ['75@01', 'at sign'],
    ['75.001', 'dot'],
    ['75_001', 'underscore']
  ])('should reject postal code with %s (%s)', (code) => {
    const result = validatePostalCode(code);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_POSTAL_CODE_FORMAT');
  });

  // Cas d'erreur : paramètres invalides
  it('should return error for empty string', () => {
    const result = validatePostalCode('');
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMPTY_POSTAL_CODE');
    expect(result.error.message).toContain('empty');
  });

  it('should return error for undefined', () => {
    const result = validatePostalCode();
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('MISSING_POSTAL_CODE');
    expect(result.error.message).toContain('missing');
  });

  it('should return error for null', () => {
    const result = validatePostalCode(null);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('MISSING_POSTAL_CODE');
  });

  it('should return error for non-string type (number)', () => {
    const result = validatePostalCode(75001);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_TYPE');
    expect(result.error.message).toContain('string');
  });

  it('should return error for non-string type (object)', () => {
    const result = validatePostalCode({ code: '75001' });
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_TYPE');
  });

  // Cas limites
  it('should reject postal code with only spaces', () => {
    const result = validatePostalCode('     ');
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMPTY_POSTAL_CODE');
  });

  it('should accept and trim postal code with leading/trailing spaces', () => {
    const result = validatePostalCode('  75001  ');
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('75001');
  });

});

/**
 * @function validateName
 * @description Tests for the validateName function that validates first name and last name
 * 
 */
describe('validateName Unit Test Suits', () => {
  
  // Cas valides : noms corrects
  it.each([
    ['Dupont', 'simple name'],
    ['Éléonore', 'name with accents'],
    ['Jean-Pierre', 'name with hyphen'],
    ['Marie-Anne-Louise', 'name with multiple hyphens'],
    ['Müller-Château', 'complex name with accents and hyphens'],
    ['François', 'name with cedilla']
  ])('should accept valid name %s (%s)', (name) => {
    const result = validateName(name);
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe(name);
  });

  // Cas invalides : noms avec chiffres
  it.each([
    ['John123', 'numbers at end'],
    ['Marie3', 'single number'],
    ['1John', 'number at start'],
    ['Jo2hn', 'number in middle']
  ])('should reject name with %s (%s)', (name) => {
    const result = validateName(name);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('INVALID_NAME_FORMAT');
    expect(result.error.message).toContain('numbers');
  });

  // Cas invalides : caractères spéciaux non autorisés
  it.each([
    ['John@Doe', 'at sign'],
    ['John_Doe', 'underscore'],
    ['John*', 'asterisk'],
    ['$John', 'dollar sign'],
    ['John#Doe', 'hash'],
    ['John%', 'percent']
  ])('should reject name with %s (%s)', (name) => {
    const result = validateName(name);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_NAME_FORMAT');
    expect(result.error.message).toContain('special characters');
  });

  // Cas invalides : Protection XSS
  it.each([
    ['<script>alert("XSS")</script>', 'script tag'],
    ['John<script>alert(1)</script>Doe', 'script tag in middle'],
    ['<div>John</div>', 'div tag'],
    ['<img src=x onerror="alert(1)">', 'img tag with onerror'],
    ['javascript:alert(1)', 'javascript protocol'],
    ['<iframe>test</iframe>', 'iframe tag']
  ])('should reject XSS attempt: %s (%s)', (name) => {
    const result = validateName(name);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('XSS_DETECTED');
    expect(result.error.message).toContain('XSS');
  });

  // Cas d'erreur : paramètres invalides
  it('should return error for empty string', () => {
    const result = validateName('');
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMPTY_NAME');
    expect(result.error.message).toContain('empty');
  });

  it('should return error for undefined', () => {
    const result = validateName();
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('MISSING_NAME');
    expect(result.error.message).toContain('missing');
  });

  it('should return error for null', () => {
    const result = validateName(null);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('MISSING_NAME');
  });

  it('should return error for non-string type', () => {
    const result = validateName(123);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_TYPE');
    expect(result.error.message).toContain('string');
  });

  it('should return error for object', () => {
    const result = validateName({ name: 'John' });
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_TYPE');
  });

  // Cas limites
  it('should reject name with only spaces', () => {
    const result = validateName('   ');
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMPTY_NAME');
  });

  it('should accept and trim name with leading/trailing spaces', () => {
    const result = validateName('  Jean  ');
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Jean');
  });

});

/**
 * @function validateEmail
 * @description Tests for the validateEmail function that validates email addresses
 * Rules: Standard valid email format
 */
describe('validateEmail Unit Test Suits', () => {
  
  // Cas valides : emails corrects
  it.each([
    ['user@example.com', 'simple email'],
    ['john.doe@example.com', 'email with dot in local part'],
    ['user+tag@example.com', 'email with plus sign'],
    ['user_name@example.co.fr', 'email with underscore and multi-level domain'],
    ['test123@test-domain.com', 'email with numbers and hyphen in domain'],
    ['a@b.fr', 'minimal valid email'],
    ['first.last@subdomain.example.com', 'email with subdomain'],
    ['user@example-domain.org', 'email with hyphen in domain']
  ])('should accept valid email %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe(email);
  });

  // Cas invalides : emails sans @
  it.each([
    ['userexample.com', 'missing @'],
    ['user.example.com', 'dot instead of @'],
    ['user', 'only local part']
  ])('should reject email without @ sign: %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
    expect(result.error.message).toContain('@');
  });

  // Cas invalides : emails avec multiple @
  it.each([
    ['user@@example.com', 'double @'],
    ['user@domain@example.com', 'multiple @ signs']
  ])('should reject email with multiple @ signs: %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
  });

  // Cas invalides : emails sans domaine
  it.each([
    ['user@', 'missing domain'],
    ['user@.com', 'missing domain name'],
    ['user@domain', 'missing TLD']
  ])('should reject email without proper domain: %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
  });

  // Cas invalides : emails sans partie locale
  it.each([
    ['@example.com', 'missing local part'],
    ['@', 'only @ sign']
  ])('should reject email without local part: %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
  });

  // Cas invalides : caractères invalides
  it.each([
    ['user name@example.com', 'space in local part'],
    ['user@exam ple.com', 'space in domain'],
    ['user#name@example.com', 'hash in local part'],
    ['user@domain,com', 'comma instead of dot'],
    ['user()@example.com', 'parentheses in local part']
  ])('should reject email with invalid characters: %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
  });

  // Cas invalides : formats incorrects
  it.each([
    ['.user@example.com', 'starts with dot'],
    ['user.@example.com', 'ends with dot before @'],
    ['user..name@example.com', 'consecutive dots'],
    ['user@-example.com', 'domain starts with hyphen'],
    ['user@example-.com', 'domain ends with hyphen']
  ])('should reject email with incorrect format: %s (%s)', (email) => {
    const result = validateEmail(email);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
  });

  // Cas d'erreur : paramètres invalides
  it('should return error for empty string', () => {
    const result = validateEmail('');
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMPTY_EMAIL');
    expect(result.error.message).toContain('empty');
  });

  it('should return error for undefined', () => {
    const result = validateEmail();
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('MISSING_EMAIL');
    expect(result.error.message).toContain('missing');
  });

  it('should return error for null', () => {
    const result = validateEmail(null);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('MISSING_EMAIL');
  });

  it('should return error for non-string type', () => {
    const result = validateEmail(123);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('INVALID_TYPE');
    expect(result.error.message).toContain('string');
  });

  // Cas limites
  it('should reject email with only spaces', () => {
    const result = validateEmail('     ');
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMPTY_EMAIL');
  });

  it('should accept and trim email with leading/trailing spaces', () => {
    const result = validateEmail('  user@example.com  ');
    
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('user@example.com');
  });

  it('should reject email that is too long', () => {
    const longEmail = 'a'.repeat(255) + '@example.com';
    const result = validateEmail(longEmail);
    
    expect(result.valid).toBe(false);
    expect(result.error.code).toBe('EMAIL_TOO_LONG');
  });
});
