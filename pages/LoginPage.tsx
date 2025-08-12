import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { DashboardIcon } from '../components/icons';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AppContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      // On successful login, the App component will automatically redirect
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center mb-6">
          <div className="bg-[#A4F44A] p-3 rounded-lg">
            <DashboardIcon className="h-8 w-8 text-[#2D7A79]" />
          </div>
          <h1 className="text-3xl font-bold ml-4 text-gray-800">Dashboard</h1>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-1">Welcome Back!</h2>
          <p className="text-center text-gray-500 mb-6">Enter your credentials to access your account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79] focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D7A79] focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2D7A79] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D7A79] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <LoadingSpinner /> : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Hint: Use email `admin@example.com` and password `password`.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
