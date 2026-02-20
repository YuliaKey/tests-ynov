import { renderHook, act, waitFor } from '@testing-library/react';
import { UserProvider, useUsers } from './UserContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Mock par défaut : API retourne un tableau vide
    axios.get.mockResolvedValue({ data: [] });
  });

  it('initializes with empty users array', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    const { result } = renderHook(() => useUsers(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.users).toEqual([]);
    expect(axios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
  });

  it('loads users from API on mount', async () => {
    const mockUsers = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];
    axios.get.mockResolvedValueOnce({ data: mockUsers });

    const { result } = renderHook(() => useUsers(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.users).toEqual(mockUsers);
    expect(axios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
  });

  it('adds a new user via API', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
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
    
    axios.post.mockResolvedValueOnce({ data: { id: 2, ...newUser } });

    await act(async () => {
      await result.current.addUser(newUser);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0]).toEqual({ id: 2, ...newUser });
    expect(axios.post).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/users',
      newUser
    );
  });

  it('clears all users', async () => {
    const mockUsers = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];
    axios.get.mockResolvedValueOnce({ data: mockUsers });

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
