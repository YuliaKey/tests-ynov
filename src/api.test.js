import { getUsers, addUser, countUsers } from './api';
import axios from 'axios';

jest.mock('axios');

describe('API Service', () => {
  const port = process.env.REACT_APP_SERVER_PORT;
  const API = `http://localhost:${port}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch all users from API', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];

      axios.get.mockResolvedValueOnce({ data: { utilisateurs: mockUsers } });

      const result = await getUsers();

      expect(axios.get).toHaveBeenCalledWith(`${API}/users`);
      expect(result).toEqual(mockUsers);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Network Error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(getUsers()).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith(`${API}/users`);
    });
  });

  describe('addUser', () => {
    it('should add a new user via POST request', async () => {
      const newUser = {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre@example.com',
        birthDate: '1995-03-15',
        postalCode: '75001',
        city: 'Paris'
      };

      const mockUtilisateur = { id: 3, name: 'Pierre Durand', email: 'pierre@example.com' };
      axios.post.mockResolvedValueOnce({ data: { utilisateur: mockUtilisateur } });

      const result = await addUser(newUser);

      expect(axios.post).toHaveBeenCalledWith(`${API}/users`, { name: 'Pierre Durand', email: 'pierre@example.com' });
      expect(result[0]).toBe(3);
      expect(result[1]).toBe('Pierre Durand');
      expect(result[2]).toBe('pierre@example.com');
    });

    it('should handle POST errors', async () => {
      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      };

      const errorMessage = 'Bad Request';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(addUser(newUser)).rejects.toThrow(errorMessage);
      expect(axios.post).toHaveBeenCalledWith(`${API}/users`, { name: 'Test User', email: 'test@example.com' });
    });
  });

  describe('countUsers', () => {
    it('fetches successfully data from an API', async () => {
      const data = {
        data: {
          utilisateurs: [
            {
              id: '1',
              nom: 'a',
              prenom: 'b',
              email: 'c@c.fr'
            }
          ]
        }
      };

      axios.get.mockImplementationOnce(() => Promise.resolve(data));
      await expect(countUsers()).resolves.toEqual(1);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/users');
    });

    it('should return 0 when no users exist', async () => {
      const data = {
        data: {
          utilisateurs: []
        }
      };

      axios.get.mockImplementationOnce(() => Promise.resolve(data));

      const result = await countUsers();

      expect(result).toBe(0);
      expect(axios.get).toHaveBeenCalledWith(`${API}/users`);
    });

    it('fetches erroneously data from an API', async () => {
      const errorMessage = 'Network Error';

      axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error(errorMessage)),
      );

      await expect(countUsers()).rejects.toThrow(errorMessage);
    });
  });
});
