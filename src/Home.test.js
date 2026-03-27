import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Home from './Home';
import axios from 'axios';

jest.mock('axios');

const mockUsers = [
  [1, 'John Doe', 'john@example.com', '2024-01-01T00:00:00.000Z'],
  [2, 'Jane Smith', 'jane@example.com', '2024-01-01T00:00:00.000Z']
];

const renderHome = (users = []) => {
  // Mock de l'API
  axios.get.mockResolvedValueOnce({ data: { utilisateurs: users } });

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
    jest.clearAllMocks();
  });

  it('renders welcome message', async () => {
    renderHome();
    expect(screen.getByText(/Bienvenue sur notre application d'inscription/i)).toBeInTheDocument();
  });

  it('displays 0 users when no users are registered', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('0 utilisateur(s) inscrit(s)')).toBeInTheDocument();
    });
  });

  it('displays correct user count', async () => {
    renderHome(mockUsers);
    
    await waitFor(() => {
      expect(screen.getByText('2 utilisateur(s) inscrit(s)')).toBeInTheDocument();
    });
  });

  it('displays user list when users are registered', async () => {
    renderHome(mockUsers);
    
    await waitFor(() => {
      expect(screen.getByText('Liste des inscrits')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('does not display user list when no users are registered', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('0 utilisateur(s) inscrit(s)')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Liste des inscrits')).not.toBeInTheDocument();
  });

  it('renders link to registration page', async () => {
    renderHome();
    const link = screen.getByText("S'inscrire");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });
});
