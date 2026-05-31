import express from 'express';
import { getPets, createPet, updatePet, deletePet } from '../controllers/PetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getPets);
router.post('/', protect, createPet);
router.put('/:id', protect, updatePet);
router.delete('/:id', protect, deletePet);

export default router;
