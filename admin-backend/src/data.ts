/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PetListing, UserProfile, AdoptionApplication, ChatSession, NotificationItem, FeedbackPlan } from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u_me',
    phone: '13812345678',
    nickname: '大白铲屎官',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    hasPetExperience: true,
    ageGroup: '90后',
    occupation: '互联网产品经理',
    livingCondition: '自有住房',
    hasStableHome: true,
    withFamily: false,
    familyAgree: true
  },
  {
    id: 'u_user2',
    phone: '13988887777',
    nickname: '快乐救助站-张阿姨',
    province: '广东省',
    city: '广州市',
    district: '白云区',
    hasPetExperience: true,
    ageGroup: '70后',
    occupation: '专职动物救助志愿者',
    livingCondition: '自有住房',
    hasStableHome: true,
    withFamily: true,
    familyAgree: true
  },
  {
    id: 'u_user3',
    phone: '13566665555',
    nickname: '小猫咪的研究员',
    province: '四川省',
    city: '成都市',
    district: '武侯区',
    hasPetExperience: false,
    ageGroup: '95后',
    occupation: '设计师',
    livingCondition: '租房',
    hasStableHome: true,
    withFamily: false,
    familyAgree: true
  },
  {
    id: 'u_applicant1',
    phone: '18655554444',
    nickname: '毛茸茸收藏家',
    province: '广东省',
    city: '广州市',
    district: '越秀区',
    hasPetExperience: true,
    ageGroup: '00后',
    occupation: '在读研究生',
    livingCondition: '合租',
    hasStableHome: true,
    withFamily: false,
    familyAgree: true
  }
];

export const INITIAL_PETS: PetListing[] = [
  {
    id: 'p_1',
    name: '奶茶',
    type: 'cat',
    breed: '中华田园橘猫',
    age: '1岁',
    gender: '妹妹',
    weight: '4.2kg',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    livingEnv: '家庭',
    health: {
      sterilized: true,
      vaccinated: true,
      dewormed: true,
      hasChip: false,
      hasMedicalHistory: true,
      medicalHistoryDesc: '曾有轻微猫癣，现已彻底痊愈。',
      needsCare: false,
      needsCareDesc: '',
      hasCertificates: true
    },
    traits: {
      litterTrained: true,
      friendly: true,
      shy: false,
      clingy: true,
      bites: false,
      apartmentFriendly: true,
      catsFriendly: true,
      dogsFriendly: false,
      kidsFriendly: true
    },
    desc: '奶茶是一只超级乖巧的甜美橘猫。特别粘人，喜欢在人怀里踩奶，熟悉之后你走到哪里它就跟到哪里，晚上会主动靠在枕头边睡觉。对人没有任何攻击性，非常适合第一次养猫的新手家庭。',
    reason: '因工作长期调派海外，实在无法带它出国，希望帮它找一个能够包容它、一辈子不离不弃的温暖家庭。',
    requirements: '希望领养人在广州有稳定住所（自有或长租），全屋安装高品质金刚网纱窗；按时接种后续疫苗，接受不定期视频回访与定期反馈；不因结婚、生育等理由弃养。',
    photos: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800'
    ],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cute-sitting-cat-looking-at-camera-44813-large.mp4',
    ownerId: 'u_user3',
    ownerNickname: '小猫咪的研究员',
    status: '开放申请',
    createdAt: '2026-05-20',
    views: 142,
    favorites: 31
  },
  {
    id: 'p_3',
    name: '芝麻',
    type: 'cat',
    breed: '英国短毛猫',
    age: '2岁',
    gender: '弟弟',
    weight: '5.5kg',
    province: '四川省',
    city: '成都市',
    district: '武侯区',
    livingEnv: '家庭',
    health: {
      sterilized: true,
      vaccinated: true,
      dewormed: true,
      hasChip: false,
      hasMedicalHistory: false,
      medicalHistoryDesc: '',
      needsCare: false,
      needsCareDesc: '',
      hasCertificates: true
    },
    traits: {
      litterTrained: true,
      friendly: false,
      shy: true,
      clingy: false,
      bites: false,
      apartmentFriendly: true,
      catsFriendly: true,
      dogsFriendly: true,
      kidsFriendly: false
    },
    desc: '芝麻是个极度安静儒雅的英短蓝猫男爵，不拆家、不嚎叫。性格稍微有些慢热，第一次见面会藏起来观察你，但是一旦熟悉并认主后，就会变成打呼噜狂魔，愿意让你抱着剪指甲。',
    reason: '由于家里老人严重过敏哮喘，尝试了分房隔离依然无法缓解，在万般无奈下只能寻找新主人。',
    requirements: '全屋防猫网，接受实名签约，接受平台规定的领养后7天/30天/180天定期反馈；必须在成都当地，送猫上门。',
    photos: [
      'https://images.unsplash.com/photo-1574158622643-69d34d72650a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800'
    ],
    ownerId: 'u_user3',
    ownerNickname: '小猫咪的研究员',
    status: '开放申请',
    createdAt: '2026-05-22',
    views: 89,
    favorites: 18
  },
  {
    id: 'p_4',
    name: '雪莉',
    type: 'dog',
    breed: '柯基',
    age: '2岁',
    gender: '妹妹',
    weight: '11kg',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    livingEnv: '家庭',
    health: {
      sterilized: true,
      vaccinated: true,
      dewormed: true,
      hasChip: true,
      hasMedicalHistory: false,
      medicalHistoryDesc: '',
      needsCare: false,
      needsCareDesc: '',
      hasCertificates: true
    },
    traits: {
      houseTrained: true,
      basicCommands: true,
      highEnergy: false,
      barking: true,
      chewing: false,
      leashHabit: '优良'
    },
    desc: '雪莉超级可爱，大屁股短腿电臀！它会定点上厕所，不咬家具，但是当门外有人走过时它会警惕地吠叫几声。对小朋友非常有爱、包容。',
    reason: '房东发现有养宠物狗之后拒绝续租，且本人即将因为家庭变化搬回宿舍，不具备继续在广州独立居住养宠的条件。',
    requirements: '不合租不群租，要求在天河或越秀周边有独立整租或自有住房；无经济压力，不能喂食劣质毒狗粮；能容忍偶尔一两声狗叫。',
    photos: [
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800'
    ],
    ownerId: 'u_me', // Published by current active user "me"! (To let user manage their listing)
    ownerNickname: '大白铲屎官',
    status: '开放申请',
    createdAt: '2026-05-19',
    views: 412,
    favorites: 95
  },
  {
    id: 'p_5',
    name: '布丁',
    type: 'cat',
    breed: '中华田园三花猫',
    age: '4个月',
    gender: '妹妹',
    weight: '1.8kg',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    livingEnv: '家庭',
    health: {
      sterilized: false,
      vaccinated: true,
      dewormed: true,
      hasChip: false,
      hasMedicalHistory: false,
      medicalHistoryDesc: '',
      needsCare: false,
      needsCareDesc: '',
      hasCertificates: true
    },
    traits: {
      litterTrained: true,
      friendly: true,
      shy: false,
      clingy: true,
      bites: false,
      apartmentFriendly: true,
      catsFriendly: true,
      dogsFriendly: true,
      kidsFriendly: true
    },
    desc: '布丁是个元气满满的小三花妹妹，性格大大咧咧极其社牛。第一天来人家里就敢到处巡逻，跟别的猫打成一片。好奇心很重，超级喜欢羽毛逗猫棒。',
    reason: '小区绿化带捡到的一窝遗弃奶猫之一，在家里悉心照料断奶打完首针疫苗，其他几个弟弟妹妹已经被好心邻居领养，目前只剩布丁小天使在寻家！',
    requirements: '仅限北京同城，要求科学喂养，适龄去医院做绝育；封窗是绝对硬性指标。愿意签署协议，配合反馈。',
    photos: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'
    ],
    ownerId: 'u_user2',
    ownerNickname: '快乐救助站-张阿姨',
    status: '已被领养', // Already adopted to simulate feedback logs!
    createdAt: '2026-04-10',
    views: 520,
    favorites: 140,
    adopterId: 'u_me' // Logged as adopted by "me" to demonstrate ongoing feedbaks!
  }
];

export const INITIAL_APPLICATIONS: AdoptionApplication[] = [
  {
    id: 'a_1',
    petId: 'p_4', // 雪莉 (our item)
    petName: '雪莉',
    petPhoto: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&q=80&w=800',
    applicantId: 'u_applicant1',
    applicantNickname: '毛茸茸收藏家',
    applicantPhone: '18655554444',
    status: '已提交',
    createdAt: '2026-05-23',
    details: {
      ageGroup: '00后',
      occupation: '在读研究生',
      livingCondition: '合租',
      hasStableHome: true,
      withFamily: false,
      familyAgree: true,
      hasPetExperience: true,
      experienceDesc: '家里在老家养过一只田园犬和两只猫。自己平时有云吸狗习惯，并且定期给流浪猫狗捐款或担任救助基地义工，非常懂得狗狗的情绪与日常护理。',
      hasOtherPets: false,
      understandBasicCare: true,
      canAffordDaily: true,
      canAffordMedical: true,
      motivation: '柯基超级可爱，而且一直梦想有一只属于自己的陪伴犬。我有充足的时间可以每日带它外出运动和互动，我的室友们也对养狗表示极其支持且愿意一同分担看管责任。',
      carePlan: '每天早晚各遛狗一次，每次30-40分钟。购买中端以上商品粮并辅以水煮鸡胸肉、西兰花。每周梳毛2次，每月洗澡1次，每年按时打传染病疫苗加狂犬。',
      emergencyPlan: '如果放假回老家会选择开车把狗一同带回国内老家，或者托付给同城养狗的靠谱同学；如有突发生病会第一时间去天河区的品牌连锁宠物医院就诊，已经预留了一笔5000元的宠物专项应急医疗金。'
    }
  },
  {
    id: 'a_2',
    petId: 'p_1', // 奶茶 (their item, applied by me)
    petName: '奶茶',
    petPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    applicantId: 'u_me',
    applicantNickname: '大白铲屎官',
    applicantPhone: '13812345678',
    status: '沟通中',
    createdAt: '2026-05-22',
    details: {
      ageGroup: '90后',
      occupation: '互联网产品经理',
      livingCondition: '自有住房',
      hasStableHome: true,
      withFamily: false,
      familyAgree: true,
      hasPetExperience: true,
      experienceDesc: '目前有一只5岁的猫，养殖科学，定期体检，对猫咪的行为学和营养学有较深理解。',
      hasOtherPets: true,
      understandBasicCare: true,
      canAffordDaily: true,
      canAffordMedical: true,
      motivation: '想给家里现在孤单的猫猫找个温柔好相处的伴侣，奶茶的描述和脾气看起来太投缘了。',
      carePlan: '两只猫独立猫砂盆，渐进式合笼隔离，使用渴望、巅峰等高品质主粮，全屋双层封网。',
      emergencyPlan: '因是广州自有红本房产，绝无因房东或搬家导致的弃养风险；如有医疗支出，预算充裕无上限压力。'
    }
  }
];

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'c_1',
    petId: 'p_4',
    petName: '雪莉',
    petPhoto: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&q=80&w=800',
    adopterId: 'u_applicant1',
    adopterNickname: '毛茸茸收藏家',
    ownerId: 'u_me',
    ownerNickname: '大白铲屎官',
    messages: [
      {
        id: 'm1',
        senderId: 'u_applicant1',
        text: '您好！我对雪莉特别感兴趣，我已经提交了非常详细的领养申请表，您有空可以看一眼哦！',
        createdAt: '2026-05-23T12:00:00Z',
        type: 'text'
      },
      {
        id: 'm2',
        senderId: 'u_me',
        text: 'hello！很高兴认识你。我已经看到你的申请了，写得很用心！你提到目前是在读研究生合租，我想确认一下，你家里所有人都100%同意养宠吗？',
        createdAt: '2026-05-23T12:05:00Z',
        type: 'text'
      },
      {
        id: 'm3',
        senderId: 'u_applicant1',
        text: '是的！合租的三位舍友都是同一个实验室的师姐，大家都特别喜欢狗。我们租的房子很大，舍友们已经签字确认同意了。我们还打算一起轮流遛它！',
        createdAt: '2026-05-23T12:10:00Z',
        type: 'text'
      }
    ],
    lastMessageText: '我们租的房子很大，舍友们已经签字确认同意了！',
    lastMessageTime: '12:10',
    unreadCount: 0
  },
  {
    id: 'c_2',
    petId: 'p_1',
    petName: '奶茶',
    petPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    adopterId: 'u_me',
    adopterNickname: '大白铲屎官',
    ownerId: 'u_user3',
    ownerNickname: '小猫咪的研究员',
    messages: [
      {
        id: 'n1',
        senderId: 'u_me',
        text: '你好！非常喜欢奶茶，我家里有丰富的养猫经验和齐全的封网配置。',
        createdAt: '2026-05-22T09:00:00Z',
        type: 'text'
      },
      {
        id: 'n2',
        senderId: 'u_user3',
        text: '你好啊！我看你的资料写得特别硬核，感觉奶茶去你那里一定会很幸福！它比较害羞，能带别的小猫相处吗？',
        createdAt: '2026-05-22T10:15:00Z',
        type: 'text'
      },
      {
        id: 'n3',
        senderId: 'u_me',
        text: '完全没有问题，我有一间独立的次卧可以用来做最初几周的隔离过渡，让它们先闻气味慢慢适应。',
        createdAt: '2026-05-22T10:20:00Z',
        type: 'text'
      }
    ],
    lastMessageText: '完全没有问题，我有一间独立的次卧可以用来隔离过渡...',
    lastMessageTime: '10:20',
    unreadCount: 1
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: '发布审核通过',
    content: '恭喜！您发布的宠物“雪莉”的信息已经通过平台多维度审核，目前已经正式上线“开放申请”。',
    time: '2026-05-19 14:00',
    type: 'system',
    read: true
  },
  {
    id: 'notif_2',
    title: '收到新的领养申请',
    content: '用户“毛茸茸收藏家”对您发布的“雪莉”提交了领养申请。申请表内包含详尽的职业和居住状况，请及时查阅！',
    time: '2026-05-23 12:00',
    type: 'application',
    read: false
  },
  {
    id: 'notif_3',
    title: '第一阶段反馈计划即将启动',
    content: '您领养的“布丁”已步入新家第 7 天适应期，请点击前往“我的领养”并撰写第一次适应期反馈，以便送养人安心。',
    time: '2026-04-17 09:00',
    type: 'feedback',
    read: true
  }
];

export const INITIAL_FEEDBACK_PLANS: FeedbackPlan[] = [
  {
    id: 'fb_1',
    petId: 'p_5', // 布丁
    petName: '布丁',
    petPhoto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    adopterId: 'u_me',
    adopterNickname: '大白铲屎官',
    ownerId: 'u_user2',
    ownerNickname: '快乐救助站-张阿姨',
    nodes: [
      {
        nodeId: 'day7',
        title: '第 7 天：适应期反馈',
        dueDate: '2026-04-17',
        status: '已提交',
        submittedAt: '2026-04-17 11:30',
        submission: {
          id: 'sub_1',
          submittedAt: '2026-04-17 11:30',
          photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'],
          text: '布丁来家里第七天啦！现在和家里的原住民橘子打得火热，经常追逐着玩。吃喝完全不需要担心，猫砂盆用得很麻溜，非常适应，是个呼噜小天使。',
          healthStatus: '很好',
          eatingHabits: '正常',
          adaptability: '已经适应',
          ownerResponse: {
            status: '正常',
            msg: '看到布丁在您家过得这么开心真的太欣慰了！吃喝正常我就放心啦，感谢您的爱心和付出！',
            repliedAt: '2026-04-17T15:00:00Z'
          }
        }
      },
      {
        nodeId: 'day30',
        title: '第 30 天：稳定期反馈',
        dueDate: '2026-05-10',
        status: '已提交',
        submittedAt: '2026-05-09 20:00',
        submission: {
          id: 'sub_2',
          submittedAt: '2026-05-09 20:00',
          photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'],
          text: '满一个月啦，带布丁去医院做了常规体检、秤了重，已经2.4kg啦，医生说骨骼发育非常好。它特别喜欢躺在客厅晒太阳，超级亲人。',
          healthStatus: '很好',
          eatingHabits: '正常',
          adaptability: '已经适应',
          ownerResponse: {
            status: '正常',
            msg: '哇，布丁长胖不少！感谢您科学细致的喂养，真是布丁的大福气！',
            repliedAt: '2026-05-10T10:00:00Z'
          }
        }
      },
      {
        nodeId: 'day90',
        title: '第 90 天：长期适应反馈',
        dueDate: '2026-07-09',
        status: '待提交'
      },
      {
        nodeId: 'day180',
        title: '第 180 天：半年反馈说明',
        dueDate: '2026-10-07',
        status: '待提交'
      }
    ]
  }
];

export const CHINA_REGIONS = {
  provinces: [
    {
      name: '广东省',
      cities: [
        { name: '广州市', districts: ['天河区', '海珠区', '越秀区', '白云区', '番禺区', '荔湾区'] },
        { name: '深圳市', districts: ['福田区', '南山区', '罗湖区', '宝安区', '龙岗区', '龙华区'] },
        { name: '珠海市', districts: ['香洲区', '斗门区', '金湾区'] }
      ]
    },
    {
      name: '四川省',
      cities: [
        { name: '成都市', districts: ['武侯区', '锦江区', '青羊区', '金牛区', '成华区', '双流区'] },
        { name: '绵阳市', districts: ['涪城区', '游仙区', '安州区'] }
      ]
    },
    {
      name: '北京市',
      cities: [
        { name: '北京市', districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区'] }
      ]
    },
    {
      name: '上海市',
      cities: [
        { name: '上海市', districts: ['浦东新区', '黄浦区', '徐汇区', '长宁区', '静安区', '普陀区'] }
      ]
    }
  ]
};
