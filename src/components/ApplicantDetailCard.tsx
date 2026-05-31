/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, ShieldCheck, Mail, Briefcase, Home, ShieldAlert,
  Heart, Calendar, HeartOff, CheckCircle2, MessageSquare, AlertCircle
} from 'lucide-react';
import { AdoptionApplication } from '../types';

interface ApplicantDetailCardProps {
  application: AdoptionApplication;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onStartChat: (id: string) => void;
  onClose: () => void;
}

export default function ApplicantDetailCard({ application, onApprove, onReject, onStartChat, onClose }: ApplicantDetailCardProps) {
  const [showRejectMenu, setShowRejectMenu] = useState(false);
  const { details } = application;

  const rejectReasons = [
    '居住条件暂不满足（如合租或不方便安置围网）',
    '距离送养人太远，不便开展线下见面或回访',
    '缺乏对应养宠经验及必备疫苗意识',
    '日常预算难以支付中等品质主粮及必要的医疗开销',
    '家人、室友或房东不同意代养',
    '沟通态度或领养动机不匹配、不真诚'
  ];

  const handleSelectItemReject = (r: string) => {
    onReject(application.id, r);
    setShowRejectMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto" id="applicant-detail-card-root">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onClose} className="text-slate-500 font-bold text-xs py-1 px-2 rounded hover:bg-slate-100">
          返回列表
        </button>
        <span className="font-bold text-xs text-slate-805">申请人档案审查室</span>
        <div className="w-12"></div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        
        {/* Core summary banner */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-lg shadow">
            {application.applicantNickname[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">{application.applicantNickname}</h3>
              <span className="bg-rose-100 text-rose-600 text-[8px] rounded px-1.5 font-bold">联络在案</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              申请目标宠物：<strong>{application.petName}</strong> · 填报于 {application.createdAt}
            </p>
          </div>
        </div>

        {/* Info Grid block */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
          {/* Experience */}
          <div className="p-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              是否有养宠经验
            </span>
            <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
              details.hasPetExperience ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {details.hasPetExperience ? '有丰富养宠经验' : '新手无多余经验'}
            </span>
          </div>

          {/* Age and occup */}
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">年龄跨度段</span>
              <span className="font-semibold text-slate-700">{details.ageGroup}</span>
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">职业状态</span>
              <span className="font-semibold text-slate-700">{details.occupation}</span>
            </div>
          </div>

          {/* Housing */}
          <div className="p-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Home className="w-4 h-4 text-indigo-500" />
              目前居住环境状况
            </span>
            <span className="font-bold text-slate-800">{details.livingCondition}</span>
          </div>

          {/* Roommates & Stable */}
          <div className="grid grid-cols-2 divide-x divide-slate-100 bg-slate-50/50">
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">家人或室友是否知情/商定</span>
              <span className="text-slate-800 font-bold text-[11px]">
                {details.familyAgree ? '✅ 全员100%知情同意' : '❌ 室友意见不合'}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-0.5">
              <span className="text-slate-400 text-[10px]">是否有家庭其他原宿宠物</span>
              <span className="font-semibold text-slate-700">{details.hasOtherPets ? '有（原住民需要合笼隔离）' : '无其他宠物'}</span>
            </div>
          </div>

          {/* Budgets */}
          <div className="p-3 bg-indigo-50/20 text-[11px] font-medium text-slate-800 flex flex-wrap gap-x-4 gap-y-1">
            <span>承担日常费用：{details.canAffordDaily ? '✅ 完全具备' : '❌ 稍显吃力'}</span>
            <span>突发疾病险预算：{details.canAffordMedical ? '✅ 已专设专项资金' : '❌ 尚未规划'}</span>
          </div>
        </div>

        {/* Written questionnaire details */}
        <div className="space-y-3">
          {/* Motivation */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">领养动机与承诺：</span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {details.motivation}
            </p>
          </div>

          {/* Care plan */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">科学喂养及遛狗/打扫计划：</span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {details.carePlan}
            </p>
          </div>

          {/* Emergency plan */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">搬家、出差紧急预案：</span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {details.emergencyPlan}
            </p>
          </div>
        </div>

        {/* Safety checklist */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 flex gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <strong>平台寄语：</strong>作为送养人，您拥有对宠物归属的绝对审核和驳回权。建议在约见之前，先行利用下方 <strong>[在线发起聊天]</strong> 发送平台推荐的科学验证问题，深入核实！约伴见面请优先挑选热闹公共场所。
          </span>
        </div>

        {/* Rejection Modal/Dropdown Menu inside card */}
        {showRejectMenu ? (
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3 shadow-lg flex flex-col gap-2">
            <div className="flex justify-between items-center border-b pb-1.5 mb-1">
              <span className="text-xs font-bold text-red-600">请选择婉拒不合适该申请的原因</span>
              <button onClick={() => setShowRejectMenu(false)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold">返回取消</button>
            </div>
            <div className="flex flex-col gap-1">
              {rejectReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectItemReject(r)}
                  className="text-left py-2 px-2.5 hover:bg-red-50 text-[11px] text-slate-700 hover:text-red-600 rounded-lg transition-colors border border-slate-100"
                >
                  {i + 1}. {r}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Interactive Controls Footer */
          application.status === '已提交' || application.status === '沟通中' ? (
            <div className="grid grid-cols-3 gap-2 pt-2 pb-6">
              <button
                type="button"
                onClick={() => setShowRejectMenu(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <HeartOff className="w-3.5 h-3.5" />
                <span>婉拒申请</span>
              </button>

              <button
                type="button"
                onClick={() => onStartChat(application.applicantId)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>与其聊天</span>
              </button>

              <button
                type="button"
                onClick={() => onApprove(application.id)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>通过初筛</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-100 border p-3 rounded text-center text-xs text-slate-500 font-bold mb-6">
              该申请状态当前为：<strong>{application.status}</strong>（已处理完成）
            </div>
          )
        )}
      </div>
    </div>
  );
}
