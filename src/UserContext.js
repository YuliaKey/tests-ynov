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

  // Charger les utilisateurs depuis l'API au montage
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
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
    <UserContext.Provider value={{ users, addUser, clearUsers, loading }}>
      {children}
    </UserContext.Provider>
  );
};
