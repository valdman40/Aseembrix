import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { encryptData, decryptData } from '../utils/encryption';
import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

const router = express.Router();

interface Task {
  id: string;
  title: string;
  description: string;
}

// In-memory store for tasks (keyed by user ID)
const tasksStore: { [userId: string]: Task[] } = {};

// Apply authentication middleware
router.use(authMiddleware);

// 📌 **Get Tasks (Fixed TS Error)**
const getTasks: RequestHandler = (req: AuthenticatedRequest, res: Response): void => {
    console.log('Getting tasks');
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const userTasks = tasksStore[userId] || [];
    res.json({
      tasks: userTasks.map((task) => ({
        ...task,
        description: decryptData(task.description),
      })),
    });
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

router.get('/', getTasks);

// 📌 **Create a New Task (Fixed TS Error)**
const createTask: RequestHandler = (req: AuthenticatedRequest, res: Response): void => {
    console.log('Creating task:', req.body);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      return;
    }

    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const encryptedDescription = encryptData(description);
    const newTask: Task = {
      id: uuidv4(),
      title,
      description: encryptedDescription,
    };

    if (!tasksStore[userId]) {
      tasksStore[userId] = [];
    }
    tasksStore[userId].push(newTask);

    res.status(201).json({
      message: 'Task created successfully.',
      task: { ...newTask, description },
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters.')
      .escape(),
    body('description')
      .trim()
      .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long.')
      .customSanitizer((value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })),
  ],
  createTask
);

// 📌 **Delete a Task (Fixed TS Error)**
const deleteTask: RequestHandler = (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;

    if (!userId || !tasksStore[userId]) {
      res.status(403).json({ message: 'Unauthorized or task not found' });
      return;
    }

    console.log('Deleting task:', taskId);

    tasksStore[userId] = tasksStore[userId].filter((task) => task.id !== taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

router.delete('/:id', deleteTask);

export default router;
