/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, Check, AlertTriangle, Eye, ArrowLeft, Camera, ShieldCheck,
  Sparkles, Heart, Activity, ChevronRight, MessageSquareQuote
} from 'lucide-react';
import { FeedbackPlan, FeedbackNode, FeedbackSubmission } from '../types';

interface FeedbackManagerProps {
  plan: FeedbackPlan;
  currentUserId: string;
  onPostFeedback: (planId: string, nodeId: string, submission: FeedbackSubmission) => void;
  onOwnerReply: (planId: string, nodeId: string, verdict: '正常' | '有异常', msg: string) => void;
  onClose: () => void;
}

export default function FeedbackManager({ plan, currentUserId, onPostFeedback, onOwnerReply, onClose }: FeedbackManagerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400'
  ]);
  const [text, setText] = useState('宝贝到新家现在一切都顺利！开始两天一直钻到床底，不吃不喝，急死我了。我根据志愿者阿姨的交代，关灯保持平静。现在它已经开始主动溜出来蹭腿了，吃了一罐巅峰主食猫罐头，呼噜噜打得极其响亮。适应情况比我想象中快，真的好软萌好可爱！');
  const [healthStatus, setHealthStatus] = useState<'很好' | '一般' | '有些问题' | '需要帮助'>('很好');
  const [eatingHabits, setEatingHabits] = useState<'正常' | '不太正常'>('正常');
  const [adaptability, setAdaptability] = useState<'已经适应' | '还在适应' | '明显不适应'>('已经适应');

  // Owner reply states
  const [ownerReplyText, setOwnerReplyText] = useState('太好听这个好消息了，听到它能正常吃饭呼噜噜踩奶我就彻底放心了，非常感谢您对它的包容与无限爱惜！');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const selectedNode = plan.nodes.find(n => n.nodeId === selectedNodeId);
  const isAdopter = currentUserId === plan.adopterId;

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 20) {
      alert('请用至少 20 字详细反馈一下宠物的最新生活、情绪和餐饮状况吧！');
      return;
    }

    const sub: FeedbackSubmission = {
      id: `fs_${Date.now()}`,
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      photos,
      text,
      healthStatus,
      eatingHabits,
      adaptability
    };

    if (selectedNodeId) {
      onPostFeedback(plan.id, selectedNodeId, sub);
      setShowForm(false);
      alert('状态反馈提交成功！已记录状态，我们将及时通知送养人批注！');
    }
  };

  const handleReplySubmit = (decision: '正常' | '有异常') => {
    if (!ownerReplyText.trim()) {
      alert('请输入给领养人的批注留言！');
      return;
    }
    if (selectedNodeId) {
      onOwnerReply(plan.id, selectedNodeId, decision, ownerReplyText);
      setShowReplyForm(false);
      alert('留言标记成功！状态更新完毕！');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto" id="feedback-manager-root">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-650 p-1.5 bg-slate-100 rounded-md">
          ←
        </button>
        <span className="font-bold text-xs text-slate-805">
          {plan.petName} 的领养定期打卡计划
        </span>
        <div className="w-8"></div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Short top portrait banner */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center gap-3 p-3">
          <img src={plan.petPhoto} alt={plan.petName} className="w-14 h-14 rounded-lg object-cover" />
          <div>
            <h3 className="font-bold text-sm text-slate-800">{plan.petName} 🌈 新家生活轴</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              领养人: <strong>{plan.adopterNickname}</strong> · 送养主: {plan.ownerNickname}
            </p>
          </div>
        </div>

        {/* Node list list */}
        {!selectedNodeId ? (
          <div className="flex flex-col gap-3.5">
            <div className="text-xs font-bold text-slate-450 uppercase tracking-widest px-1">当前反馈时间轴：</div>
            
            <div className="flex flex-col gap-3 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-0.5 before:bg-slate-200">
              {plan.nodes.map((n) => {
                const isOverdue = n.status === '待提交' && new Date(n.dueDate) < new Date('2026-05-24');
                return (
                  <div key={n.nodeId} className="flex gap-4 relative z-10 items-start">
                    {/* Circle Dot wrapper */}
                    <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${
                      n.status === '已提交' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : isOverdue 
                          ? 'bg-rose-50 border-rose-400 text-rose-500 animate-pulse'
                          : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {n.status === '已提交' ? <Check className="w-5 h-5" /> : <Calendar className="w-4 h-4" />}
                    </div>

                    {/* Node details */}
                    <button
                      onClick={() => setSelectedNodeId(n.nodeId)}
                      type="button"
                      className="flex-1 bg-white p-3 border border-slate-200 hover:border-rose-300 rounded-xl text-left flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-850">{n.title}</span>
                          {isOverdue && (
                            <span className="bg-rose-100 text-rose-600 text-[8px] rounded px-1 flex items-center gap-0.5 font-bold">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              逾期打卡
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">约定结算时间：{n.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold ${
                          n.status === '已提交' ? 'text-emerald-500' : isOverdue ? 'text-rose-500' : 'text-slate-500'
                        }`}>
                          {n.status === '已提交' ? '已阅' : isOverdue ? '去核算' : '待递交'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Sub-panel block : Submission detail / or create form */
          <div className="flex flex-col gap-4">
            {/* Click back list */}
            <button
              onClick={() => { setSelectedNodeId(null); setShowForm(false); setShowReplyForm(false); }}
              className="flex items-center text-xs text-slate-500 hover:text-slate-800 font-semibold gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回时间轴节点</span>
            </button>

            {/* Display submission detail if submitted */}
            {selectedNode?.status === '已提交' && selectedNode.submission ? (
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* submission picture */}
                  {selectedNode.submission.photos.length > 0 && (
                    <img 
                      src={selectedNode.submission.photos[0]} 
                      alt="pet status photo" 
                      className="w-full h-44 object-cover border-b" 
                    />
                  )}
                  
                  {/* attributes info */}
                  <div className="p-4 flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-400 text-[10px]">
                      <span>打卡时间：{selectedNode.submission.submittedAt}</span>
                      <span className="bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded font-bold">{selectedNode.title}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 select-none text-center">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400">目前精神/情绪</span>
                        <span className="font-bold text-slate-700">{selectedNode.submission.healthStatus}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400">饮食食量</span>
                        <span className="font-bold text-slate-700">{selectedNode.submission.eatingHabits}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-400">适应家庭度</span>
                        <span className="font-bold text-slate-700 text-[11px] text-rose-500">{selectedNode.submission.adaptability}</span>
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                      {selectedNode.submission.text}
                    </p>
                  </div>
                </div>

                {/* Display Owner Reply Comments */}
                {selectedNode.submission.ownerResponse ? (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm text-xs">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-1.5 font-bold">
                      <span className="text-indigo-800 flex items-center gap-1">
                        <MessageSquareQuote className="w-4 h-4" />
                        送养人张阿姨给您的留言回复：
                      </span>
                      <span className="text-[9px] text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded scale-90">
                        {selectedNode.submission.ownerResponse.status}
                      </span>
                    </div>
                    <p className="text-indigo-950 italic leading-relaxed whitespace-pre-wrap">
                      “{selectedNode.submission.ownerResponse.msg}”
                    </p>
                    <span className="text-[9px] text-indigo-400 text-right">时间: {selectedNode.submission.ownerResponse.repliedAt.slice(0, 10)}</span>
                  </div>
                ) : (
                  /* Reply form for Former Owner view */
                  !isAdopter && (
                    showReplyForm ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-3 text-xs">
                        <span className="font-bold text-slate-700">添加您对本次提交的留言回复：</span>
                        <textarea
                          value={ownerReplyText}
                          onChange={(e) => setOwnerReplyText(e.target.value)}
                          rows={3}
                          className="bg-slate-50 border border-slate-200 text-xs p-2 rounded focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleReplySubmit('有异常')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 rounded"
                          >
                            标记有异常 / 平台协助
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit('正常')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded"
                          >
                            感谢反馈并标记正常
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReplyForm(true)}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 font-bold text-xs rounded-xl active:scale-95 transition-all text-center"
                      >
                        写留言批注给领养人
                      </button>
                    )
                  )
                )}
              </div>
            ) : (
              /* Create Form for Adopter to fill in */
              isAdopter ? (
                <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="border-b pb-2 mb-1 flex items-center justify-between font-bold text-slate-700">
                    <span>撰写：{selectedNode?.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">截止期：{selectedNode?.dueDate}</span>
                  </div>

                  {/* photos upload mock */}
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-500">上传宝贝近期健康生活萌照 (必填)：</span>
                    <div className="flex gap-2 items-center pt-1.5">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border">
                        <img src={photos[0]} alt="preview mock" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // mock picking different happy cat
                          setPhotos(['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400']);
                        }}
                        className="w-14 h-14 rounded-lg bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-[9px] text-slate-400 font-semibold"
                      >
                        <Camera className="w-4 h-4 mb-0.5" />
                        <span>重新截图</span>
                      </button>
                    </div>
                  </div>

                  {/* Health status */}
                  <div className="flex flex-col gap-1 border-t pt-2.5">
                    <span className="font-bold text-slate-500">宝贝当前情绪精神？</span>
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5 font-bold text-center">
                      {['很好', '一般', '有些问题', '需要帮助'].map((st: any) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setHealthStatus(st)}
                          className={`py-1 rounded text-[10px] border transition-all ${
                            healthStatus === st ? 'bg-indigo-600 border-indigo-650 text-white' : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eating habits */}
                  <div className="flex items-center justify-between border-t border-b py-2.5">
                    <span className="font-bold text-slate-500">食欲/喝水习惯是否正常？</span>
                    <div className="flex gap-2 font-bold">
                      <button
                        type="button"
                        onClick={() => setEatingHabits('正常')}
                        className={`px-3 py-1 rounded text-[10px] ${eatingHabits === '正常' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        很正常
                      </button>
                      <button
                        type="button"
                        onClick={() => setEatingHabits('不太正常')}
                        className={`px-3 py-1 rounded text-[10px] ${eatingHabits === '不太正常' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        有些不正常
                      </button>
                    </div>
                  </div>

                  {/* Adaptability */}
                  <div className="flex items-center justify-between pb-2.5 border-b">
                    <span className="font-bold text-slate-500">适应家里程度？</span>
                    <div className="flex gap-2 font-bold">
                      {['已经适应', '还在适应', '明显不适应'].map((ad: any) => (
                        <button
                          key={ad}
                          type="button"
                          onClick={() => setAdaptability(ad)}
                          className={`px-2.5 py-1 rounded text-[10px] ${adaptability === ad ? 'bg-rose-500 text-white shadow' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {ad}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Journal writeup */}
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-550">描述详情生活随感及需要注意的事 (不少于20字) <span className="text-rose-500">*</span></span>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      className="bg-slate-50 border p-2 rounded text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <span className="text-[10px] text-right text-slate-400">已写：{text.length} / 500字</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 font-black text-xs rounded-xl active:scale-95 shadow shadow-rose-500/15"
                  >
                    确认提报阶段性反馈
                  </button>
                </form>
              ) : (
                <div className="bg-slate-100 border p-4 rounded-xl text-center text-xs text-slate-500">
                  当前节点 <strong>{selectedNode?.title}</strong> <strong>正在等待领养人提报内容</strong>中。
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
