import { Link } from 'react-router-dom';
import { useUsers } from './UserContext';
import './Home.css';

function Home() {
  const { users } = useUsers();

  return (
    <div className="home-container">
      <h1>Bienvenue sur notre application d'inscription</h1>
      <p className="user-count">{users.length} utilisateur(s) inscrit(s)</p>
      
      {users.length > 0 && (
        <div className="users-list">
          <h2>Liste des inscrits</h2>
          <table>
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Ville</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Link to="/register" className="register-link">
        S'inscrire
      </Link>
    </div>
  );
}

export default Home;
