import React, { useState } from 'react';
import { Bot, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'admin@gmail.com' && password === 'Admin@12345') {
      sessionStorage.setItem('officehub360_is_admin_authenticated', 'true');
      // Set session expiry to 60 minutes from now
      sessionStorage.setItem('officehub360_admin_session_expiry', (Date.now() + 3600000).toString());
      onLogin();
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-[#3b82f6] selection:text-white items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-14 h-14 bg-[#3b82f6] rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 mb-4">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">OfficeHub360</h1>
          <p className="text-sm text-[#71717a]">Admin Access Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider ml-1">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-all outline-none"
                placeholder="Enter admin email"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-all outline-none"
                placeholder="Enter secure password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-2 cursor-pointer"
          >
            Authenticate <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
