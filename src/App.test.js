import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

test('should render home page by default', () => {
  window.history.pushState({}, '', '/tests-ynov');
  
  render(<App />);

  expect(screen.getByText(/Bienvenue sur notre application d'inscription/i)).toBeInTheDocument();
});

test('should display user count on home page', () => {
  window.history.pushState({}, '', '/tests-ynov');
  
  render(<App />);
  
  // Vérifier que le compteur d'utilisateurs est présent
  expect(screen.getByText(/utilisateur\(s\) inscrit\(s\)/i)).toBeInTheDocument();
});

