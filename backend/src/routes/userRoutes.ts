import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/UserController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;
