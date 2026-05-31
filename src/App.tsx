/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Heart, MapPin,
  AlertCircle, X, ChevronRight, ChevronLeft, Filter,
  Shield, Activity, Settings, HeartPulse, History, Skull
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  UserProfile, PetListing, AdoptionApplication, ChatSession, 
  Message, Appointment, FeedbackPlan, FeedbackSubmission, NotificationItem,
  FeedbackNode
} from './types';

import { 
  INITIAL_CHATS, INITIAL_NOTIFICATIONS, INITIAL_FEEDBACK_PLANS 
} from './data';

import RegionSelector from './components/RegionSelector';
import DigitalSignature from './components/DigitalSignature';
import RegisterForm from './components/RegisterForm';
import PublishWizard from './components/PublishWizard';
import ApplicantDetailCard from './components/ApplicantDetailCard';
import ChatWindow from './components/ChatWindow';
import FeedbackManager from './components/FeedbackManager';

const API_HOST = window.location.hostname || 'localhost';
const API_BASE = `http://${API_HOST}:5005/api`;

const isPetOpenForApplication = (pet: PetListing) => pet.status === '开放申请';

export default function App() {
  // Database States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [pets, setPets] = useState<PetListing[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [feedbackPlans, setFeedbackPlans] = useState<FeedbackPlan[]>(INITIAL_FEEDBACK_PLANS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [rescueRecords, setRescueRecords] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [eolRecords, setEolRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, usersRes, appsRes, rescueRes, medRes, eolRes, feedbackRes, chatsRes, apptsRes, notifRes] = await Promise.all([
          axios.get(`${API_BASE}/pets`),
          axios.get(`${API_BASE}/users`),
          axios.get(`${API_BASE}/admin/applications`),
          axios.get(`${API_BASE}/lifecycle/rescue`),
          axios.get(`${API_BASE}/lifecycle/medical`),
          axios.get(`${API_BASE}/lifecycle/eol`),
          axios.get(`${API_BASE}/feedback/plans`),
          axios.get(`${API_BASE}/engagement/chats`),
          axios.get(`${API_BASE}/engagement/appointments`),
          axios.get(`${API_BASE}/engagement/notifications`)
        ]);
        setPets(petsRes.data);
        setUsers(usersRes.data);
        setApplications(appsRes.data || []);
        setRescueRecords(rescueRes.data);
        setMedicalRecords(medRes.data);
        setEolRecords(eolRes.data);
        setFeedbackPlans(feedbackRes.data || []);
        setChats(chatsRes.data || []);
        setAppointments(apptsRes.data || []);
        setNotifications(notifRes.data || []);

        const savedUser = localStorage.getItem('currentUser');
        const hasLoggedOut = localStorage.getItem('hasLoggedOut') === 'true';
        if (!savedUser && !hasLoggedOut && usersRes.data.length > 0) {
          const demoUser = usersRes.data.find((user: UserProfile) => user.phone === '11111111111') || usersRes.data[usersRes.data.length - 1];
          setCurrentUser(demoUser);
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          setSubView(null);
        }
      } catch (error) {
        console.error('Error fetching mobile data:', error);
      }
    };
    fetchData();
    const interval = window.setInterval(fetchData, 2000);
    return () => window.clearInterval(interval);
  }, []);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // UI Control States in Phone
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'publish' | 'messages' | 'mine'>('home');
  const [subView, setSubView] = useState<string | null>(null);
  
  // Selection ids
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedFeedbackPlanId, setSelectedFeedbackPlanId] = useState<string | null>(null);

  // Region Overrides
  const [currentRegion, setCurrentRegion] = useState({ province: '广东省', city: '广州市', district: '天河区' });
  const [showGlobalRegionPicker, setShowGlobalRegionPicker] = useState(false);

  // Discover Filter States
  const [filterType, setFilterType] = useState<'all' | 'cat' | 'dog'>('all');
  const [filterAge, setFilterAge] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterSterilized, setFilterSterilized] = useState<boolean | null>(null);
  const [filterVaccinated, setFilterVaccinated] = useState<boolean | null>(null);
  const [filterSpecialTrait, setFilterSpecialTrait] = useState<string>('all'); // e.g., "friendly", "apartment", "potty"
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Success Story detail mockup helper
  const [showSuccessStoryId, setShowSuccessStoryId] = useState<string | null>(null);

  // Application form custom inputs inside view
  const [appFormLiveCondition, setAppFormLiveCondition] = useState('自有住房');
  const [appFormRoommates, setAppFormRoommates] = useState(true);
  const [appFormMotivation, setAppFormMotivation] = useState('我特别喜欢毛茸茸的小动物，上班生活工作规律。想有一只小猫爪能够陪伴成长，我也愿意竭尽所能科学供它最好的粮食与体检！');
  const [appFormPromise, setAppFormPromise] = useState(false);

  // Contract Signature helper
  const [contractSignature, setContractSignature] = useState<string | null>(null);

  // Report mock state
  const [reportReason, setReportReason] = useState('疑似宠物商家买卖虚假包装流浪');
  const [reportText, setReportText] = useState('');

  const [profileDraft, setProfileDraft] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (currentUser && subView === 'settings') {
      setProfileDraft(currentUser);
    }
  }, [currentUser, subView]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    if (!profileDraft.nickname?.trim()) {
      alert('请填写昵称');
      return;
    }
    if (!/^1\d{10}$/.test(profileDraft.phone || '')) {
      alert('请输入正确的 11 位手机号');
      return;
    }

    try {
      const res = await axios.put(`${API_BASE}/users/${currentUser.id}`, profileDraft, {
        headers: { Authorization: 'Bearer mock-token-for-dev' }
      });
      setCurrentUser(res.data);
      localStorage.setItem('currentUser', JSON.stringify(res.data));
      setUsers(prev => prev.map(user => user.id === currentUser.id ? res.data : user));
      alert('个人资料已保存');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('保存失败，请检查后端服务。');
    }
  };

  // Simulator Time Hook
  const [simulatedTime, setSimulatedTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSimulatedTime(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync favorites helper in local memory state
  const [favoritePetIds, setFavoritePetIds] = useState<string[]>(['p_1', 'p_4']);

  const toggleFavorite = (petId: string) => {
    setFavoritePetIds(prev => 
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    );
  };

  // Helper selectors
  const activePetObject = pets.find(p => p.id === selectedPetId);
  const activeChatObject = chats.find(c => c.id === selectedChatId);
  const activeApplicationObject = applications.find(a => a.id === selectedApplicationId);
  const currentUserFeedbackPlans = currentUser
    ? feedbackPlans.filter(plan => plan.adopterId === currentUser.id)
    : [];
  const currentUserOwnedFeedbackPlans = currentUser
    ? feedbackPlans.filter(plan => plan.ownerId === currentUser.id)
    : [];
  const activeFeedbackPlanObject = currentUser
    ? feedbackPlans.find(f => f.id === selectedFeedbackPlanId && (f.adopterId === currentUser.id || f.ownerId === currentUser.id))
    : feedbackPlans.find(f => f.id === selectedFeedbackPlanId);

  const saveNotification = async (notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev]);
    try {
      const res = await axios.post(`${API_BASE}/engagement/notifications`, notification);
      setNotifications(prev => prev.map(item => item.id === notification.id ? res.data : item));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleSystemFeedbackReminder = async () => {
    if (!currentUser) {
      alert('请先登录后再查看系统催打。');
      setSubView('login');
      return;
    }

    const pendingEntries = currentUserFeedbackPlans.flatMap(plan =>
      plan.nodes
        .filter(node => node.status === '待提交')
        .map(node => ({ plan, node }))
    );

    if (pendingEntries.length === 0) {
      alert('当前账号暂无需要系统催打的定期打卡。');
      return;
    }

    const firstEntry = pendingEntries[0];
    const notification: NotificationItem = {
      id: `notif_feedback_reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '系统催打：请提交新家定期打卡',
      content: `您领养的【${firstEntry.plan.petName}】还有 ${pendingEntries.length} 个待提交回访节点。最近一项是【${firstEntry.node.title}】，截止日期 ${firstEntry.node.dueDate}。`,
      time: '刚才',
      type: 'feedback',
      read: false
    };

    await saveNotification(notification);
    alert(`已生成 ${pendingEntries.length} 项系统催打提醒，请到消息通知查看。`);
    setActiveTab('messages');
    setSubView('notification-center');
  };

  const ensureChatSession = async (payload: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const existing = chats.find(chat => chat.petId === payload.petId && chat.adopterId === payload.adopterId);
    if (existing) return existing;

    const res = await axios.post(`${API_BASE}/engagement/chats/ensure`, payload);
    const savedChat = res.data as ChatSession;
    setChats(prev => prev.some(chat => chat.id === savedChat.id) ? prev : [savedChat, ...prev]);
    return savedChat;
  };

  const ensureChatForApplication = async (app: AdoptionApplication) => {
    const pet = pets.find(item => item.id === app.petId);
    return ensureChatSession({
      petId: app.petId,
      petName: app.petName,
      petPhoto: app.petPhoto,
      adopterId: app.applicantId,
      adopterNickname: app.applicantNickname,
      ownerId: pet?.ownerId || 'u_1',
      ownerNickname: pet?.ownerNickname || '送养人',
      messages: [
        {
          id: `m_init_${app.id}`,
          senderId: app.applicantId,
          text: `您好！我对您送养的宠物【${app.petName}】进行了线上领养申请填报，期待进一步沟通。`,
          createdAt: new Date().toISOString(),
          type: 'text'
        }
      ],
      lastMessageText: `您好！我对您送养的宠物【${app.petName}】进行了申请填报...`,
      lastMessageTime: '刚刚',
      unreadCount: 0
    });
  };

  useEffect(() => {
    const approvedApps = applications.filter(app => app.status === '已通过');
    const missingPlans = approvedApps.filter(app => !feedbackPlans.some(plan => plan.petId === app.petId && plan.adopterId === app.applicantId));
    if (missingPlans.length === 0) return;

    const ensureMissingPlans = async () => {
      try {
        const plans = await Promise.all(missingPlans.map(app => {
          const pet = pets.find(item => item.id === app.petId);
          return axios.post(`${API_BASE}/feedback/plans/ensure`, {
            petId: app.petId,
            petName: app.petName,
            petPhoto: app.petPhoto,
            adopterId: app.applicantId,
            adopterNickname: app.applicantNickname,
            ownerId: pet?.ownerId,
            ownerNickname: pet?.ownerNickname
          });
        }));
        setFeedbackPlans(prev => {
          const merged = [...prev];
          plans.forEach(({ data }) => {
            if (!merged.some(plan => plan.id === data.id)) {
              merged.push(data);
            }
          });
          return merged;
        });
      } catch (error) {
        console.error('Error ensuring feedback plans:', error);
      }
    };

    ensureMissingPlans();
  }, [applications, feedbackPlans, pets]);

  // Message Sending dispatch
  const handleSendMessage = async (sessionId: string, text: string) => {
    const newMsg: Message = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUser?.id || 'guest',
      text,
      createdAt: new Date().toISOString(),
      type: 'text'
    };

    setChats(prev => prev.map(c => {
      if (c.id === sessionId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessageText: text.length > 20 ? text.slice(0, 20) + '...' : text,
          lastMessageTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
      }
      return c;
    }));

    try {
      const res = await axios.post(`${API_BASE}/engagement/chats/${sessionId}/messages`, newMsg);
      setChats(prev => prev.map(chat => chat.id === sessionId ? res.data : chat));
    } catch (error) {
      console.error('Error saving chat message:', error);
      alert('消息发送失败，请检查后端服务。');
    }
  };

  // Submit Adoption Application Flow
  const handleCreateApplication = async (petId: string) => {
    if (!currentUser) {
      alert('请先完成手机账户注册或登录！');
      jumpToScreen('用户注册页');
      return;
    }
    if (!appFormPromise) {
      alert('提交前，请勾选签署您的诚信不转卖、不虐待不遗弃承诺！');
      return;
    }

    const targetPet = pets.find(p => p.id === petId);
    if (!targetPet) return;
    if (targetPet.ownerId === currentUser.id) {
      alert('这是您自己发布的宠物，不能提交领养申请。');
      return;
    }
    if (!isPetOpenForApplication(targetPet)) {
      alert('该宠物当前不在开放申请状态，暂时不能提交领养申请。');
      return;
    }
    if (applications.some(app => app.petId === petId && app.applicantId === currentUser.id && app.status !== '已取消')) {
      alert('您已经提交过这只宠物的领养申请，请到“我的领养申请”查看进度。');
      return;
    }

    const newApp: AdoptionApplication = {
      id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      petId,
      petName: targetPet.name,
      petPhoto: targetPet.photos[0],
      applicantId: currentUser.id,
      applicantNickname: currentUser.nickname,
      applicantPhone: currentUser.phone,
      status: '已提交',
      createdAt: new Date().toISOString().split('T')[0],
      details: {
        ageGroup: currentUser.ageGroup || '90后',
        occupation: currentUser.occupation || '自由职业',
        livingCondition: appFormLiveCondition,
        hasStableHome: true,
        withFamily: false,
        familyAgree: appFormRoommates,
        hasPetExperience: currentUser.hasPetExperience,
        experienceDesc: currentUser.hasPetExperience 
          ? '具备科学养宠经验，了解基础医疗常识。' 
          : '新手领养，已提前学习科学养宠知识。',
        hasOtherPets: currentUser.livingCondition === '已养宠',
        understandBasicCare: true,
        canAffordDaily: true,
        canAffordMedical: true,
        motivation: appFormMotivation,
        carePlan: '提供充足的陪伴，科学喂养，定期体检。',
        emergencyPlan: '如有突发状况，将第一时间送往专业宠物医院，绝不弃养。'
      }
    };

    try {
      const res = await axios.post(`${API_BASE}/admin/applications`, newApp);
      setApplications(prev => [res.data, ...prev]);
    } catch (error) {
      console.error('Error creating application:', error);
      alert('申请提交失败，请稍后再试。');
      return;
    }

    try {
      await ensureChatForApplication(newApp);
    } catch (error) {
      console.error('Error creating application chat:', error);
    }

    // Add list indicator application stats state adjustment
    setPets(prev => prev.map(p => {
      if (p.id === petId) {
        return { ...p, status: '申请处理中' };
      }
      return p;
    }));

    // Trigger platform system notifications for publisher to review!
    const newNotif: NotificationItem = {
      id: `notif_app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '收到新的流浪爱心申请表',
      content: `用户【${currentUser.nickname}】提请了对您送养“${targetPet.name}”的候选考核。请进入我的发布栏目中甄选审核。`,
      time: '刚才',
      type: 'application',
      read: false
    };
    saveNotification(newNotif);

    setSubView('apply-success');
  };

  // Publisher views and takes action of approving candidates
  const handleApproveApplicant = async (appId: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    try {
      const res = await axios.put(
        `${API_BASE}/admin/applications/${appId}`,
        { status: '已预约见面' },
        { headers: { Authorization: 'Bearer mock-token-for-dev' } }
      );
      setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
      setPets(prev => prev.map(p => p.id === targetApp.petId
        ? { ...p, status: '已预约见面', adopterId: targetApp.applicantId }
        : p
      ));
    } catch (error) {
      console.error('Error approving applicant:', error);
      alert('初筛通过失败，请检查后端服务。');
      return;
    }

    // Trigger meeting book panel and open automatically
    alert('恭喜审核通过初筛！请立刻填写见面日期地点或视频验证形式以发起通知。');
    
    // Automatically establish preset active appointment
    const newAppt: Appointment = {
      id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      petId: targetApp.petId,
      petName: targetApp.petName,
      petPhoto: targetApp.petPhoto,
      applicantId: targetApp.applicantId,
      ownerId: currentUser?.id || 'u_me',
      type: '线下见面',
      time: '2026-05-30 14:30',
      location: `中国 ${currentRegion.province} ${currentRegion.city} ${currentRegion.district} 约定某某流浪救助基地/公共商区`,
      notes: '建议约在周末，带去附近宠物医院做个全身血气检查。',
      status: '待对方确认'
    };
    try {
      const apptRes = await axios.post(`${API_BASE}/engagement/appointments`, newAppt);
      setAppointments(prev => [apptRes.data, ...prev]);
    } catch (error) {
      console.error('Error saving appointment:', error);
      setAppointments(prev => [newAppt, ...prev]);
    }

	    // Send a mock message of progress in matching chat
	    const matchChat = await ensureChatForApplication(targetApp);
	    await handleSendMessage(matchChat.id, '恭喜！您的领养考察自检资料已通过初筛。我已经向您发起预约见面单，期待线下和孩子对齐一见咯！');

	    setActiveTab('messages');
	    setSelectedChatId(matchChat.id);
	    setSubView('chat-detail');
	  };

  // Reject Candidate
  const handleRejectApplicant = async (appId: string, reason: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    try {
      const res = await axios.put(
        `${API_BASE}/admin/applications/${appId}`,
        { status: '未通过', rejectReason: reason },
        { headers: { Authorization: 'Bearer mock-token-for-dev' } }
      );
      setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
      setPets(prev => prev.map(p => p.id === targetApp.petId && ['申请处理中', '已预约见面'].includes(p.status)
        ? { ...p, status: '开放申请', adopterId: undefined }
        : p
      ));
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      alert('婉拒申请失败，请检查后端服务。');
      return;
    }

    // Trigger system message
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: '非常遗憾领养申请未录用',
      content: `关于您对“${targetApp.petName}”的申请遗憾未通过初选。原因：${reason}。仍旧非常感激您的公益参与心！`,
      time: '刚才',
      type: 'application',
      read: false
    };
    saveNotification(newNotif);

    alert(`已向申请人发送婉拒通知。理由：${reason}`);
    setSubView(null);
  };

  // Electronic signature consensus - finalize adoption process and spawn feedback tracking scheme
  const handleFinalizeSignature = async (signatureData: string) => {
    setContractSignature(signatureData);

    if (!activeApplicationObject) return;

    try {
      const appRes = await axios.put(
        `${API_BASE}/admin/applications/${activeApplicationObject.id}`,
        {
          status: '待确认领养',
          adopterSignature: signatureData,
          adopterSignedAt: new Date().toISOString()
        },
        { headers: { Authorization: 'Bearer mock-token-for-dev' } }
      );
      setApplications(prev => prev.map(a => a.id === activeApplicationObject.id ? appRes.data : a));
      setPets(prev => prev.map(p => p.id === activeApplicationObject.petId
        ? { ...p, status: '申请处理中', adopterId: activeApplicationObject.applicantId }
        : p
      ));
    } catch (error) {
      console.error('Error finalizing signature:', error);
      alert('签约完成写入后端失败，请检查后端服务。');
      return;
    }

    // System notifications
    const newNotif: NotificationItem = {
      id: `notif_sign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '领养协议已签署，等待平台终审',
      content: `您与【${activeApplicationObject.applicantNickname}】关于《${activeApplicationObject.petName}》的领养协议已提交。后台管理者最终核准后，领养才会正式生效并生成定期打卡任务。`,
      time: '刚才',
      type: 'feedback',
      read: false
    };
    saveNotification(newNotif);

    alert('领养协议已提交，正在等待后台管理者最终核准。后台通过后才会正式领养并生成定期回访任务。');
    setSubView('my-applications');
  };

  // Submit actual Feedback check in node
  const handlePostNodeFeedback = async (planId: string, nodeId: string, submission: FeedbackSubmission) => {
    const targetPlan = feedbackPlans.find(p => p.id === planId);
    if (!targetPlan) return;

    try {
      const res = await axios.put(`${API_BASE}/feedback/plans/${planId}/nodes/${nodeId}`, submission);
      setFeedbackPlans(prev => prev.map(plan => plan.id === planId ? res.data : plan));
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('回访打卡写入后端失败，请稍后再试。');
      return;
    }

    const newNotif: NotificationItem = {
      id: `notif_fb_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '收到领养后成长状况汇报',
      content: `领养人针对【${targetPlan.petName}】提交了【${nodeId === 'day7' ? '第七天' : '第三十天'}】的新家适应打卡。内含照片、饱食等情绪度，请前往查看批注。`,
      time: '刚才',
      type: 'feedback',
      read: false
    };
    saveNotification(newNotif);
  };

  // Publisher reviews and write feedback notes
  const handleOwnerReplyFeedback = async (planId: string, nodeId: string, verdict: '正常' | '有异常', msg: string) => {
    const targetPlan = feedbackPlans.find(p => p.id === planId);
    const targetNode = targetPlan?.nodes.find(node => node.nodeId === nodeId);
    if (!targetPlan || !targetNode?.submission) return;

    const updatedSubmission: FeedbackSubmission = {
      ...targetNode.submission,
      ownerResponse: {
        status: verdict === '正常' ? '正常' : '有异常',
        msg,
        repliedAt: new Date().toISOString()
      }
    };

    try {
      const res = await axios.put(`${API_BASE}/feedback/plans/${planId}/nodes/${nodeId}`, updatedSubmission);
      setFeedbackPlans(prev => prev.map(plan => plan.id === planId ? res.data : plan));
    } catch (error) {
      console.error('Error replying feedback:', error);
      alert('回访批注写入后端失败，请稍后再试。');
      return;
    }

    /*
    setFeedbackPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          nodes: plan.nodes.map(node => {
            if (node.nodeId === nodeId && node.submission) {
              return {
                ...node,
                submission: {
                  ...node.submission,
                  ownerResponse: {
                    status: verdict === '正常' ? '正常' : '有异常',
                    msg,
                    repliedAt: new Date().toISOString()
                  }
                }
              };
            }
            return node;
          })
        };
      }
      return plan;
    }));
    */
  };

  // Shortcut state jumper to simulate all 34 prototyped sheets listed in the specification!
  const jumpToScreen = (screenName: string) => {
    // Break subviews
    setSubView(null);
    setSelectedPetId(null);
    setSelectedApplicationId(null);
    setSelectedChatId(null);
    setSelectedFeedbackPlanId(null);
    setShowGlobalRegionPicker(false);
    setShowSuccessStoryId(null);

    switch(screenName) {
      case '1. 启动说明页':
        setCurrentUser(null);
        setSubView('launch-intro');
        break;
      case '2. 手机注册页':
        setCurrentUser(null);
        setSubView('register');
        break;
      case '3. 手机校验码登记':
        setCurrentUser(null);
        setSubView('register'); // Handles countdown with timer
        break;
      case '4. 密码登录页':
        setCurrentUser(null);
        setSubView('login');
        break;
      case '5. 首页核心看板':
        setActiveTab('home');
        break;
      case '6. 中国行政区选择':
        setActiveTab('home');
        setShowGlobalRegionPicker(true);
        break;
      case '7. 流浪成功故事':
        setActiveTab('home');
        setShowSuccessStoryId('story1');
        break;
      case '8. 发现宠物分栏':
        setActiveTab('discover');
        setFilterType('all');
        break;
      case '9. 专项高级筛选':
        setActiveTab('discover');
        setShowFilterModal(true);
        break;
      case '10. 宠物详情卡(柯基雪莉)':
        setSelectedPetId('p_4');
        setSubView('pet-detail');
        break;
      case '11. 线上领养申请表':
        setSelectedPetId('p_1'); // 奶茶
        setSubView('apply-form');
         break;
      case '12. 申请递交成功页':
        setSelectedPetId('p_1');
        setSubView('apply-success');
        break;
      case '13. 发布类型确认':
        setActiveTab('publish');
        break;
      case '14. 信息发布中...':
        // Simulates completed publishwizard in step 3
        setActiveTab('publish');
        break;
      case '15. 流浪审核提示':
        // Pending state
        setActiveTab('publish');
        break;
      case '16. 自主发布管理':
        setActiveTab('mine');
        setSubView('my-publish-list');
        break;
      case '17. 流转候选列表':
        setSelectedPetId('p_4');
        setSubView('applicant-list');
        break;
      case '18. 精细档案考查专区':
        setSelectedApplicationId('a_1');
        setSubView('applicant-detail');
        break;
      case '19. 在线即时通讯(Chat)':
        setSelectedChatId('c_1');
        setSubView('chat-detail');
        break;
      case '20. 会见约见发布表':
        setSelectedChatId('c_1');
        setSubView('chat-detail');
        break;
      case '21. 双向领养协议':
        setSelectedApplicationId('a_1');
        setSubView('contract-signing');
        break;
      case '22. 我的领养橱窗':
        setActiveTab('mine');
        setSubView('my-applications');
        break;
      case '23. 回访跟踪计划':
        setSelectedFeedbackPlanId('fb_1'); // 布丁
        setSubView('feedback-plan');
        break;
      case '24. 定期汇报阶段呈批':
        setSelectedFeedbackPlanId('fb_1'); // 布丁
        setSubView('feedback-plan'); // user clicks Day 7 to submit feedback
        break;
      case '25. 状态异常帮助/拉黑':
        setActiveTab('mine');
        setSubView('help-report');
        break;
      default:
        setActiveTab('home');
    }
  };

  // Filter computation
  const filteredPets = pets.filter(p => {
    if (p.status === '审核中' || p.status === '已下架') return false;

    // 1. Region recommendation logic
    const matchesRegion = p.province === currentRegion.province && p.city === currentRegion.city;
    if (!matchesRegion) return false;

    // 2. Tab filter
    if (filterType !== 'all' && p.type !== filterType) return false;

    // 3. Age filter
    if (filterAge !== 'all') {
      if (filterAge === 'young' && !p.age.includes('个月')) return false;
      if (filterAge === 'adult' && p.age.includes('个月')) return false;
    }

    // 5. Gender filter
    if (filterGender !== 'all' && p.gender !== filterGender) return false;

    // 6. Sterilized
    if (filterSterilized !== null && p.health?.sterilized !== filterSterilized) return false;

    // 7. Vaccinated
    if (filterVaccinated !== null && p.health?.vaccinated !== filterVaccinated) return false;

    // 8. Custom habits
    if (filterSpecialTrait !== 'all') {
      if (filterSpecialTrait === 'friendly' && p.traits?.friendly !== true) return false;
      if (filterSpecialTrait === 'apartment' && p.traits?.apartmentFriendly !== true) return false;
      if (filterSpecialTrait === 'potty' && p.traits?.houseTrained !== true) return false;
    }

	    return true;
	  });

  const overlaySubViews = new Set([
    'register', 'login', 'forgot', 'launch-intro', 'pet-detail', 'apply-form', 'apply-success',
    'my-publish-list', 'applicant-list', 'applicant-detail', 'chat-detail', 'contract-signing',
    'feedback-plan', 'help-report', 'settings', 'notification-center'
  ]);

	  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-4" id="app-viewport">
      
      {/* CENTER MOBILE PHONE EMULATOR (Phone Hardware Mockup Frame) */}
      <div className="bg-slate-950 flex items-center justify-center">
        
        {/* Physical hardware shape */}
        <div className="relative w-[375px] h-[780px] bg-slate-950 rounded-[48px] shadow-2xl border-[10px] border-slate-800 flex flex-col overflow-hidden ring-4 ring-slate-850">
          
          {/* Dynamic Island Camera Notch */}
          <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-50 flex items-center justify-between px-3.5">
            <div className="w-2.5 h-2.5 bg-indigo-950 rounded-full border border-slate-900 shrink-0"></div>
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full shrink-0"></div>
          </div>

          {/* Virtual Top iOS Style Status Bar */}
          <div className="bg-white text-slate-900 px-6 pt-3.5 pb-1 flex justify-between items-center text-[10px] font-bold select-none shrink-0 z-40">
            <span className="font-mono">{simulatedTime}</span>
          </div>

          {/* Active Screens router inside viewport */}
          <div className="flex-1 bg-white text-slate-900 overflow-hidden flex flex-col relative">
            <AnimatePresence mode="wait">
              
              {/* Overlay Modal Cascade Screens Router */}
	              {subView && subView !== 'my-applications' && overlaySubViews.has(subView) ? (
                <div className="absolute inset-0 bg-white z-40 flex flex-col">
                  
                  {/* Register Views (Register, Login, Forgot) */}
                  {(subView === 'register' || subView === 'login' || subView === 'forgot') && (
                    <RegisterForm
                      viewMode={subView as 'register' | 'login' | 'forgot'}
                      onViewChange={(mode: string) => setSubView(mode)}
                      onSuccess={async (prof: UserProfile) => {
                        if (prof.id === 'login_attempt') {
                          // Login Logic
                          const existingUser = users.find(u => u.phone === prof.phone);
                          if (existingUser) {
                            setCurrentUser(existingUser);
                            localStorage.setItem('currentUser', JSON.stringify(existingUser));
                            localStorage.removeItem('hasLoggedOut');
                            setSubView(null);
                            alert(`登录成功！欢迎您，${existingUser.nickname}`);
                          } else {
                            // User not found
                            const wantRegister = window.confirm(`此电话号码【${prof.phone}】并未注册，需要注册吗？`);
                            if (wantRegister) {
                              setSubView('register');
                            } else {
                              // Force stay on login page if they cancel
                              setSubView('login');
                            }
                          }
                          return;
                        }

                        // Registration Logic
                        try {
                          const res = await axios.post(`${API_BASE}/users`, prof);
                          const savedUser = res.data;
                          setCurrentUser(savedUser);
                          localStorage.setItem('currentUser', JSON.stringify(savedUser));
                          localStorage.removeItem('hasLoggedOut');
                          setUsers(prev => [...prev, savedUser]);
                          setSubView(null);
                          alert(`注册并登录成功！欢迎您，${savedUser.nickname}`);
                        } catch (error) {
                          console.error('Registration failed:', error);
                          alert('注册失败，请稍后再试');
                        }
                      }}
                    />
                  )}

                  {/* Launch Introductory guide page */}
                  {subView === 'launch-intro' && (
                    <div className="flex flex-col flex-1 bg-slate-900 text-white p-6 justify-between text-center select-none">
                      <div className="my-auto space-y-4">
                        <span className="text-6xl animate-bounce">📦</span>
                        <h2 className="text-xl font-extrabold text-rose-400">流浪猫狗公益领养计划</h2>
                        <p className="text-xs text-slate-400 leading-relaxed text-balance">
                          让每一只街角颤抖的毛孩子，重新在家庭温情中打滚。平台默认要求实名手机注册验证，全业务绝对零费用承诺，拒绝不当买卖交易！
                        </p>
                        <div className="bg-slate-800/80 border border-slate-700/80 text-left p-3.5 rounded-xl text-[10px] space-y-1">
                          <strong className="block text-rose-400 text-xs mb-1">🐾 MVP第一期专享核心规则：</strong>
                          <div>· 不设特定身份划分：每个注册账号都平等拥有送养和领养权。</div>
                          <div>· 全国联动精准检索：自如筛选幼龄/成龄及是否绝育。</div>
                          <div>· 双胞合意线上盖章：签署具备实名记录防弃养领养协议书。</div>
                          <div>· 计划到期打卡通知：第7/30/180天到期微信及时警示。</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSubView('register')}
                        className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold text-xs"
                      >
                        立刻通过手机号码注册账户
                      </button>
                    </div>
                  )}

                  {/* Success story detail mockup modal view */}
                  {showSuccessStoryId && (
                    <div className="flex flex-col flex-1 bg-white overflow-y-auto">
                      <div className="relative h-48 bg-slate-100">
                        <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" alt="adopted" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setShowSuccessStoryId(null)}
                          className="absolute top-3 left-3 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
                        <h2 className="text-base font-black text-slate-900">“豆豆”已经找到温暖新家啦！</h2>
                        <p className="text-[10px] text-slate-400">领养家长：大白铲屎官 · 回访标记：正常打卡 Day 30</p>
                        <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-800 italic">
                          “豆豆它现在完全适应了新家的主卧，每天一早就会跑来床头用小爪垫疯狂蹭人，吃饭超级香，真的感谢送养平台让我们相遇！”
                        </div>
                        <p>
                          当初豆豆在白云区的小巷中被饿得浑身脏兮兮的，甚至伴有轻微的皮肤泛红，幸得志愿者送养人用心地在平台发布了招请。经过两周的线上信息核对与线下咖啡馆汇合见面，我们和前主人愉悦地敲定了无商领养协议并录入了指印。
                        </p>
                        <p>
                          现在我们已经完成了7天适应性反馈和30天长期反馈，原送养主人张阿姨在我的反馈下面留下了开心点赞！每一次打卡其实不仅是对张阿姨的一份嘱托和安心，也是我们科学养宠生活的一步成长契机。
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pet Detail Screen */}
                  {selectedPetId && subView === 'pet-detail' && activePetObject && (
                    <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto pb-14 text-xs">
                      <div className="relative h-52 bg-slate-100 z-10 shrink-0">
                        {activePetObject.photos && activePetObject.photos.length > 0 && (
                          <img src={activePetObject.photos[0]} alt="pet detail photo" className="w-full h-full object-cover" />
                        )}
                        {/* Status label */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                          <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {activePetObject.status}
                          </span>
                          <span className="bg-slate-900/60 text-white text-[9px] font-mono px-2 py-0.5 rounded-full">
                            👀 {activePetObject.views} 人看过
                          </span>
                        </div>
                        {/* Return back button */}
                        <button
                          onClick={() => { setSubView(null); setSelectedPetId(null); }}
                          className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black text-white p-1 rounded-full border border-white/20 active:scale-95"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Detail Details panel */}
                      <div className="p-4 flex flex-col gap-3.5 relative z-10">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-slate-800">{activePetObject.name}</h2>
                                <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-1.5 rounded">{activePetObject.breed}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                发布于：{activePetObject.createdAt} &middot; 发布人：{activePetObject.ownerNickname}
                              </p>
                            </div>
                            <span className="text-rose-500 font-bold text-sm bg-rose-50/50 p-2 rounded-lg">{activePetObject.gender} · {activePetObject.age}</span>
                          </div>
                        </div>

                        {/* Health profile details */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-2">🐾 健康体检信息一览：</h3>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
                            <div className="flex items-center gap-1">
                              <span>已打全套必选疫苗:</span>
                              <span className={activePetObject?.health?.vaccinated ? 'text-emerald-550 font-bold' : 'text-slate-400'}>
                                {activePetObject?.health?.vaccinated ? '✅ 已接种' : '❌ 未接种'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>已在同城完成绝育:</span>
                              <span className={activePetObject?.health?.sterilized ? 'text-emerald-555 font-bold' : 'text-slate-400'}>
                                {activePetObject?.health?.sterilized ? '✅ 已进行' : '❌ 未绝育'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>周期驱虫有疫苗本:</span>
                              <span className={activePetObject?.health?.dewormed ? 'text-emerald-550' : 'text-slate-400'}>
                                {activePetObject?.health?.dewormed ? '✅ 已完成' : '❌ 未驱虫'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>包含芯片/有医疗本:</span>
                              <span className={activePetObject?.health?.hasCertificates ? 'text-emerald-550 font-medium' : 'text-slate-400'}>
                                {activePetObject?.health?.hasCertificates ? '✅ 疫苗本健全' : '❌ 暂无'}
                              </span>
                            </div>
                          </div>
                          {activePetObject?.health?.hasMedicalHistory && (
                            <div className="bg-amber-50 rounded border border-amber-200 p-2.5 m-2.5 mb-0 text-[10px] text-amber-800 leading-normal">
                              ⚠️ <strong>以往病史：</strong>{activePetObject?.health?.medicalHistoryDesc}
                            </div>
                          )}
                        </div>

                        {/* Description and traits traits list */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <h3 className="font-bold text-slate-805 mb-1.5 text-rose-500">🌟 脾气与习惯特征：</h3>
                          <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {activePetObject.desc}
                          </p>
                        </div>

                        {/* Sending away reason */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                          <h3 className="font-bold text-slate-800 mb-1">🎁 送养原因说明：</h3>
                          <p className="text-slate-650 leading-relaxed">{activePetObject.reason}</p>
                        </div>

                        {/* Adoption Criteria Hard conditions */}
                        <div className="bg-indigo-50 border border-indigo-250 rounded-xl p-3.5 text-xs text-indigo-950 font-medium">
                          <h3 className="font-bold text-indigo-800 mb-1.5 flex items-center gap-1">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            硬性领养人要求：
                          </h3>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {activePetObject.requirements}
                          </p>
                        </div>

                        {/* Publisher profile info card without phone number privacy disclosure */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3 leading-relaxed">
                          <div className="flex items-center justify-between border-b pb-2 mb-2">
                            <span className="font-bold text-[11px] text-slate-400 uppercase tracking-widest">送养家长：</span>
                            <span className="text-[10px] text-slate-400 font-mono">平台绿徽章义工</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-750">
                              {activePetObject.ownerNickname[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{activePetObject.ownerNickname}</div>
                              <div className="text-[9px] text-slate-400">历史发布：2只流浪儿 · 平台回复率：100%</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floor action fixed panel for Pet Detail */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2.5 flex items-center gap-3 z-30 shadow-md shrink-0 select-none">
                        <button 
                          onClick={() => toggleFavorite(activePetObject.id)}
                          type="button" 
                          className="flex flex-col items-center shrink-0 pr-1 hover:text-red-500"
                        >
                          <Heart className={`w-5 h-5 transition-colors ${favoritePetIds.includes(activePetObject.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                          <span className="text-[10px] mt-0.5 text-slate-500">
                            {favoritePetIds.includes(activePetObject.id) ? '已收藏' : '收藏'}
                          </span>
                        </button>

                        <button
                          onClick={async () => {
                            if (!currentUser) {
                              alert('请先登录后再联系送养家长！');
                              setSubView('login');
                              return;
                            }
                            const chat = await ensureChatSession({
                              petId: activePetObject.id,
                              petName: activePetObject.name,
                              petPhoto: activePetObject.photos[0],
                              adopterId: currentUser.id,
                              adopterNickname: currentUser.nickname,
                              ownerId: activePetObject.ownerId,
                              ownerNickname: activePetObject.ownerNickname,
                              messages: [
                                { id: `m_init_${Date.now()}`, senderId: currentUser.id, text: `您好，我对您发布的${activePetObject.name}特别感兴趣，可以向您多了解一下吗？`, createdAt: new Date().toISOString(), type: 'text' }
                              ],
                              lastMessageText: '您好，我对您选拔的小动物格外感兴趣...',
                              lastMessageTime: '刚刚',
                              unreadCount: 0
                            });
                            setSelectedChatId(chat.id);
                            setSubView('chat-detail');
                          }}
                          className="flex-[1] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl py-2.5 font-bold text-xs text-slate-700 active:scale-95 transition-all text-center"
                        >
                          在线联系送养家长
                        </button>

                        <button
                          onClick={() => {
                            if (currentUser?.id === activePetObject.ownerId) {
                              alert('这是您自己发布的宠物，不能提交领养申请。');
                              return;
                            }
                            if (!isPetOpenForApplication(activePetObject)) {
                              alert('该宠物当前不在开放申请状态，无法填写申请表。');
                              return;
                            }
                            if (currentUser && applications.some(app => app.petId === activePetObject.id && app.applicantId === currentUser.id && app.status !== '已取消')) {
                              alert('您已经提交过这只宠物的领养申请，请到“我的领养申请”查看进度。');
                              return;
                            }
                            setSubView('apply-form');
                          }}
                          className={`flex-[1.5] py-2.5 rounded-xl font-bold text-xs text-white text-center active:scale-95 transition-all shadow-md ${
                            currentUser?.id === activePetObject.ownerId || !isPetOpenForApplication(activePetObject)
                              ? 'bg-slate-300 text-slate-400 cursor-not-allowed shadow-none'
                              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/15'
                          }`}
                        >
                          {currentUser?.id === activePetObject.ownerId ? '自己发布不可申请' : '填表申请领养这只'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Adoption Form Step view */}
                  {selectedPetId && subView === 'apply-form' && activePetObject && (
                    <div className="flex flex-col flex-1 bg-white overflow-y-auto pb-14 text-xs select-none">
                      <div className="bg-slate-100 p-3 flex justify-between items-center shrink-0 border-b border-slate-200">
                        <button onClick={() => setSubView('pet-detail')} className="text-slate-500 font-bold">返回退出</button>
                        <span className="font-bold text-xs text-slate-800">流浪科学爱心领养申请书</span>
                        <div className="w-12"></div>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); handleCreateApplication(activePetObject.id); }} className="p-4 flex flex-col gap-3.5">
                        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded p-3 leading-normal text-[10px]">
                          <strong>亲爱的领养申请候选人：</strong>
                          本表将作为送养人张阿姨等对您住房、家人知情情况评估的严肃材料。请务必诚实填报。
                        </div>

                        {/* Preset identity parameters */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 block">自动代入您的实名档案</span>
                          <div className="flex justify-between">
                            <span className="text-slate-500">申请人昵称：</span>
                            <span className="font-bold text-slate-700">{currentUser?.nickname}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">手机号码：</span>
                            <span className="font-bold text-slate-700">{currentUser?.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">历史经验：</span>
                            <span className="font-bold text-indigo-600">{currentUser?.hasPetExperience ? '有科学养猫犬经验' : '新手无经验'}</span>
                          </div>
                        </div>

                        {/* Living environment selectors */}
                        <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-700">目前您新家的住房情况？<span className="text-rose-500">*</span></span>
                          <div className="grid grid-cols-2 gap-2 pt-1 font-bold">
                            {['自有住房', '整套租房', '合租同住', '学生宿舍'].map((choice) => (
                              <button
                                key={choice}
                                type="button"
                                onClick={() => setAppFormLiveCondition(choice)}
                                className={`py-1 rounded text-[10px] border transition-all ${
                                  appFormLiveCondition === choice ? 'bg-rose-500 border-rose-500 text-white shadow' : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Roommates / family agree */}
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-705">家人或舍友是否100%全员支持？</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setAppFormRoommates(true)}
                              className={`px-3 py-1 rounded text-[10px] font-bold ${appFormRoommates ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                            >
                              完全支持
                            </button>
                            <button
                              type="button"
                              onClick={() => setAppFormRoommates(false)}
                              className={`px-3 py-1 rounded text-[10px] font-bold ${!appFormRoommates ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                            >
                              未沟通妥
                            </button>
                          </div>
                        </div>

                        {/* motivation textbox */}
                        <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-700">为什么想领养 {activePetObject.name}？有流浪看护计划吗？</span>
                          <textarea
                            value={appFormMotivation}
                            onChange={(e) => setAppFormMotivation(e.target.value)}
                            rows={3}
                            placeholder="写下几句温厚的想法，这能极大缩短原主人挑选时间..."
                            className="bg-white border text-xs p-2.5 rounded leading-relaxed text-slate-850 focus:outline-none"
                          />
                        </div>

                        {/* Promises check */}
                        <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={appFormPromise}
                            onChange={() => setAppFormPromise(!appFormPromise)}
                            className="w-4 h-4 text-rose-500 mt-0.5 border-slate-300 rounded focus:ring-rose-500"
                          />
                          <span className="text-[10px] text-slate-500 leading-normal">
                            我郑重承诺：<strong>决不因怀孕、生子、搬家抛弃</strong>{activePetObject.name}。接受按期在我的领养处提交生活照片反馈。自愿接受如有违规拉黑处置。
                          </span>
                        </label>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={!appFormPromise}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                            appFormPromise 
                              ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          确认无误，递交领养考察表
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Success applicant form modal */}
                  {subView === 'apply-success' && (
                    <div className="flex flex-col flex-1 bg-white items-center justify-center p-6 text-center select-none">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-4 shadow-sm">
                        🌸
                      </div>
                      <h2 className="text-base font-black text-slate-800">您的爱心领养申请资料已递交成功！</h2>
                      <p className="text-xs text-slate-400 mt-2.5 leading-relaxed text-balance">
                        该内容已被平台密送给送养人。对方查阅通过初筛后，将立刻在<strong>消息/Chat</strong> 中发起对话并向您预约双向见面核准行程，敬请随时看护通知。
                      </p>
                      <button
                        onClick={() => { setSubView(null); setSelectedPetId(null); setActiveTab('messages'); }}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs mt-6 transition-all shadow"
                      >
                        立刻去收件箱看最新信鸽
                      </button>
                    </div>
                  )}

                  {/* My publishing listings dashboard view */}
                  {subView === 'my-publish-list' && (
                    <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto">
                      <div className="bg-white p-3 flex justify-between items-center shrink-0 border-b relative z-10">
                        <button onClick={() => setSubView(null)} className="text-slate-500 font-bold text-xs">返回</button>
                        <span className="font-bold text-xs text-slate-800">我发布的宠物在刊看板</span>
                        <div className="w-8"></div>
                      </div>

                      <div className="p-4 flex flex-col gap-3 text-xs leading-relaxed">
                        {pets.filter(p => p.ownerId === currentUser?.id).length === 0 ? (
                          <div className="p-12 text-center text-slate-400">目前暂无您的送养发布。</div>
                        ) : (
                          pets.filter(p => p.ownerId === currentUser?.id).map(pet => {
                            const matchCount = applications.filter(a => a.petId === pet.id).length;
                            const petFeedbackPlans = currentUserOwnedFeedbackPlans.filter(plan => plan.petId === pet.id);
                            const pendingReplyCount = petFeedbackPlans.reduce((count, plan) => (
                              count + plan.nodes.filter(node => node.status === '已提交' && !node.submission?.ownerResponse).length
                            ), 0);
                            const nextSubmittedPlan = petFeedbackPlans.find(plan =>
                              plan.nodes.some(node => node.status === '已提交' && !node.submission?.ownerResponse)
                            ) || petFeedbackPlans[0];
                            return (
                              <div key={pet.id} className="bg-white border rounded-xl overflow-hidden p-3 flex gap-3 relative justify-between items-center">
                                <div className="flex gap-2.5">
                                  <img src={pet.photos[0]} alt="pet thumbnail" className="w-12 h-12 rounded object-cover" />
                                  <div>
                                    <h4 className="font-bold text-slate-800">{pet.name} ({pet.breed})</h4>
                                    <p className="text-[10px] text-slate-400">类型：{pet.type === 'cat' ? '猫' : '狗'} &middot; 当前状态：{pet.status}</p>
                                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 rounded mt-1.5 inline-block">
                                      📬 已经有 {matchCount} 人申请领养
                                    </span>
                                    {petFeedbackPlans.length > 0 && (
                                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded mt-1.5 ml-1 inline-block">
                                        新家打卡 {petFeedbackPlans.length} 组{pendingReplyCount > 0 ? `，${pendingReplyCount} 条待批注` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    onClick={() => { setSelectedPetId(pet.id); setSubView('applicant-list'); }}
                                    className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded active:scale-95 transition-all text-center"
                                  >
                                    查看申请人
                                  </button>
                                  <button
                                    onClick={() => { setSelectedPetId(pet.id); setSubView('pet-detail'); }}
                                    className="px-2 py-1 bg-slate-150 text-slate-600 font-semibold text-[10px] rounded active:scale-95 text-center"
                                  >
                                    查看详情
                                  </button>
                                  {nextSubmittedPlan && (
                                    <button
                                      onClick={() => { setSelectedFeedbackPlanId(nextSubmittedPlan.id); setSubView('feedback-plan'); }}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded active:scale-95 transition-all text-center"
                                    >
                                      查看新家打卡
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Applicants List Triage Screen */}
                  {selectedPetId && subView === 'applicant-list' && (
                    <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto">
                      <div className="bg-white p-3 flex justify-between items-center shrink-0 border-b">
                        <button onClick={() => setSubView('my-publish-list')} className="text-slate-500 font-bold text-xs">返回</button>
                        <span className="font-bold text-xs text-slate-800">各渠道应征领养家长筛选</span>
                        <div className="w-8"></div>
                      </div>

                      <div className="p-4 flex flex-col gap-3 text-xs leading-relaxed">
                        <div className="bg-rose-50 border border-rose-100 p-2 text-[10px] text-rose-700 rounded-lg">
                          这里是您发布的宠物【{pets.find(p => p.id === selectedPetId)?.name || '小可爱'}】收到的全部领养表单列表。请点选审查。
                        </div>

                        {applications.filter(a => a.petId === selectedPetId).length === 0 ? (
                          <div className="p-12 text-center text-slate-400">该宠物暂无应征申请。</div>
                        ) : (
                          applications.filter(a => a.petId === selectedPetId).map(app => (
                            <div key={app.id} className="bg-white border rounded-xl p-3 flex justify-between items-center">
                              <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{app.applicantNickname}</span>
                                  <span className={`text-[8px] px-1 rounded ${
                                    app.status === '已提交' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                  }`}>{app.status}</span>
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  状况：{app.details.livingCondition} &middot; 经验：{app.details.hasPetExperience ? '有经验' : '新手'}
                                </p>
                              </div>
                              <button
                                onClick={() => { setSelectedApplicationId(app.id); setSubView('applicant-detail'); }}
                                className="px-3 py-1 bg-rose-500 text-white font-bold text-[10px] rounded active:scale-95"
                              >
                                审查资料
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Applicant elaborate Dossier Card screen */}
                  {selectedApplicationId && subView === 'applicant-detail' && activeApplicationObject && (
                    <ApplicantDetailCard
                      application={activeApplicationObject}
                      onApprove={(id) => handleApproveApplicant(id)}
                      onReject={(id, r) => handleRejectApplicant(id, r)}
                      onStartChat={async () => {
                        const chat = await ensureChatForApplication(activeApplicationObject);
                        setSelectedChatId(chat.id);
                        setSubView('chat-detail');
                      }}
                      onClose={() => setSubView('my-publish-list')}
                    />
                  )}

                  {/* Active Chat Detail Screen Overlay */}
                  {selectedChatId && subView === 'chat-detail' && activeChatObject && (
                    <ChatWindow
                      session={activeChatObject}
                      currentUserId={currentUser?.id || 'u_me'}
                      onSendMessage={(sid, text) => handleSendMessage(sid, text)}
                      activeAppointment={appointments.find(a => a.petId === activeChatObject.petId && (a.applicantId === activeChatObject.adopterId || a.ownerId === activeChatObject.ownerId))}
                      onBookAppointment={async (appt) => {
                        try {
                          const res = await axios.post(`${API_BASE}/engagement/appointments`, appt);
                          setAppointments(prev => [res.data, ...prev]);
                          alert('会面预约发送成功！');
                        } catch (error) {
                          console.error('Error booking appointment:', error);
                          alert('会面预约写入后端失败，请稍后再试。');
                        }
                      }}
                      onApproveAppointment={async (id) => {
                        try {
                          const res = await axios.put(`${API_BASE}/engagement/appointments/${id}`, { status: '已确认' });
                          setAppointments(prev => prev.map(a => a.id === id ? res.data : a));
                        } catch (error) {
                          console.error('Error approving appointment:', error);
                          alert('确认预约写入后端失败，请稍后再试。');
                          return;
                        }

                        // Change pet state to "已预约见面"
                        try {
                          await axios.put(`${API_BASE}/pets/${activeChatObject.petId}`, { status: '已预约见面' }, {
                            headers: { Authorization: 'Bearer mock-token-for-dev' }
                          });
                        } catch (error) {
                          console.error('Error updating pet after appointment approval:', error);
                        }
                        setPets(prev => prev.map(p => {
                          if (p.id === activeChatObject.petId) {
                            return { ...p, status: '已预约见面' };
                          }
                          return p;
                        }));
                      }}
                      onClose={() => setSubView(null)}
                    />
                  )}

                  {/* Contract double Signing consent screens */}
                  {selectedApplicationId && subView === 'contract-signing' && activeApplicationObject && (
                    <div className="flex flex-col flex-1 bg-white overflow-y-auto pb-14 text-xs select-none">
                      <div className="bg-slate-100 p-3 flex justify-between items-center shrink-0 border-b">
                        <button onClick={() => setSubView('my-applications')} className="text-slate-500 font-bold text-xs">退出签署</button>
                        <span className="font-bold text-xs text-slate-800">全国非商爱心领养协议书</span>
                        <div className="w-8"></div>
                      </div>

                      <div className="p-4 flex flex-col gap-4">
                        <div className="border border-slate-200 bg-slate-50 rounded p-3 h-48 overflow-y-auto leading-relaxed text-[11px] text-slate-600 space-y-2">
                          <h4 className="font-black text-center text-slate-800 border-b pb-1">全国流浪猫狗民间非商业领养与定期打卡回访协议条款书</h4>
                          <p><strong>第一条 核心合意目的：</strong>送养人承诺以真实公益心态将受托动物交付，不以此谋取财产利益；领养人承诺以科学方法陪伴终身。</p>
                          <p><strong>第二条 日常防弃养限制条约：</strong>领养人绝对不得以搬家、成婚、怀产等由，擅自随意丢弃、变卖或群群退货。绝不允许任何形式的不人道虐待。</p>
                          <p><strong>第三条 平台联合打卡监督：</strong>系统在第 <strong>7天（适应期）、30天（融合期）、90天（防变故期）、185天（稳定期）</strong> 触发自动微信打卡随访节点。领养人负有按期上传动物近期图文、眼神、精神状态进行申报反馈的民事法律义务。不服从随访将被冻结账号公示。</p>
                          <p>如有争议，双方同意首先向平台志愿者申请调解或启动二次发布协助方案。</p>
                        </div>

                        {/* Interactive Digital sign pen-stroke board */}
                        <DigitalSignature
                          defaultName={currentUser?.nickname}
                          onSignComplete={(signedImgOrText) => {
                            handleFinalizeSignature(signedImgOrText);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Feedback Manager periodic tracker board Overlay modal */}
                  {selectedFeedbackPlanId && subView === 'feedback-plan' && activeFeedbackPlanObject && (
                    <FeedbackManager
                      plan={activeFeedbackPlanObject}
                      currentUserId={currentUser?.id || 'u_me'}
                      onPostFeedback={(pid, nid, sub) => handlePostNodeFeedback(pid, nid, sub)}
                      onOwnerReply={(pid, nid, dec, msg) => handleOwnerReplyFeedback(pid, nid, dec, msg)}
                      onClose={() => setSubView(null)}
                    />
                  )}

                  {/* Help Violations report panel */}
                  {subView === 'help-report' && (
                    <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto text-xs p-4 gap-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <button onClick={() => setSubView(null)} className="text-slate-500 font-bold block">←</button>
                        <span className="font-bold text-slate-800 text-xs">违规、虚假宠物商业举报站</span>
                        <div className="w-4"></div>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 block mb-1">点选举报违规事由来由</span>
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="bg-white border rounded p-2 text-xs text-slate-700 w-full"
                        >
                          <option value="疑似宠物商家买卖虚假包装流浪">疑似宠物商家买卖虚假包装流浪</option>
                          <option value="要求提前打款支付昂贵空运费用流落诈骗">要求提前打款支付昂贵空运费用流落诈骗</option>
                          <option value="宠物信息失实病史不符严重欺骗">宠物信息失实病史不符严重欺骗</option>
                          <option value="骚扰、辱骂或者拉客营销广告">骚扰、辱骂或者拉客营销广告</option>
                        </select>
                      </div>

                      <div>
                        <span className="font-bold text-slate-755 block mb-1">在此详尽写下事情经过及证据（15字以上）</span>
                        <textarea
                          placeholder="写明聊天中对方向您预索定金的截图证据等，平台将迅速介入核封拉黑拉闸！"
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          className="bg-white border p-2 text-xs rounded leading-relaxed text-slate-850 w-full h-24 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (reportText.length < 15) {
                            alert('请输入至少 15 字以上的补充证据叙说！');
                            return;
                          }
                          try {
                            await axios.post(`${API_BASE}/engagement/reports`, {
                              reason: reportReason,
                              text: reportText,
                              reporterId: currentUser?.id || 'guest',
                              reporterNickname: currentUser?.nickname || '游客'
                            });
                          } catch (error) {
                            console.error('Error submitting report:', error);
                            alert('举报材料写入后端失败，请稍后再试。');
                            return;
                          }
                          alert('您的公益举报材料已安全上传！平台审核小组将在 1 个工作日内约谈被举报人并做销号处置。');
                          setReportText('');
                          setSubView(null);
                        }}
                        className="w-full bg-rose-500 py-2 rounded-xl text-white font-bold hover:bg-rose-600 cursor-pointer text-center"
                      >
                        提交公益举报投诉
                      </button>
                    </div>
                  )}

                  {/* Settings Page details */}
                  {subView === 'settings' && (
                    <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto p-4 text-xs gap-4 leading-relaxed">
                      <div className="flex justify-between items-center border-b pb-2">
                        <button onClick={() => setSubView(null)} className="text-slate-500 font-bold text-xs">返回</button>
                        <span className="font-bold text-slate-800 text-xs text-center">个人资料设置</span>
                        <div className="w-8"></div>
                      </div>

                      <div className="bg-white rounded-xl border p-4 space-y-3">
                        <div>
                          <span className="font-bold text-slate-600 block mb-1">昵称</span>
                          <input
                            value={profileDraft.nickname || ''}
                            onChange={(e) => setProfileDraft(prev => ({ ...prev, nickname: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="请输入昵称"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-600 block mb-1">手机号</span>
                          <input
                            value={profileDraft.phone || ''}
                            onChange={(e) => setProfileDraft(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                            className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="11 位手机号"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-slate-600 block mb-1">所在地区</span>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              value={profileDraft.province || ''}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, province: e.target.value }))}
                              className="border rounded-lg px-2 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              placeholder="省份"
                            />
                            <input
                              value={profileDraft.city || ''}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, city: e.target.value }))}
                              className="border rounded-lg px-2 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              placeholder="城市"
                            />
                            <input
                              value={profileDraft.district || ''}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, district: e.target.value }))}
                              className="border rounded-lg px-2 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              placeholder="区县"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-bold text-slate-600 block mb-1">年龄段</span>
                            <select
                              value={profileDraft.ageGroup || ''}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, ageGroup: e.target.value }))}
                              className="w-full border rounded-lg px-2 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            >
                              <option value="">请选择</option>
                              <option value="80后">80后</option>
                              <option value="90后">90后</option>
                              <option value="95后">95后</option>
                              <option value="00后">00后</option>
                              <option value="其他">其他</option>
                            </select>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600 block mb-1">住房情况</span>
                            <select
                              value={profileDraft.livingCondition || ''}
                              onChange={(e) => setProfileDraft(prev => ({ ...prev, livingCondition: e.target.value }))}
                              className="w-full border rounded-lg px-2 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            >
                              <option value="">请选择</option>
                              <option value="自有住房">自有住房</option>
                              <option value="租房">租房</option>
                              <option value="合租">合租</option>
                              <option value="宿舍">宿舍</option>
                              <option value="与家人同住">与家人同住</option>
                              <option value="其他">其他</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-slate-600 block mb-1">职业</span>
                          <input
                            value={profileDraft.occupation || ''}
                            onChange={(e) => setProfileDraft(prev => ({ ...prev, occupation: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="请输入职业"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ['hasPetExperience', '有养宠经验'],
                            ['hasStableHome', '居住稳定'],
                            ['withFamily', '与家人同住'],
                            ['familyAgree', '家人同意']
                          ].map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setProfileDraft(prev => ({ ...prev, [key]: !prev[key as keyof UserProfile] }))}
                              className={`rounded-lg border px-3 py-2 text-left font-bold ${profileDraft[key as keyof UserProfile] ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                            >
                              {profileDraft[key as keyof UserProfile] ? '已确认 ' : '未确认 '}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleSaveProfile}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-lg text-center"
                      >
                        保存个人资料
                      </button>

                      {currentUser && (
                        <button
                          onClick={() => {
                            setCurrentUser(null);
                            localStorage.removeItem('currentUser');
                            localStorage.setItem('hasLoggedOut', 'true');
                            setSubView('login');
                            alert('您已退出当前账号。');
                          }}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg text-center"
                        >
                          退出登录
                        </button>
                      )}
                    </div>
                  )}

                </div>
              ) : null}

              {/* TABS FOOTER SCREEN (Main Navigation Entryways) */}
              
              {/* Tab 1: HOME PANEL */}
              {activeTab === 'home' && (
                <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto pb-14 text-xs select-none">
                  
                  {/* Top Area Location Selector */}
                  <div className="bg-white px-4 py-3 border-b border-slate-205 flex flex-col gap-2 shrink-0">
                    <div className="flex justify-between items-center text-xs">
                      <button 
                        onClick={() => setShowGlobalRegionPicker(true)}
                        className="flex items-center text-slate-800 font-extrabold gap-0.5 hover:text-rose-500 text-left cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>中国 {currentRegion.province} {currentRegion.city} {currentRegion.district}</span>
                        <span className="text-[9px] text-rose-450 ml-1 font-normal underline hover:no-underline">手动切换</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">流浪动物共建计划</span>
                    </div>

                    {/* Regional cascaderpicker overlay inside view */}
                    {showGlobalRegionPicker && (
                      <div className="absolute inset-0 bg-white z-50 flex flex-col">
                        <RegionSelector
                          initialValue={currentRegion}
                          onSelect={(p, c, d) => {
                            setCurrentRegion({ province: p, city: c, district: d });
                            setShowGlobalRegionPicker(false);
                          }}
                          onClose={() => setShowGlobalRegionPicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Main scrolling sections */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    
                    {/* Classified Area Quick Entries */}
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 px-1">快速分类专区：</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-700">
                        <button
                          onClick={() => { setActiveTab('discover'); setFilterType('cat'); }}
                          className="bg-white border p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm hover:border-rose-400 active:scale-95 transition-transform cursor-pointer"
                        >
                          <span className="text-xl">🐱</span>
                          <span>找猫猫专线</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('discover'); setFilterType('dog'); }}
                          className="bg-white border p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm hover:border-rose-400 active:scale-95 transition-transform"
                        >
                          <span className="text-xl">🐶</span>
                          <span>找狗狗专区</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('discover'); setFilterSpecialTrait('friendly'); }}
                          className="bg-white border p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm hover:border-indigo-400 active:scale-95 transition-transform"
                        >
                          <span className="text-xl">🧸</span>
                          <span>新手友好</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('discover'); setFilterSpecialTrait('apartment'); }}
                          className="bg-white border p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm hover:border-indigo-400 active:scale-95 transition-transform"
                        >
                          <span className="text-xl">🏢</span>
                          <span>适应公寓</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('discover'); setFilterSterilized(true); }}
                          className="bg-white border p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm hover:border-indigo-450 active:scale-95 transition-transform"
                        >
                          <span className="text-xl">✂️</span>
                          <span>已全绝育</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('discover'); setFilterVaccinated(true); }}
                          className="bg-white border p-2 rounded-xl flex flex-col items-center gap-1 shadow-sm hover:border-indigo-455 active:scale-95 transition-transform animate-pulse"
                        >
                          <span className="text-xl">💉</span>
                          <span>全套疫苗</span>
                        </button>
                      </div>
                    </div>

                    {/* Adoption flow diagram steps */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-2xl border border-indigo-100 flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1">
                        <Activity className="w-4 h-4 text-indigo-505 shrink-0" />
                        合规科学公益领养五步曲：
                      </span>
                      <div className="grid grid-cols-5 text-center text-[9px] font-bold text-slate-500 gap-1 pt-1 select-none">
                        <div>
                          <div className="bg-white w-6 h-6 rounded-full mx-auto flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-600 mb-1">1</div>
                          <span>浏览宠物</span>
                        </div>
                        <div>
                          <div className="bg-white w-6 h-6 rounded-full mx-auto flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-600 mb-1">2</div>
                          <span>提交申请</span>
                        </div>
                        <div>
                          <div className="bg-white w-6 h-6 rounded-full mx-auto flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-600 mb-1">3</div>
                          <span>沟通确认</span>
                        </div>
                        <div>
                          <div className="bg-white w-6 h-6 rounded-full mx-auto flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-600 mb-1">4</div>
                          <span>线下签约</span>
                        </div>
                        <div>
                          <div className="bg-white w-6 h-6 rounded-full mx-auto flex items-center justify-center border border-indigo-200 shadow-sm text-indigo-600 mb-1">5</div>
                          <span>定期反馈</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Pet Showcase card lists */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-slate-400 px-1">
                        <span>本区待领养推荐：</span>
                        <span>共编在册 {filteredPets.length} 只</span>
                      </div>
                      
                      {filteredPets.length === 0 ? (
                        <div className="bg-white border p-8 rounded-2xl text-center text-slate-400">
                          当前区域中国 {currentRegion.province} {currentRegion.city} {currentRegion.district} 暂无流浪猫狗档案，可点击左上角切换城市！
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {filteredPets.map((pet) => (
                            <button
                              key={pet.id}
                              id={`pet-home-card-${pet.id}`}
                              onClick={() => { setSelectedPetId(pet.id); setSubView('pet-detail'); }}
                              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-rose-450 transition-all text-left flex shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
                            >
                              <img src={pet.photos[0]} alt={pet.name} className="w-24 h-24 object-cover shrink-0" />
                              <div className="p-3 flex-1 flex flex-col justify-between overflow-hidden">
                                <div>
                                  <div className="flex justify-between items-center h-4">
                                    <h4 className="font-bold text-slate-800 text-xs truncate flex items-center gap-1.5">
                                      {pet.name}
                                      <span className="text-[9px] bg-indigo-50 text-indigo-605 rounded-full px-1.5 font-normal truncate">{pet.breed}</span>
                                    </h4>
                                    <span className={`text-[8px] font-black rounded px-1.5 py-0.5 ${
                                      pet.status === '开放申请' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'
                                    }`}>{pet.status}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1 truncate">{pet.gender} &middot; {pet.age} &middot; {pet.district}</p>
                                </div>
                                <div className="flex gap-1 overflow-hidden shrink-0 pt-1 leading-none select-none">
                                  {pet.health?.sterilized && <span className="text-[8px] bg-slate-100 font-bold px-1.5 rounded py-0.5 text-slate-500">已绝育</span>}
                                  {pet.health?.vaccinated && <span className="text-[8px] bg-slate-100 font-bold px-1.5 rounded py-0.5 text-slate-500">已接种疫苗</span>}
                                  {pet.traits?.friendly && <span className="text-[8px] bg-rose-50 font-bold px-1.5 rounded py-0.5 text-rose-500">性格极温顺</span>}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>



                  </div>
                </div>
              )}

              {/* Tab 2: DISCOVER MATCHING SEARCH PANEL */}
              {activeTab === 'discover' && (
                <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto pb-14 text-xs select-none relative">
                  
                  {/* Local filtering criteria status bar */}
                  <div className="bg-white border-b sticky top-0 px-3 py-2.5 flex justify-between items-center z-25 shrink-0 shadow-sm gap-2">
                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded text-[11px] font-bold">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-0.5 rounded ${filterType === 'all' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        全部猫狗
                      </button>
                      <button
                        onClick={() => setFilterType('cat')}
                        className={`px-3 py-0.5 rounded ${filterType === 'cat' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'}`}
                      >
                        找猫猫
                      </button>
                      <button
                        onClick={() => setFilterType('dog')}
                        className={`px-3 py-0.5 rounded ${filterType === 'dog' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-550'}`}
                      >
                        找狗狗
                      </button>
                    </div>

                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="px-2.5 py-1 text-slate-650 hover:text-rose-505 font-bold border rounded-lg flex items-center gap-1 shadow-inner cursor-pointer"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>高难筛选</span>
                    </button>
                  </div>

                  {/* Discover Filter Drawer on screen overlay */}
                  {showFilterModal && (
                    <div className="absolute inset-x-0 top-0 bg-white border-b-2 shadow-2xl z-30 p-4 transition-all duration-300 flex flex-col gap-3.5">
                      <div className="flex justify-between items-center border-b pb-2 mb-1.5">
                        <span className="font-extrabold text-xs text-slate-800">专项猫狗特征条件检索：</span>
                        <button onClick={() => setShowFilterModal(false)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5 bg-slate-100 rounded">
                          收回 [x]
                        </button>
                      </div>

                      {/* Age */}
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">宠物年龄组：</span>
                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded text-[10px] font-bold">
                          {['all', 'young', 'adult'].map((ag) => (
                            <button
                              key={ag}
                              onClick={() => setFilterAge(ag)}
                              className={`px-2.5 py-0.5 rounded ${filterAge === ag ? 'bg-rose-500 text-white font-black' : 'text-slate-500'}`}
                            >
                              {ag === 'all' ? '全部年岁' : ag === 'young' ? '幼龄期 (月)' : '已入成犬猫'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-semibold text-slate-705">性别：</span>
                        <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded text-[10px] font-bold">
                          {['all', '妹妹', '弟弟'].map((gd) => (
                            <button
                              key={gd}
                              onClick={() => setFilterGender(gd)}
                              className={`px-3 py-0.5 rounded ${filterGender === gd ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
                            >
                              {gd === 'all' ? '不限' : gd}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special habit condition dropdown */}
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-semibold text-slate-700">特定生活习性：</span>
                        <select
                          value={filterSpecialTrait}
                          onChange={(e) => setFilterSpecialTrait(e.target.value)}
                          className="bg-slate-50 border rounded p-1 text-[11px] text-slate-700"
                        >
                          <option value="all">不限特征习惯</option>
                          <option value="friendly">脾气特别粘人友好</option>
                          <option value="apartment">适宜紧凑公寓楼</option>
                          <option value="potty">会定点排便</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t pt-3">
                        <button
                          onClick={() => {
                            setFilterAge('all');
                            setFilterGender('all');
                            setFilterSterilized(null);
                            setFilterVaccinated(null);
                            setFilterSpecialTrait('all');
                          }}
                          className="py-1.5 text-center bg-slate-100 font-bold hover:bg-slate-200 text-slate-650 rounded"
                        >
                          恢复初始
                        </button>
                        <button
                          onClick={() => setShowFilterModal(false)}
                          className="py-1.5 text-center bg-rose-500 text-white font-bold hover:bg-rose-600 rounded"
                        >
                          核算检索结果
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List Content discovery */}
                  <div className="p-4 flex-1">
                    {filteredPets.length === 0 ? (
                      <div className="bg-white border rounded-2xl p-8 text-center text-slate-400">
                        抱歉，在此筛选要求及城市定位：【中国 {currentRegion.province} {currentRegion.city} {currentRegion.district}】范围内，今天暂无符合此习惯特征的待发布档案。可以点击恢复重设或更宽筛选条件探索！
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pb-8">
                        {filteredPets.map((pet) => (
                          <button
                            key={pet.id}
                            id={`discover-grid-${pet.id}`}
                            onClick={() => { setSelectedPetId(pet.id); setSubView('pet-detail'); }}
                            style={{ height: '197px' }}
                            className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-rose-450 text-left flex flex-col shadow-sm transition-all hover:shadow active:scale-[0.98] cursor-pointer"
                          >
                            <img src={pet.photos[0]} alt={pet.name} className="w-full h-24 object-cover" />
                            <div className="p-2.5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center leading-none">
                                  <span className="font-black text-xs text-slate-800 truncate">{pet.name}</span>
                                  <span className="text-[7.5px] bg-indigo-50 text-indigo-650 font-semibold px-1 rounded-sm">{pet.breed}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1">{pet.gender} &middot; {pet.age} &middot; {pet.district}</p>
                              </div>
                              <span className="text-[8px] tracking-wide bg-amber-50 text-amber-700 font-bold px-1.5 rounded-full w-fit">
                                {pet.status}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

	                  {/* Tab 3: PUBLISH WIZARD PANEL (Step-by-Step wizard integration) */}
	                  {activeTab === 'publish' && (
	                    <div className="absolute inset-0 bg-white z-[45] flex flex-col">
	                      {currentUser ? (
	                        <PublishWizard
	                          publisherId={currentUser.id}
	                          publisherNickname={currentUser.nickname}
	                          onPublishComplete={async (newPet) => {
	                            try {
	                              const res = await axios.post(`${API_BASE}/pets`, newPet, {
	                                headers: { Authorization: 'Bearer mock-token-for-dev' }
	                              });
	                              setPets(prev => [res.data, ...prev]);
	                            } catch (error) {
	                              console.error('Error publishing pet:', error);
	                              alert('发布失败，请稍后再试。');
	                              throw error;
	                            }
	                            const notif: NotificationItem = {
	                              id: `notif_pub_${Date.now()}`,
	                              title: '送养信息已提交审核',
	                              content: `您刚刚提交的送养流浪儿【${newPet.name}】已进入平台审核，管理员通过后会开放申请。`,
	                              time: '刚才',
	                              type: 'system',
	                              read: false
	                            };
	                            saveNotification(notif);
	                            setActiveTab('mine');
	                            setSubView('my-publish-list');
	                          }}
	                          onCancel={() => {
	                            setActiveTab('home');
	                          }}
	                        />
	                      ) : (
	                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
	                          <div className="text-4xl">+</div>
	                          <div>
	                            <h2 className="text-base font-black text-slate-800">请先登录后再发布送养信息</h2>
	                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">发布人需要实名手机账号。发布后先进入后台审核，通过后才开放领养申请。</p>
	                          </div>
	                          <button
	                            type="button"
	                            onClick={() => {
	                              setActiveTab('mine');
	                              setSubView('login');
	                            }}
	                            className="w-full py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold"
	                          >
	                            去登录 / 注册
	                          </button>
	                        </div>
	                      )}
	                    </div>
	                  )}

              {/* Tab 4: COMMUNICATIONS / INBOX MAIL PANEL */}
              {activeTab === 'messages' && (
                <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto pb-14 text-xs select-none relative">
                  <div className="bg-white p-3 border-b text-center shrink-0 z-10 sticky top-0 shadow-sm">
                    <span className="font-extrabold text-xs text-slate-800">流浪科学即时讯息收件箱</span>
                  </div>

                  {/* Regional conversations list */}
                  <div className="p-3 space-y-2 flex-grow overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">与送养主/领养者历史对话流：</span>
                    
                    {(currentUser
                      ? chats.filter(ch => ch.ownerId === currentUser.id || ch.adopterId === currentUser.id)
                      : chats
                    ).length === 0 ? (
                      <div className="p-12 text-center text-slate-400">目前暂无您的即时连通连心会话。</div>
                    ) : (
                      (currentUser
                        ? chats.filter(ch => ch.ownerId === currentUser.id || ch.adopterId === currentUser.id)
                        : chats
                      ).map((ch) => {
                        const otherName = currentUser?.id === ch.ownerId ? ch.adopterNickname : ch.ownerNickname;
                        return (
                          <button
                            key={ch.id}
                            id={`message-row-${ch.id}`}
                            onClick={() => { setSelectedChatId(ch.id); setSubView('chat-detail'); }}
                            className="bg-white border rounded-xl overflow-hidden p-3 flex items-center justify-between text-left hover:border-rose-400 transition-all shadow-sm w-full select-none cursor-pointer"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800 shrink-0">
                                {otherName[0]}
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span>{otherName}</span>
                                  <span className="text-[8.5px] font-bold text-rose-500 bg-rose-50 rounded px-1 scale-90">目标：{ch.petName}</span>
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate mt-1">
                                  {ch.lastMessageText || '发了句招呼。'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end justify-between h-8">
                              <span className="text-[9px] text-slate-400 font-mono">{ch.lastMessageTime}</span>
                              {ch.unreadCount > 0 && (
                                <span className="bg-red-500 text-white rounded-full text-[8px] font-black px-1.5 py-0.5 mt-1 leading-none">
                                  {ch.unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: MINE PROFILE / MANAGEMENT DASHBOARD */}
              {activeTab === 'mine' && (
                <div className="flex flex-col flex-1 bg-slate-55 overflow-y-auto pb-14 text-xs select-none">
                  
                  {/* Top Profile identity card */}
                  <div className="bg-gradient-to-br from-rose-500 to-orange-600 text-white p-5 pt-8 flex items-center gap-3.5 relative z-10 shadow-md shrink-0">
                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center font-extrabold text-xl text-white shadow-inner">
                      {currentUser ? currentUser.nickname[0] : '离'}
                    </div>
                    {currentUser ? (
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-sm text-white">
                          <span>{currentUser.nickname}</span>
                          <span className="bg-white/20 text-[8px] rounded px-1">正式公益账号</span>
                        </div>
                        <p className="text-[10px] text-rose-100 font-medium font-mono mt-1">
                          手机在案：{currentUser.phone.slice(0, 3)}****{currentUser.phone.slice(7, 11)} &middot; {currentUser.city} {currentUser.district}
                        </p>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => setSubView('register')}>
                        <span className="font-extrabold text-sm text-white">请点击注册/登录您的账户</span>
                        <p className="text-[10px] text-rose-100 font-light mt-0.5">解锁发布流浪猫狗、填写科学领养表功能</p>
                      </div>
                    )}
                    <button
                      aria-label="个人资料设置"
                      onClick={() => setSubView('settings')}
                      className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded hover:bg-white/10 active:scale-95 transition-transform"
                    >
                      <Settings className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Middle panels listings */}
                  <div className="p-4 space-y-4">
                    
                    {/* Management listings columns */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            if (!currentUser) return alert('请先登录您的手机号！');
                            setSubView('my-publish-list');
                          }}
                          className="bg-white hover:border-rose-400 border rounded-2xl p-3 text-left flex flex-col justify-between h-20 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="text-xl">📊</span>
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-800 block">我的送养发布</span>
                            <span className="text-[9px] text-slate-400">管理候选及点击通过</span>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setSubView('my-applications');
                          }}
                          className="bg-white hover:border-indigo-400 border rounded-2xl p-3 text-left flex flex-col justify-between h-20 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="text-xl">📥</span>
                          <div>
                            <span className="font-extrabold text-[11px] text-slate-800 block">我的领养申请</span>
                            <span className="text-[9px] text-slate-400">查看审核、会晤、双向签约</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Post-Adoption feedback status blocks */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 divide-y space-y-2">
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-xs font-black text-rose-500 flex items-center gap-1">
                          <Activity className="w-4 h-4 text-rose-500 shrink-0" />
                          新家状态汇报随随访定期打卡：
                        </span>
	                        <button
	                          type="button"
	                          onClick={handleSystemFeedbackReminder}
	                          className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-1.5 rounded-full active:scale-95 transition-transform"
	                        >
	                          系统催打
	                        </button>
                      </div>

                      {/* Display feedback node rows */}
                      <div className="pt-2 text-[10px] space-y-2">
                        {currentUserFeedbackPlans.length === 0 && (
                          <div className="py-4 text-center text-[10px] font-bold text-slate-400">
                            当前账号暂无需要提交的新家随访打卡。
                          </div>
                        )}

                        {currentUserFeedbackPlans.map((plan, idx) => {
                          const matchNode = plan.nodes.find(n => n.status === '待提交');
                          return (
                            <div key={`${plan.id}-${idx}`} className="flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <img src={plan.petPhoto} alt="pet min" className="w-7 h-7 rounded object-cover" />
                                <div>
                                  <div className="font-bold text-slate-700">领养猫咪：{plan.petName}</div>
                                  <p className="text-[9px] text-slate-400">目前阶段数：{matchNode ? matchNode.title : '已圆满通过打卡审阅'}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => { setSelectedFeedbackPlanId(plan.id); setSubView('feedback-plan'); }}
                                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-black rounded text-[9px] active:scale-95 transition-transform"
                              >
                                {matchNode ? '去提报/查看' : '查看全部大档'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Offline applicant applications timeline view (Mine applications list) */}
              {subView === 'my-applications' && (
                <div className="absolute inset-0 z-40 flex flex-col bg-slate-50 overflow-y-auto">
                  <div className="bg-white p-3 flex justify-between justify-items-center shrink-0 border-b relative z-10">
                    <button onClick={() => setSubView(null)} className="text-slate-500 font-bold text-xs">返回</button>
                    <span className="font-bold text-xs text-slate-800">您提请的待批领养申请时间线</span>
                    <div className="w-8"></div>
                  </div>

                  <div className="p-4 flex flex-col gap-3 text-xs leading-relaxed">
                    <div className="bg-indigo-50 border border-indigo-100 p-2 text-[10px] text-indigo-700 rounded-lg">
                      这里是您向他人申请领养流浪毛孩的流转状况时间轴。
                    </div>

                    {(currentUser
                      ? applications.filter(a => a.applicantId === currentUser.id)
                      : applications
                    ).length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                        <div className="text-4xl">📥</div>
                        <div className="font-black text-slate-800">目前还没有领养申请</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          去“发现宠物”选择心仪的猫狗，填写领养申请表后，会在这里看到审核、沟通、会晤和签约进度。
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSubView(null);
                            setActiveTab('discover');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-xs active:scale-95 transition-transform"
                        >
                          去发现宠物
                        </button>
                      </div>
                    ) : (
                      (currentUser
                        ? applications.filter(a => a.applicantId === currentUser.id)
                        : applications
                      ).map((app, idx) => (
                        <div key={`${app.id}-${idx}`} className="bg-white border rounded-xl overflow-hidden p-3.5 space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b pb-1.5 font-bold">
                            <span className="text-slate-800 flex items-center gap-1">
                              <strong>宠物：{app.petName}</strong>
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                              app.status === '已通过' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : app.status === '已预约见面' 
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-indigo-50 text-indigo-650'
                            }`}>{app.status}</span>
                          </div>

                          <div className="space-y-1 text-slate-500 text-[11px]">
                            <div>递报时间：<strong>{app.createdAt}</strong></div>
                            <div>同住同意核定：{app.details.familyAgree ? '已首肯一致' : '未表决'}</div>
                          </div>

                          {/* Matching action buttons under condition */}
                          <div className="flex gap-2 justify-end pt-1.5 border-t">
                            <button
                              type="button"
                              onClick={async () => {
                                const chat = await ensureChatForApplication(app);
                                setSelectedChatId(chat.id);
                                setSubView('chat-detail');
                              }}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 border rounded font-bold text-[10px]"
                            >
                              和主人Chat沟通
                            </button>

                            {/* Show Signing protocol digital sign trigger */}
                            {app.status === '已预约见面' && (
                              <button
                                type="button"
                                onClick={() => { setSelectedApplicationId(app.id); setSubView('contract-signing'); }}
                                className="px-3 py-1 bg-rose-500 hover:bg-rose-605 text-white font-extrabold rounded text-[10px] shadow active:scale-95 animate-bounce"
                              >
                                ✍️ 线上签署流浪协议
                              </button>
                            )}

                            {app.status === '已通过' && (
                              <>
                                <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 rounded px-2 py-0.5 leading-none self-center">
                                  🤝 后台已同意领养，请按期提交回访
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const plan = feedbackPlans.find(item => item.petId === app.petId && item.adopterId === app.applicantId);
                                    if (plan) {
                                      setSelectedFeedbackPlanId(plan.id);
                                      setSubView('feedback-plan');
                                    } else {
                                      alert('回访计划正在生成，请稍后再试。');
                                    }
                                  }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded text-[10px] shadow active:scale-95"
                                >
                                  提交领养反馈
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Notification Center list View */}
              {subView === 'notification-center' && (
                <div className="flex flex-col flex-1 bg-slate-50 overflow-y-auto pb-14 text-xs">
                  <div className="bg-white p-3 border-b text-center shrink-0 z-10 sticky top-0 shadow-sm flex items-center justify-between">
                    <button onClick={() => setSubView(null)} className="text-slate-500 font-bold text-xs">返回</button>
                    <span className="font-extrabold text-[11.5px] text-slate-805">爱心领养消息提醒箱</span>
                    <button 
                      onClick={async () => {
                        setNotifications(prev => prev.map(n => ({...n, read: true})));
                        try {
                          const res = await axios.put(`${API_BASE}/engagement/notifications/read-all`);
                          setNotifications(res.data || []);
                        } catch (error) {
                          console.error('Error marking notifications read:', error);
                        }
                      }}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      全标已读
                    </button>
                  </div>

                  <div className="p-3 space-y-3">
                    {notifications.map((notif, idx) => (
                      <div 
                        key={`${notif.id}-${idx}`} 
                        className={`p-3.5 rounded-xl border flex flex-col gap-1 transition-all shadow-sm bg-white ${
                          !notif.read ? 'border-indigo-400 bg-gradient-to-br from-indigo-50/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className={`${!notif.read ? 'text-indigo-950 font-extrabold' : 'text-slate-800'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>}
                        </div>
                        <p className="text-slate-500 text-[10.5px] leading-relaxed mt-0.5">
                          {notif.content}
                        </p>
                        <div className="flex justify-between items-center pt-1.5 text-[9px] text-slate-400 font-mono">
                          <span>类型位：{notif.type === 'system' ? '💻 平台广播' : notif.type === 'feedback' ? '📅 定期回执打卡' : '📝 审查对拢'}</span>
                          <span>{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </AnimatePresence>

            {/* Virtual bottom tab bar (Only rendered when no full modals are active) */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-14 flex justify-between items-center px-4 leading-none text-slate-700 z-30 select-none shadow-inner shrink-0">
              {[
                { id: 'home', icon: '🏠', label: '首页' },
                { id: 'discover', icon: '🔍', label: '发现宠物' },
                { id: 'publish', icon: '➕', label: '发布送养' },
                { id: 'messages', icon: '💬', label: '消息通知' },
                { id: 'mine', icon: '👤', label: '我的' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => {
                      setSubView(null);
                      setActiveTab(tab.id as any);
                    }}
                    style={{ outline: 'none' }}
                    className={`flex flex-col items-center flex-1 justify-center h-full active:scale-95 transition-transform ${
                      isActive ? 'text-rose-500 font-black scale-105' : 'text-slate-420 hover:text-slate-650'
                    }`}
                  >
                    <span className="text-base leading-none mb-1">{tab.icon}</span>
                    <span className="text-[9px] leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Simulated home indicator bottom bar */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-900 rounded-full z-40 select-none pointer-events-none"></div>

          </div>
        </div>
      </div>
    </div>
  );
}
