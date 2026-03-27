import { Link } from 'react-router-dom';
import { useUsers } from './UserContext';
import './Home.css';

function Home() {
  const { users, error } = useUsers();

  return (
    <div className="home-container">
      <h1>Bienvenue sur notre application d'inscription</h1>
      {error && (
        <div className="toaster error" data-cy="error-message">{error}</div>
      )}
      {!error && (
        <p className="user-count">{users.length} utilisateur(s) inscrit(s)</p>
      )}

      {!error && users.length > 0 && (
        <div className="users-list">
          <h2>Liste des inscrits</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user[1]}</td>
                  <td>{user[2]}</td>
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
