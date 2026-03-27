import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from './api';

const UserContext = createContext();

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les utilisateurs depuis l'API au montage
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const data = await api.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Erreur lors du chargement des utilisateurs. Le serveur est indisponible.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const addUser = async (user) => {
    try {
      const newUser = await api.addUser(user);
      setUsers(prevUsers => [...prevUsers, newUser]);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const clearUsers = () => {
    setUsers([]);
  };

  return (
    <UserContext.Provider value={{ users, addUser, clearUsers, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
