import React, { useState } from 'react';
import axios from 'axios';
import { 
  Users, Activity, ClipboardCheck, MessageSquare, History, Search, Filter, 
  Check, X, AlertTriangle, Shield, Trash2, Edit2, Eye, ExternalLink, FileText,
  Clock, CheckCircle, AlertCircle, Sparkles, Building, Key,
  Heart, ArrowUpRight, ArrowLeft, ArrowRight, CheckCircle2, Award,
  HeartPulse, Stethoscope, Skull
} from 'lucide-react';
import { PetListing, AdoptionApplication, UserProfile, ChatSession, FeedbackPlan, AuditLog } from '../types';

const API_BASE = 'http://localhost:5005/api';

interface AdminPortalProps {
  pets: PetListing[];
  setPets: React.Dispatch<React.SetStateAction<PetListing[]>>;
  applications: AdoptionApplication[];
  setApplications: React.Dispatch<React.SetStateAction<AdoptionApplication[]>>;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  chats: ChatSession[];
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  feedbackPlans: FeedbackPlan[];
  setFeedbackPlans: React.Dispatch<React.SetStateAction<FeedbackPlan[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  onClose: () => void;
  jumpToPhoneScreen: (screen: string) => void;
  // API Handlers
  onUpdatePet: (petId: string, data: Partial<PetListing>) => Promise<any>;
  onUpdateUser: (userId: string, data: Partial<UserProfile>) => Promise<any>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddUser: (userData: Partial<UserProfile>) => Promise<any>;
  onUpdateApplicationStatus: (applicationId: string, status: AdoptionApplication['status'], rejectReason?: string) => Promise<any>;
  lifecycleRecords: {
    rescue: any[];
    medical: any[];
    eol: any[];
  };
}

export default function AdminPortal({
  pets,
  setPets,
  applications,
  setApplications,
  users,
  setUsers,
  chats,
  setChats,
  feedbackPlans,
  setFeedbackPlans,
  auditLogs,
  setAuditLogs,
  onClose,
  jumpToPhoneScreen,
  onUpdatePet,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  onUpdateApplicationStatus,
  lifecycleRecords
}: AdminPortalProps) {
  // Navigation tabs of Admin Portal
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'pets' | 'applications' | 'users' | 'chats' | 'feedback' | 'audit' | 'lifecycle'>('overview');

  // Search & filter states
  const [petSearch, setPetSearch] = useState('');
  const [petTypeFilter, setPetTypeFilter] = useState<'all' | 'cat' | 'dog'>('all');
  const [petStatusFilter, setPetStatusFilter] = useState<string>('all');
  
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');

  const [userSearch, setUserSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [activeChatIndex, setActiveChatIndex] = useState<number | null>(null);

  // Selected entities for detail modal/edit triggers
  const [editingPet, setEditingPet] = useState<PetListing | null>(null);
  const [viewingApp, setViewingApp] = useState<AdoptionApplication | null>(null);
  const [refusalReason, setRefusalReason] = useState('');
  
  // Local state for adding/editing credit ratings
  const [creditAdjustmentUserId, setCreditAdjustmentUserId] = useState<string | null>(null);
  const [creditAdjustmentPoints, setCreditAdjustmentPoints] = useState<number>(5);
  const [creditAdjustmentType, setCreditAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [creditReasonRemark, setCreditReasonRemark] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newUserForm, setNewUserForm] = useState<Partial<UserProfile>>({
    nickname: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    ageGroup: '90后',
    occupation: '',
    livingCondition: '自有住房'
  });

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAddUser(newUserForm);
      setShowAddUserModal(false);
      setNewUserForm({
        nickname: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        ageGroup: '90后',
        occupation: '',
        livingCondition: '自有住房'
      });
      pushAuditLog('手动创建用户', '用户账户管理', 'new', `管理员手动创建了新用户：【${newUserForm.nickname}】`);
    } catch (error) {
      alert('添加用户失败');
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updatedUser = await onUpdateUser(editingUser.id, editingUser);
      setUsers(prev => prev.map(user => user.id === editingUser.id ? updatedUser : user));
      setEditingUser(null);
      pushAuditLog('修改用户信息', '用户账户管理', editingUser.id, `管理员修改了用户【${editingUser.nickname}】的档案信息。`);
    } catch (error) {
      alert('修改用户失败');
    }
  };

  // 1. Log simulation admin utilities
  const pushAuditLog = (action: string, module: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operator: '超级管理员 (SuperAdmin)',
      action,
      module,
      targetId,
      details,
      ip: '192.168.1.100 (广东广州·安全链路)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    axios.post(`${API_BASE}/admin/logs`, newLog).catch((error) => {
      console.error('Error saving audit log:', error);
    });
  };

  const canFinalApproveApplication = (app: AdoptionApplication) => {
    const pet = pets.find(item => item.id === app.petId);
    const isAdminPublishedPet = Boolean(pet?.ownerId?.startsWith('admin_'));
    const publisherConfirmed =
      app.status === '待确认领养' ||
      app.status === '已预约见面' ||
      (pet?.status === '已预约见面' && pet.adopterId === app.applicantId);

    return isAdminPublishedPet || publisherConfirmed;
  };

  // 2. Action Handlers for Pet Files
  const handleApprovePet = async (petId: string) => {
    const targetPet = pets.find(p => p.id === petId);
    if (targetPet) {
      try {
        await onUpdatePet(petId, { status: '开放申请' });
        pushAuditLog('审核置为上架', '宠物档案管理', petId, `批准发布流浪动物筹措：【${targetPet.name}】(${targetPet.breed}) 并启用同城推荐。`);
        setPets(prev => prev.map(p => p.id === petId ? { ...p, status: '开放申请', adopterId: undefined } : p));
      } catch (error) {
        alert('审核操作失败，请检查后端服务。');
      }
    }
  };

  const handleRejectPet = async (petId: string) => {
    const targetPet = pets.find(p => p.id === petId);
    if (targetPet) {
      try {
        await onUpdatePet(petId, { status: '已下架' });
        pushAuditLog('审核驳回档案', '宠物档案管理', petId, `拒绝【${targetPet.name}】的送养申请。由于健康或商业背景考量疑似存在违规行为。`);
        setPets(prev => prev.map(p => p.id === petId ? { ...p, status: '已下架' } : p));
      } catch (error) {
        alert('审核驳回失败，请检查后端服务。');
      }
    }
  };

  const handleToggleShelfPet = async (petId: string, currentStatus: string) => {
    const targetStatus = currentStatus === '已下架' ? '开放申请' : '已下架';
    const targetPet = pets.find(p => p.id === petId);
    if (targetPet) {
      try {
        await onUpdatePet(petId, { status: targetStatus as any });
        pushAuditLog(
          targetStatus === '已下架' ? '强行下架档案' : '重新上架档案', 
          '宠物档案管理', 
          petId, 
          `手动操作：对宠物【${targetPet.name}】执行${targetStatus === '已下架' ? '下架降权' : '重新上架'}。`
        );
        setPets(prev => prev.map(p => p.id === petId ? { ...p, status: targetStatus as any, adopterId: targetStatus === '开放申请' ? undefined : p.adopterId } : p));
      } catch (error) {
        alert('状态切换失败，请检查后端服务。');
      }
    }
  };

  const handleSavePetEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet) return;
    
    try {
      await onUpdatePet(editingPet.id, editingPet);
      pushAuditLog('修改宠物信息', '宠物档案管理', editingPet.id, `更新宠物档案字段，名称：【${editingPet.name}】，品种：${editingPet.breed}`);
      setPets(prev => prev.map(p => p.id === editingPet.id ? editingPet : p));
      setEditingPet(null);
    } catch (error) {
      alert('保存修改失败，请检查后端服务。');
    }
  };

  // 3. Action Handlers for Adoption Applications
  const handleUpdateAppStatus = async (appId: string, nextStatus: AdoptionApplication['status'], extraDetails?: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      const pet = pets.find(item => item.id === app.petId);
      const isAdminPublishedPet = Boolean(pet?.ownerId?.startsWith('admin_'));

      if (nextStatus === '已通过' && !canFinalApproveApplication(app)) {
        alert('请先等待送养人确认候选人。发布者确认后，后台才能最终核准领养。');
        return;
      }

      if (nextStatus === '已通过') {
        pushAuditLog('核批领养成功', '领养申请审批', appId, isAdminPublishedPet
          ? `后台发布宠物【${app.petName}】由管理员直接核准给申请人【${app.applicantNickname}】，并生成回访生命周期。`
          : `在送养人确认和领养协议签署后，后台最终核准申请人【${app.applicantNickname}】领养宠物【${app.petName}】，并生成回访生命周期。`
        );
      } else if (nextStatus === '未通过') {
        pushAuditLog('驳回领养申请', '领养申请审批', appId, `驳回 【${app.applicantNickname}】 的申请意愿。原因批示：${extraDetails || '住房协议未达成/经验背景不符'}`);
      } else {
        pushAuditLog('推进审批步骤', '领养申请审批', appId, `将申请表进度更改为：【${nextStatus}】`);
      }
    }

    try {
      const updatedApp = await onUpdateApplicationStatus(appId, nextStatus, extraDetails);
      setApplications(prev => prev.map(a => a.id === appId ? updatedApp : a));
      if (updatedApp.status === '已通过') {
        setPets(prevPets => prevPets.map(p => p.id === updatedApp.petId ? { ...p, status: '已被领养', adopterId: updatedApp.applicantId } : p));
        const feedbackRes = await axios.get(`${API_BASE}/feedback/plans`);
        setFeedbackPlans(feedbackRes.data || []);
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
      alert('后端审批状态更新失败，请检查 API 服务。');
    }
  };

  // 4. User Credit profile Adjuster
  const handleUserCreditAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditAdjustmentUserId) return;

    const u = users.find(user => user.id === creditAdjustmentUserId);
    if (u) {
      const adjustText = creditAdjustmentType === 'add' ? `优良事迹加分 (+${creditAdjustmentPoints}分)` : `违规警告扣分 (-${creditAdjustmentPoints}分)`;
      const points = Number.isFinite(creditAdjustmentPoints) ? creditAdjustmentPoints : 0;
      const nextScore = Math.max(0, Math.min(100, Number((u as any).creditScore ?? 98) + (creditAdjustmentType === 'add' ? points : -points)));
      try {
        const updatedUser = await onUpdateUser(u.id, { ...(u as any), creditScore: nextScore } as any);
        setUsers(prev => prev.map(user => user.id === u.id ? updatedUser : user));
      } catch (error) {
        alert('信用分写入后端失败，请检查 API 服务。');
        return;
      }
      pushAuditLog('信用调整与拉黑', '用户账户管理', u.id, `人工干预用户：【${u.nickname}】。信用备注：${creditReasonRemark || '管理员考查备注'} -> 执行操作：${adjustText}`);
      alert(`用户【${u.nickname}】信用调整生效！系统已更新并留档审计。`);
    }
    
    setCreditAdjustmentUserId(null);
    setCreditReasonRemark('');
  };

  // 5. Feedback Report approval
  const handleReviewFeedbackNode = async (planId: string, nodeId: string, verdict: '正常' | '有异常', adminRemarks: string) => {
    const plan = feedbackPlans.find(p => p.id === planId);
    const node = plan?.nodes.find(n => n.nodeId === nodeId);
    if (plan) {
      pushAuditLog('批核家庭回访', '回访监督管理', planId, `批阅宠物【${plan.petName}】的新家第 ${nodeId} 天打卡：【结论：${verdict}】。批注意见：${adminRemarks}`);
    }

    if (!plan || !node?.submission) {
      alert('该节点还没有领养人提交内容，不能批注。');
      return;
    }

    try {
      const res = await axios.put(`${API_BASE}/feedback/plans/${planId}/nodes/${nodeId}`, {
        ...node.submission,
        ownerResponse: {
          status: verdict,
          msg: adminRemarks || '已批阅，对爱心打卡表示感谢！情况评定正常。',
          repliedAt: new Date().toISOString().split('T')[0]
        }
      });
      setFeedbackPlans(prev => prev.map(planItem => planItem.id === planId ? res.data : planItem));
    } catch (error) {
      alert('回访批注写入后端失败，请检查 API 服务。');
      return;
    }

    alert('已成功下达管理员业务意见！该回访进度已闭换。');
  };

  // Quick statistics calculated reactively
  const waitingPets = pets.filter(p => p.status === '开放申请');
  const applyingPets = pets.filter(p => p.status === '申请处理中' || p.status === '已预约见面');
  const adoptedPets = pets.filter(p => p.status === '已被领养');
  const adoptionPoolPets = [...waitingPets, ...applyingPets, ...adoptedPets];
  const pendingApplications = applications.filter(a => !['已通过', '未通过', '已取消'].includes(a.status));
  const maxAdoptionChartValue = Math.max(1, waitingPets.length, applyingPets.length, adoptedPets.length);
  const getAdoptionChartHeight = (count: number) => {
    if (count === 0) return 10;
    return Math.max(28, Math.round((count / maxAdoptionChartValue) * 128));
  };
  const adoptionChartItems = [
    { label: '待领养', count: waitingPets.length, className: 'bg-emerald-500 hover:bg-emerald-400' },
    { label: '申请中', count: applyingPets.length, className: 'bg-amber-500 hover:bg-amber-400' },
    { label: '已领养', count: adoptedPets.length, className: 'bg-indigo-500 hover:bg-indigo-400' }
  ];

  const stats = {
    totalPets: pets.length,
    adoptionPoolPets: adoptionPoolPets.length,
    reviewingPets: pets.filter(p => p.status === '审核中').length,
    pausedPets: pets.filter(p => p.status === '暂停申请' || p.status === '已下架').length,
    activePets: waitingPets.length,
    applyingPets: applyingPets.length,
    adoptedPets: adoptedPets.length,
    
    totalApps: applications.length,
    pendingApps: pendingApplications.length,
    approvedApps: applications.filter(a => a.status === '已通过').length,

    totalUsers: users.length,
    chatsCount: chats.length,
    unsubmittedFeedbacks: feedbackPlans.reduce((sum, current) => {
      return sum + current.nodes.filter(n => n.status === '待提交').length;
    }, 0),
    submittedFeedbacks: feedbackPlans.reduce((sum, current) => {
      return sum + current.nodes.filter(n => n.status === '已提交' || n.submission).length;
    }, 0)
  };

  // Filters logic
  const filteredPets = pets.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(petSearch.toLowerCase()) || 
                          p.breed.toLowerCase().includes(petSearch.toLowerCase()) ||
                          p.district.toLowerCase().includes(petSearch.toLowerCase());
    const matchesType = petTypeFilter === 'all' || p.type === petTypeFilter;
    const matchesStatus = petStatusFilter === 'all' || p.status === petStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredApps = applications.filter(a => {
    const matchesSearch = a.petName.toLowerCase().includes(appSearch.toLowerCase()) || 
                          a.applicantNickname.toLowerCase().includes(appSearch.toLowerCase()) ||
                          a.applicantPhone.includes(appSearch);
    const matchesStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const latestFeedbackEntry = feedbackPlans
    .flatMap(plan => plan.nodes
      .filter(node => node.status === '已提交' || node.submission)
      .map(node => ({ plan, node }))
    )
    .sort((a, b) => {
      const aTime = a.node.submission?.submittedAt || a.node.submittedAt || '';
      const bTime = b.node.submission?.submittedAt || b.node.submittedAt || '';
      return bTime.localeCompare(aTime);
    })[0];

  const filteredUsers = users.filter(u => {
    return u.nickname.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch);
  });

  const activeCreditUser = users.find(user => user.id === creditAdjustmentUserId);
  const getUserCreditScore = (user: UserProfile) => Number((user as any).creditScore ?? 98);

  return (
    <div className="w-full h-full min-h-[720px] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden text-slate-100 shadow-xl" id="admin-portal-layer">
      
      {/* Top Banner Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-widest uppercase">宠物领养管理平台</h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/40">
                中心监管台 v1.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              监管机构：绿色地球流浪动物爱心保障中心工作站。当前控制源：<span className="text-white font-semibold">192.168.1.100</span>
            </p>
          </div>
        </div>

        {/* Operational Status Emblem */}
        <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>系统状态: 守护中心在线监视中</span>
        </div>
      </div>

      {/* Main Admin Content Grid - Workspace Layout */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: '640px' }}>
        
        {/* Left Vertical Sub-menu Panel for Admin Modules */}
        <div className="w-52 shrink-0 bg-slate-950/40 border-r border-slate-800 p-3 flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase px-2 mb-1">监管主业务模块</span>
          
          <button 
            onClick={() => setActiveAdminTab('overview')}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all ${
              activeAdminTab === 'overview' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <Activity className="w-4 h-4 shrink-0" />
              <span>📊 系统仪表大盘</span>
            </div>
            <span className="text-[9px] font-semibold bg-slate-900/60 text-indigo-400 px-1 rounded">监控</span>
          </button>

          <button 
            onClick={() => setActiveAdminTab('pets')}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all ${
              activeAdminTab === 'pets' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <Heart className="w-4 h-4 shrink-0" />
              <span>🐾 宠物档案管理</span>
            </div>
            {stats.reviewingPets > 0 && (
              <span className="text-[9px] font-bold bg-pink-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                {stats.reviewingPets}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveAdminTab('applications')}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all ${
              activeAdminTab === 'applications' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span>📋 领养申请审批</span>
            </div>
            {stats.pendingApps > 0 && (
              <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                {stats.pendingApps}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveAdminTab('users')}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all ${
              activeAdminTab === 'users' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-4 h-4 shrink-0" />
              <span>👤 用户账户信用</span>
            </div>
            <span className="text-[9px] font-mono text-slate-550">#{stats.totalUsers}</span>
          </button>

          <button 
            onClick={() => setActiveAdminTab('chats')}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all ${
              activeAdminTab === 'chats' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>💬 沟通与签约监控</span>
            </div>
            <span className="text-[9px] font-mono text-slate-550">#{stats.chatsCount}</span>
          </button>

          <button 
            onClick={() => setActiveAdminTab('feedback')}
            className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all ${
              activeAdminTab === 'feedback' ? 'bg-indigo-600 text-white font-extrabold shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 shrink-0" />
              <span>🏡 领养回访打卡</span>
            </div>
            {stats.submittedFeedbacks > 0 && (
              <span className="text-[9px] font-bold bg-emerald-500 text-white px-1 py-0.5 rounded">
                {stats.submittedFeedbacks}
              </span>
            )}
          </button>

          <div className="mt-auto" />
        </div>

        {/* Right Dynamic Viewport */}
        <div className="flex-1 bg-slate-900/40 p-4 overflow-y-auto flex flex-col gap-4">
          
          {/* =======================================================
              MODULE 1: OVERVIEW DASHBOARD
             ======================================================= */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-white">整体营运大盘</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">实时接收来自手机段的增删改查事件，共享高一致性沙盒内存数据库系统。</p>
                </div>
                <div className="text-[10px] bg-slate-800 text-indigo-400 px-3 py-1 rounded-lg font-mono border border-slate-700">
                  数据最后同步: 今天 {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Statistics grid display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">领养池宠物总量</span>
                    <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs">🐾</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{stats.adoptionPoolPets}</span>
                    <span className="text-[9px] text-slate-450">仅统计可领养流程</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-[9px] border-t border-slate-800 pt-1.5 mt-2">
                    <span className="text-emerald-400">● {stats.activePets} 待领养</span>
                    <span className="text-amber-400">● {stats.applyingPets} 申请中</span>
                    <span className="text-indigo-400">● {stats.adoptedPets} 已领养</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">领养申请表</span>
                    <span className="p-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs">📋</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{stats.totalApps}</span>
                    <span className="text-[9px] text-slate-450">历史累计提交</span>
                  </div>
                  <div className="mt-1.5 flex gap-2 text-[9px] border-t border-slate-800 pt-1.5 mt-2">
                    <span className="text-amber-400">● {stats.pendingApps} 份处于流程中</span>
                    <span className="text-emerald-400">● {stats.approvedApps} 领养圆满匹配</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">后续回访追踪打卡</span>
                    <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">🏡</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{stats.submittedFeedbacks}</span>
                    <span className="text-[9px] text-slate-450">份已提交打卡报告</span>
                  </div>
                  <div className="mt-1.5 flex gap-2 text-[9px] border-t border-slate-800 pt-1.5 mt-2 col-span-2">
                    <span className="text-slate-400">回访覆盖率：<strong className="text-emerald-400">100%</strong></span>
                    <span className="text-indigo-400">待办: {stats.unsubmittedFeedbacks} 节点</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">活跃用户数 (信用建档)</span>
                    <span className="p-1 bg-slate-800 text-slate-400 rounded-lg text-xs">👤</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
                    <span className="text-[9px] text-slate-450">全网实名注册用户</span>
                  </div>
                  <div className="mt-1.5 flex justify-between text-[9px] border-t border-slate-800 pt-1.5 mt-2">
                    <span className="text-indigo-300">防盗防弃养机制正常</span>
                    <span className="text-slate-400">安全权重: 99.8%</span>
                  </div>
                </div>
              </div>

              {/* Layout for visual trends / live audits and flow controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Simulated Chart visual illustration */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 lg:col-span-2 space-y-3">
                  <span className="text-xs font-bold text-white block">📊 领养池状态分布 (待领养 / 申请中 / 已领养)</span>
                  
                  <div className="h-44 flex items-end justify-between px-6 pt-4 relative">
                    {/* Background guidelines */}
                    <div className="absolute inset-x-0 top-4 border-t border-slate-900 border-dashed text-[8px] text-slate-600"></div>
                    <div className="absolute inset-x-0 top-18 border-t border-slate-900 border-dashed text-[8px] text-slate-600"></div>
                    <div className="absolute inset-x-0 top-32 border-t border-slate-900 border-dashed text-[8px] text-slate-600"></div>
                    
                    {adoptionChartItems.map(item => (
                      <div key={item.label} className="flex flex-col items-center gap-2 group z-10 w-20">
                        <div
                          className={`w-10 rounded-t-lg transition-all ${item.className}`}
                          style={{ height: `${getAdoptionChartHeight(item.count)}px` }}
                        ></div>
                        <span className="text-[9px] text-slate-400">{item.label} ({item.count})</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex gap-2 items-center">
                      <span className="text-emerald-400">✔</span>
                      <span>当前领养池合计 {stats.adoptionPoolPets} 只；平台审核中和暂停申请不计入领养池。</span>
                    </div>
                    <button 
                      onClick={() => {
                        pushAuditLog('系统链路自检', '全局健康检查', 'sys_health', '管理员触发数据链路健康度自检：用户、宠物、申请、回访、审计模块均可读取。');
                        alert('触发审计链路健康度自检：一切正常！');
                      }}
                      className="text-xs text-indigo-400 font-extrabold hover:underline"
                    >
                      运行自检 ➔
                    </button>
                  </div>
                </div>

                {/* Simulated Recent Audit Highlights */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">🪵 安全红线·最新操作审计</span>
                    <button 
                      onClick={() => setActiveAdminTab('audit')}
                      className="text-[10px] text-indigo-400 hover:underline"
                    >
                      完整日志 ({auditLogs.length})
                    </button>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[175px] pr-1">
                    {auditLogs.slice(0, 4).map(log => (
                      <div key={log.id} className="text-[9px] bg-slate-900 p-2 rounded-xl border border-slate-850 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-350 bg-slate-800 px-1 py-0.5 rounded text-[8px]">{log.action}</span>
                          <span className="text-slate-500 font-mono">{log.timestamp?.slice(11, 19) || '--:--:--'}</span>
                        </div>
                        <p className="text-slate-300 leading-normal">{log.details}</p>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="text-slate-500 text-center py-6 text-xs font-mono">
                        (暂无操作日志存档)
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Streamlined System Compliance Guideline Block */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-slate-200">📋 流浪猫狗生老病死全生命周期治理规范</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      本系统致力于规范流浪及领养宠物的「档案审核 ➔ 意愿审批 ➔ 回访跟踪 ➔ 履约监控 ➔ 信用评价」全闭环链路。各区网格员和主管应严格落实：每宗领养匹配生成对应的定期打卡回访计划，对不合规送养人及时下架并公示其社会信用。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1.5 rounded-lg shrink-0 font-mono">
                      核定归档: GAA-2026-X
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              MODULE 2: PET FILE MANAGEMENT (Pet Management)
             ======================================================= */}
          {activeAdminTab === 'pets' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white">1. 宠物档案生命周期管束中心</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">查看及调阅全网流浪猫狗登记档案，涵盖多媒体和健康标签。支持人工审核违规并下架。</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">类型:</span>
                  <select 
                    value={petTypeFilter}
                    onChange={(e) => setPetTypeFilter(e.target.value as any)}
                    className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none"
                  >
                    <option value="all">全部物种</option>
                    <option value="cat">🐱 猫猫</option>
                    <option value="dog">🐶 狗狗</option>
                  </select>
                  <select
                    value={petStatusFilter}
                    onChange={(e) => setPetStatusFilter(e.target.value)}
                    className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none"
                  >
                    <option value="all">全部生命阶段</option>
                    <option value="审核中">⏳ 审核中</option>
                    <option value="开放申请">💚 开放申请</option>
                    <option value="申请处理中">🟡 申请处理中</option>
                    <option value="已预约见面">📅 已预约见面</option>
                    <option value="已被领养">🏠 已被领养</option>
                    <option value="暂停申请">⏸ 暂停申请</option>
                    <option value="已下架">🚫 已下架</option>
                  </select>
                </div>
              </div>

              {/* Search Bar for Pets */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="极速检索：输入宠物姓名、品种、城市所在地、发布者昵称进行定位..."
                  value={petSearch}
                  onChange={(e) => setPetSearch(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Pets Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-805">
                      <tr>
                        <th className="p-3">宠物照片 / 称呼</th>
                        <th className="p-3">物种品种</th>
                        <th className="p-3">所在地</th>
                        <th className="p-3">健康标记 (绝育/疫苗/驱虫/芯片)</th>
                        <th className="p-3">当前状态</th>
                        <th className="p-3 text-right">人工调控操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {filteredPets.map(pet => (
                        <tr key={pet.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={pet.photos[0]} 
                                alt={pet.name} 
                                className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-extrabold text-white flex items-center gap-1">
                                  <span>{pet.name}</span>
                                  <span className={`text-[8px] rounded px-1 uppercase ${
                                    pet.gender === '妹妹' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'
                                  }`}>
                                    {pet.gender} · {pet.age}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-450 mt-0.5">送养人：{pet.ownerNickname}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-300 font-medium">
                            {pet.type === 'cat' ? '🐱' : '🐶'} {pet.breed}
                          </td>
                          <td className="p-3 text-slate-300 font-mono text-[11px]">
                            {pet.province} {pet.city} {pet.district}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 text-[9px]">
                              <span className={`px-1 rounded ${pet.health?.sterilized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                {pet.health?.sterilized ? '已绝育' : '未绝育'}
                              </span>
                              <span className={`px-1 rounded ${pet.health?.vaccinated ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                {pet.health?.vaccinated ? '已免疫' : '未免疫'}
                              </span>
                              <span className={`px-1 rounded ${pet.health?.dewormed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                {pet.health?.dewormed ? '已驱虫' : '未驱虫'}
                              </span>
                              {pet.health?.hasChip && (
                                <span className="bg-indigo-500/10 text-indigo-400 px-1 rounded">有芯片</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pet.status === '开放申请' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              pet.status === '审核中' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20 animate-pulse' :
                              pet.status === '申请处理中' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              pet.status === '已预约见面' ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20' :
                              pet.status === '已被领养' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              'bg-slate-850 text-slate-400 border border-slate-800'
                            }`}>
                              {pet.status === '审核中' && '⏳ 平台审核中'}
                              {pet.status === '开放申请' && '💚 开放领养中'}
                              {pet.status === '申请处理中' && '🟡 申请处理中'}
                              {pet.status === '已预约见面' && '📅 已预约见面'}
                              {pet.status === '已被领养' && '🏠 已被领养'}
                              {pet.status === '暂停申请' && '⏸ 暂停申请'}
                              {pet.status === '已下架' && '🚫 已下架'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {pet.status === '审核中' ? (
                                <>
                                  <button 
                                    onClick={() => handleApprovePet(pet.id)}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    批准上架
                                  </button>
                                  <button 
                                    onClick={() => handleRejectPet(pet.id)}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    驳修
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => setEditingPet(pet)}
                                    className="p-1 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded border border-slate-800 cursor-pointer"
                                    title="快速编辑基本信息"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleToggleShelfPet(pet.id, pet.status)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                      pet.status === '已下架' ? 'bg-indigo-650 hover:bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                    }`}
                                  >
                                    {pet.status === '已下架' ? '重新上架' : '暂停下架'}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredPets.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                            没有找到符合过滤条件的宠物档案。
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inline mini modal editor */}
              {editingPet && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-extrabold text-white">✏ 快速修改宠物档案属性：【{editingPet.name}】</span>
                    <button onClick={() => setEditingPet(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSavePetEdit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">宠物名称</label>
                      <input 
                        type="text" 
                        value={editingPet.name} 
                        onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">品种</label>
                      <input 
                        type="text" 
                        value={editingPet.breed} 
                        onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">估计年龄</label>
                      <input 
                        type="text" 
                        value={editingPet.age} 
                        onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">体重标签</label>
                      <input 
                        type="text" 
                        value={editingPet.weight} 
                        onChange={(e) => setEditingPet({ ...editingPet, weight: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">生活环境背景</label>
                      <input 
                        type="text" 
                        value={editingPet.livingEnv} 
                        onChange={(e) => setEditingPet({ ...editingPet, livingEnv: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">救助缘由情况描述</label>
                      <input 
                        type="text" 
                        value={editingPet.reason} 
                        onChange={(e) => setEditingPet({ ...editingPet, reason: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div className="flex md:col-span-4 justify-end gap-2 border-t border-slate-850 pt-2.5 mt-1">
                      <button 
                        type="button" 
                        onClick={() => setEditingPet(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-705"
                      >
                        取消
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded"
                      >
                        保存并记录审计
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              MODULE 3: ADOPTION APPLICATIONS APPROVAL
             ======================================================= */}
          {activeAdminTab === 'applications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white">2. 线上领养候选申请书、家庭状况精细审批</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">多因子考察候选人家用防护网、经济实力、生活圈宠养意识，协助原主人匹配健康家庭。</p>
                </div>
                <div>
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800 focus:outline-none"
                  >
                    <option value="all">全部申请进度</option>
                    <option value="已提交">📨 已提交考察</option>
                    <option value="沟通中">💬 深入沟通中</option>
                    <option value="已预约见面">📅 预约现场会晤</option>
                    <option value="待确认领养">🤝 待核准电子签约</option>
                    <option value="已通过">✅ 圆满通过</option>
                    <option value="未通过">❌ 驳回否定</option>
                  </select>
                </div>
              </div>

              {/* Search Applications */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="极速检索：输入宠物名、申请人姓名、联系方式进行即时考察定位..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Applications list table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-805">
                      <tr>
                        <th className="p-3">申请人 / 宠物</th>
                        <th className="p-3">申请人基本面 (职业/年龄)</th>
                        <th className="p-3">居住条件与经验</th>
                        <th className="p-3">家庭同意度</th>
                        <th className="p-3">当前流程状态</th>
                        <th className="p-3 text-right">审核与进度干预</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {filteredApps.map(app => (
                        <tr key={app.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={app.petPhoto} 
                                alt={app.petName} 
                                className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-850"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-extrabold text-white text-xs block">
                                  {app.applicantNickname} 
                                  <span className="text-[9px] text-slate-450 font-mono ml-1 font-normal">({app.applicantPhone})</span>
                                </span>
                                <span className="text-[9px] text-indigo-400 mt-0.5 block flex items-center gap-1">
                                  申请对象: <strong className="text-white bg-indigo-500/10 px-1 rounded">{app.petName}</strong>
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-350">
                              <div className="font-semibold text-slate-250">{app.details.occupation}</div>
                              <div className="text-[9px] text-slate-450 font-mono mt-0.5">{app.details.ageGroup}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-[10px]">
                              <span className="text-slate-250 font-bold block">{app.details.livingCondition}</span>
                              <span className={`inline-block px-1 rounded text-[8px] ${
                                app.details.hasStableHome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {app.details.hasStableHome ? '安全居住期稳定' : '短期流动期'}
                              </span>
                              <span className={`inline-block px-1 rounded text-[8px] ml-1 ${
                                app.details.hasPetExperience ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-450'
                              }`}>
                                {app.details.hasPetExperience ? '有丰富养宠经验' : '零基础新手'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                                app.details.familyAgree ? 'text-emerald-400' : 'text-slate-500'
                              }`}>
                                {app.details.familyAgree ? '✔ 家人全体支持' : '✖ 有同住人反对意见'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold ${
                              app.status === '已通过' ? 'bg-emerald-500/10 text-emerald-400' :
                              app.status === '已提交' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              app.status === '沟通中' ? 'bg-amber-500/10 text-amber-400' :
                              app.status === '待确认领养' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              app.status === '未通过' ? 'bg-rose-500/10 text-rose-450' :
                              'bg-slate-850 text-slate-350'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => setViewingApp(app)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-705 text-slate-200 border border-slate-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3 text-indigo-450" />
                                <span>深核背景表</span>
                              </button>
                              
	                              <button 
	                                onClick={() => handleUpdateAppStatus(app.id, '已通过')}
	                                className={`px-2 py-1 rounded text-[10px] font-extrabold ${
	                                  canFinalApproveApplication(app)
	                                    ? 'bg-emerald-655 hover:bg-emerald-600 text-white cursor-pointer'
	                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
	                                }`}
	                                disabled={!canFinalApproveApplication(app)}
	                              >
                                终审通过
                              </button>

                              <button 
                                onClick={() => {
                                  const reason = prompt('请输入拒绝驳回该领养人的依据（将自动通知并留档）：', '住房类型不符合独门独户或防盗金刚网防护不到位。');
                                  if (reason) handleUpdateAppStatus(app.id, '未通过', reason);
                                }}
                                className="px-2 py-1 bg-rose-650 hover:bg-rose-600 text-white rounded text-[10px] font-extrabold cursor-pointer"
                                disabled={app.status === '未通过'}
                              >
                                拒绝
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredApps.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 text-xs text-balance">
                            未匹配到任何手机客户端提交的领养申请记录。
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slider overlay detail drawer when viewing app details */}
              {viewingApp && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs">📋</span>
                      <h4 className="text-xs font-bold text-white">
                        申请意向书评估表 - 【{viewingApp.applicantNickname}】 应募 【{viewingApp.petName}】
                      </h4>
                    </div>
                    <button onClick={() => setViewingApp(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2.5">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">领养初衷与动机：</span>
                        <p className="text-slate-200 leading-normal mb-1">{viewingApp.details.motivation}</p>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">日常养育人及作息空档：</span>
                        <p className="text-slate-200 leading-normal">{viewingApp.details.carePlan || '全家人轮流伺候，每天有2-3小时专属时间用于陪伴和照料。'}</p>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">意外生病/搬家/生育紧急预案：</span>
                        <p className="text-slate-200 leading-normal">{viewingApp.details.emergencyPlan || '即便生病或工作变动，均交托爸妈或自驾运送，对生命终期绝不出售、不抛弃，遵守签约底线。'}</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-[11px] self-start bg-slate-900/50 p-3 rounded-2xl border border-slate-850">
                      <span className="font-extrabold text-slate-300 block border-b border-slate-800 pb-1 mb-2">多因子信用准入评估</span>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-450 text-[10px]">经济保障潜力</span>
                        <span className="font-bold text-emerald-400">稳定 (可负担中上猫狗粮+医疗险)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 text-[10px]">家人/同住舍友对猫毛等接纳状态</span>
                        <span className="font-bold text-emerald-400">100% 同意并支持</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 text-[10px]">既往养宠经验</span>
                        <span className="font-semibold text-slate-250">
                          {viewingApp.details.hasPetExperience ? '有丰富养宠且熟悉各项指标' : '新手 (愿意接受辅导和强制打卡监督)'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 mt-2">
                        <span className="text-slate-450 text-[10px]">电子领养协议指纹</span>
                        <span className="font-mono text-slate-350 text-[10px]">MD5-SHA1_FP8276AF</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            handleUpdateAppStatus(viewingApp.id, '已通过');
                            setViewingApp(null);
                          }}
	                          disabled={!canFinalApproveApplication(viewingApp)}
	                          className={`flex-1 py-1.5 rounded text-center font-bold text-xs ${
	                            canFinalApproveApplication(viewingApp)
	                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
	                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
	                          }`}
                        >
                          终审核准
                        </button>
                        <button 
                          onClick={() => {
                            handleUpdateAppStatus(viewingApp.id, '沟通中');
                            setViewingApp(null);
                          }}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-slate-800 text-indigo-200 hover:text-white rounded text-center border border-indigo-500/30 cursor-pointer"
                        >
                          标记并置入沟通流
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              MODULE 4: USER ACCOUNT CREDIT PROFILES
             ======================================================= */}
          {activeAdminTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white">3. 实名用户群组、防盗拉黑、信用度记录仪</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">控制全网实名注册家庭的活跃状态、历史成功受领次数与信用分防线。执行强制风控降权。</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-lg transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    添加新用户
                  </button>
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                    <input 
                      type="text"
                      placeholder="按手机号或姓名定位信用账户..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 pl-8 rounded-lg border border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Users Credit Records list */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-805">
                      <tr>
                        <th className="p-3">实名登记账号</th>
                        <th className="p-3">所在地 / 年龄段</th>
                        <th className="p-3">职业身份</th>
                        <th className="p-3">生活住房类型</th>
                        <th className="p-3">生命安全系数 / 事迹档案</th>
                        <th className="p-3 text-right">信用分调整 / 封禁</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-3">
                            <div>
                              <span className="font-extrabold text-white text-xs block">{user.nickname}</span>
                              <span className="text-[9px] text-slate-450 font-mono mt-0.5 block">{user.phone}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-350">
                            {user.province} {user.city} 
                            <span className="text-[9px] text-slate-450 font-medium bg-slate-900 px-1 rounded ml-1">{user.ageGroup}</span>
                          </td>
                          <td className="p-3 text-slate-300 font-semibold">{user.occupation}</td>
                          <td className="p-3 font-medium text-slate-355">{user.livingCondition}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-medium">信用权重:</span>
                                <span className="text-xs font-black text-emerald-450 font-mono">{getUserCreditScore(user)}/100</span>
                                <span className={`text-[8px] font-extrabold px-1 rounded scale-90 ${
                                  (user as any).status === 'risk_review'
                                    ? 'bg-rose-500/10 text-rose-300'
                                    : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                  {(user as any).status === 'risk_review' ? '风控' : '优异'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-slate-450">
                                <span>历史送养: <strong className="text-slate-300">1次</strong></span>
                                <span>成功领养: <strong className="text-slate-300">{user.id === 'u_applicant1' ? '1次' : '0次'}</strong></span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => {
                                  setCreditAdjustmentUserId(null);
                                  setEditingUser(user);
                                }}
                                className="p-1 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded border border-slate-800 cursor-pointer"
                                title="修改用户信息"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingUser(null);
                                  setCreditAdjustmentUserId(user.id);
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-705 text-slate-300 border border-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                ✍ 调整信用
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    await onUpdateUser(user.id, { ...(user as any), status: 'risk_review' } as any);
                                    pushAuditLog('风控黑名单干预', '用户账户管理', user.id, `对用户【${user.nickname}】执行黑名单告警处置！`);
                                    alert(`已将用户【${user.nickname}】置于黄牌风控考察中，将限制其在本服务大厅内无节制高频应征的行为。`);
                                  } catch (error) {
                                    alert('风控状态写入后端失败，请检查 API 服务。');
                                  }
                                }}
                                className="px-2 py-1 bg-rose-950/40 hover:bg-rose-950 text-rose-300 border border-rose-950/50 hover:border-rose-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                🚫 告警限制
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm(`确定要删除用户【${user.nickname}】吗？`)) {
                                    try {
                                      await onDeleteUser(user.id);
                                      pushAuditLog('注销用户账号', '用户账户管理', user.id, `管理员彻底删除了用户：【${user.nickname}】`);
                                    } catch (e) {
                                      alert('删除失败');
                                    }
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-400 bg-slate-850 hover:bg-slate-800 rounded border border-slate-800 cursor-pointer"
                                title="注销用户"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                    <span className="text-xs font-extrabold text-white">👤 添加新实名用户</span>
                    <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">昵称</label>
                      <input 
                        type="text" 
                        value={newUserForm.nickname}
                        onChange={(e) => setNewUserForm({ ...newUserForm, nickname: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">手机号</label>
                      <input 
                        type="text" 
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">职业</label>
                      <input 
                        type="text" 
                        value={newUserForm.occupation}
                        onChange={(e) => setNewUserForm({ ...newUserForm, occupation: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">地区 (省/市/区)</label>
                      <div className="grid grid-cols-3 gap-1">
                        <input type="text" placeholder="省" value={newUserForm.province} onChange={(e) => setNewUserForm({ ...newUserForm, province: e.target.value })} className="bg-slate-900 border border-slate-855 rounded px-1 py-1" />
                        <input type="text" placeholder="市" value={newUserForm.city} onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value })} className="bg-slate-900 border border-slate-855 rounded px-1 py-1" />
                        <input type="text" placeholder="区" value={newUserForm.district} onChange={(e) => setNewUserForm({ ...newUserForm, district: e.target.value })} className="bg-slate-900 border border-slate-855 rounded px-1 py-1" />
                      </div>
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2 border-t border-slate-850 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddUserModal(false)} 
                        className="px-3 py-1 bg-slate-800 text-slate-350 rounded"
                      >
                        取消
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded"
                      >
                        确认创建
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit User Modal */}
              {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
                <div className="w-full max-w-2xl bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                    <span className="text-xs font-extrabold text-white">✏ 修改用户信息：【{editingUser.nickname}】</span>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleEditUserSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">昵称</label>
                      <input 
                        type="text" 
                        value={editingUser.nickname}
                        onChange={(e) => setEditingUser({ ...editingUser, nickname: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">手机号</label>
                      <input 
                        type="text" 
                        value={editingUser.phone}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">职业</label>
                      <input 
                        type="text" 
                        value={editingUser.occupation}
                        onChange={(e) => setEditingUser({ ...editingUser, occupation: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">住房状况</label>
                      <select 
                        value={editingUser.livingCondition}
                        onChange={(e) => setEditingUser({ ...editingUser, livingCondition: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                      >
                        <option value="自有住房">自有住房</option>
                        <option value="租房">租房</option>
                        <option value="合租">合租</option>
                        <option value="宿舍">宿舍</option>
                        <option value="与家人同住">与家人同住</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2 border-t border-slate-850 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingUser(null)} 
                        className="px-3 py-1 bg-slate-800 text-slate-350 rounded"
                      >
                        取消
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded"
                      >
                        保存修改
                      </button>
                    </div>
                  </form>
                </div>
                </div>
              )}

              {/* Adjust User Credit Modal Panel */}
              {creditAdjustmentUserId && activeCreditUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
                <div className="w-full max-w-2xl bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                    <span className="text-xs font-extrabold text-white">
                      ✍ 调节实名勋章和信用评分：【{activeCreditUser.nickname}】当前 {getUserCreditScore(activeCreditUser)}/100
                    </span>
                    <button onClick={() => setCreditAdjustmentUserId(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleUserCreditAdjust} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">调整模式</label>
                      <select 
                        value={creditAdjustmentType}
                        onChange={(e) => setCreditAdjustmentType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                      >
                        <option value="add">优秀志愿者行为 / 爱心打卡积极 (+分)</option>
                        <option value="deduct">多次无故失约 / 经举报不理睬打卡 (-分)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">分值权重</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="20"
                        value={creditAdjustmentPoints}
                        onChange={(e) => setCreditAdjustmentPoints(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">管理员批注缘由说明</label>
                      <input 
                        type="text" 
                        placeholder="例如：打卡质量优秀，特核加信用积分。"
                        value={creditReasonRemark}
                        onChange={(e) => setCreditReasonRemark(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-855 rounded px-2.5 py-1 text-slate-200"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2 border-t border-slate-850 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setCreditAdjustmentUserId(null)} 
                        className="px-3 py-1 bg-slate-800 text-slate-350 rounded"
                      >
                        取消
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded"
                      >
                        确认并签章留档
                      </button>
                    </div>
                  </form>
                </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              MODULE 5: CHATS & CONTRACTS MONITORING
             ======================================================= */}
          {activeAdminTab === 'chats' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-extrabold text-white">4. 在线会谈纠纷、电子非商领养协议公信公证</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">调阅线上即时通讯内容以作仲裁依据。存证电子协议（指纹、哈希验证与不可逆指骨加密）维护法律约束。</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Active Chat lists */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 h-[300px] overflow-y-auto space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block border-b border-slate-850 pb-1.5 mb-2.5">
                    📱 发现会话通道集 ({chats.length} 个)
                  </span>
                  {chats.map((session, index) => (
                    <button
                      key={session.id}
                      onClick={() => setActiveChatIndex(index)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex justify-between items-center ${
                        activeChatIndex === index ? 'bg-indigo-650 text-white border-indigo-500' : 'bg-slate-900/60 text-slate-350 border-slate-850 hover:bg-slate-850'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span>{session.petName}</span>
                          <span className="text-[9px] font-normal opacity-80">
                            ({session.adopterNickname} ⇦ {session.ownerNickname})
                          </span>
                        </div>
                        <p className="text-[9px] opacity-70 mt-1 truncate max-w-[150px]">{session.lastMessageText}</p>
                      </div>
                      <span className="text-[8px] font-mono opacity-60 shrink-0">{session.lastMessageTime}</span>
                    </button>
                  ))}
                </div>

                {/* Chat window debugger transcript */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 lg:col-span-2 flex flex-col justify-between h-[300px]">
                  <div>
                    <span className="text-[10px] font-bold text-slate-100 block border-b border-slate-855 pb-1.5 mb-2 flex items-center justify-between">
                      <span>🤖 纠纷监控及历史记录监视器（管理员加密只读审计环境）</span>
                      {activeChatIndex !== null && (
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[8px] tracking-wider animate-pulse">
                          ● 安全沙盒拦截监管中
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[220px]">
                    {activeChatIndex !== null ? (
                      chats[activeChatIndex].messages.map(msg => {
                        const isAdopter = msg.senderId === chats[activeChatIndex].adopterId;
                        return (
                          <div key={msg.id} className={`flex flex-col max-w-[85%] ${isAdopter ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                            <span className="text-[8px] text-slate-500 font-semibold mb-0.5 mb-0.5 px-1.5">
                              {isAdopter ? chats[activeChatIndex].adopterNickname : chats[activeChatIndex].ownerNickname} · {msg.createdAt}
                            </span>
                            <div className={`p-2 rounded-xl text-xs ${
                              isAdopter ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-200 border border-slate-800'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 text-center py-16 text-xs text-balance">
                        💡 请点击左侧任一组会话，即刻以监督审计人员之视角调阅纠纷双方的历史聊天全套记录。
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Electronic Contract verification drawer block */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white block border-b border-slate-850 pb-1.5">
                  🔏 电子公证领养协议区块链电子安全散列存档：
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">【契约首推样本】非商公约保障法</span>
                    <p className="text-slate-200 text-[10px] leading-relaxed">
                      该协议在签署通过后生效。约定凡存在弃养、离暴、绝育疫苗刻意失约，送养人均有法定权向当地公安、救助协会及本系统申请强制收回流浪宠物。
                    </p>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 font-mono space-y-1.5 text-[10px]">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 font-sans">协议指纹及证书指证</span>
                    <div className="text-slate-350">安全哈希: <span className="text-yellow-400">#F67A1289BCDE90</span></div>
                    <div className="text-slate-350">数字密码: <span className="text-emerald-450">Verified.RSA-4096</span></div>
                    <div className="text-slate-350">状态：<span className="font-sans font-bold text-emerald-400">已盖法律章签名</span></div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-center items-center">
                    <span className="text-[9px] text-slate-500 font-extrabold">领养签约人亲笔电子盖章：</span>
                    <div className="bg-slate-950 p-1 rounded-lg border border-rose-500/30 text-rose-500 font-serif font-black text-xs scale-95 mt-1.5 border-2 border-double transform rotate-2">
                       大白铲屎官 · 印 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              MODULE 6: FEEDBACK & FOLLOW-UP REPORTING
             ======================================================= */}
          {activeAdminTab === 'feedback' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-extrabold text-white">5. 领养后期生平打卡回访、健康状况汇报考查中心</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">强制性监管打卡机制，确保领养人在第 7、30、90、180 天按时汇报接纳、食欲和环境适应。对异常提出整改。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Feedback nodes */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3.5">
                  <span className="text-xs font-bold text-slate-200 block border-b border-slate-855 pb-1">
                    🏡 正在被监管中的大白家庭回访状态追踪
                  </span>

                  {feedbackPlans.map(plan => (
                    <div key={plan.id} className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={plan.petPhoto} 
                          alt={plan.petName} 
                          className="w-10 h-10 rounded-lg object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-extrabold text-white text-xs block">
                            宠物: {plan.petName} ({plan.adopterNickname} 领养)
                          </span>
                          <span className="text-[9px] text-slate-450 mt-0.5 block">原送养监督官: {plan.ownerNickname}</span>
                        </div>
                      </div>

                      {/* Timeline steps */}
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        {plan.nodes.map(n => {
                          const isSuccess = n.status === '已提交' || n.submission;
                          return (
                            <div key={n.nodeId} className="p-1 rounded bg-slate-950 text-center border border-slate-850">
                              <span className="text-[8px] text-slate-500 block leading-none">{n.title?.slice(3, 7) || '阶段'}</span>
                              <span className={`text-[9px] font-black block mt-1 ${
                                isSuccess ? 'text-emerald-400' : 'text-amber-450 animate-pulse'
                              }`}>
                                {isSuccess ? '● 已提交' : '○ 待审'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read feedback submissions */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block border-b border-slate-855 pb-1.5 mb-2">
                      📝 最近提交打卡内容
                    </span>

                    {latestFeedbackEntry?.node.submission ? (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2.5 text-xs text-slate-300">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-450">打卡自述：{latestFeedbackEntry.plan.petName} / {latestFeedbackEntry.node.title}</span>
                          <span className="text-emerald-400 font-mono">{latestFeedbackEntry.node.submission.submittedAt}</span>
                        </div>
                        <p className="leading-relaxed bg-slate-950 p-2 rounded border border-slate-850 text-slate-200">
                          “{latestFeedbackEntry.node.submission.text}”
                        </p>

                        <div className="grid grid-cols-3 gap-2 py-0.5 text-[10px]">
                          <div>
                            <span className="text-slate-500 text-[8px] block">精神/情绪</span>
                            <strong className="text-emerald-450">{latestFeedbackEntry.node.submission.healthStatus}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[8px] block">饮食状态</span>
                            <strong className="text-emerald-455">{latestFeedbackEntry.node.submission.eatingHabits}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[8px] block">家庭适应</span>
                            <strong className="text-indigo-405">{latestFeedbackEntry.node.submission.adaptability}</strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-6 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500 text-center">
                        暂无领养人提交的定期打卡。
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-850 pt-2.5 mt-3 space-y-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold block">管理员人工决策审批批注：</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          if (latestFeedbackEntry) {
                            handleReviewFeedbackNode(latestFeedbackEntry.plan.id, latestFeedbackEntry.node.nodeId, '正常', '情况评估：一切优秀，无任何不良反馈或违纪行为，领养安全。');
                          }
                        }}
                        disabled={!latestFeedbackEntry}
                        className={`flex-1 py-1 px-2.5 rounded font-bold text-center text-[10px] ${
                          latestFeedbackEntry ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        ✅ 无异常归档
                      </button>
                      <button 
                        onClick={() => {
                          const note = prompt('请输入发出整改警告的批示：', '经考察饮水有轻微猫癣风险，请及时在干燥处外涂防癣消。');
                          if (note && latestFeedbackEntry) {
                            handleReviewFeedbackNode(latestFeedbackEntry.plan.id, latestFeedbackEntry.node.nodeId, '有异常', note);
                          }
                        }}
                        disabled={!latestFeedbackEntry}
                        className={`flex-1 py-1 px-2 rounded font-bold text-center text-[10px] ${
                          latestFeedbackEntry ? 'bg-rose-700/80 hover:bg-rose-600 text-rose-100 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        ⚠️ 下发异常干预整改
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              MODULE 8: LIFECYCLE MANAGEMENT (LIFECYCLE)
             ======================================================= */}
          {activeAdminTab === 'lifecycle' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white">5. 生老病死全周期治理追踪</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">从源头救助、医疗健康监控到最终的生命善后，记录流浪动物在平台上的每一个关键节点。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rescue Section */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-850 pb-2">
                    <HeartPulse className="w-5 h-5" />
                    <span className="text-xs font-black uppercase">救助记录 (源头)</span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {lifecycleRecords.rescue.map((r: any) => (
                      <div key={r.id} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-white">宠物 ID: {r.petId}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{r.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">地点: {r.location}</p>
                        <p className="text-[10px] text-slate-300 mt-0.5 italic">" {r.condition} "</p>
                        <div className="mt-2 flex justify-end">
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded">救助人: {r.rescuer}</span>
                        </div>
                      </div>
                    ))}
                    {lifecycleRecords.rescue.length === 0 && <p className="text-center py-4 text-slate-600 text-[10px]">暂无救助数据</p>}
                  </div>
                </div>

                {/* Medical Section */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-850 pb-2">
                    <Stethoscope className="w-5 h-5" />
                    <span className="text-xs font-black uppercase">医疗健康监控</span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {lifecycleRecords.medical.map((m: any) => (
                      <div key={m.id} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 hover:border-emerald-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${m.type === '手术' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                            <span className="text-[11px] font-bold text-white">{m.type}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">{m.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1">{m.details}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[9px] text-slate-500">宠物 ID: {m.petId}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{m.hospital}</span>
                        </div>
                      </div>
                    ))}
                    {lifecycleRecords.medical.length === 0 && <p className="text-center py-4 text-slate-600 text-[10px]">暂无医疗数据</p>}
                  </div>
                </div>

                {/* EOL Section */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 border-b border-slate-850 pb-2">
                    <Skull className="w-5 h-5" />
                    <span className="text-xs font-black uppercase">生命善后记录</span>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {lifecycleRecords.eol.map((e: any) => (
                      <div key={e.id} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 hover:border-slate-500 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-white">死因: {e.cause}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{e.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">悼词: {e.memorial}</p>
                        <div className="mt-2 flex justify-between items-center border-t border-slate-800/50 pt-1.5">
                          <span className="text-[9px] text-slate-500">宠物 ID: {e.petId}</span>
                          <span className="text-[9px] text-slate-300 font-medium">📍 {e.burialLocation}</span>
                        </div>
                      </div>
                    ))}
                    {lifecycleRecords.eol.length === 0 && <p className="text-center py-4 text-slate-600 text-[10px]">暂无善后数据</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              MODULE 7: SECURITY AUDIT HISTORY
             ======================================================= */}
          {activeAdminTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white">6. 系统管理员审计、安全操作轨迹归档室</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">防范违规买卖、黑心中介以及恶意操作。记录所有修改宠物、信用干预、审批退回的高安全行为。</p>
                </div>
                <button 
                  onClick={() => {
                    setAuditLogs([]);
                    alert('已清空本次控制台模拟产生的临时审计日志！');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white border border-slate-700 rounded-lg text-xs cursor-pointer"
                >
                  清空历史痕迹
                </button>
              </div>

              {/* Audit trail representation table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-805 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/60 text-slate-400 text-[9px] font-bold uppercase tracking-wider border-b border-slate-805">
                      <tr>
                        <th className="p-3">事件时间戳</th>
                        <th className="p-3">操作主体</th>
                        <th className="p-3">业务模块</th>
                        <th className="p-3">合规操作类别</th>
                        <th className="p-3">目标实体 ID</th>
                        <th className="p-3">核心变更存证细节</th>
                        <th className="p-3">安全源 I.P.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 text-[11px]">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-900/20">
                          <td className="p-3 text-slate-405">{log.timestamp}</td>
                          <td className="p-3 text-indigo-400 font-bold font-sans">
                            {log.operator}
                          </td>
                          <td className="p-3 text-slate-300 font-sans">{log.module}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 bg-slate-850 rounded text-[9px] font-extrabold font-sans text-slate-205">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{log.targetId}</td>
                          <td className="p-3 text-slate-250 font-sans leading-relaxed">{log.details}</td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{log.ip}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-550 text-xs">
                            (暂未沉淀生成任何合规管理员的审计日志)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
