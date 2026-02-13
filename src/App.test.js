import { render, screen } from '@testing-library/react';
import App from './App';

test('should render registration form', () => {
  render(<App />);

  // Vérifier que le formulaire d'inscription est présent
  expect(screen.getByText(/formulaire d'inscription/i)).toBeInTheDocument();
});

