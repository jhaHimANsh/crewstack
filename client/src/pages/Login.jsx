import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen aurora relative overflow-hidden">
      {/* nav */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-bg shadow-glow-cyan">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 12 10 16 18 8" />
              </svg>
            </div>
            <span className="font-bold tracking-tight">Task Manager</span>
          </Link>
          <Link to="/signup" className="btn-sun text-xs">Sign up</Link>
        </div>
      </div>

      {/* main */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <div className="text-center mb-10 max-w-2xl">
          <p className="text-accent text-sm font-semibold mb-3">Free To-Do lists for teams and individuals</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Welcome back.</h1>
          <p className="text-muted mt-3">Sign in to continue to your workspace.</p>
        </div>

        <div className="w-full max-w-md card p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@team.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-sm text-muted mt-6">
          New here?{' '}
          <Link to="/signup" className="accent-text hover:underline">Create an account</Link>
        </p>

        {/* feature pills */}
        <div className="flex flex-wrap gap-2 mt-12 justify-center">
          {['Role-based access', 'Real-time status', 'Overdue tracking', 'Team collaboration'].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-muted">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="relative z-10 text-center pb-8 text-xs text-subtle">
        © {new Date().getFullYear()} Task Manager · Free Forever, Upgrade Anytime
      </div>
    </div>
  );
};

export default Login;
