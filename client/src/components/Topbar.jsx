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
    `font-black uppercase tracking-widest text-sm px-3 py-1.5 border-[3px] transition-all ${
      isActive
        ? 'bg-sun border-ink shadow-brutal-sm'
        : 'bg-transparent border-transparent hover:bg-ink hover:text-paper'
    }`;

  return (
    <header className="bg-paper border-b-[4px] border-ink sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sun border-[3px] border-ink shadow-brutal-sm flex items-center justify-center font-black text-ink">
              ▌
            </div>
            <span className="font-display font-black text-xl tracking-tighter">
              CREWSTACK
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/projects" className={linkClass}>Projects</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className={isAdmin ? 'chip-admin' : 'chip-member'}>{user?.role}</span>
            <span className="font-bold text-sm">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-xs">
            Sign out
          </button>
        </div>
      </div>
      <nav className="md:hidden border-t-[3px] border-ink px-4 py-2 flex gap-1">
        <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/projects" className={linkClass}>Projects</NavLink>
      </nav>
    </header>
  );
};

export default Topbar;
