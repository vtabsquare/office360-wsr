import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminLogin } from './AdminLogin';

describe('AdminLogin UI/UX Component', () => {
  it('renders the login form correctly', () => {
    render(<AdminLogin onLogin={() => {}} />);
    
    // Check if main heading is present
    expect(screen.getByText('OfficeHub360')).toBeInTheDocument();
    expect(screen.getByText('Admin Access Required')).toBeInTheDocument();
    
    // Check if input fields are present
    expect(screen.getByPlaceholderText('Enter admin email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter secure password')).toBeInTheDocument();
    
    // Check if submit button is present
    expect(screen.getByRole('button', { name: /authenticate/i })).toBeInTheDocument();
  });

  it('shows error on invalid credentials', () => {
    const handleLogin = vi.fn();
    render(<AdminLogin onLogin={handleLogin} />);
    
    const emailInput = screen.getByPlaceholderText('Enter admin email');
    const passwordInput = screen.getByPlaceholderText('Enter secure password');
    const submitBtn = screen.getByRole('button', { name: /authenticate/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);
    
    // Should show error and not call onLogin
    expect(screen.getByText('Invalid admin credentials.')).toBeInTheDocument();
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it('calls onLogin on valid credentials', () => {
    const handleLogin = vi.fn();
    render(<AdminLogin onLogin={handleLogin} />);
    
    const emailInput = screen.getByPlaceholderText('Enter admin email');
    const passwordInput = screen.getByPlaceholderText('Enter secure password');
    const submitBtn = screen.getByRole('button', { name: /authenticate/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Admin@12345' } });
    fireEvent.click(submitBtn);
    
    // Should call onLogin
    expect(handleLogin).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Invalid admin credentials.')).not.toBeInTheDocument();
  });
});
