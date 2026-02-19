import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Home from './Home';

const mockUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    birthDate: '1990-01-01',
    postalCode: '75001',
    city: 'Paris'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    birthDate: '1985-05-15',
    postalCode: '69001',
    city: 'Lyon'
  }
];

const renderHome = (users = []) => {
  if (users.length > 0) {
    localStorage.setItem('users', JSON.stringify(users));
  } else {
    localStorage.removeItem('users');
  }

  return render(
    <BrowserRouter>
      <UserProvider>
        <Home />
      </UserProvider>
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders welcome message', () => {
    renderHome();
    expect(screen.getByText(/Bienvenue sur notre application d'inscription/i)).toBeInTheDocument();
  });

  it('displays 0 users when no users are registered', () => {
    renderHome();
    expect(screen.getByText('0 utilisateur(s) inscrit(s)')).toBeInTheDocument();
  });

  it('displays correct user count', () => {
    renderHome(mockUsers);
    expect(screen.getByText('2 utilisateur(s) inscrit(s)')).toBeInTheDocument();
  });

  it('displays user list when users are registered', () => {
    renderHome(mockUsers);
    
    expect(screen.getByText('Liste des inscrits')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
  });

  it('does not display user list when no users are registered', () => {
    renderHome();
    expect(screen.queryByText('Liste des inscrits')).not.toBeInTheDocument();
  });

  it('renders link to registration page', () => {
    renderHome();
    const link = screen.getByText("S'inscrire");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });
});
