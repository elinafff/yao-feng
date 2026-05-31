import { Request, Response } from 'express';
import { getCollection, saveToCollection } from '../db';

const buildPlan = (data: any) => ({
  id: data.id || `fb_${data.petId}_${data.adopterId}`,
  petId: data.petId,
  petName: data.petName,
  petPhoto: data.petPhoto,
  adopterId: data.adopterId,
  adopterNickname: data.adopterNickname,
  ownerId: data.ownerId || 'u_1',
  ownerNickname: data.ownerNickname || '大白铲屎官',
  nodes: data.nodes || [
    { nodeId: 'day7', title: '第 7 天：适应期状况评估', dueDate: '2026-06-01', status: '待提交' },
    { nodeId: 'day30', title: '第 30 天：家庭稳定生活随记', dueDate: '2026-06-24', status: '待提交' },
    { nodeId: 'day90', title: '第 90 天：长期适应反馈', dueDate: '2026-08-23', status: '待提交' },
    { nodeId: 'day180', title: '第 180 天：半年健康发育总结书', dueDate: '2026-11-21', status: '待提交' }
  ]
});

export const getFeedbackPlans = async (req: Request, res: Response) => {
  try {
    res.json(await getCollection('feedback_plans'));
  } catch {
    res.status(500).json({ message: 'Error fetching feedback plans' });
  }
};

export const ensureFeedbackPlan = async (req: Request, res: Response) => {
  try {
    const plans = await getCollection('feedback_plans');
    const existing = plans.find((plan: any) => plan.petId === req.body.petId && plan.adopterId === req.body.adopterId);
    if (existing) {
      res.json(existing);
      return;
    }

    const plan = buildPlan(req.body);
    await saveToCollection('feedback_plans', plan);
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const submitFeedbackNode = async (req: Request, res: Response) => {
  try {
    const plans = await getCollection('feedback_plans');
    const plan = plans.find((item: any) => item.id === req.params.planId);
    if (!plan) {
      res.status(404).json({ message: 'Feedback plan not found' });
      return;
    }

    const updatedPlan = {
      ...plan,
      nodes: plan.nodes.map((node: any) => node.nodeId === req.params.nodeId
        ? { ...node, status: '已提交', submittedAt: req.body.submittedAt, submission: req.body }
        : node
      )
    };
    await saveToCollection('feedback_plans', updatedPlan);
    await saveToCollection('logs', {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      operator: plan.adopterNickname || '领养人',
      action: '提交领养回访',
      module: '领养回访打卡',
      targetId: plan.id,
      details: `领养人提交了【${plan.petName}】的【${req.params.nodeId}】阶段回访反馈。`,
      ip: '127.0.0.1'
    });
    res.json(updatedPlan);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
