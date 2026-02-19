import React, { createContext, useState, useEffect, useContext } from 'react';

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

  // Charger les utilisateurs depuis localStorage au montage
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  // Sauvegarder les utilisateurs dans localStorage à chaque changement
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);

  const addUser = (user) => {
    setUsers(prevUsers => [...prevUsers, user]);
  };

  const clearUsers = () => {
    setUsers([]);
    localStorage.removeItem('users');
  };

  return (
    <UserContext.Provider value={{ users, addUser, clearUsers }}>
      {children}
    </UserContext.Provider>
  );
};
