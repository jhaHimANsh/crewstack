import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

// rotating color pool for project tiles
const tiles = ['bg-sun', 'bg-bolt', 'bg-coral', 'bg-lime', 'bg-lilac', 'bg-sky'];
const textOn = { 'bg-bolt': 'text-white', 'bg-ink': 'text-paper' };

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
          <div className="inline-block chip bg-lilac mb-3">Projects</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">
            All projects.
          </h1>
          <p className="font-medium text-ink/60 mt-2">
            {isAdmin
              ? 'You can see every project in the workspace.'
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
            <div key={i} className="h-48 border-[3px] border-ink skel" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="panel p-12 text-center">
          <div className="font-display text-6xl font-black mb-3">∅</div>
          <h3 className="font-display font-black text-2xl mb-2 tracking-tight">No projects yet</h3>
          <p className="font-medium text-ink/60 mb-6">
            {isAdmin
              ? 'Create the first one to get started.'
              : "You haven't been added to any projects yet."}
          </p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => {
            const tile = tiles[i % tiles.length];
            const txt = textOn[tile] || 'text-ink';
            return (
              <div
                key={p.id}
                className="bg-cream border-[3px] border-ink shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col"
              >
                {/* color header */}
                <div className={`${tile} ${txt} border-b-[3px] border-ink p-4 flex items-center justify-between`}>
                  <div className="w-10 h-10 bg-ink text-paper border-[3px] border-ink flex items-center justify-center font-black text-lg">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="chip bg-paper border-ink">{p.status}</span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-display font-black text-xl tracking-tight hover:underline decoration-[3px] underline-offset-4"
                  >
                    {p.name}
                  </Link>
                  <p className="text-sm font-medium text-ink/70 mt-1 line-clamp-2 min-h-[2.5rem]">
                    {p.description || 'No description.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2 pt-4 border-t-[3px] border-ink/10">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {[p.owner, ...(p.members || [])].slice(0, 3).map((m, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 bg-paper border-[2px] border-ink flex items-center justify-center font-black text-xs"
                            title={m?.name}
                          >
                            {m?.name?.charAt(0)?.toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="font-mono text-[11px] font-bold">
                        {p.members?.length + 1} member{p.members?.length === 0 ? '' : 's'}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold">
                      {p.taskCount || 0} task{p.taskCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Link to={`/projects/${p.id}`} className="font-black text-sm uppercase tracking-widest hover:bg-sun px-1">
                      Open →
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => remove(p.id, p.name)}
                        className="font-black text-xs uppercase tracking-widest text-ink/40 hover:text-coral"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-paper border-[4px] border-ink shadow-brutal-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-2xl tracking-tight">New project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 border-[3px] border-ink bg-cream hover:bg-coral font-black"
              >
                ×
              </button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  className="input"
                  placeholder="e.g. Q3 Launch"
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
                  {creating ? 'Creating…' : 'Create →'}
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
