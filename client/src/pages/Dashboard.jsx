import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

const statusChip = (s) =>
  s === 'DONE' ? 'chip-done' : s === 'IN_PROGRESS' ? 'chip-progress' : 'chip-todo';

const statusLabel = (s) => s.replace('_', ' ');

const StatBlock = ({ label, value, bg, hint, mono = true }) => (
  <div className={`${bg} border-[3px] border-ink shadow-brutal p-5`}>
    <div className="font-black uppercase tracking-widest text-[11px] mb-3">{label}</div>
    <div className={`${mono ? 'font-mono' : 'font-display'} text-5xl font-black leading-none`}>
      {value}
    </div>
    {hint && <div className="text-xs font-bold mt-3 uppercase tracking-wider">{hint}</div>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/tasks/dashboard/stats')
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-3 w-full loading-bar mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 border-[3px] border-ink skel" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-block chip bg-sun mb-3">Welcome back</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">
            {user.name.split(' ')[0]}.
          </h1>
          <p className="font-medium text-ink/60 mt-2 max-w-md">
            Here's the state of your stack.
          </p>
        </div>
        <Link to="/projects" className="btn-ink">
          All projects →
        </Link>
      </div>

      {/* Stat blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock label="Projects" value={stats.totalProjects} bg="bg-cream" />
        <StatBlock label="Total tasks" value={stats.totalTasks} bg="bg-sky" />
        <StatBlock
          label="In progress"
          value={stats.inProgress}
          bg="bg-sun"
          hint={`${stats.done} done`}
        />
        <StatBlock
          label="Overdue"
          value={stats.overdue}
          bg={stats.overdue > 0 ? 'bg-coral' : 'bg-lime'}
          hint={stats.overdue > 0 ? 'Heads up' : 'All clear'}
        />
      </div>

      {/* Status breakdown + My tasks */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-black text-xl tracking-tight">Task status</h3>
            <span className="font-mono text-xs uppercase tracking-widest">[ {stats.totalTasks} total ]</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'To Do', value: stats.todo, bg: 'bg-cream' },
              { label: 'In Progress', value: stats.inProgress, bg: 'bg-sun' },
              { label: 'Done', value: stats.done, bg: 'bg-lime' }
            ].map((row) => {
              const pct = stats.totalTasks
                ? Math.round((row.value / stats.totalTasks) * 100)
                : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-1.5">
                    <span>{row.label}</span>
                    <span className="font-mono">{row.value} · {pct}%</span>
                  </div>
                  <div className="h-5 border-[3px] border-ink bg-white relative">
                    <div className={`h-full ${row.bg} border-r-[3px] border-ink transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My tasks */}
        <div className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-black text-xl tracking-tight">My tasks</h3>
            <span className="chip bg-bolt text-white">{stats.myTasksCount} assigned</span>
          </div>
          {stats.myTasks.length === 0 ? (
            <div className="border-[3px] border-dashed border-ink/30 py-10 text-center">
              <div className="font-mono text-sm uppercase tracking-widest">[ empty queue ]</div>
              <div className="text-xs font-medium mt-2 text-ink/60">No tasks assigned yet.</div>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {stats.myTasks.map((t) => (
                <li
                  key={t.id}
                  className="bg-white border-[3px] border-ink p-3 flex items-center justify-between gap-3 hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <Link to={`/projects/${t.project?.id}`} className="flex-1 min-w-0">
                    <div className="font-bold truncate">{t.title}</div>
                    <div className="text-xs font-medium text-ink/60 mt-0.5 uppercase tracking-wider">
                      {t.project?.name}
                      {t.dueDate && ` · ${new Date(t.dueDate).toLocaleDateString()}`}
                    </div>
                  </Link>
                  <span className={statusChip(t.status)}>{statusLabel(t.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Overdue panel */}
      <div className="panel p-6">
        <div className="flex items-center gap-3 mb-5">
          <h3 className="font-display font-black text-xl tracking-tight">Overdue tasks</h3>
          {stats.overdue > 0 && (
            <span className="chip-overdue">{stats.overdue} late</span>
          )}
        </div>
        {stats.overdueTasks.length === 0 ? (
          <div className="border-[3px] border-dashed border-ink/30 py-10 text-center bg-lime/20">
            <div className="font-mono text-sm uppercase tracking-widest font-black">[ all clear ]</div>
            <div className="text-xs font-medium mt-2">Nothing overdue. Great work.</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.overdueTasks.map((t) => (
              <Link
                key={t.id}
                to={`/projects/${t.project?.id}`}
                className="bg-coral/30 border-[3px] border-ink p-3 hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <div className="font-bold truncate">{t.title}</div>
                <div className="text-xs uppercase font-bold tracking-wider mt-1">{t.project?.name}</div>
                <div className="font-mono text-xs font-black mt-2 bg-coral border-2 border-ink inline-block px-1.5">
                  Due {new Date(t.dueDate).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
