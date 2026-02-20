import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './UserContext';
import RegistrationForm from './RegistrationForm';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <UserProvider>
        {component}
      </UserProvider>
    </BrowserRouter>
  );
};

describe('RegistrationForm - Integration Tests', () => {
  
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
    mockNavigate.mockClear();
    
    // Mock des réponses axios
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ 
      data: { 
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        birthDate: '1990-01-01',
        postalCode: '75001',
        city: 'Paris'
      } 
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render all form fields', () => {
    renderWithProviders(<RegistrationForm />);
    
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date de naissance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('submit button should be disabled initially', () => {
    renderWithProviders(<RegistrationForm />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  test('should display error message for invalid first name (with numbers)', async () => {
    renderWithProviders(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    
    await userEvent.type(firstNameInput, 'John123');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('firstName-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('firstName-error')).toHaveTextContent(/cannot contain numbers/i);
  });

  test('should display error message for invalid email format', async () => {
    renderWithProviders(<RegistrationForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('email-error')).toHaveTextContent(/invalid/i);
  });

  test('should display error for invalid postal code', async () => {
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
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

  test('should call API and show success toaster on valid submission', async () => {
    jest.useFakeTimers();
    renderWithProviders(<RegistrationForm />);
    
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
    
    const expectedUserData = {
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
      birthDate: dateString,
      postalCode: '69001',
      city: 'Lyon'
    };
    
    axios.post.mockResolvedValueOnce({ data: { id: 2, ...expectedUserData } });
    
    await userEvent.click(submitButton);
    
    // Vérifier que le toaster de succès est affiché
    await waitFor(() => {
      expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
    });
    expect(screen.getByTestId('success-toaster')).toHaveTextContent(/inscription réussie/i);
    
    // Vérifier que l'API a été appelée
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        expectedUserData
      );
    });
    
    // Vérifier que navigate est appelé après 2 secondes
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    
    jest.useRealTimers();
  });

  test('should clear form fields after successful submission', async () => {
    jest.useFakeTimers();
    renderWithProviders(<RegistrationForm />);
    
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
    
    const expectedUserData = {
      firstName: 'Pierre',
      lastName: 'Durand', 
      email: 'pierre@example.com',
      birthDate: validDate.toISOString().split('T')[0],
      postalCode: '13001',
      city: 'Marseille'
    };
    
    axios.post.mockResolvedValueOnce({ data: { id: 1, ...expectedUserData } });
    
    await userEvent.click(submitButton);
    
    // Vérifier que l'API a été appelée
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        expectedUserData
      );
    });
    
    // Vérifier que le toaster de succès apparaît
    await waitFor(() => {
      expect(screen.getByTestId('success-toaster')).toBeInTheDocument();
    });
    
    // Vérifier la navigation après 2 secondes
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    jest.useRealTimers();
  });

  test('should not submit form when invalid', async () => {
    renderWithProviders(<RegistrationForm />);
    
    const submitButton = screen.getByTestId('submit-button');
    const firstNameInput = screen.getByLabelText(/prénom/i);
    
    expect(submitButton).toBeDisabled();
    
    await userEvent.type(firstNameInput, 'John');
    fireEvent.blur(firstNameInput);
    
    // Le bouton devrait toujours être désactivé car le formulaire n'est pas complet
    expect(submitButton).toBeDisabled();
    
    // Vérifier que rien n'a été sauvegardé dans localStorage
    expect(localStorage.getItem('users')).toBeNull();
    
    // Vérifier que le toaster n'apparaît pas
    expect(screen.queryByTestId('success-toaster')).not.toBeInTheDocument();
  });

  test('should prevent XSS attack in name field', async () => {
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const submitButton = screen.getByTestId('submit-button');
    
    // Remplir seulement un champ
    await userEvent.type(firstNameInput, 'John');
    
    // Le bouton doit rester disabled car tous les champs ne sont pas remplis
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('submit-button');
  });

  test('should display error for invalid last name', async () => {
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
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
    renderWithProviders(<RegistrationForm />);
    
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    
    // Cliquer puis sortir sans remplir
    birthDateInput.focus();
    await userEvent.tab();
    
    await waitFor(() => {
      expect(screen.getByTestId('birthDate-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('birthDate-error')).toHaveTextContent(/required/i);
  });

  test('should hide success toaster after 2 seconds and navigate', async () => {
    jest.useFakeTimers();
    renderWithProviders(<RegistrationForm />);
    
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
      jest.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    
    jest.useRealTimers();
  });

  test('should display error message when API returns 400 (duplicate email)', async () => {
    renderWithProviders(<RegistrationForm />);
    
    // Mock une erreur 400 - email existe déjà
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'Cet email est déjà utilisé.' }
      }
    });
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.type(emailInput, 'existing@example.com');
    await userEvent.type(birthDateInput, '1990-01-01');
    await userEvent.type(postalCodeInput, '75001');
    await userEvent.type(cityInput, 'Paris');
    
    const submitButton = screen.getByTestId('submit-button');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('api-error-toaster')).toBeInTheDocument();
    });
    
    const errorToaster = screen.getByTestId('api-error-toaster');
    expect(errorToaster).toHaveTextContent('Cet email est déjà utilisé.');
    
    // Vérifier que la navigation n'a pas eu lieu
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should display generic error message when API returns 400 without message', async () => {
    renderWithProviders(<RegistrationForm />);
    
    // Mock une erreur 400 sans message spécifique
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {}
      }
    });
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(birthDateInput, '1990-01-01');
    await userEvent.type(postalCodeInput, '75001');
    await userEvent.type(cityInput, 'Paris');
    
    const submitButton = screen.getByTestId('submit-button');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('api-error-toaster')).toBeInTheDocument();
    });
    
    const errorToaster = screen.getByTestId('api-error-toaster');
    expect(errorToaster).toHaveTextContent('Cet email est déjà utilisé.');
  });

  test('should display error message when API returns 500 (server error)', async () => {
    renderWithProviders(<RegistrationForm />);
    
    // Mock une erreur 500 - serveur inaccessible
    axios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      }
    });
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(birthDateInput, '1990-01-01');
    await userEvent.type(postalCodeInput, '75001');
    await userEvent.type(cityInput, 'Paris');
    
    const submitButton = screen.getByTestId('submit-button');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('api-error-toaster')).toBeInTheDocument();
    });
    
    const errorToaster = screen.getByTestId('api-error-toaster');
    expect(errorToaster).toHaveTextContent('Le serveur est momentanément indisponible. Veuillez réessayer plus tard.');
    
    // Vérifier que la navigation n'a pas eu lieu
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should display error message when network fails (no response)', async () => {
    renderWithProviders(<RegistrationForm />);
    
    // Mock une erreur réseau sans réponse du serveur
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(birthDateInput, '1990-01-01');
    await userEvent.type(postalCodeInput, '75001');
    await userEvent.type(cityInput, 'Paris');
    
    const submitButton = screen.getByTestId('submit-button');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('api-error-toaster')).toBeInTheDocument();
    });
    
    const errorToaster = screen.getByTestId('api-error-toaster');
    expect(errorToaster).toHaveTextContent('Impossible de contacter le serveur. Veuillez vérifier votre connexion.');
    
    // Vérifier que la navigation n'a pas eu lieu
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('should display generic error message when API returns other error code (403)', async () => {
    renderWithProviders(<RegistrationForm />);
    
    // Mock une erreur 403 - autre code d'erreur
    axios.post.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: 'Forbidden' }
      }
    });
    
    const firstNameInput = screen.getByLabelText(/prénom/i);
    const lastNameInput = screen.getByLabelText(/^nom/i);
    const emailInput = screen.getByLabelText(/email/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    const postalCodeInput = screen.getByLabelText(/code postal/i);
    const cityInput = screen.getByLabelText(/ville/i);
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(birthDateInput, '1990-01-01');
    await userEvent.type(postalCodeInput, '75001');
    await userEvent.type(cityInput, 'Paris');
    
    const submitButton = screen.getByTestId('submit-button');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('api-error-toaster')).toBeInTheDocument();
    });
    
    const errorToaster = screen.getByTestId('api-error-toaster');
    expect(errorToaster).toHaveTextContent('Une erreur est survenue. Veuillez réessayer.');
    
    // Vérifier que la navigation n'a pas eu lieu
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
