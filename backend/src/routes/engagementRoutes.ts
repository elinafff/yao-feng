import express from 'express';
import {
  addChatMessage,
  createAppointment,
  createReport,
  ensureChat,
  getAppointments,
  getChats,
  getNotifications,
  markNotificationsRead,
  saveNotification,
  updateAppointment
} from '../controllers/EngagementController';

const router = express.Router();

router.get('/chats', getChats);
router.post('/chats/ensure', ensureChat);
router.post('/chats/:id/messages', addChatMessage);

router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);

router.get('/notifications', getNotifications);
router.post('/notifications', saveNotification);
router.put('/notifications/read-all', markNotificationsRead);

router.post('/reports', createReport);

export default router;
