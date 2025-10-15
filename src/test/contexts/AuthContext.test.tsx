import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  login: vi.fn(),
  verifyToken: vi.fn(),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password', library_slug: 'test' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial state correctly', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('handles successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'staff',
      first_name: 'Test',
      last_name: 'User'
    };
    const mockToken = 'mock-jwt-token';

    (api.login as any).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    (api.login as any).mockRejectedValueOnce(new Error(errorMessage));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  it('handles logout correctly', async () => {
    // First login
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'staff',
      first_name: 'Test',
      last_name: 'User'
    };
    const mockToken = 'mock-jwt-token';

    (api.login as any).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Then logout
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('restores authentication state from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'staff',
      first_name: 'Test',
      last_name: 'User'
    };
    const mockToken = 'mock-jwt-token';

    // Set up localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    (api.verifyToken as any).mockResolvedValueOnce({ user: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  it('handles invalid token on mount', async () => {
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));

    (api.verifyToken as any).mockRejectedValueOnce(new Error('Invalid token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('shows loading state during authentication check', () => {
    // Mock a slow verifyToken call
    (api.verifyToken as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    localStorage.setItem('token', 'some-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isLoading')).toHaveTextContent('true');
  });

  it('handles network errors during login', async () => {
    (api.login as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });
});
