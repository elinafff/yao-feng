import { Request, Response } from 'express';
import { getCollection, saveToCollection, deleteFromCollection } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

// --- 生 (Rescue/Birth) ---
export const createRescueRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = {
      ...req.body,
      id: `rescue_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await saveToCollection('rescue_records', record);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getRescueRecords = async (req: Request, res: Response) => {
  try {
    const records = await getCollection('rescue_records');
    const petId = req.query.petId;
    if (petId) {
      res.json(records.filter((r: any) => r.petId === petId));
    } else {
      res.json(records);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rescue records' });
  }
};

// --- 病 (Medical) ---
export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = {
      ...req.body,
      id: `med_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await saveToCollection('medical_records', record);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const records = await getCollection('medical_records');
    const petId = req.query.petId;
    if (petId) {
      res.json(records.filter((r: any) => r.petId === petId));
    } else {
      res.json(records);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records' });
  }
};

// --- 死 (End of Life) ---
export const createEndOfLifeRecord = async (req: AuthRequest, res: Response) => {
  try {
    const record = {
      ...req.body,
      id: `eol_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    await saveToCollection('end_of_life_records', record);
    
    // Update pet status to '已离世'
    const pets = await getCollection('pets');
    const pet = pets.find((p: any) => p.id === req.body.petId);
    if (pet) {
      await saveToCollection('pets', { ...pet, status: '已离世', updatedAt: new Date().toISOString() });
    }

    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getEndOfLifeRecords = async (req: Request, res: Response) => {
  try {
    const records = await getCollection('end_of_life_records');
    const petId = req.query.petId;
    if (petId) {
      res.json(records.filter((r: any) => r.petId === petId));
    } else {
      res.json(records);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching end of life records' });
  }
};
