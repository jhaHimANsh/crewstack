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
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden lg:flex relative bg-bolt border-r-[4px] border-ink p-12 flex-col justify-between text-paper">
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} />
        <div className="absolute top-24 right-20 w-24 h-24 bg-sun border-[4px] border-ink shadow-brutal rotate-12" />
        <div className="absolute bottom-40 right-8 w-32 h-32 bg-coral border-[4px] border-ink shadow-brutal-lg -rotate-6" />
        <div className="absolute bottom-12 left-1/3 w-16 h-16 bg-lime border-[4px] border-ink shadow-brutal rotate-45" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3 text-paper">
            <div className="w-12 h-12 bg-paper text-ink border-[4px] border-ink shadow-brutal flex items-center justify-center font-black text-2xl">▌</div>
            <span className="font-display font-black text-3xl tracking-tighter">CREWSTACK</span>
          </Link>
        </div>

        <div className="relative space-y-6 max-w-lg">
          <div className="inline-block bg-paper text-ink px-3 py-1 font-black text-xs uppercase tracking-widest border-[3px] border-ink">
            New here?
          </div>
          <h1 className="font-display font-black text-5xl xl:text-6xl leading-[0.95] tracking-tighter">
            Build your<br/>workspace<br/>in under <span className="bg-sun text-ink px-2 border-[3px] border-ink shadow-brutal">60s</span>
          </h1>
        </div>

        <div className="relative font-mono text-xs uppercase tracking-widest font-bold">
          [ open source · MIT · 2026 ]
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-sun border-[3px] border-ink shadow-brutal-sm flex items-center justify-center font-black">▌</div>
            <span className="font-display font-black text-xl tracking-tighter">CREWSTACK</span>
          </Link>

          <div className="mb-8">
            <div className="inline-block chip bg-coral mb-3">Sign up</div>
            <h2 className="font-display font-black text-4xl tracking-tighter">Make an account.</h2>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Name</label>
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
                minLength={6}
                className="input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'ADMIN', label: 'Admin', sub: 'Create & manage everything', bg: 'bg-sun' },
                  { value: 'MEMBER', label: 'Member', sub: 'Work on assigned tasks', bg: 'bg-cream' }
                ].map((r) => {
                  const active = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`p-3 border-[3px] border-ink text-left transition-all ${
                        active
                          ? `${r.bg} shadow-brutal -translate-y-0.5`
                          : 'bg-white hover:bg-cream'
                      }`}
                    >
                      <div className="font-black uppercase text-sm tracking-wider">{r.label}</div>
                      <div className="text-[11px] font-medium mt-0.5">{r.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-bolt w-full text-base py-3.5">
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p className="text-sm mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
