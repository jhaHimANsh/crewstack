const prisma = require('../config/prisma');

const memberSelect = { id: true, name: true, email: true, role: true };

// Check if user can access this project (admin OR owner OR member)
const canAccess = (project, user) => {
  if (user.role === 'ADMIN') return true;
  if (project.ownerId === user.id) return true;
  return project.members.some((m) => m.userId === user.id);
};

// GET /api/projects
exports.list = async (req, res, next) => {
  try {
    const where =
      req.user.role === 'ADMIN'
        ? {}
        : {
            OR: [
              { ownerId: req.user.id },
              { members: { some: { userId: req.user.id } } }
            ]
          };

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: memberSelect },
        members: { include: { user: { select: memberSelect } } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      count: projects.length,
      projects: projects.map((p) => ({
        ...p,
        members: p.members.map((m) => m.user),
        taskCount: p._count.tasks
      }))
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects  (ADMIN only)
exports.create = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: (memberIds || []).map((userId) => ({ userId }))
        }
      },
      include: {
        owner: { select: memberSelect },
        members: { include: { user: { select: memberSelect } } }
      }
    });

    res.status(201).json({
      message: 'Project created',
      project: { ...project, members: project.members.map((m) => m.user) }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
exports.get = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: memberSelect },
        members: { include: { user: { select: memberSelect } } },
        tasks: {
          include: {
            assignee: { select: memberSelect },
            creator: { select: memberSelect }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!canAccess(project, req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      project: { ...project, members: project.members.map((m) => m.user) },
      tasks: project.tasks
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id  (ADMIN only)
exports.update = async (req, res, next) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        owner: { select: memberSelect },
        members: { include: { user: { select: memberSelect } } }
      }
    });
    res.json({
      message: 'Project updated',
      project: { ...project, members: project.members.map((m) => m.user) }
    });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Project not found' });
    next(err);
  }
};

// DELETE /api/projects/:id  (ADMIN only)
exports.remove = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project and its tasks deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Project not found' });
    next(err);
  }
};

// POST /api/projects/:id/members  (ADMIN only)
exports.addMember = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user) return res.status(404).json({ message: 'User with that email not found' });

    try {
      await prisma.projectMember.create({
        data: { projectId: req.params.id, userId: user.id }
      });
    } catch (e) {
      if (e.code === 'P2002') return res.status(400).json({ message: 'User is already a member' });
      throw e;
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: memberSelect },
        members: { include: { user: { select: memberSelect } } }
      }
    });

    res.json({
      message: 'Member added',
      project: { ...project, members: project.members.map((m) => m.user) }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId  (ADMIN only)
exports.removeMember = async (req, res, next) => {
  try {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId: req.params.id, userId: req.params.userId }
      }
    });
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: memberSelect },
        members: { include: { user: { select: memberSelect } } }
      }
    });
    res.json({
      message: 'Member removed',
      project: { ...project, members: project.members.map((m) => m.user) }
    });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Member not found' });
    next(err);
  }
};
