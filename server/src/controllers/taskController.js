const prisma = require('../config/prisma');

const memberSelect = { id: true, name: true, email: true, role: true };

// Helper: project IDs the current user can access
const accessibleProjectIds = async (user) => {
  if (user.role === 'ADMIN') {
    const all = await prisma.project.findMany({ select: { id: true } });
    return all.map((p) => p.id);
  }
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }]
    },
    select: { id: true }
  });
  return projects.map((p) => p.id);
};

// GET /api/tasks
exports.list = async (req, res, next) => {
  try {
    const { project, status, assignee, overdue } = req.query;
    const ids = await accessibleProjectIds(req.user);

    const where = { projectId: { in: ids } };
    if (project) {
      if (!ids.includes(project))
        return res.status(403).json({ message: 'No access to that project' });
      where.projectId = project;
    }
    if (status) where.status = status;
    if (assignee) where.assigneeId = assignee;

    let tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: memberSelect },
        creator: { select: memberSelect },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (overdue === 'true') {
      const now = new Date();
      tasks = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
      );
    }

    res.json({ count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.create = async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeId, status, priority, dueDate } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only admins or project owner can create tasks
    if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Only Admin or project owner can create tasks' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId: assigneeId || null,
        status,
        priority,
        dueDate,
        creatorId: req.user.id
      },
      include: {
        assignee: { select: memberSelect },
        creator: { select: memberSelect },
        project: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.get = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: memberSelect },
        creator: { select: memberSelect },
        project: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            members: { select: { userId: true } }
          }
        }
      }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const canSee =
      req.user.role === 'ADMIN' ||
      task.project.ownerId === req.user.id ||
      task.project.members.some((m) => m.userId === req.user.id);

    if (!canSee) return res.status(403).json({ message: 'Access denied' });

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.update = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          select: { ownerId: true, members: { select: { userId: true } } }
        }
      }
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = task.project.ownerId === req.user.id;
    const isAssignee = task.assigneeId === req.user.id;
    const isMember = task.project.members.some((m) => m.userId === req.user.id);

    if (!isAdmin && !isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Non-admin/non-owner can only change status of own assigned tasks
    let data;
    if (!isAdmin && !isOwner) {
      if (!isAssignee) {
        return res.status(403).json({
          message: 'Only assignee, owner, or admin can update this task'
        });
      }
      data = req.body.status !== undefined ? { status: req.body.status } : {};
    } else {
      data = req.body;
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: {
        assignee: { select: memberSelect },
        creator: { select: memberSelect },
        project: { select: { id: true, name: true } }
      }
    });

    res.json({ message: 'Task updated', task: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.remove = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { ownerId: true } } }
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'ADMIN' && task.project.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Only Admin or project owner can delete tasks' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/dashboard/stats
exports.stats = async (req, res, next) => {
  try {
    const ids = await accessibleProjectIds(req.user);

    const allTasks = await prisma.task.findMany({
      where: { projectId: { in: ids } },
      include: {
        assignee: { select: memberSelect },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const isOverdue = (t) =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE';

    const myTasks = allTasks.filter((t) => t.assigneeId === req.user.id);

    res.json({
      stats: {
        totalProjects: ids.length,
        totalTasks: allTasks.length,
        todo: allTasks.filter((t) => t.status === 'TODO').length,
        inProgress: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
        done: allTasks.filter((t) => t.status === 'DONE').length,
        overdue: allTasks.filter(isOverdue).length,
        myTasksCount: myTasks.length,
        myOverdueCount: myTasks.filter(isOverdue).length,
        myTasks: myTasks.slice(0, 10),
        recentTasks: allTasks.slice(0, 8),
        overdueTasks: allTasks.filter(isOverdue).slice(0, 8)
      }
    });
  } catch (err) {
    next(err);
  }
};
