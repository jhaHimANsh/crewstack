import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Topbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition ${
      isActive
        ? 'bg-card text-white border border-border'
        : 'text-muted hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-bg shadow-glow-cyan">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 12 10 16 18 8" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight">Task Manager</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/projects" className={linkClass}>Projects</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className={isAdmin ? 'chip-admin' : 'chip-member'}>{user?.role}</span>
            <span className="font-medium text-sm">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-xs px-4 py-2">
            Sign out
          </button>
        </div>
      </div>
      <nav className="md:hidden border-t border-border px-4 py-2 flex gap-1">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/projects" className={linkClass}>Projects</NavLink>
      </nav>
    </header>
  );
};

export default Topbar;
