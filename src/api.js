import axios from 'axios';

const port = process.env.REACT_APP_SERVER_PORT;
const API = `http://localhost:${port}`;

/**
 * Récupère la liste de tous les utilisateurs inscrits
 * @returns {Promise} Promise contenant le tableau d'utilisateurs
 */
export const getUsers = async () => {
  const response = await axios.get(`${API}/users`);
  return response.data.utilisateurs;
};

/**
 * Ajoute un nouvel utilisateur inscrit
 * @param {Object} userData - Les données de l'utilisateur à ajouter
 * @returns {Promise} Promise contenant l'utilisateur créé
 */
export const addUser = async (userData) => {
  const name = `${userData.firstName} ${userData.lastName}`;
  const response = await axios.post(`${API}/users`, { name, email: userData.email });
  const u = response.data.utilisateur;
  return [u.id, u.name, u.email, new Date().toISOString()];
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
