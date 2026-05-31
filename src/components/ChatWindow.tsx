/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Send, Phone, ShieldAlert, Calendar, MapPin, Check, Plus, AlertCircle,
  HelpCircle, Sparkles, MessageSquare, Clock, Video, UserCheck
} from 'lucide-react';
import { ChatSession, Message, Appointment } from '../types';
import RegionSelector from './RegionSelector';

interface ChatWindowProps {
  session: ChatSession;
  currentUserId: string;
  onSendMessage: (sessionId: string, text: string) => void;
  onBookAppointment: (appointment: Appointment) => void;
  activeAppointment?: Appointment;
  onApproveAppointment?: (id: string) => void;
  onClose: () => void;
}

export default function ChatWindow({ 
  session, 
  currentUserId, 
  onSendMessage, 
  onBookAppointment,
  activeAppointment,
  onApproveAppointment,
  onClose 
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [showQuickFAQ, setShowQuickFAQ] = useState(true);
  const [showMeetForm, setShowMeetForm] = useState(false);

  // Appointment Form States
  const [meetType, setMeetType] = useState<'线下见面' | '线上视频'>('线下见面');
  const [meetDate, setMeetDate] = useState('2026-05-30');
  const [meetTime, setMeetTime] = useState('14:30');
  const [meetRegion, setMeetRegion] = useState({ province: '广东省', city: '广州市', district: '天河区' });
  const [meetAddress, setMeetAddress] = useState('花城汇南区星巴克门口');
  const [meetNotes, setMeetNotes] = useState('建议当天带个航空狗箱，方便核准眼缘后进行无缝转移保护。');
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const isPublisher = currentUserId === session.ownerId;

  // Shortcuts Specified in prompt:
  const publisherFAQs = [
    '你家里是否所有人都同意养宠？',
    '如果宠物生病，你能接受医疗费用吗？',
    '你是否接受领养后定期反馈？',
    '你是否有长期稳定饲养计划？'
  ];

  const applicantFAQs = [
    '它平时性格怎么样？',
    '它最近健康情况如何？',
    '它是否能和其他宠物相处？',
    '它是否有需要特别注意的习惯？'
  ];

  const faqsToUse = isPublisher ? publisherFAQs : applicantFAQs;

  const handleSendText = (text: string) => {
    if (!text.trim()) return;
    onSendMessage(session.id, text);
    setInputText('');
  };

  const handleSendFAQ = (faqText: string) => {
    onSendMessage(session.id, faqText);
  };

  const handleSubmitMeet = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetType === '线下见面' && !meetAddress.trim()) {
      alert('请输入见面详细地点！');
      return;
    }

    const appt: Appointment = {
      id: `appt_${Date.now()}`,
      petId: session.petId,
      petName: session.petName,
      petPhoto: session.petPhoto,
      applicantId: session.adopterId,
      ownerId: session.ownerId,
      type: meetType,
      time: `${meetDate} ${meetTime}`,
      location: meetType === '线下见面' 
        ? `中国 ${meetRegion.province} ${meetRegion.city} ${meetRegion.district} ${meetAddress}`
        : '线上视频通话 (微信/平台视频通话)',
      notes: meetNotes,
      status: '待对方确认'
    };

    onBookAppointment(appt);
    setShowMeetForm(false);
    
    // Simulate notification in-system chat message bubbles
    onSendMessage(
      session.id, 
      `🏠 [系统通知发起约见] 我发起了与您的见面预约：\n方式: ${meetType}\n时间: ${meetDate} ${meetTime}\n地点: ${appt.location}\n备注: ${meetNotes}\n请点击聊天窗口上的确认卡片进行批对通过。`
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50 relative overflow-hidden" id="chat-window-root">
      
      {/* Region selector cascade overlay for booking */}
      {showRegionPicker && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <RegionSelector
            initialValue={meetRegion}
            onSelect={(p, c, d) => {
              setMeetRegion({ province: p, city: c, district: d });
              setShowRegionPicker(false);
            }}
            onClose={() => setShowRegionPicker(false)}
          />
        </div>
      )}

      {/* Appointment booking form overlay panel */}
      {showMeetForm && (
        <div className="absolute inset-0 bg-white z-40 flex flex-col overflow-y-auto p-4 gap-4">
          <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>发起领养预约会合</span>
            </span>
            <button 
              onClick={() => setShowMeetForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none py-1.5 px-2 bg-slate-100 rounded-md"
            >
              取消
            </button>
          </div>

          <form onSubmit={handleSubmitMeet} className="flex flex-col gap-3.5 mt-2 pb-6">
            {/* Meet Type */}
            <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400">选择预约合拢方式</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setMeetType('线下见面')}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    meetType === '线下见面' ? 'bg-rose-500 border-rose-500 text-white shadow' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  线下见面 (看实物眼缘)
                </button>
                <button
                  type="button"
                  onClick={() => setMeetType('线上视频')}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    meetType === '线上视频' ? 'bg-rose-500 border-rose-500 text-white shadow' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  线上视频 (异地/核验封网)
                </button>
              </div>
            </div>

            {/* Date time */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">选择见面日期</span>
                <input
                  type="date"
                  value={meetDate}
                  onChange={(e) => setMeetDate(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded px-2.5 py-1 text-slate-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">具体时间</span>
                <input
                  type="time"
                  value={meetTime}
                  onChange={(e) => setMeetTime(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded px-2.5 py-1 text-slate-700"
                />
              </div>
            </div>

            {/* Address Cascader (Only for offline meetup) */}
            {meetType === '线下见面' && (
              <div className="flex flex-col gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">线下汇合省市县范围</span>
                <button
                  type="button"
                  onClick={() => setShowRegionPicker(true)}
                  className="flex items-center justify-between bg-white border border-slate-200 rounded px-2.5 py-1.5 text-left text-xs text-slate-700"
                >
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1" />
                    中国 {meetRegion.province} {meetRegion.city} {meetRegion.district}
                  </span>
                  <span className="text-[9px] text-rose-500 font-bold">更改</span>
                </button>
                <input
                  type="text"
                  placeholder="请输入公园、宠物医院、星巴克等具体公共场所详细地址"
                  value={meetAddress}
                  onChange={(e) => setMeetAddress(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded p-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400">额外补充备注要求</span>
              <textarea
                value={meetNotes}
                onChange={(e) => setMeetNotes(e.target.value)}
                rows={2}
                className="bg-white border border-slate-200 text-xs rounded p-2 text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Safety alerts */}
            <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[10px] text-amber-900 leading-normal flex gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>见面安全风险警语：</strong>
                平台严厉打击任何不合理收费。建议线下见面首选宠物医院或公共商场，<strong>防范假借疫苗费/保证金收不退款诈骗！</strong>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer pt-2.5"
            >
              一键发送预约邀请给对方
            </button>
          </form>
        </div>
      )}

      {/* Header section in chat */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <button onClick={onClose} className="text-slate-400 hover:text-slate-650 p-1 bg-slate-100 rounded-md">
          ←
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-xs text-slate-800">
            {isPublisher ? session.adopterNickname : session.ownerNickname}
          </span>
          <span className="text-[9px] text-rose-600 bg-rose-50 rounded-full px-1.5 mt-0.5 border border-rose-100 font-bold">
            探讨宠物：{session.petName}
          </span>
        </div>
        <button
          onClick={() => setShowMeetForm(true)}
          className="text-[10px] px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-black shadow-sm flex items-center gap-0.5 active:scale-95 transition-transform"
        >
          <Calendar className="w-3 h-3" />
          <span>预约见面</span>
        </button>
      </div>

      {/* Safety Alert in banner */}
      <div className="bg-indigo-50 border-b border-indigo-100 px-3 py-2 text-[10px] text-indigo-800 font-medium flex gap-2 items-center leading-relaxed shrink-0">
        <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>【流浪无商防伪安全盾】本对话不透露双方真实手机号。对方无权向您预提任何押金，支持见面后再确认交接。</span>
      </div>

      {/* Chat messages body area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {session.messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                isMe 
                  ? 'bg-rose-500 text-white rounded-tr-none shadow shadow-rose-500/10' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
              }`}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 font-mono px-1">
                {isMe ? '我' : (isPublisher ? session.adopterNickname : session.ownerNickname)} · {m.createdAt.slice(11, 16) || '已送达'}
              </span>
            </div>
          );
        })}

        {/* Dynamic Appointment reference card renderer */}
        {activeAppointment && (
          <div className="bg-white rounded-xl border border-rose-200 p-3 self-center w-full max-w-[290px] shadow mt-2">
            <div className="flex justify-between items-center border-b pb-2 mb-2 font-bold text-xs text-slate-600">
              <span className="text-rose-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 fill-rose-50" />
                领养见面对齐卡
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                activeAppointment.status === '已确认' ? 'bg-emerald-100 text-emerald-700 font-black' : 'bg-amber-100 text-amber-700 font-bold'
              }`}>
                {activeAppointment.status}
              </span>
            </div>
            
            <div className="text-xs space-y-1 text-slate-700 leading-relaxed mb-3">
              <div>方式：<strong className="text-slate-900">{activeAppointment.type}</strong></div>
              <div>时间：<strong>{activeAppointment.time}</strong></div>
              <div className="flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                <span>地址: <strong className="text-[11px] text-slate-900">{activeAppointment.location}</strong></span>
              </div>
              {activeAppointment.notes && <div className="text-[10px] text-slate-400 italic">备注: {activeAppointment.notes}</div>}
            </div>

            {/* Action buttons inside card */}
            {activeAppointment.status === '待对方确认' && (
              currentUserId === activeAppointment.applicantId ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onApproveAppointment) {
                      onApproveAppointment(activeAppointment.id);
                      onSendMessage(session.id, "✅ 我已经正式点击同意了您的约期会合请求！咱们在约定的时间地点不见不散咯！");
                    }
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1.5 rounded-lg text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>批对预约 (同意赴约)</span>
                </button>
              ) : (
                <div className="text-[9px] text-slate-400 italic text-center py-1">
                  正在等待对方（领养候选人）点击确认接受...
                </div>
              )
            )}

            {activeAppointment.status === '已确认' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 text-center text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>已经确立好时间！祝线下沟通顺利！</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommended scientific Question templates list */}
      {showQuickFAQ && (
        <div className="bg-white border-t border-slate-100 px-3 py-2 shrink-0 z-10 select-none">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-405 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              <span>推荐一击发送问题（双向考察）</span>
            </span>
            <button 
              onClick={() => setShowQuickFAQ(false)}
              className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
            >
              收起 [x]
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {faqsToUse.map((faq, i) => (
              <button
                key={i}
                onClick={() => handleSendFAQ(faq)}
                type="button"
                className="text-left shrink-0 max-w-[170px] bg-slate-50 border border-slate-200 hover:border-rose-400 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-650 hover:text-rose-600 transition-colors cursor-pointer"
              >
                {faq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input typing footer row */}
      <div className="bg-white border-t border-slate-200 px-3 py-2.5 flex items-center gap-2 shrink-0">
        {!showQuickFAQ && (
          <button
            onClick={() => setShowQuickFAQ(true)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-700"
            title="查看快捷建议提问"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="给对方写句真诚的消息吧..."
          onKeyDown={(e) => e.key === 'Enter' && handleSendText(inputText)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <button
          onClick={() => handleSendText(inputText)}
          disabled={!inputText.trim()}
          className={`p-2 rounded-full ${
            inputText.trim() ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' : 'bg-slate-100 text-slate-300'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
