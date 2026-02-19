import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext';
import Home from './Home';
import RegistrationForm from './RegistrationForm';

function App() {
  return (
    <UserProvider>
      <Router basename="/tests-ynov">
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegistrationForm />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
