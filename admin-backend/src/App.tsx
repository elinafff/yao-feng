/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserProfile, PetListing, AdoptionApplication, ChatSession, 
  FeedbackPlan, AuditLog 
} from './types';

import { 
  INITIAL_CHATS, INITIAL_FEEDBACK_PLANS 
} from './data';

import AdminPortal from './components/AdminPortal';

const API_BASE = 'http://localhost:5005/api';

export default function App() {
  // Database States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pets, setPets] = useState<PetListing[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [feedbackPlans, setFeedbackPlans] = useState<FeedbackPlan[]>(INITIAL_FEEDBACK_PLANS);
  const [lifecycleRecords, setLifecycleRecords] = useState<{
    rescue: any[];
    medical: any[];
    eol: any[];
  }>({ rescue: [], medical: [], eol: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, petsRes, appsRes, logsRes, rescueRes, medRes, eolRes, feedbackRes, chatsRes] = await Promise.all([
          axios.get(`${API_BASE}/users`),
          axios.get(`${API_BASE}/pets`),
          axios.get(`${API_BASE}/admin/applications`),
          axios.get(`${API_BASE}/admin/logs`),
          axios.get(`${API_BASE}/lifecycle/rescue`),
          axios.get(`${API_BASE}/lifecycle/medical`),
          axios.get(`${API_BASE}/lifecycle/eol`),
          axios.get(`${API_BASE}/feedback/plans`),
          axios.get(`${API_BASE}/engagement/chats`)
        ]);
        setUsers(usersRes.data);
        setPets(petsRes.data);
        setApplications(appsRes.data || []);
        setFeedbackPlans(feedbackRes.data || []);
        setChats(chatsRes.data || []);
        if (logsRes.data?.length) {
          setAuditLogs(logsRes.data);
        }
        setLifecycleRecords({
          rescue: rescueRes.data,
          medical: medRes.data,
          eol: eolRes.data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = window.setInterval(fetchData, 2000);
    return () => window.clearInterval(interval);
  }, []);
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit_init_1',
      timestamp: '2026-05-24 16:30:15',
      operator: '系统自检 (System)',
      action: '基础引擎就绪',
      module: '生命安全网关',
      targetId: 'sys_kernel',
      details: '流浪动物生老病死全周期治理系统：全双向合规链路已成功就绪，实时加载4组样本。',
      ip: '127.0.0.1'
    },
    {
      id: 'audit_init_2',
      timestamp: '2026-05-24 18:42:00',
      operator: '系统自检 (System)',
      action: '预加载数据源',
      module: '数据加载器',
      targetId: 'db_seed',
      details: '成功预拉取 4 组实名登记家庭、2 组进行中领养申请和 3 组领养后续回访记录。',
      ip: '127.0.0.1'
    }
  ]);

  const handleUpdatePet = async (petId: string, data: Partial<PetListing>) => {
    try {
      const res = await axios.put(`${API_BASE}/pets/${petId}`, data, {
        headers: { Authorization: 'Bearer mock-token-for-dev' }
      });
      setPets(prev => prev.map(p => p.id === petId ? { ...p, ...res.data } : p));
      return res.data;
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<UserProfile>) => {
    try {
      const res = await axios.put(`${API_BASE}/users/${userId}`, data, {
        headers: { Authorization: 'Bearer mock-token-for-dev' }
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...res.data } : u));
      return res.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: 'Bearer mock-token-for-dev' }
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const handleAddUser = async (userData: Partial<UserProfile>) => {
    try {
      const res = await axios.post(`${API_BASE}/users`, userData, {
        headers: { Authorization: 'Bearer mock-token-for-dev' }
      });
      setUsers(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: AdoptionApplication['status'], rejectReason?: string) => {
    const res = await axios.put(
      `${API_BASE}/admin/applications/${applicationId}`,
      { status, rejectReason },
      { headers: { Authorization: 'Bearer mock-token-for-dev' } }
    );
    setApplications(prev => prev.map(app => app.id === applicationId ? res.data : app));
    return res.data;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-viewport">
      {/* Viewport limits aligned perfectly */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminPortal
          pets={pets}
          setPets={setPets}
          applications={applications}
          setApplications={setApplications}
          users={users}
          setUsers={setUsers}
          chats={chats}
          setChats={setChats}
          feedbackPlans={feedbackPlans}
          setFeedbackPlans={setFeedbackPlans}
          auditLogs={auditLogs}
          setAuditLogs={setAuditLogs}
          onClose={() => {}}
          jumpToPhoneScreen={() => {}}
          // API Handlers
          onUpdatePet={handleUpdatePet}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
          onUpdateApplicationStatus={handleUpdateApplicationStatus}
          lifecycleRecords={lifecycleRecords}
        />
      </div>
    </div>
  );
}
