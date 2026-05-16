import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data.token, data.user);
      toast.success(`Account ready — welcome, ${data.user.name}`);
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Signup failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen aurora-warm relative overflow-hidden">
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
          <Link to="/login" className="btn-ghost text-xs">Sign in</Link>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="text-center mb-10 max-w-2xl">
          <p className="text-accent text-sm font-semibold mb-3">Free Forever, Upgrade Anytime</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Create a free account.</h1>
          <p className="text-muted mt-3">Set up your workspace in under a minute.</p>
        </div>

        <div className="w-full max-w-md card p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                required
                minLength={2}
                className="input"
                placeholder="Jane Cooper"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
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
                minLength={6}
                className="input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'ADMIN', label: 'Admin', sub: 'Create & manage' },
                  { value: 'MEMBER', label: 'Member', sub: 'Work on tasks' }
                ].map((r) => {
                  const active = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`p-3 rounded-xl border text-left transition ${
                        active
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border bg-card text-white hover:border-accent/40'
                      }`}
                    >
                      <div className="font-semibold text-sm">{r.label}</div>
                      <div className="text-[11px] opacity-70 mt-0.5">{r.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account…' : 'Start for free'}
            </button>
          </form>
        </div>

        <p className="text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="accent-text hover:underline">Sign in</Link>
        </p>
      </div>

      <div className="relative z-10 text-center pb-8 text-xs text-subtle">
        © {new Date().getFullYear()} Task Manager
      </div>
    </div>
  );
};

export default Signup;
