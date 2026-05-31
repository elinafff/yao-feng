import { Request, Response } from 'express';
import { getCollection, saveToCollection, deleteFromCollection } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getPets = async (req: Request, res: Response) => {
  try {
    const pets = await getCollection('pets');
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pets' });
  }
};

export const createPet = async (req: AuthRequest, res: Response) => {
  try {
    const newPet = {
      ...req.body,
      id: `p_${Date.now()}`,
      views: 0,
      favorites: 0,
      createdAt: new Date().toISOString()
    };
    await saveToCollection('pets', newPet);
    
    if (req.admin) {
      await saveToCollection('logs', {
        id: `log_${Date.now()}`,
        adminId: req.admin.id,
        action: 'CREATE',
        targetModel: 'Pet',
        targetId: newPet.id,
        details: `Created pet: ${newPet.name}`,
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json(newPet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePet = async (req: AuthRequest, res: Response) => {
  try {
    const pets = await getCollection('pets');
    const pet = pets.find((p: any) => p.id === req.params.id);
    
    if (pet) {
      const updatedPet = { ...pet, ...req.body, updatedAt: new Date().toISOString() };
      if (['开放申请', '审核中', '暂停申请', '已下架'].includes(updatedPet.status)) {
        delete updatedPet.adopterId;
      }
      await saveToCollection('pets', updatedPet);

      if (req.admin) {
        await saveToCollection('logs', {
          id: `log_${Date.now()}`,
          adminId: req.admin.id,
          action: 'UPDATE',
          targetModel: 'Pet',
          targetId: updatedPet.id,
          details: `Updated pet: ${updatedPet.name}`,
          createdAt: new Date().toISOString()
        });
      }

      res.json(updatedPet);
    } else {
      res.status(404).json({ message: 'Pet not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePet = async (req: AuthRequest, res: Response) => {
  try {
    const pets = await getCollection('pets');
    const pet = pets.find((p: any) => p.id === req.params.id);
    
    if (pet) {
      await deleteFromCollection('pets', req.params.id as string);

      if (req.admin) {
        await saveToCollection('logs', {
          id: `log_${Date.now()}`,
          adminId: req.admin.id,
          action: 'DELETE',
          targetModel: 'Pet',
          targetId: req.params.id,
          details: `Deleted pet: ${pet.name}`,
          createdAt: new Date().toISOString()
        });
      }

      res.json({ message: 'Pet removed' });
    } else {
      res.status(404).json({ message: 'Pet not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
