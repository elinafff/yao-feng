import { Request, Response } from 'express';
import { getCollection, saveToCollection } from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getApplications = async (req: Request, res: Response) => {
  try {
    const apps = await getCollection('applications');
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const pets = await getCollection('pets');
    const pet = pets.find((item: any) => item.id === req.body.petId);

    if (!pet) {
      res.status(404).json({ message: 'Pet not found' });
      return;
    }

    if (pet.status !== '开放申请') {
      res.status(400).json({ message: '该宠物当前不在待领养状态，不能提交新的领养申请。' });
      return;
    }

    const newApplication = {
      ...req.body,
      id: req.body.id || `a_${Date.now()}`,
      status: req.body.status || '已提交',
      createdAt: req.body.createdAt || new Date().toISOString().split('T')[0]
    };

    await saveToCollection('applications', newApplication);

    await saveToCollection('pets', { ...pet, status: '申请处理中', updatedAt: new Date().toISOString() });

    await saveToCollection('logs', {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      operator: newApplication.applicantNickname || '手机端用户',
      action: '提交领养申请',
      module: '领养申请审批',
      targetId: newApplication.id,
      details: `手机前端提交了对【${newApplication.petName}】的领养申请，监管台已进入流程跟踪。`,
      ip: '127.0.0.1'
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const apps = await getCollection('applications');
    const app = apps.find((a: any) => a.id === req.params.id);
    
    if (app) {
      const pets = await getCollection('pets');
      const pet = pets.find((item: any) => item.id === app.petId);
      const admins = await getCollection('admins');
      const isAdminPublishedPet = Boolean(pet && admins.some((admin: any) => admin.id === pet.ownerId));
      const publisherConfirmed =
        app.status === '待确认领养' ||
        app.status === '已预约见面' ||
        (pet?.status === '已预约见面' && pet.adopterId === app.applicantId);

      if (req.body.status === '已通过' && !isAdminPublishedPet && !publisherConfirmed) {
        res.status(400).json({ message: '用户发布的送养信息需要送养人确认候选人后，后台才能最终核准领养。' });
        return;
      }

      const updatedApp = {
        ...app,
        ...req.body,
        status: req.body.status || app.status,
        updatedAt: new Date().toISOString()
      };
      await saveToCollection('applications', updatedApp);

      if (pet) {
        if (req.body.status === '已通过') {
          await saveToCollection('pets', {
            ...pet,
            status: '已被领养',
            adopterId: updatedApp.applicantId,
            updatedAt: new Date().toISOString()
          });
        }

        if (req.body.status === '已预约见面') {
          await saveToCollection('pets', {
            ...pet,
            status: '已预约见面',
            adopterId: updatedApp.applicantId,
            updatedAt: new Date().toISOString()
          });
        }

        if (req.body.status === '待确认领养') {
          await saveToCollection('pets', {
            ...pet,
            status: '申请处理中',
            adopterId: updatedApp.applicantId,
            updatedAt: new Date().toISOString()
          });
        }

        if (req.body.status === '未通过' && ['申请处理中', '已预约见面'].includes(pet.status)) {
          await saveToCollection('pets', {
            ...pet,
            status: '开放申请',
            adopterId: undefined,
            updatedAt: new Date().toISOString()
          });
        }
      }

      if (req.body.status === '已通过') {
        const plans = await getCollection('feedback_plans');
        const exists = plans.some((plan: any) => plan.petId === updatedApp.petId && plan.adopterId === updatedApp.applicantId);
        if (!exists) {
          await saveToCollection('feedback_plans', {
            id: `fb_${updatedApp.petId}_${updatedApp.applicantId}`,
            petId: updatedApp.petId,
            petName: updatedApp.petName,
            petPhoto: updatedApp.petPhoto,
            adopterId: updatedApp.applicantId,
            adopterNickname: updatedApp.applicantNickname,
            ownerId: pet?.ownerId || 'u_1',
            ownerNickname: pet?.ownerNickname || '大白铲屎官',
            nodes: [
              { nodeId: 'day7', title: '第 7 天：适应期状况评估', dueDate: '2026-06-01', status: '待提交' },
              { nodeId: 'day30', title: '第 30 天：家庭稳定生活随记', dueDate: '2026-06-24', status: '待提交' },
              { nodeId: 'day90', title: '第 90 天：长期适应反馈', dueDate: '2026-08-23', status: '待提交' },
              { nodeId: 'day180', title: '第 180 天：半年健康发育总结书', dueDate: '2026-11-21', status: '待提交' }
            ]
          });
        }
      }

      await saveToCollection('logs', {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
        operator: req.admin?.username || '监管台',
        action: req.body.status === '已通过' ? '核准领养申请' : '更新领养申请',
        module: '领养申请审批',
        targetId: updatedApp.id,
        details: `监管台将【${updatedApp.applicantNickname}】对【${updatedApp.petName}】的申请状态更新为【${req.body.status}】。`,
        ip: '192.168.1.100'
      });

      res.json(updatedApp);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
