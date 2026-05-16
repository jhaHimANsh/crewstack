import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];

const statusLabel = (s) => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s);
const statusDot = (s) =>
  s === 'DONE' ? 'bg-ok' : s === 'IN_PROGRESS' ? 'bg-warn' : 'bg-bad';
const priorityChip = (p) =>
  p === 'HIGH' ? 'chip-high' : p === 'MEDIUM' ? 'chip-medium' : 'chip-low';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('All');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [memberEmail, setMemberEmail] = useState('');

  const isOwner = project?.owner?.id === user?.id;
  const canManage = isAdmin || isOwner;

  const load = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
      setTasks(data.tasks);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const filteredTasks = useMemo(() => {
    if (filter === 'All') return tasks;
    if (filter === 'Overdue')
      return tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
      );
    if (filter === 'Mine') return tasks.filter((t) => t.assigneeId === user.id);
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter, user]);

  const tasksByStatus = useMemo(() => {
    const groups = { TODO: [], IN_PROGRESS: [], DONE: [] };
    filteredTasks.forEach((t) => groups[t.status]?.push(t));
    return groups;
  }, [filteredTasks]);

  const openCreate = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      assigneeId: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: ''
    });
    setShowTaskModal(true);
  };
  const openEdit = (t) => {
    setEditingTask(t);
    setTaskForm({
      title: t.title,
      description: t.description || '',
      assigneeId: t.assigneeId || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : ''
    });
    setShowTaskModal(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taskForm,
        assigneeId: taskForm.assigneeId || null,
        dueDate: taskForm.dueDate || null
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', { ...payload, projectId: id });
        toast.success('Task created');
      }
      setShowTaskModal(false);
      load();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed';
      toast.error(msg);
    }
  };

  const quickStatus = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      toast.success(`→ ${statusLabel(newStatus)}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteTask = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      toast.success('Member added');
      setMemberEmail('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-1 w-full bg-card rounded-full overflow-hidden mb-6">
          <div className="loading-bar h-full" />
        </div>
        <div className="h-40 rounded-2xl skel mb-6" />
        <div className="h-96 rounded-2xl skel" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* breadcrumb */}
      <div className="text-sm flex items-center gap-2 text-subtle">
        <Link to="/projects" className="hover:text-accent">Projects</Link>
        <span>/</span>
        <span className="text-white">{project.name}</span>
      </div>

      {/* header */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center font-bold text-2xl text-accent shadow-glow-cyan">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
                <span className={project.status === 'ACTIVE' ? 'chip-active' : 'chip-member'}>
                  {project.status}
                </span>
              </div>
              <p className="text-muted max-w-2xl">{project.description || 'No description.'}</p>
              <div className="text-xs text-subtle mt-2">
                Owner: {project.owner?.name} · Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          {(canManage || project.members?.some((m) => m.id === user.id)) && (
            <button onClick={openCreate} className="btn-primary">
              + New task
            </button>
          )}
        </div>
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'TODO', 'IN_PROGRESS', 'DONE', 'Overdue', 'Mine'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                filter === f
                  ? 'bg-accent text-bg border-accent'
                  : 'bg-card text-muted border-border hover:border-accent/40 hover:text-white'
              }`}
            >
              {f === 'TODO' ? 'To Do' : f === 'IN_PROGRESS' ? 'In Progress' : f === 'DONE' ? 'Done' : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1">
          {['list', 'board'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                view === v ? 'bg-accent text-bg' : 'text-muted hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* MAIN: tasks */}
        <div>
          {filteredTasks.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3 opacity-40">✨</div>
              <h3 className="font-bold text-lg">No tasks</h3>
              <p className="text-muted text-sm mt-1">
                {filter === 'All' ? 'Create the first task.' : `No matches for "${filter}".`}
              </p>
            </div>
          ) : view === 'board' ? (
            <div className="grid md:grid-cols-3 gap-3">
              {STATUS.map((s) => (
                <div key={s} className="card">
                  <div className="border-b border-border px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`dot ${statusDot(s)}`} />
                      <span className="font-semibold text-xs uppercase tracking-wider">{statusLabel(s)}</span>
                    </div>
                    <span className="text-xs font-semibold text-subtle tabular-nums">
                      {tasksByStatus[s]?.length || 0}
                    </span>
                  </div>
                  <div className="p-2 space-y-2 min-h-[300px]">
                    {tasksByStatus[s]?.map((t) => <TaskCard key={t.id} t={t} user={user} canManage={canManage} onEdit={openEdit} onDelete={deleteTask} onStatus={quickStatus} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((t) => <TaskCard key={t.id} t={t} user={user} canManage={canManage} onEdit={openEdit} onDelete={deleteTask} onStatus={quickStatus} wide />)}
            </div>
          )}
        </div>

        {/* SIDEBAR: members */}
        <aside className="card p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Team</h3>
            <span className="text-xs text-subtle">{1 + (project.members?.length || 0)} member{project.members?.length === 0 ? '' : 's'}</span>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 p-2 rounded-xl bg-raised">
              <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-sm text-accent">
                {project.owner?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{project.owner?.name}</div>
                <div className="text-xs text-subtle truncate">{project.owner?.email}</div>
              </div>
              <span className="chip-admin">Owner</span>
            </li>
            {project.members?.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-raised transition">
                <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center font-bold text-sm">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{m.name}</div>
                  <div className="text-xs text-subtle truncate">{m.email}</div>
                </div>
                {canManage && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="text-xs text-subtle hover:text-bad"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          {canManage && (
            <form onSubmit={addMember} className="mt-4 pt-4 border-t border-border space-y-2">
              <input
                type="email"
                required
                className="input text-sm py-2"
                placeholder="member@team.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full text-xs py-2">Invite member</button>
            </form>
          )}
        </aside>
      </div>

      {/* Task modal */}
      {showTaskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="card-raised w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl">{editingTask ? 'Edit task' : 'New task'}</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="w-8 h-8 rounded-full bg-card border border-border hover:border-bad hover:text-bad text-muted"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveTask} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  className="input"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  className="input"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    {STATUS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    {PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Assign to</label>
                  <select
                    className="input"
                    value={taskForm.assigneeId}
                    onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {[project.owner, ...(project.members || [])]
                      .filter(Boolean)
                      .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i)
                      .map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="label">Due date</label>
                  <input
                    type="date"
                    className="input"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Save changes' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ t, user, canManage, onEdit, onDelete, onStatus, wide = false }) => {
  const overdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
  const isAssignee = t.assigneeId === user.id;
  const canEdit = canManage || isAssignee;
  const statusDotClass = t.status === 'DONE' ? 'bg-ok' : t.status === 'IN_PROGRESS' ? 'bg-warn' : 'bg-bad';

  return (
    <div className={`bg-raised border rounded-xl p-3 hover:border-accent/40 transition ${overdue ? 'border-bad/40' : 'border-border'}`}>
      <div className="flex items-start gap-2.5">
        <span className={`dot ${statusDotClass} mt-2 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className={
              t.priority === 'HIGH' ? 'chip-high' :
              t.priority === 'MEDIUM' ? 'chip-medium' : 'chip-low'
            }>
              {t.priority}
            </span>
            {overdue && <span className="chip-todo">Overdue</span>}
          </div>
          <h4 className="font-semibold text-sm leading-snug">{t.title}</h4>
          {wide && t.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{t.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            {t.assignee ? (
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center font-semibold text-[10px]">
                  {t.assignee.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-muted">{t.assignee.name}</span>
              </span>
            ) : (
              <span className="text-subtle">Unassigned</span>
            )}
            {t.dueDate && (
              <span className={overdue ? 'text-bad font-semibold tabular-nums' : 'text-subtle tabular-nums'}>
                {new Date(t.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between gap-2">
          <select
            value={t.status}
            onChange={(e) => onStatus(t, e.target.value)}
            className="text-xs bg-card border border-border rounded-md px-2 py-1 focus:outline-none focus:border-accent text-white"
          >
            {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
              <option key={s} value={s}>
                {s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
              </option>
            ))}
          </select>
          {canManage && (
            <div className="flex gap-1">
              <button onClick={() => onEdit(t)} className="text-xs text-muted hover:text-accent px-2">
                Edit
              </button>
              <button onClick={() => onDelete(t)} className="text-xs text-muted hover:text-bad px-2">
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
