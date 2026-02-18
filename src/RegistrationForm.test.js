import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from './RegistrationForm';

describe('RegistrationForm - Integration Tests', () => {
  
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  test('should render all form fields', () => {
    render(<RegistrationForm />);
    
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date de naissance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('submit button should be disabled initially', () => {
    render(<RegistrationForm />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  test('should display error message for invalid first name (with numbers)', async () => {
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    
    await userEvent.type(firstNameInput, 'John123');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('firstName-error')).toHaveTextContent(/cannot contain numbers/i);
  });

  test('should display error message for invalid email format', async () => {
    render(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('email-error')).toHaveTextContent(/invalid/i);
  });

  test('should display error for invalid postal code', async () => {
    render(<RegistrationForm />);
    
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    
    // Code postal trop court
    await userEvent.type(postalCodeInput, '123');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('postalCode-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('postalCode-error')).toHaveTextContent(/5 digits/i);
  });

  test('should display error for under 18 years old', async () => {
    render(<RegistrationForm />);
    
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    
    // Date qui donne moins de 18 ans (il y a 10 ans)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const dateString = tenYearsAgo.toISOString().split('T')[0];
    
    // Pour les champs date, utiliser fireEvent pour change et blur
    fireEvent.change(birthDateInput, { target: { value: dateString } });
    fireEvent.blur(birthDateInput);
    
    await waitFor(() => {
      expect(screen.getByTestId('birthDate-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('birthDate-error')).toHaveTextContent(/18 years old/i);
  });

  test('chaotic user: multiple invalid inputs, corrections, and corrections again', async () => {
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const submitButton = screen.getByTestId('submit-button');
    
    // Étape 1: Saisie invalide du prénom avec chiffres
    await userEvent.type(firstNameInput, 'John123');
    fireEvent.blur(firstNameInput);
    await waitFor(() => {
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
    
    // Étape 2: Correction du prénom
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'John');
    fireEvent.blur(firstNameInput);
    await waitFor(() => {
      expect(screen.queryByTestId('firstName-error')).not.toBeInTheDocument();
    });
    
    // Étape 3: Saisie invalide de l'email
    await userEvent.type(emailInput, 'not-an-email');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
    
    // Étape 4: Correction email à moitié (toujours invalide)
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    
    // Étape 5: Vraie correction de l'email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@example.com');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
    
    // Étape 6: Code postal invalide
    await userEvent.type(postalCodeInput, 'ABC');
    fireEvent.blur(postalCodeInput);
    await waitFor(() => {
      expect(screen.getByTestId('postalCode-error')).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when all fields are valid', async () => {
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    const submitButton = screen.getByTestId('submit-button');
    
    // Remplir tous les champs valides
    await userEvent.type(firstNameInput, 'Jean');
    await userEvent.type(lastNameInput, 'Dupont');
    await userEvent.type(emailInput, 'jean.dupont@example.com');
    
    // Date de naissance valide (25 ans)
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 25);
    fireEvent.change(birthDateInput, { target: { value: validDate.toISOString().split('T')[0] } });
    
    await userEvent.type(postalCodeInput, '75001');
    await userEvent.type(cityInput, 'Paris');
    
    // Le bouton devrait être activé
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('should save to localStorage and show success toaster on valid submission', async () => {
    jest.useFakeTimers();
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    const submitButton = screen.getByTestId('submit-button');
    
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 25);
    const dateString = validDate.toISOString().split('T')[0];
    
    await userEvent.type(firstNameInput, 'Marie');
    fireEvent.blur(firstNameInput);
    
    await userEvent.type(lastNameInput, 'Martin');
    fireEvent.blur(lastNameInput);
    
    await userEvent.type(emailInput, 'marie.martin@example.com');
    fireEvent.blur(emailInput);
    
    fireEvent.change(birthDateInput, { target: { value: dateString } });
    fireEvent.blur(birthDateInput);
    
    await userEvent.type(postalCodeInput, '69001');
    fireEvent.blur(postalCodeInput);
    
    await userEvent.type(cityInput, 'Lyon');
    fireEvent.blur(cityInput);
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 2000 });
    
    await userEvent.click(submitButton);
    
    // Vérifier que les données sont dans localStorage
    await waitFor(() => {
      expect(localStorage.getItem('registrationData')).not.toBeNull();
    });
    
    const savedData = JSON.parse(localStorage.getItem('registrationData'));
    expect(savedData).toEqual({
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
      birthDate: dateString,
      postalCode: '69001',
      city: 'Lyon'
    });
    
    // Vérifier que le toaster de succès est affiché
    await waitFor(() => {
      expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
    });
    expect(screen.getByTestId('success-toaster')).toHaveTextContent(/inscription réussie/i);
    
    // Vérifier que les champs sont vidés
    expect(firstNameInput.value).toBe('');
    expect(lastNameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    jest.useRealTimers();
  });

  test('should clear form fields after successful submission', async () => {
    jest.useFakeTimers();
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    const submitButton = screen.getByTestId('submit-button');
    
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 30);
    
    await userEvent.type(firstNameInput, 'Pierre');
    await userEvent.tab();
    
    await userEvent.type(lastNameInput, 'Durand');
    await userEvent.tab();
    
    await userEvent.type(emailInput, 'pierre@example.com');
    await userEvent.tab();
    
    fireEvent.change(birthDateInput, { target: { value: validDate.toISOString().split('T')[0] } });
    fireEvent.blur(birthDateInput); 
    
    await userEvent.type(postalCodeInput, '13001');
    await userEvent.tab(); 
    
    await userEvent.type(cityInput, 'Marseille');
    fireEvent.blur(cityInput);
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 2000 });
    
    localStorage.clear();
    
    await userEvent.click(submitButton);
    
    const savedData = JSON.parse(localStorage.getItem('registrationData'));
    expect(savedData).toEqual({
      firstName: 'Pierre',
      lastName: 'Durand', 
      email: 'pierre@example.com',
      birthDate: validDate.toISOString().split('T')[0],
      postalCode: '13001',
      city: 'Marseille'
    });
    
    expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(firstNameInput.value).toBe('');
    });
    expect(lastNameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(birthDateInput.value).toBe('');
    expect(postalCodeInput.value).toBe('');
    expect(cityInput.value).toBe('');
    
    expect(submitButton).toBeDisabled();
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    jest.useRealTimers();
  });

  test('should not submit form when invalid', async () => {
    render(<RegistrationForm />);
    
    const submitButton = screen.getByTestId('submit-button');
    const firstNameInput = screen.getByLabelText(/prénom/i);
    
    expect(submitButton).toBeDisabled();
    
    await userEvent.type(firstNameInput, 'John');
    fireEvent.blur(firstNameInput);
    
    // Le bouton devrait toujours être désactivé car le formulaire n'est pas complet
    expect(submitButton).toBeDisabled();
    
    // Vérifier que rien n'a été sauvegardé dans localStorage
    expect(localStorage.getItem('registrationData')).toBeNull();
    
    // Vérifier que le toaster n'apparaît pas
    expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
  });

  test('should prevent XSS attack in name field', async () => {
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    
    // Tentative d'injection XSS
    await userEvent.type(firstNameInput, '<script>alert("xss")</script>');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('firstName-error')).toHaveTextContent(/XSS/i);
  });

  test('button stays gray (disabled) when form has errors', async () => {
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const submitButton = screen.getByTestId('submit-button');
    
    // Remplir seulement un champ
    await userEvent.type(firstNameInput, 'John');
    
    // Le bouton doit rester disabled car tous les champs ne sont pas remplis
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('submit-button');
  });

  test('should display error for invalid last name', async () => {
    render(<RegistrationForm />);
    
    const lastNameInput = screen.getByLabelText(/^nom/i);
    
    // Saisie invalide avec des chiffres
    await userEvent.type(lastNameInput, 'Doe123');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('lastName-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('lastName-error')).toHaveTextContent(/cannot contain numbers/i);
  });

  test('should display error for invalid city name', async () => {
    render(<RegistrationForm />);
    
    const cityInput = screen.getByLabelText(/ville/i);
    
    // Saisie invalide avec des chiffres
    await userEvent.type(cityInput, 'Paris123');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('city-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('city-error')).toHaveTextContent(/cannot contain numbers/i);
  });

  test('should validate on change when field is already touched', async () => {
    render(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await userEvent.type(emailInput, 'invalid');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'valid@example.com');
    
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });

  test('should display error when birthDate field is empty on blur', async () => {
    render(<RegistrationForm />);
    
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    
    // Cliquer puis sortir sans remplir
    birthDateInput.focus();
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('birthDate-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('birthDate-error')).toHaveTextContent(/required/i);
  });

  test('should hide success toaster after 3 seconds', async () => {
    jest.useFakeTimers();
    render(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    const submitButton = screen.getByTestId('submit-button');
    
    // Remplir le formulaire
    const validDate = new Date();
    validDate.setFullYear(validDate.getFullYear() - 25);
    
    await userEvent.type(firstNameInput, 'Sophie');
    await userEvent.type(lastNameInput, 'Dubois');
    await userEvent.type(emailInput, 'sophie@example.com');
    fireEvent.change(birthDateInput, { target: { value: validDate.toISOString().split('T')[0] } });
    await userEvent.type(postalCodeInput, '33000');
    await userEvent.type(cityInput, 'Bordeaux');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });
});

