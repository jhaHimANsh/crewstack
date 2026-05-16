import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY = ['LOW', 'MEDIUM', 'HIGH'];

const statusLabel = (s) => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s);
const statusBg = (s) =>
  s === 'DONE' ? 'bg-lime' : s === 'IN_PROGRESS' ? 'bg-sun' : 'bg-cream';
const priorityChip = (p) =>
  p === 'HIGH' ? 'chip-high' : p === 'MEDIUM' ? 'chip-medium' : 'chip-low';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board'); // board | list
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
        <div className="h-3 w-full loading-bar mb-6" />
        <div className="h-40 border-[3px] border-ink skel mb-6" />
        <div className="h-96 border-[3px] border-ink skel" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* breadcrumb */}
      <div className="font-mono text-xs uppercase tracking-widest flex gap-2 font-bold">
        <Link to="/projects" className="hover:bg-sun px-1">Projects</Link>
        <span>/</span>
        <span className="bg-ink text-paper px-1">{project.name}</span>
      </div>

      {/* project header */}
      <div className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-sun border-[3px] border-ink shadow-brutal flex items-center justify-center font-display font-black text-3xl">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tighter">{project.name}</h1>
                <span className={project.status === 'ACTIVE' ? 'chip-active' : 'chip-member'}>
                  {project.status}
                </span>
              </div>
              <p className="font-medium text-ink/70 max-w-2xl">{project.description || 'No description.'}</p>
              <div className="font-mono text-[11px] font-bold uppercase tracking-widest mt-3 text-ink/50">
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
              className={`px-3 py-1.5 border-[3px] border-ink font-black text-xs uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-ink text-sun shadow-brutal-sm'
                  : 'bg-cream hover:bg-sun'
              }`}
            >
              {f === 'TODO' ? 'To Do' : f === 'IN_PROGRESS' ? 'In Progress' : f === 'DONE' ? 'Done' : f}
            </button>
          ))}
        </div>
        <div className="flex items-center border-[3px] border-ink">
          {['board', 'list'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 font-black text-xs uppercase tracking-widest ${
                view === v ? 'bg-ink text-sun' : 'bg-cream hover:bg-sun'
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
            <div className="panel p-12 text-center">
              <div className="font-display text-5xl font-black mb-3">∅</div>
              <h3 className="font-display font-black text-xl tracking-tight">No tasks</h3>
              <p className="font-medium text-ink/60 mt-1">
                {filter === 'All' ? 'Create the first task.' : `No matches for "${filter}".`}
              </p>
            </div>
          ) : view === 'board' ? (
            <div className="grid md:grid-cols-3 gap-3">
              {STATUS.map((s) => (
                <div key={s} className="bg-paper border-[3px] border-ink min-h-[400px]">
                  <div className={`${statusBg(s)} border-b-[3px] border-ink px-3 py-2 flex items-center justify-between`}>
                    <span className="font-black text-xs uppercase tracking-widest">{statusLabel(s)}</span>
                    <span className="font-mono text-[11px] font-bold bg-ink text-paper px-1.5">
                      {tasksByStatus[s]?.length || 0}
                    </span>
                  </div>
                  <div className="p-2 space-y-2">
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
        <aside className="panel p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-lg tracking-tight">Crew</h3>
            <span className="font-mono text-[11px] font-bold">{1 + (project.members?.length || 0)}</span>
          </div>
          <ul className="space-y-2">
            <li className="border-[3px] border-ink p-2.5 bg-sun flex items-center gap-3">
              <div className="w-9 h-9 bg-ink text-paper border-[2px] border-ink flex items-center justify-center font-black">
                {project.owner?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{project.owner?.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest truncate">{project.owner?.email}</div>
              </div>
              <span className="chip bg-ink text-sun">Owner</span>
            </li>
            {project.members?.map((m) => (
              <li key={m.id} className="border-[3px] border-ink p-2.5 bg-cream flex items-center gap-3">
                <div className="w-9 h-9 bg-paper border-[2px] border-ink flex items-center justify-center font-black">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{m.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest truncate">{m.email}</div>
                </div>
                {canManage && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="font-black text-xs hover:text-coral"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          {canManage && (
            <form onSubmit={addMember} className="mt-4 pt-4 border-t-[3px] border-ink/20 space-y-2">
              <input
                type="email"
                required
                className="input text-sm py-2"
                placeholder="email@crew.co"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <button type="submit" className="btn-ink w-full text-xs py-2">Add member</button>
            </form>
          )}
        </aside>
      </div>

      {/* Task modal */}
      {showTaskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="bg-paper border-[4px] border-ink shadow-brutal-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-2xl tracking-tight">
                {editingTask ? 'Edit task' : 'New task'}
              </h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="w-8 h-8 border-[3px] border-ink bg-cream hover:bg-coral font-black"
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

// Single task card used in board & list view
const TaskCard = ({ t, user, canManage, onEdit, onDelete, onStatus, wide = false }) => {
  const overdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';
  const isAssignee = t.assigneeId === user.id;
  const canEdit = canManage || isAssignee;

  return (
    <div className={`bg-white border-[3px] border-ink p-3 hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${overdue ? 'bg-coral/20' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={
              t.priority === 'HIGH' ? 'chip-high' :
              t.priority === 'MEDIUM' ? 'chip-medium' : 'chip-low'
            }>
              {t.priority}
            </span>
            {overdue && <span className="chip-overdue">Late</span>}
          </div>
          <h4 className="font-bold text-sm leading-snug">{t.title}</h4>
          {wide && t.description && (
            <p className="text-xs font-medium text-ink/60 mt-1 line-clamp-2">{t.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-bold">
            {t.assignee ? (
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-cream border-[2px] border-ink flex items-center justify-center font-black text-[9px]">
                  {t.assignee.name.charAt(0).toUpperCase()}
                </span>
                <span className="uppercase tracking-wider">{t.assignee.name}</span>
              </span>
            ) : (
              <span className="font-mono uppercase tracking-widest text-ink/40">[ unassigned ]</span>
            )}
            {t.dueDate && (
              <span className={`font-mono ${overdue ? 'bg-coral border-2 border-ink px-1' : 'text-ink/60'}`}>
                {new Date(t.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="mt-3 pt-2 border-t-[2px] border-ink/10 flex items-center justify-between gap-2">
          <select
            value={t.status}
            onChange={(e) => onStatus(t, e.target.value)}
            className="text-[11px] font-black uppercase tracking-widest border-[2px] border-ink px-1.5 py-0.5 bg-white focus:outline-none focus:bg-sun"
          >
            {STATUS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          {canManage && (
            <div className="flex gap-1">
              <button onClick={() => onEdit(t)} className="text-[11px] font-black uppercase tracking-widest hover:bg-sun px-1.5">
                Edit
              </button>
              <button onClick={() => onDelete(t)} className="text-[11px] font-black uppercase tracking-widest hover:text-coral px-1.5">
                Del
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
