import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetch = () => {
    setLoading(true);
    api
      .get('/projects')
      .then((res) => setProjects(res.data.projects))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id, name) => {
    if (!confirm(`Delete "${name}"? All tasks will be removed.`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-accent text-sm font-semibold mb-2">Projects</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All projects.</h1>
          <p className="text-muted mt-2">
            {isAdmin
              ? 'Every project in your workspace.'
              : 'Projects you own or belong to.'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New project
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl skel" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3 opacity-40">📋</div>
          <h3 className="font-bold text-xl mb-2">No projects yet</h3>
          <p className="text-muted mb-6">
            {isAdmin
              ? 'Create your first one to get started.'
              : "You haven't been added to any projects yet."}
          </p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card p-5 hover:border-accent/40 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className={p.status === 'ACTIVE' ? 'chip-active' : 'chip-member'}>
                  {p.status}
                </span>
              </div>
              <Link
                to={`/projects/${p.id}`}
                className="font-bold text-lg hover:text-accent transition block"
              >
                {p.name}
              </Link>
              <p className="text-sm text-muted mt-1 line-clamp-2 min-h-[2.5rem]">
                {p.description || 'No description.'}
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[p.owner, ...(p.members || [])].slice(0, 3).map((m, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-raised border-2 border-card flex items-center justify-center text-[10px] font-semibold"
                        title={m?.name}
                      >
                        {m?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] text-subtle tabular-nums">
                    {1 + (p.members?.length || 0)} member{p.members?.length === 0 ? '' : 's'}
                  </span>
                </div>
                <span className="text-[11px] text-subtle tabular-nums">
                  {p.taskCount || 0} task{p.taskCount === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Link
                  to={`/projects/${p.id}`}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Open →
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => remove(p.id, p.name)}
                    className="text-xs text-subtle hover:text-bad opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="card-raised w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl">New project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-card border border-border hover:border-bad hover:text-bad text-muted"
              >
                ×
              </button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="label">Project name</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  className="input"
                  placeholder="e.g. Q4 Launch"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  className="input"
                  placeholder="What's the goal?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
