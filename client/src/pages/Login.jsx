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
      toast.success(`Logged in as ${data.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — brutalist hero panel */}
      <div className="hidden lg:flex relative bg-sun border-r-[4px] border-ink p-12 flex-col justify-between">
        {/* decorative grid */}
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage: 'linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} />
        {/* floating decorative blocks */}
        <div className="absolute top-32 right-12 w-32 h-32 bg-bolt border-[4px] border-ink shadow-brutal-lg rotate-6" />
        <div className="absolute bottom-32 right-32 w-20 h-20 bg-coral border-[4px] border-ink shadow-brutal -rotate-12" />
        <div className="absolute top-1/2 left-12 w-16 h-16 bg-lime border-[4px] border-ink shadow-brutal rotate-12" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-paper border-[4px] border-ink shadow-brutal flex items-center justify-center font-black text-2xl">
              ▌
            </div>
            <span className="font-display font-black text-3xl tracking-tighter">CREWSTACK</span>
          </Link>
        </div>

        <div className="relative space-y-6 max-w-lg">
          <div className="inline-block bg-ink text-sun px-3 py-1 font-black text-xs uppercase tracking-widest border-[3px] border-ink">
            v1.0 / Production Ready
          </div>
          <h1 className="font-display font-black text-5xl xl:text-6xl leading-[0.95] tracking-tighter">
            Stack the work.<br/>
            Stack the crew.<br/>
            <span className="bg-ink text-paper px-2">Ship it.</span>
          </h1>
          <p className="font-medium text-lg max-w-md">
            Project & task management with proper role-based access. Built loud, fast, opinionated.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-xs font-mono">
          <span className="w-2 h-2 bg-lime border-2 border-ink" />
          <span className="font-bold uppercase tracking-widest">All systems operational</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-paper">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-sun border-[3px] border-ink shadow-brutal-sm flex items-center justify-center font-black">▌</div>
            <span className="font-display font-black text-xl tracking-tighter">CREWSTACK</span>
          </Link>

          <div className="mb-8">
            <div className="inline-block chip bg-bolt text-white mb-3">Welcome back</div>
            <h2 className="font-display font-black text-4xl tracking-tighter">Sign in.</h2>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@crew.co"
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
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="text-sm mt-8 font-medium">
            No account?{' '}
            <Link to="/signup" className="link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
