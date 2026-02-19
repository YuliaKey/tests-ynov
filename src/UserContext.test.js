import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUsers } from './UserContext';

const wrapper = ({ children }) => <UserProvider>{children}</UserProvider>;

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty users array', () => {
    const { result } = renderHook(() => useUsers(), { wrapper });
    expect(result.current.users).toEqual([]);
  });

  it('loads users from localStorage on mount', () => {
    const mockUsers = [
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));

    const { result } = renderHook(() => useUsers(), { wrapper });
    expect(result.current.users).toEqual(mockUsers);
  });

  it('adds a new user', () => {
    const { result } = renderHook(() => useUsers(), { wrapper });
    
    const newUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      birthDate: '1990-01-01',
      postalCode: '75001',
      city: 'Paris'
    };

    act(() => {
      result.current.addUser(newUser);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0]).toEqual(newUser);
  });

  it('saves users to localStorage when adding', () => {
    const { result } = renderHook(() => useUsers(), { wrapper });
    
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    act(() => {
      result.current.addUser(newUser);
    });

    const storedUsers = JSON.parse(localStorage.getItem('users'));
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0]).toEqual(newUser);
  });

  it('clears all users', () => {
    const mockUsers = [
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));

    const { result } = renderHook(() => useUsers(), { wrapper });

    act(() => {
      result.current.clearUsers();
    });

    expect(result.current.users).toEqual([]);
    expect(localStorage.getItem('users')).toBeNull();
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useUsers());
    }).toThrow('useUsers must be used within a UserProvider');

    consoleSpy.mockRestore();
  });
});
