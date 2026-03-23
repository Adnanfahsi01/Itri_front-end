import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../utils/api';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminLogin(formData);

      // Store token and admin data
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));

      // Redirect to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 animate-pulse [animation-delay:2s]" />

      {/* Floating Geometric Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 rounded-full animate-bounce [animation-duration:3s]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-secondary/30 rounded-full animate-bounce [animation-duration:5s]"></div>
      <div className="absolute top-1/2 right-20 w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl flex items-center justify-center relative z-10 mx-auto mb-6 transform group-hover:rotate-6 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 mb-3 tracking-tighter">
              Accès Système
            </h1>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] opacity-80">Administration Sécurisée ITRI</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-bold animate-shake backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group">
              <label className="block text-[10px] font-black text-white/40 uppercase mb-3 ml-2 tracking-[0.2em] group-focus-within:text-secondary transition-colors">
                Identifiant Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white/10 transition-all outline-none text-white font-bold placeholder:text-white/10 placeholder:font-medium"
                  placeholder="admin@itri-tech.com"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-secondary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-white/40 uppercase mb-3 ml-2 tracking-[0.2em] group-focus-within:text-secondary transition-colors">
                Clé de Sécurité
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white/10 transition-all outline-none text-white font-bold placeholder:text-white/10"
                  placeholder="••••••••••••"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-secondary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group/btn h-16 bg-white text-[#0F172A] rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all active:scale-[0.98] disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed overflow-hidden mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-accent translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
              <span className="relative z-10 group-hover/btn:text-white transition-colors duration-300">
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Authentification...
                  </div>
                ) : 'Entrer dans le Dashboard'}
              </span>
            </button>
          </form>

          {/* Helper Legend */}
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mb-4">Credentiels d'urgence</p>
            <div className="group/code relative inline-block">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary/50 scale-x-0 group-hover/code:scale-x-100 transition-transform origin-left"></div>
              <code className="text-[10px] font-mono text-secondary bg-secondary/10 px-4 py-2 rounded-lg border border-secondary/20 block group-hover:bg-secondary/20 transition-colors">
                itriainticevent@gmail.com
              </code>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
          Designed for Excellence • ITRI 2026
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}} />
    </div>
  );
}

export default AdminLogin;
