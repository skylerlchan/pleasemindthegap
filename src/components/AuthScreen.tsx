import React, { useState } from 'react';
import { Brain, Calendar, Target, Zap, AlertCircle, Mail, Lock, User } from 'lucide-react';

interface AuthScreenProps {
  onSignUp: (email: string, password: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignUp, onSignIn, loading, error }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onSignIn(email, password);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const currentError = formError || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-black dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 dark:border dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-full shadow-lg">
                <Brain size={32} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mind the Gap</h1>
            <p className="text-gray-600 dark:text-gray-200">
              Bridge the gap between planning and execution with intelligent task management
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-left">
              <Calendar className="text-blue-600 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-200 text-sm">Google Calendar-style time slots</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <Target className="text-green-600 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-200 text-sm">Strategic project organization</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <Zap className="text-purple-600 flex-shrink-0" size={20} />
              <span className="text-gray-700 dark:text-gray-200 text-sm">Smart deadline management</span>
            </div>
          </div>

          {currentError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                  <p className="text-red-700 dark:text-red-100 text-sm mt-1">{currentError}</p>
                  {error && error.includes('Supabase') && (
                    <p className="text-red-600 dark:text-red-200 text-xs mt-2">
                      Please click "Connect to Supabase" in the top right to set up your database.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <User size={20} />
              <span>
                {loading 
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-colors text-sm"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-300 mt-6 text-center">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
};