import axios from 'axios';

const port = process.env.REACT_APP_SERVER_PORT;
const API = `http://localhost:${port}`;
/* istanbul ignore next */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jsonplaceholder.typicode.com';

/**
 * Récupère la liste de tous les utilisateurs inscrits
 * @returns {Promise} Promise contenant le tableau d'utilisateurs
 */
export const getUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

/**
 * Ajoute un nouvel utilisateur inscrit
 * @param {Object} userData - Les données de l'utilisateur à ajouter
 * @returns {Promise} Promise contenant l'utilisateur créé
 */
export const addUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  return response.data;
};

/**
 * Compte le nombre d'utilisateurs inscrits
 * @returns {Promise<number>} Promise contenant le nombre d'utilisateurs
 */
export const countUsers = async () => {
  try {
    const response = await axios.get(`${API}/users`);
    return response.data.utilisateurs.length;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
