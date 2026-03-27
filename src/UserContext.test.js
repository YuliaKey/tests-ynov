import { renderHook, act, waitFor } from '@testing-library/react';
import { UserProvider, useUsers } from './UserContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;

describe('UserContext', () => {
  const API = `http://localhost:${process.env.REACT_APP_SERVER_PORT}`;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Mock par défaut : API retourne un tableau vide
    axios.get.mockResolvedValue({ data: { utilisateurs: [] } });
  });

  it('initializes with empty users array', async () => {
    axios.get.mockResolvedValueOnce({ data: { utilisateurs: [] } });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(axios.get).toHaveBeenCalledWith(`${API}/users`);
  });

  it('loads users from API on mount', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    axios.get.mockResolvedValueOnce({ data: { utilisateurs: mockUsers } });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(axios.get).toHaveBeenCalledWith(`${API}/users`);
  });

  it('adds a new user via API', async () => {
    axios.get.mockResolvedValueOnce({ data: { utilisateurs: [] } });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      birthDate: '1990-01-01',
      postalCode: '75001',
      city: 'Paris'
    };

    const mockUtilisateur = { id: 2, name: 'Jane Smith', email: 'jane@example.com' };
    axios.post.mockResolvedValueOnce({ data: { utilisateur: mockUtilisateur } });

    await act(async () => {
      await result.current.addUser(newUser);
    });

    expect(result.current.users).toHaveLength(1);
    expect(axios.post).toHaveBeenCalledWith(
      `${API}/users`,
      { name: 'Jane Smith', email: 'jane@example.com' }
    );
  });

  it('clears all users', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    axios.get.mockResolvedValueOnce({ data: { utilisateurs: mockUsers } });

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.clearUsers();
    });

    expect(result.current.users).toEqual([]);
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useUsers());
    }).toThrow('useUsers must be used within a UserProvider');

    consoleSpy.mockRestore();
  });

  it('handles API error when fetching users on mount', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});
