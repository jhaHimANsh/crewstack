import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

const statusDot = (s) =>
  s === 'DONE' ? 'bg-ok' : s === 'IN_PROGRESS' ? 'bg-warn' : 'bg-bad';
const statusLabel = (s) => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s);
const statusChip = (s) =>
  s === 'DONE' ? 'chip-done' : s === 'IN_PROGRESS' ? 'chip-progress' : 'chip-todo';

const StatCard = ({ label, value, accent, hint }) => (
  <div className="card p-5 relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-30 ${accent}`} />
    <div className="relative">
      <div className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</div>
      <div className="text-4xl font-bold mt-2 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-subtle mt-2">{hint}</div>}
    </div>
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
        <div className="h-1 w-full bg-card rounded-full overflow-hidden mb-8">
          <div className="loading-bar h-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl skel" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent text-sm font-semibold mb-2">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hi, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-muted mt-2">Here's what's happening across your projects.</p>
        </div>
        <Link to="/projects" className="btn-primary">All projects →</Link>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" value={stats.totalProjects} accent="bg-accent" />
        <StatCard label="Total tasks" value={stats.totalTasks} accent="bg-sun" />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          accent="bg-warn"
          hint={`${stats.done} completed`}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          accent={stats.overdue > 0 ? 'bg-bad' : 'bg-ok'}
          hint={stats.overdue > 0 ? 'Needs attention' : 'All clear ✓'}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-5">Task status</h3>
          <div className="space-y-4">
            {[
              { label: 'To Do', value: stats.todo, color: 'bg-bad' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-warn' },
              { label: 'Done', value: stats.done, color: 'bg-ok' }
            ].map((row) => {
              const pct = stats.totalTasks
                ? Math.round((row.value / stats.totalTasks) * 100)
                : 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`dot ${row.color}`} />
                      <span className="font-medium">{row.label}</span>
                    </div>
                    <span className="text-muted tabular-nums">{row.value} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-raised rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My tasks */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg">My tasks</h3>
            <span className="chip-medium">{stats.myTasksCount} assigned</span>
          </div>
          {stats.myTasks.length === 0 ? (
            <div className="text-center py-10 text-subtle text-sm">
              No tasks assigned to you yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {stats.myTasks.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/projects/${t.project?.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-raised border border-border hover:border-accent/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`dot ${statusDot(t.status)}`} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{t.title}</div>
                        <div className="text-xs text-subtle mt-0.5">
                          {t.project?.name}
                          {t.dueDate && ` · ${new Date(t.dueDate).toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <span className={statusChip(t.status)}>{statusLabel(t.status)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center gap-3 mb-5">
            <h3 className="font-bold text-lg">Overdue tasks</h3>
            {stats.overdue > 0 && <span className="chip-todo">{stats.overdue} late</span>}
          </div>
          {stats.overdueTasks.length === 0 ? (
            <div className="text-center py-10 text-subtle text-sm">
              🎉 No overdue tasks. Great work.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.overdueTasks.map((t) => (
                <Link
                  key={t.id}
                  to={`/projects/${t.project?.id}`}
                  className="p-4 rounded-xl bg-raised border border-bad/30 hover:border-bad transition block"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="dot bg-bad" />
                    <span className="text-xs font-semibold text-bad">OVERDUE</span>
                  </div>
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-subtle mt-1">{t.project?.name}</div>
                  <div className="text-xs text-bad mt-2 tabular-nums">
                    Due {new Date(t.dueDate).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
