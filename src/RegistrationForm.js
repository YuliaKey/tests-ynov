import { useState } from 'react';
import { validateName, validateEmail, validatePostalCode, validateCity, validateAge } from './validator';
import './RegistrationForm.css';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    postalCode: '',
    city: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateField = (name, value) => {
    let result;
    
    switch(name) {
      case 'firstName':
      case 'lastName':
        result = validateName(value);
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'postalCode':
        result = validatePostalCode(value);
        break;
      case 'city':
        result = validateCity(value);
        break;
      case 'birthDate':
        if (!value) {
          result = { valid: false, error: { message: 'Birth date is required' } };
        } else {
          const date = new Date(value);
          result = validateAge({ birthDate: date });
        }
        break;
      /* istanbul ignore next */
      default:
        result = { valid: true };
    }
    
    return result.valid ? null : result.error.message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Valider le champ si déjà touché
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Gestion de la perte de focus
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    const allFieldsFilled = Object.values(formData).every(value => value !== '');
    const noErrors = Object.keys(formData).every(field => !validateField(field, formData[field]));
    return allFieldsFilled && noErrors;
  };

  // Gestion de la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    /* istanbul ignore else */
    if (isFormValid()) {
      localStorage.setItem('registrationData', JSON.stringify(formData));
      
      setShowSuccess(true);
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        postalCode: '',
        city: ''
      });
      setErrors({});
      setTouched({});
      
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="registration-form-container">
      <h2>Formulaire d'Inscription</h2>
      
      {showSuccess && (
        <div className="toaster success" data-testid="success-toaster">
          ✓ Inscription réussie ! Les données ont été sauvegardées.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="firstName">Prénom *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && (
            <span className="error-message" data-testid="firstName-error">
              {errors.firstName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Nom *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && (
            <span className="error-message" data-testid="lastName-error">
              {errors.lastName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && (
            <span className="error-message" data-testid="email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Date de naissance *</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.birthDate ? 'error' : ''}
          />
          {errors.birthDate && (
            <span className="error-message" data-testid="birthDate-error">
              {errors.birthDate}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="postalCode">Code Postal *</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.postalCode ? 'error' : ''}
          />
          {errors.postalCode && (
            <span className="error-message" data-testid="postalCode-error">
              {errors.postalCode}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="city">Ville *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.city ? 'error' : ''}
          />
          {errors.city && (
            <span className="error-message" data-testid="city-error">
              {errors.city}
            </span>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={!isFormValid()}
          data-testid="submit-button"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
}

export default RegistrationForm;
