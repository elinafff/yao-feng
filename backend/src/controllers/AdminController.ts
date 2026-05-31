import { Request, Response } from 'express';
import { getCollection, saveToCollection } from '../db';
import generateToken from '../utils/generateToken';

export const loginAdmin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const admins = await getCollection('admins');
    const admin = admins.find((a: any) => a.username === username && a.password === password);

    if (admin) {
      res.json({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        token: generateToken(admin.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const registerAdmin = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  try {
    const admins = await getCollection('admins');
    const adminExists = admins.find((a: any) => a.username === username);

    if (adminExists) {
      res.status(400).json({ message: 'Admin already exists' });
      return;
    }

    const newAdmin = {
      id: `admin_${Date.now()}`,
      username,
      password,
      role: role || 'editor',
      createdAt: new Date().toISOString()
    };
    
    await saveToCollection('admins', newAdmin);

    res.status(201).json({
      id: newAdmin.id,
      username: newAdmin.username,
      role: newAdmin.role,
      token: generateToken(newAdmin.id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    res.json(await getCollection('logs'));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

export const createLog = async (req: Request, res: Response) => {
  try {
    const log = {
      ...req.body,
      id: req.body.id || `audit_${Date.now()}`,
      timestamp: req.body.timestamp || new Date().toLocaleString('zh-CN', { hour12: false }),
      ip: req.body.ip || '192.168.1.100'
    };
    await saveToCollection('logs', log);
    res.status(201).json(log);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
