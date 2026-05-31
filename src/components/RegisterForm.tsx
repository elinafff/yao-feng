/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, Lock, User, Check, AlertCircle, Eye, MapPin } from 'lucide-react';
import { UserProfile } from '../types';
import RegionSelector from './RegionSelector';

interface RegisterFormProps {
  viewMode: 'register' | 'login' | 'forgot';
  onViewChange: (mode: 'register' | 'login' | 'forgot') => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function RegisterForm({ viewMode, onViewChange, onSuccess }: RegisterFormProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [hasExperience, setHasExperience] = useState<boolean>(false);
  const [agreeRules, setAgreeRules] = useState(false);
  
  // Region Selection states
  const [region, setRegion] = useState({ province: '广东省', city: '广州市', district: '天河区' });
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  // Verification Code SMS Timer
  const [countdown, setCountdown] = useState(0);
  const [smsMessage, setSmsMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSendCode = () => {
    if (!phone || phone.length !== 11 || !/^\d{11}$/.test(phone)) {
      alert('请输入正确的 11 位中国大陆手机号');
      return;
    }
    setCountdown(60);
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsMessage(`[流浪动物领养平台] 验证码已发送：${mockCode}`);
    setTimeout(() => {
      setCode(mockCode);
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11 || !/^\d{11}$/.test(phone)) {
      alert('请输入正确的 11 位手机号！');
      return;
    }
    if (!code) {
      alert('请输入收到的短信验证码！');
      return;
    }
    if (password.length < 6 || password.length > 20) {
      alert('密码长度需要在 6 - 20 位之间！');
      return;
    }
    if (!nickname.trim()) {
      alert('请填写个人昵称！');
      return;
    }
    if (!agreeRules) {
      alert('请阅读并勾选同意平台领养规则！');
      return;
    }

    // Success! Formulate the registered profile
    const newProfile: UserProfile = {
      id: `u_${Date.now()}`,
      phone,
      nickname,
      province: region.province,
      city: region.city,
      district: region.district,
      hasPetExperience: hasExperience,
      ageGroup: '95后',
      occupation: '公务员',
      livingCondition: '自有住房',
      hasStableHome: true,
      withFamily: false,
      familyAgree: true
    };
    onSuccess(newProfile);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      alert('请输入 11 位中国大陆手机号');
      return;
    }
    if (!password) {
      alert('请输入密码');
      return;
    }

    // Since we are using a mock backend/localStorage/simple DB, 
    // we should check against the users list passed from App.tsx or just simulate.
    // However, the user wants a specific message: "没有注册，请注册"
    onSuccess({
      id: 'login_attempt',
      phone,
      password, // Pass password to verify on App.tsx side or just simulate
      nickname: '',
      province: '',
      city: '',
      district: '',
      hasPetExperience: false,
      ageGroup: '',
      occupation: '',
      livingCondition: '',
      hasStableHome: false,
      withFamily: false,
      familyAgree: false
    } as any);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      alert('请输入 11 位中国大陆手机号');
      return;
    }
    if (!code) {
      alert('请获取并输入短信验证码');
      return;
    }
    if (password.length < 6) {
      alert('重设的新密码不能少于 6 位');
      return;
    }
    alert('密码重置成功，请使用新密码登录！');
    onViewChange('login');
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white relative p-5 justify-between select-none" id="register-form-root">
      
      {/* Region selector overlay modal */}
      {showRegionPicker && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <RegionSelector
            initialValue={region}
            onSelect={(p, c, d) => {
              setRegion({ province: p, city: c, district: d });
              setShowRegionPicker(false);
            }}
            onClose={() => setShowRegionPicker(false)}
          />
        </div>
      )}

      {/* Header */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black text-rose-500 tracking-wider">🐾 宠物领养</span>
          <span className="bg-rose-100 text-[10px] text-rose-500 font-bold px-1.5 py-0.5 rounded">猫狗专区</span>
        </div>
        <p className="text-slate-400 text-xs text-balance">
          {viewMode === 'register' && '开启您的领养与送养旅程，让流浪毛孩子过上温暖明天。'}
          {viewMode === 'login' && '密码登录，不区分账号角色，发布与领养功能一网打尽。'}
          {viewMode === 'forgot' && '手机号重设密码安全通道'}
        </p>
      </div>

      {smsMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2.5 rounded-lg text-xs mt-3 flex items-start gap-1.5 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="font-mono">{smsMessage}</span>
        </div>
      )}

      {/* Forms Section */}
      <div className="my-auto flex-1 flex flex-col justify-start max-h-[460px] overflow-y-auto py-4 pr-1">
        {viewMode === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">手机号码</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="请输入您的11位中国大陆手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Captcha Verify Code */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">短信验证码</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
                  <span className="text-xs font-bold font-mono text-indigo-500 mr-2">SMS</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="请输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="bg-transparent text-xs w-full focus:outline-none text-slate-800 font-mono tracking-widest"
                  />
                </div>
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className={`px-3 py-2 text-xs font-medium rounded-lg shrink-0 transition-colors ${
                    countdown > 0
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s 后重新发送` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">设置密码</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="请输入6-20位密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Nickname */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">昵称</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="昵称（用于浏览/聊天/发布等）"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* City Division selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">所在城市</label>
              <button
                type="button"
                onClick={() => setShowRegionPicker(true)}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-left"
              >
                <span className="flex items-center text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-500 mr-2" />
                  中国 {region.province} {region.city} {region.district}
                </span>
                <span className="text-[10px] text-rose-500 font-bold hover:underline">点击重选</span>
              </button>
            </div>

            {/* Pet experience */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg mt-1">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-700">是否有养宠经验？</span>
                <span className="text-[10px] text-slate-400">如实提供有助于发布人评定。</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasExperience(true)}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                    hasExperience ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  有经验
                </button>
                <button
                  type="button"
                  onClick={() => setHasExperience(false)}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                    !hasExperience ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  无经验
                </button>
              </div>
            </div>

            {/* Agreemeets Rules */}
            <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeRules}
                onChange={() => setAgreeRules(!agreeRules)}
                className="mt-0.5 w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
              />
              <span className="text-[10px] text-slate-500 leading-normal">
                我已认真阅读并绝对同意本平台的 
                <span className="text-rose-500 font-bold underline ml-1">《平台领养规则》</span>
                ，认可绝不转卖、虐待、遗弃宠物，自愿配合后期打卡。
              </span>
            </label>

            {/* Submit registering */}
            <button
              type="submit"
              disabled={!agreeRules}
              className={`w-full py-2.5 rounded-xl font-bold text-xs mt-2 transition-all shadow-md ${
                agreeRules
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
              }`}
            >
              提交资料并注册
            </button>
          </form>
        ) : viewMode === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">手机号</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2.5">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="请输入您的手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400">登录密码</label>
                <button
                  type="button"
                  onClick={() => onViewChange('forgot')}
                  className="text-[10px] text-slate-400 font-bold hover:text-rose-500"
                >
                  忘记密码？
                </button>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2.5">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="请输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Submit logging */}
            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs mt-2 transition-all shadow-md shadow-rose-500/10"
            >
              密码验证登录
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">绑定的手机号码</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2.5">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  maxLength={11}
                  placeholder="请输入绑定的11位中国手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Verification code */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">短信验证验证</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2.5">
                  <span className="text-xs font-bold font-mono text-indigo-500 mr-2">SMS</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="bg-transparent text-xs w-full focus:outline-none text-slate-800 font-mono tracking-wider"
                  />
                </div>
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className={`px-3 py-2.5 text-xs font-medium rounded-lg shrink-0 transition-colors ${
                    countdown > 0
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400">重订新密码</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2.5">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  placeholder="请输入重设密码（6-20位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-2.5 rounded-xl font-bold text-xs mt-2 transition-all shadow-md"
            >
              重置密码并跳转登录
            </button>
          </form>
        )}
      </div>

      {/* Floor navigation toggle between login / register */}
      <div className="border-t border-slate-100 pt-4 flex justify-center text-xs">
        {viewMode === 'register' ? (
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>已经拥有手机号账户？</span>
            <button
              onClick={() => onViewChange('login')}
              className="text-rose-500 font-black hover:underline cursor-pointer"
            >
              立刻登录
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500 p-1">
            <span>还没有在本平台注册？</span>
            <button
              onClick={() => onViewChange('register')}
              className="text-rose-500 font-black hover:underline cursor-pointer"
            >
              立即注册一个
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
