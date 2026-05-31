import { Request, Response } from 'express';
import { getCollection, saveToCollection, deleteFromCollection } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getCollection('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const newUser = {
      ...req.body,
      id: `u_${Date.now()}`,
      creditScore: 100,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await saveToCollection('users', newUser);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const users = await getCollection('users');
    const user = users.find((u: any) => u.id === req.params.id);
    
    if (user) {
      const updatedUser = { ...user, ...req.body, updatedAt: new Date().toISOString() };
      await saveToCollection('users', updatedUser);
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const success = await deleteFromCollection('users', req.params.id as string);
    if (success) {
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
