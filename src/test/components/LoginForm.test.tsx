import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../../components/LoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the auth context
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    isAuthenticated: false,
    isLoading: false,
    user: null,
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API
vi.mock('../../services/api', () => ({
  login: vi.fn(),
}));

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    renderWithRouter(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/library slug/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has correct default values', () => {
    renderWithRouter(<LoginForm />);
    
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    expect(librarySlugInput.value).toBe('demo-library');
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid email', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.clear(librarySlugInput);
    
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.type(librarySlugInput, 'test-library');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  it('calls login function with correct data on successful submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.clear(librarySlugInput);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(librarySlugInput, 'test-library');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        library_slug: 'test-library',
      });
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.clear(librarySlugInput);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(librarySlugInput, 'test-library');
    await user.click(submitButton);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('shows error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.clear(librarySlugInput);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.type(librarySlugInput, 'test-library');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('trims whitespace from input values', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.clear(librarySlugInput);
    
    await user.type(emailInput, '  test@example.com  ');
    await user.type(passwordInput, '  password123  ');
    await user.type(librarySlugInput, '  test-library  ');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        library_slug: 'test-library',
      });
    });
  });

  it('handles form submission with Enter key', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    
    await user.clear(librarySlugInput);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(librarySlugInput, 'test-library');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        library_slug: 'test-library',
      });
    });
  });

  it('autofills demo credentials when demo button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const librarySlugInput = screen.getByLabelText(/library slug/i) as HTMLInputElement;
    const demoButton = screen.getByRole('button', { name: /fill demo credentials/i });
    
    // Initially, email and password should be empty
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
    expect(librarySlugInput.value).toBe('demo-library'); // Default value
    
    await user.click(demoButton);
    
    // After clicking, all fields should be filled with demo credentials
    expect(emailInput.value).toBe('admin@demo.com');
    expect(passwordInput.value).toBe('password123');
    expect(librarySlugInput.value).toBe('demo-library');
  });

  it('clears error messages when demo credentials are autofilled', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginForm />);
    
    // First, trigger an error by submitting empty form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
    
    // Then click the demo button
    const demoButton = screen.getByRole('button', { name: /fill demo credentials/i });
    await user.click(demoButton);
    
    // Error should be cleared
    expect(screen.queryByText(/please fill in all fields/i)).not.toBeInTheDocument();
  });
});
