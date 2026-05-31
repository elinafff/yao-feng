/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  phone: string;
  nickname: string;
  province: string;
  city: string;
  district: string;
  hasPetExperience: boolean;
  ageGroup: string;
  occupation: string;
  livingCondition: string; // '自有住房' | '租房' | '合租' | '宿舍' | '与家人同住' | '其他'
  hasStableHome: boolean;
  withFamily: boolean;
  familyAgree: boolean;
}

export interface PetListing {
  id: string;
  name: string;
  type: 'cat' | 'dog';
  breed: string;
  age: string; // e.g. "3个月", "1岁", "2岁"
  gender: '妹妹' | '弟弟';
  weight: string;
  province: string;
  city: string;
  district: string;
  livingEnv: string; // '家庭' | '救助站' | '寄养家庭' | '宠物医院' | '其他'
  health: {
    sterilized: boolean;
    vaccinated: boolean;
    dewormed: boolean;
    hasChip: boolean;
    hasMedicalHistory: boolean;
    medicalHistoryDesc: string;
    needsCare: boolean;
    needsCareDesc: string;
    hasCertificates: boolean;
  };
  traits: {
    // Cats
    litterTrained?: boolean;
    friendly?: boolean;
    shy?: boolean;
    clingy?: boolean;
    bites?: boolean;
    apartmentFriendly?: boolean;
    catsFriendly?: boolean;
    dogsFriendly?: boolean;
    kidsFriendly?: boolean;
    // Dogs
    houseTrained?: boolean;
    basicCommands?: boolean;
    highEnergy?: boolean;
    barking?: boolean;
    chewing?: boolean;
    leashHabit?: string; // '优良' | '正在训练' | '习惯不好'
  };
  desc: string; // Character / detail description
  reason: string; // Sending away reason
  requirements: string; // Adoption conditions
  photos: string[];
  videoUrl?: string; // Optional simulated video URL
  ownerId: string;
  ownerNickname: string;
  status: '开放申请' | '申请处理中' | '已预约见面' | '已被领养' | '暂停申请' | '审核中' | '已下架';
  createdAt: string;
  views: number;
  favorites: number;
  adopterId?: string;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  applicantId: string;
  applicantNickname: string;
  applicantPhone: string;
  status: '已提交' | '发布者已查看' | '沟通中' | '已预约见面' | '待确认领养' | '已通过' | '未通过' | '已取消';
  rejectReason?: string;
  createdAt: string;
  details: {
    ageGroup: string;
    occupation: string;
    livingCondition: string;
    hasStableHome: boolean;
    withFamily: boolean;
    familyAgree: boolean;
    hasPetExperience: boolean;
    experienceDesc: string;
    hasOtherPets: boolean;
    understandBasicCare: boolean;
    canAffordDaily: boolean;
    canAffordMedical: boolean;
    motivation: string;
    carePlan: string;
    emergencyPlan: string;
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  type: 'text' | 'image' | 'pet_card' | 'appointment_card';
  payload?: any; // For structured cards like booking reference
}

export interface ChatSession {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  adopterId: string;
  adopterNickname: string;
  ownerId: string;
  ownerNickname: string;
  messages: Message[];
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  applicantId: string;
  ownerId: string;
  type: '线下见面' | '线上视频';
  time: string;
  location: string;
  notes?: string;
  status: '待对方确认' | '已确认' | '已完成' | '已取消';
}

export interface FeedbackNode {
  nodeId: string; // 'day7' | 'day30' | 'day90' | 'day180' | 'day365'
  title: string;
  dueDate: string;
  status: '待提交' | '已提交' | '已逾期';
  submittedAt?: string;
  submission?: FeedbackSubmission;
}

export interface FeedbackPlan {
  id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  adopterId: string;
  adopterNickname: string;
  ownerId: string;
  ownerNickname: string;
  nodes: FeedbackNode[];
}

export interface FeedbackSubmission {
  id: string;
  submittedAt: string;
  photos: string[];
  text: string;
  healthStatus: '很好' | '一般' | '有些问题' | '需要帮助';
  eatingHabits: '正常' | '不太正常';
  adaptability: '已经适应' | '还在适应' | '明显不适应';
  ownerResponse?: {
    status: '正常' | '有异常';
    msg: string;
    repliedAt: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'system' | 'application' | 'feedback';
  read: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  module: string;
  targetId: string;
  details: string;
  ip: string;
}
