import express from 'express';
import { ensureFeedbackPlan, getFeedbackPlans, submitFeedbackNode } from '../controllers/FeedbackController';

const router = express.Router();

router.get('/plans', getFeedbackPlans);
router.post('/plans/ensure', ensureFeedbackPlan);
router.put('/plans/:planId/nodes/:nodeId', submitFeedbackNode);

export default router;
