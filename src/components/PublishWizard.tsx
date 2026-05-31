/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, MapPin, Check, Camera, Video,
  AlertCircle, ShieldAlert, Sparkles, Plus, Trash2, Eye, FileText,
  X, Heart, Info, Shield, CheckCircle2
} from 'lucide-react';
import { PetListing } from '../types';
import RegionSelector from './RegionSelector';

interface PublishWizardProps {
  onPublishComplete: (newListing: PetListing) => void | Promise<void>;
  onCancel: () => void;
  publisherId: string;
  publisherNickname: string;
}

export default function PublishWizard({ onPublishComplete, onCancel, publisherId, publisherNickname }: PublishWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');

  // Step 2: Base Info
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'妹妹' | '弟弟'>('妹妹');
  const [weight, setWeight] = useState('');
  const [livingEnv, setLivingEnv] = useState('家庭');
  const [region, setRegion] = useState({ province: '广东省', city: '广州市', district: '天河区' });
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  // Step 3: Health Info
  const [sterilized, setSterilized] = useState(false);
  const [vaccinated, setVaccinated] = useState(false);
  const [dewormed, setDewormed] = useState(false);
  const [hasChip, setHasChip] = useState(false);
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [medicalHistoryDesc, setMedicalHistoryDesc] = useState('');
  const [needsCare, setNeedsCare] = useState(false);
  const [needsCareDesc, setNeedsCareDesc] = useState('');
  const [hasCertificates, setHasCertificates] = useState(false);
  const [healthPhotos, setHealthPhotos] = useState<string[]>([]);

  // Step 4: Traits & Habits
  const [catTraits, setCatTraits] = useState({
    litterTrained: true,
    friendly: true,
    shy: false,
    clingy: false,
    bites: false,
    apartmentFriendly: true,
    catsFriendly: true,
    dogsFriendly: true,
    kidsFriendly: true
  });

  const [dogTraits, setDogTraits] = useState({
    houseTrained: true,
    basicCommands: false,
    highEnergy: true,
    barking: false,
    chewing: false,
    leashHabit: '正在训练'
  });

  const [desc, setDesc] = useState('');

  // Step 5: Reasoning & conditions
  const [reason, setReason] = useState('');
  const [requirements, setRequirements] = useState('');
  const [acceptVisit, setAcceptVisit] = useState(true);
  const [signAgreement, setSignAgreement] = useState(true);
  const [offlineMeet, setOfflineMeet] = useState(true);
  const [feedbackYear, setFeedbackYear] = useState(false); // whether to add 365 days

  // Step 6: Photos/Videos Upload
  const [petPhotos, setPetPhotos] = useState<string[]>([]);
  const [hasVideo, setHasVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildListing = (status: PetListing['status']): PetListing => ({
    id: `p_${Date.now()}`,
    name,
    type: petType,
    breed,
    age,
    gender,
    weight,
    province: region.province,
    city: region.city,
    district: region.district,
    livingEnv,
    health: {
      sterilized,
      vaccinated,
      dewormed,
      hasChip,
      hasMedicalHistory,
      medicalHistoryDesc,
      needsCare,
      needsCareDesc,
      hasCertificates
    },
    traits: petType === 'cat' ? catTraits : dogTraits,
    desc,
    reason,
    requirements,
    photos: petPhotos,
    videoUrl: hasVideo ? 'https://assets.mixkit.co/videos/preview/mixkit-cute-sitting-cat-looking-at-camera-44813-large.mp4' : undefined,
    ownerId: publisherId,
    ownerNickname: publisherNickname,
    status,
    createdAt: new Date().toISOString().split('T')[0],
    views: 1,
    favorites: 0
  });

  const handleNext = () => {
    if (step === 2) {
      if (!name.trim()) return alert('请输入宠物名字');
      if (!breed.trim()) return alert('请填写宠物品种');
      if (!age.trim()) return alert('请选择或填写年龄');
    }
    if (step === 4) {
      if (desc.length < 10) return alert('请至少写10个字介绍宠物的性格与生活习惯吧');
    }
    if (step === 5) {
      if (reason.length < 15) return alert('请更详尽地说明您的送养原因，至少15字以上');
      if (requirements.length < 15) return alert('请输入具体的领养者筛选要求，至少15字以上');
    }
    if (step === 6) {
      if (petPhotos.length < 3) return alert('必须上传至少3张清晰宠物照片（正面图、全身图、生活图）');
    }

    setStep((prev) => (prev + 1) as any);
  };

  const handlePrev = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handlePublishSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onPublishComplete(buildListing('审核中'));
      setStep(8);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50 relative select-none font-sans" id="publish-wizard-root">
      
      {/* Region Picker Modal */}
      {showRegionPicker && (
        <div className="absolute inset-0 bg-white z-[60] flex flex-col">
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
      <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
        <button 
          onClick={onCancel} 
          className="text-slate-400 font-bold text-xs p-1 hover:text-rose-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-black text-sm text-slate-800 tracking-tight">
          {step <= 7 ? `发布送养 (${step}/7)` : '审核中'}
        </span>
        <div className="w-6"></div>
      </div>

      {/* Steps indicators for Wizard progress */}
      {step <= 7 && (
        <div className="bg-white px-4 py-3 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-full transition-all duration-300 ${
                  s <= step ? 'bg-rose-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="ml-3 text-[10px] font-black text-rose-500 font-mono">
            {Math.round((step / 7) * 100)}%
          </span>
        </div>
      )}

      {/* Main active Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Step 1: Pet Type choosing */}
        {step === 1 && (
          <div className="flex flex-col gap-5 my-auto">
            <div className="text-center">
              <h2 className="text-base font-black text-slate-800">请优先选择送养宠物类型</h2>
              <p className="text-[11px] text-slate-400 mt-1">本平台仅支持猫猫与狗狗的非商业领养，不支持其他物种</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setPetType('cat'); handleNext(); }}
                className={`border-2 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all cursor-pointer ${
                  petType === 'cat' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-4xl">🐱</span>
                <span className="font-black text-xs">寻找有爱猫家长</span>
                <span className="text-[9px] text-slate-400">中华田园/短毛等各种可爱的猫咪</span>
              </button>
              <button
                type="button"
                onClick={() => { setPetType('dog'); handleNext(); }}
                className={`border-2 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all cursor-pointer ${
                  petType === 'dog' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-4xl">🐶</span>
                <span className="font-black text-xs">寻找有爱狗家长</span>
                <span className="text-[9px] text-slate-400">萨摩/柯基/哈士奇流浪寻主等</span>
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-800 text-[10px] leading-relaxed flex gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5 font-bold">平台零收费防骗宣言</strong>
                任何以“疫苗押金”、“空运运费”、“体检押金”为由要求提前微信支付不合理费用的均涉嫌流浪诈骗，请在消息列表举报。平台承诺不从事任何宠物买卖。
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Base Info Form */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <div className="bg-rose-50 text-rose-700 p-2.5 rounded-lg text-[10px] font-medium flex items-center justify-between">
              <span>当前送养品类：{petType === 'cat' ? '😻 喵星人' : '🐶 汪星人'}</span>
              <button onClick={() => setStep(1)} className="underline text-rose-500 font-bold">切换品类</button>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-[11px] font-bold text-slate-400">宠物名字 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="给小动物取个亲切的名字吧"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Breed */}
            <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-[11px] font-bold text-slate-400">品种 <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="例如：中华田园猫 / 边境牧羊犬 / 暹罗等"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            {/* Age & weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-[11px] font-bold text-slate-400">估算年龄 <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="如：3个月、1.5岁"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-[11px] font-bold text-slate-400">体重大小</label>
                <input
                  type="text"
                  placeholder="如：4.5kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">宠物性别 <span className="text-rose-500">*</span></span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('妹妹')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gender === '妹妹' ? 'bg-rose-500 text-white shadow' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  妹妹 (母)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('弟弟')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    gender === '弟弟' ? 'bg-rose-500 text-white shadow' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  弟弟 (公)
                </button>
              </div>
            </div>

            {/* Current Living Env */}
            <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-[11px] font-bold text-slate-400">目前所处居住环境 <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                {['家庭', '救助站', '寄养家庭', '宠物医院', '其他'].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setLivingEnv(env)}
                    className={`py-1 text-[11px] rounded transition-all font-semibold ${
                      livingEnv === env ? 'bg-rose-100 text-rose-600 border border-rose-400' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Region select cascade picker */}
            <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-200">
              <label className="text-[11px] font-bold text-slate-400">所在省市区县定位 <span className="text-rose-500">*</span></label>
              <button
                type="button"
                onClick={() => setShowRegionPicker(true)}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-left mt-1.5"
              >
                <span className="flex items-center text-xs text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-rose-500 mr-1.5" />
                  中国 {region.province} {region.city} {region.district}
                </span>
                <span className="text-[10px] text-rose-500 font-bold">手动切换</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Health Info */}
        {step === 3 && (
          <div className="flex flex-col gap-3.5">
            <h3 className="text-xs font-bold text-slate-500 px-1">请真实点选宠物的健康状态：</h3>

            {/* Sterilized, Vaccinated, Dewormed */}
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 p-1">
              {/* Sterilized */}
              <div className="flex items-center justify-between p-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">是否已绝育？</span>
                  <span className="text-[10px] text-slate-400">根据实际情况或年龄点选（幼宠未到年龄选免）</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSterilized(true)}
                    className={`px-3 py-1 rounded text-xs transition-all ${sterilized ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    已绝育
                  </button>
                  <button
                    type="button"
                    onClick={() => setSterilized(false)}
                    className={`px-3 py-1 rounded text-xs transition-all ${!sterilized ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    未绝育
                  </button>
                </div>
              </div>

              {/* Vaccinated */}
              <div className="flex items-center justify-between p-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">是否接种全套必打疫苗？</span>
                  <span className="text-[10px] text-slate-400">猫三联 / 犬四联联、狂犬疫苗打完打卡</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVaccinated(true)}
                    className={`px-3 py-1 rounded text-xs transition-all ${vaccinated ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    已接种
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaccinated(false)}
                    className={`px-3 py-1 rounded text-xs transition-all ${!vaccinated ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    未接种
                  </button>
                </div>
              </div>

              {/* Dewormed */}
              <div className="flex items-center justify-between p-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">体内外驱虫是否进行完？</span>
                  <span className="text-[10px] text-slate-400">大宠爱 / 爱沃克驱虫周期状况</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDewormed(true)}
                    className={`px-3 py-1 rounded text-xs transition-all ${dewormed ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    已完全
                  </button>
                  <button
                    type="button"
                    onClick={() => setDewormed(false)}
                    className={`px-3 py-1 rounded text-xs transition-all ${!dewormed ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    未驱虫
                  </button>
                </div>
              </div>

              {/* Microchipped */}
              <div className="flex items-center justify-between p-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">是否有防遗失防伪芯片？</span>
                  <span className="text-[10px] text-slate-400">通常市政犬注册植入有此码</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasChip(true)}
                    className={`px-3 py-1 rounded text-xs transition-all ${hasChip ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    有芯片
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasChip(false)}
                    className={`px-3 py-1 rounded text-xs transition-all ${!hasChip ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}
                  >
                    无芯片
                  </button>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">是否有疾病史（如皮肤病、感冒）？</span>
                <input
                  type="checkbox"
                  checked={hasMedicalHistory}
                  onChange={() => setHasMedicalHistory(!hasMedicalHistory)}
                  className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
                />
              </div>
              {hasMedicalHistory && (
                <textarea
                  placeholder="为了毛孩着想必须诚实，写明具体疾病及服药说明（如曾得过猫癣，现已治愈等）"
                  value={medicalHistoryDesc}
                  onChange={(e) => setMedicalHistoryDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded p-2 text-xs w-full h-16 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              )}
            </div>

            {/* Special Care requirements */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">是否需要特殊护理（如特定主粮药用）？</span>
                <input
                  type="checkbox"
                  checked={needsCare}
                  onChange={() => setNeedsCare(!needsCare)}
                  className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
                />
              </div>
              {needsCare && (
                <textarea
                  placeholder="写明需要护理的细节点。如：患有些微泪痕要购买进口眼药洗液每日洁理"
                  value={needsCareDesc}
                  onChange={(e) => setNeedsCareDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded p-2 text-xs w-full h-16 text-slate-800 focus:outline-none resize-none"
                />
              )}
            </div>

            {/* Certificates upload preview */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-800">具有疫苗本照片等医疗证明：</span>
              <div className="flex gap-2 items-center flex-wrap pt-1.5">
                {healthPhotos.map((img, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt="medical proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setHealthPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setHealthPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=200'])}
                  className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 flex flex-col items-center justify-center text-[9px] text-slate-400 font-bold"
                >
                  <Plus className="w-4 h-4 text-slate-400 mb-0.5" />
                  <span>添加证明</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Traits and Habits */}
        {step === 4 && (
          <div className="flex flex-col gap-3.5">
            <h3 className="text-xs font-bold text-slate-500 px-1">请选择特征性格标签（以便精准检索）：</h3>

            {petType === 'cat' ? (
              <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2.5">
                {Object.keys(catTraits).map((key) => {
                  const val = (catTraits as any)[key];
                  const keyLabels: any = {
                    litterTrained: '会用猫砂',
                    friendly: '脾气亲人',
                    shy: '胆小怕生',
                    clingy: '粘人挂件',
                    bites: '有抓咬行为',
                    apartmentFriendly: '适居公寓',
                    catsFriendly: '能和猫相处',
                    dogsFriendly: '能和狗相处',
                    kidsFriendly: '能与小孩相处'
                  };
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCatTraits(prev => ({ ...prev, [key]: !val }))}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                        val 
                          ? 'bg-rose-50 border-rose-400 text-rose-600 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{keyLabels[key] || key}</span>
                      <Check className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform ${val ? 'scale-100' : 'scale-0'}`} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { k: 'houseTrained', label: '定点排便' },
                    { k: 'basicCommands', label: '懂基础指令' },
                    { k: 'highEnergy', label: '充沛高运动量' },
                    { k: 'barking', label: '经常警惕吠叫' },
                    { k: 'chewing', label: '存在拆家咬物' }
                  ].map((item) => {
                    const val = (dogTraits as any)[item.k];
                    return (
                      <button
                        key={item.k}
                        type="button"
                        onClick={() => setDogTraits(prev => ({ ...prev, [item.k]: !val }))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                          val 
                            ? 'bg-rose-50 border-rose-400 text-rose-600 font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{item.label}</span>
                        <Check className={`w-3.5 h-3.5 shrink-0 ${val ? 'scale-100' : 'scale-0'}`} />
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-xs font-semibold text-slate-700">牵引拉绳习惯:</span>
                  <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded text-[11px] font-bold">
                    {['优秀', '正在训练', '习惯不好'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setDogTraits(prev => ({ ...prev, leashHabit: tag }))}
                        className={`px-2 py-0.5 rounded ${dogTraits.leashHabit === tag ? 'bg-rose-500 text-white shadow' : 'text-slate-500'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Character Description textbox */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400">性格介绍与细节叙述 （10-300字）<span className="text-rose-500">*</span></label>
              <textarea
                placeholder="请详细描述宠物的脾气、平日最爱的玩具、是否抓人蹭腿。诚恳而温情动人的文字可以大大提高新家匹配通过速率！"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                maxLength={300}
                className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 w-full h-32 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
              />
              <span className="text-[10px] text-right text-slate-400">当前已写：{desc.length} / 300 字</span>
            </div>
          </div>
        )}

        {/* Step 5: Send reason and adoption conditions */}
        {step === 5 && (
          <div className="flex flex-col gap-3.5">
            {/* Reason */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400">请写明送养宠物的真实原因 （不少于15字）<span className="text-rose-500">*</span></label>
              <textarea
                placeholder="工作调动、严重过敏无法解决等真实客观原因。拒绝不负责任的随意转托送！"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 w-full h-24 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
              />
            </div>

            {/* Requirements */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400">领养者需具备的硬性要求 （不少于15字）<span className="text-rose-500">*</span></label>
              <textarea
                placeholder="关于阳台封网、收入、科学驱虫、不允许笼养及配合随访要求等。"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 w-full h-24 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
              />
            </div>

            {/* Simulated interactive feedback period choices */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-800">平台推荐规则及后续回访任务安排：</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                为了保障流浪小生命的领养状态：本平台默认要求领养人在领养完成后第 <strong>7天、30天、90天、180天</strong> 按时登录回馈最新生活照片，不配合回访将触发违规限制。
              </p>
              <label className="flex items-center justify-between border-t border-slate-100 pt-2 cursor-pointer">
                <span className="text-xs text-slate-750 font-semibold flex items-center gap-1">
                  <span>增加第 365 天 (一周年) 反馈计划</span>
                  <span className="bg-rose-100 text-rose-600 text-[8px] rounded px-1 scale-90">优选</span>
                </span>
                <input
                  type="checkbox"
                  checked={feedbackYear}
                  onChange={() => setFeedbackYear(!feedbackYear)}
                  className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Agreement / options checkboxes */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
              {/* visit */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">是否需要线下见面沟通？</span>
                <input
                  type="checkbox"
                  checked={offlineMeet}
                  onChange={() => setOfflineMeet(!offlineMeet)}
                  className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
                />
              </label>
              {/* signature */}
              <label className="flex items-center justify-between border-t border-slate-100 pt-2 cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">是否要求强制在线签署领养协议？</span>
                <input
                  type="checkbox"
                  checked={signAgreement}
                  onChange={() => setSignAgreement(!signAgreement)}
                  className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 6:的照片/视频/证明 */}
        {step === 6 && (
          <div className="flex flex-col gap-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-[10px] leading-relaxed flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">照片上传合规规范（必填至少3张）：</strong>
                要求至少上传：1张宠物<strong>正面大头清晰照</strong>、1张<strong>全身站立外观照</strong>以及1张平日家里<strong>生活萌照</strong>。支持视频文件辅助展示。
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-700">宠物多图一键添加 （已添加 {petPhotos.length} / 5 张）：</span>
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {petPhotos.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={url} alt="Uploaded pet" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPetPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 shadow-md active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-slate-900/60 text-[8px] text-white text-center font-bold">
                      {idx === 0 ? '正面照' : idx === 1 ? '全身照' : idx === 2 ? '生活照' : `图${idx + 1}`}
                    </span>
                  </div>
                ))}

                {petPhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      // Simulating adding high-quality Unsplash image to fill
                      const samplePool = [
                        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
                        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
                        'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400'
                      ];
                      const randUrl = samplePool[Math.floor(Math.random() * samplePool.length)];
                      setPetPhotos(prev => [...prev, randUrl]);
                    }}
                    className="aspect-square border-2 border-dashed border-slate-300 rounded-lg hover:border-rose-300 bg-slate-50 flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold transition-all cursor-pointer"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>传生活照片</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video mock toggle */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Video className="w-4 h-4 text-rose-500" />
                  <span>是否包含15-30秒宠物趣味小视频？</span>
                </span>
                <span className="text-[10px] text-slate-400">视频介绍可以让领养人极速动心！</span>
              </div>
              <input
                type="checkbox"
                checked={hasVideo}
                onChange={() => setHasVideo(!hasVideo)}
                className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        {/* Step 7: Preview Page */}
        {step === 7 && (
          <div className="flex flex-col gap-3">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded text-[10px] font-bold">
              📷 预览模式：这是发布后呈现在领养人手机屏的真实成效预览：
            </div>

            {/* Simulated detail layout in micro-preview */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 pb-4">
              <div className="relative h-44 bg-slate-100">
                {petPhotos.length > 0 ? (
                  <img src={petPhotos[0]} alt="main preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">暂无照片</div>
                )}
                {hasVideo && (
                  <span className="absolute bottom-2 right-2 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                    <Video className="w-3 h-3 fill-current" />
                    <span>视频在案</span>
                  </span>
                )}
                <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                  审核中 (预览)
                </span>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {/* Titles */}
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                      {name}
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-1.5 rounded">{breed}</span>
                    </h1>
                    <span className="text-red-500 font-bold text-xs">{gender} / {age}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    所在地区：中国 {region.province} {region.city} {region.district}
                  </p>
                </div>

                {/* Health tag list */}
                <div className="flex flex-wrap gap-1 border-t border-b border-slate-100 py-2.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${sterilized ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {sterilized ? '已绝育' : '未绝育'}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${vaccinated ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {vaccinated ? '已接种疫苗' : '未接种疫苗'}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${dewormed ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {dewormed ? '已完成驱虫' : '未进行驱虫'}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${hasCertificates ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {hasCertificates ? '全套疫苗本本' : '流失证明项'}
                  </span>
                </div>

                {/* Traits lists show */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">性格与生活习惯：</h4>
                  <p className="text-xs text-slate-650 leading-relaxed text-balance bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {desc}
                  </p>
                </div>

                {/* Reasons lists */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">送养原因：</h4>
                  <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {reason}
                  </p>
                </div>

                {/* Requirements lists */}
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">领养要求：</h4>
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 whitespace-pre-wrap">
                    {requirements}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Submission Pending Audit State */}
        {step === 8 && (
          <div className="flex flex-col gap-5 items-center justify-center my-auto text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center animate-pulse">
              <span className="text-4xl">🕒</span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">您的流浪动物送养信息已提交审核！</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                平台专职志愿者张阿姨与快乐救助站团队，正按照流浪非商用标准对该宠物及您的无毒买卖资质审核。通常于 <strong>5 - 15分钟</strong> 内完成！审核成功后全网立刻开放申请。
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left w-full text-xs space-y-2">
              <div className="font-bold border-b pb-1 text-slate-500">当前流程定位信息</div>
              <div>🐾 宠物：<span className="font-bold text-slate-800">{name} ({breed})</span></div>
              <div>📍 范围：中国 {region.province} {region.city} {region.district}</div>
              <div>⚡ 状态：<span className="bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 font-bold scale-90">待审核中</span></div>
            </div>

            <div className="border border-indigo-200 rounded-lg bg-indigo-50 p-3 w-full text-left mt-4 text-[10px] text-indigo-800 leading-relaxed">
              该发布会停留在“审核中”。只有后台管理者在宠物档案管理中审核通过后，才会进入“开放申请”。
            </div>
          </div>
        )}
      </div>

      {/* Button footer row */}
      {step <= 7 && (
        <div className="bg-white px-4 py-3 border-t border-slate-200 flex gap-2 shrink-0">
          {step > 1 && (
            <button
              onClick={handlePrev}
              type="button"
              className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一步</span>
            </button>
          )}

          {step < 7 ? (
            <button
              onClick={handleNext}
              type="button"
              disabled={step === 6 && petPhotos.length < 3}
              className={`flex-[2] py-2 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all ${
                step === 6 && petPhotos.length < 3
                  ? 'bg-slate-300 cursor-not-allowed active:scale-100'
                  : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              <span>保存并下一步</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublishSubmit}
              type="button"
              disabled={isSubmitting}
              className={`flex-[2] py-2 text-xs font-black text-white rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all ${
                isSubmitting ? 'bg-slate-300 cursor-not-allowed active:scale-100' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <FileText className="w-4 h-4 animate-bounce" />
              <span>{isSubmitting ? '正在提交...' : '呈送平台志愿者审核'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
