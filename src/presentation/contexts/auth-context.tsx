// src/presentation/contexts/auth-context.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../../services/auth/auth.service';
import User from '../../domain/entities/user.entity';
import { Credentials, UserData } from '../../domain/models/auth.models';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To show splash screen during initial auth check
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  registerUser: (userData: UserData) => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<boolean>;
  verifyResetCode: (email: string, code: string) => Promise<string>;
  resetPassword: (token: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.checkAuthStatus();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
    const loggedInUser = await authService.signIn(credentials);
    setUser(loggedInUser);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during sign out', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (userData: UserData) => {
    await authService.register(userData);
  }, []);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    registerUser,
    sendResetPasswordEmail: (email: string) => authService.sendResetCode(email),
    verifyResetCode: (email: string, code: string) => authService.verifyResetCode(email, code),
    resetPassword: (token: string, email: string, password: string) => authService.changePassword(email, password, token),
  }), [user, isAuthenticated, isLoading, signIn, signOut, registerUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
