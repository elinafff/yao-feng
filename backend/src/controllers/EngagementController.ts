import { Request, Response } from 'express';
import { getCollection, saveToCollection } from '../db';

const nowText = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

export const getChats = async (req: Request, res: Response) => {
  try {
    res.json(await getCollection('chats'));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const ensureChat = async (req: Request, res: Response) => {
  try {
    const chats = await getCollection('chats');
    const existing = chats.find((chat: any) => chat.petId === req.body.petId && chat.adopterId === req.body.adopterId);
    if (existing) {
      res.json(existing);
      return;
    }

    const chat = {
      ...req.body,
      id: req.body.id || `c_${Date.now()}`,
      messages: req.body.messages || [],
      lastMessageText: req.body.lastMessageText || '会话已建立',
      lastMessageTime: req.body.lastMessageTime || nowText(),
      unreadCount: req.body.unreadCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveToCollection('chats', chat);
    res.status(201).json(chat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addChatMessage = async (req: Request, res: Response) => {
  try {
    const chats = await getCollection('chats');
    const chat = chats.find((item: any) => item.id === req.params.id);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    const message = {
      ...req.body,
      id: req.body.id || `m_${Date.now()}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      type: req.body.type || 'text'
    };
    const updatedChat = {
      ...chat,
      messages: [...(chat.messages || []), message],
      lastMessageText: message.text?.length > 20 ? `${message.text.slice(0, 20)}...` : message.text,
      lastMessageTime: nowText(),
      updatedAt: new Date().toISOString()
    };

    await saveToCollection('chats', updatedChat);
    res.json(updatedChat);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    res.json(await getCollection('appointments'));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = {
      ...req.body,
      id: req.body.id || `appt_${Date.now()}`,
      status: req.body.status || '待对方确认',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveToCollection('appointments', appointment);
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const appointments = await getCollection('appointments');
    const appointment = appointments.find((item: any) => item.id === req.params.id);
    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    const updatedAppointment = { ...appointment, ...req.body, updatedAt: new Date().toISOString() };
    await saveToCollection('appointments', updatedAppointment);
    res.json(updatedAppointment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    res.json(await getCollection('notifications'));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveNotification = async (req: Request, res: Response) => {
  try {
    const notification = {
      ...req.body,
      id: req.body.id || `notif_${Date.now()}`,
      time: req.body.time || '刚才',
      read: Boolean(req.body.read)
    };
    await saveToCollection('notifications', notification);
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const markNotificationsRead = async (req: Request, res: Response) => {
  try {
    const notifications = await getCollection('notifications');
    const updated = await Promise.all(notifications.map((notification: any) => saveToCollection('notifications', { ...notification, read: true })));
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const report = {
      ...req.body,
      id: req.body.id || `report_${Date.now()}`,
      status: '待处理',
      createdAt: new Date().toISOString()
    };
    await saveToCollection('reports', report);
    await saveToCollection('logs', {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      operator: report.reporterNickname || '手机端用户',
      action: '提交违规举报',
      module: '公益举报投诉',
      targetId: report.id,
      details: `用户提交举报：${report.reason}`,
      ip: '127.0.0.1'
    });
    res.status(201).json(report);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
