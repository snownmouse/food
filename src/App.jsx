import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as echarts from 'echarts';
import chinaGeoJson from '../public/china.json';
import { getFoodImage } from './foodImages';

// 历史时期定义
const TIME_PERIODS = [
  { id: 'prehistoric', name: '史前-先秦', year: '-5000~-221', color: '#8B4513' },
  { id: 'han', name: '汉唐', year: '公元前206~公元907', color: '#DAA520' },
  { id: 'song', name: '宋元', year: '960~1368', color: '#CD853F' },
  { id: 'ming', name: '明清', year: '1368~1912', color: '#B8860B' },
  { id: 'modern', name: '近现代', year: '1912~至今', color: '#228B22' },
];

// 食物图片映射 - 使用真实图片URL
// 图片定义已移至 foodImages.js 文件中

// 省份典型食物数据 - 每个省份有多个代表性食物
const provinceFoods = {
  '北京市': [
    { name: '北京烤鸭', period: 'ming', description: '明清宫廷美食' },
    { name: '炸酱面', period: 'modern', description: '老北京风味' },
  ],
  '天津市': [
    { name: '狗不理包子', period: 'modern', description: '百年老字号' },
  ],
  '河北省': [
    { name: '驴肉火烧', period: 'modern', description: '河北名吃' },
    { name: '黍米糕', period: 'prehistoric', description: '先秦主食' },
  ],
  '山西省': [
    { name: '刀削面', period: 'modern', description: '面食之王' },
    { name: '小米饭', period: 'prehistoric', description: '史前粟作' },
    { name: '老陈醋', period: 'han', description: '三千年的历史' },
  ],
  '内蒙古自治区': [
    { name: '手把肉', period: 'prehistoric', description: '游牧传统' },
    { name: '奶茶', period: 'han', description: '草原饮品' },
    { name: '炒米', period: 'prehistoric', description: '蒙古主食' },
  ],
  '辽宁省': [
    { name: '锅包肉', period: 'modern', description: '东北名菜' },
    { name: '老边饺子', period: 'modern', description: '百年传承' },
  ],
  '吉林省': [
    { name: '朝鲜冷面', period: 'modern', description: '延边特色' },
    { name: '白肉血肠', period: 'modern', description: '满族传统' },
  ],
  '黑龙江省': [
    { name: '锅包肉', period: 'modern', description: '东北经典' },
    { name: '大豆酱', period: 'prehistoric', description: '先秦发酵' },
    { name: '五常大米', period: 'prehistoric', description: '优质稻作' },
  ],
  '上海市': [
    { name: '小笼包', period: 'modern', description: '江南点心' },
    { name: '生煎包', period: 'modern', description: '上海特色' },
  ],
  '江苏省': [
    { name: '盐水鸭', period: 'ming', description: '南京名菜' },
    { name: '阳澄湖大闸蟹', period: 'song', description: '江南鲜味' },
    { name: '苏式月饼', period: 'song', description: '中秋传统' },
  ],
  '浙江省': [
    { name: '龙井虾仁', period: 'song', description: '茶乡名菜' },
    { name: '西湖醋鱼', period: 'song', description: '杭帮经典' },
    { name: '东坡肉', period: 'song', description: '宋代名菜' },
  ],
  '安徽省': [
    { name: '臭鳜鱼', period: 'ming', description: '徽州名菜' },
    { name: '毛豆腐', period: 'ming', description: '发酵美食' },
    { name: '黄山烧饼', period: 'song', description: '徽州小吃' },
  ],
  '福建省': [
    { name: '佛跳墙', period: 'modern', description: '闽菜之首' },
    { name: '沙茶面', period: 'modern', description: '南洋风味' },
    { name: '荔枝肉', period: 'song', description: '福州名菜' },
  ],
  '江西省': [
    { name: '瓦罐汤', period: 'song', description: '南昌特色' },
    { name: '藜蒿炒腊肉', period: 'modern', description: '鄱阳湖鲜' },
  ],
  '山东省': [
    { name: '德州扒鸡', period: 'ming', description: '四大名鸡' },
    { name: '煎饼卷大葱', period: 'prehistoric', description: '齐鲁主食' },
    { name: '糖醋鲤鱼', period: 'han', description: '鲁菜经典' },
  ],
  '河南省': [
    { name: '烩面', period: 'modern', description: '中原面食' },
    { name: '胡辣汤', period: 'song', description: '河南早餐' },
    { name: '道口烧鸡', period: 'ming', description: '四大名鸡' },
  ],
  '湖北省': [
    { name: '热干面', period: 'modern', description: '武汉名片' },
    { name: '武昌鱼', period: 'han', description: '三国名菜' },
    { name: '鸭脖', period: 'modern', description: '武汉小吃' },
  ],
  '湖南省': [
    { name: '剁椒鱼头', period: 'ming', description: '湘菜代表' },
    { name: '臭豆腐', period: 'modern', description: '长沙名吃' },
    { name: '辣椒炒肉', period: 'ming', description: '家常湘菜' },
  ],
  '广东省': [
    { name: '白切鸡', period: 'modern', description: '粤菜经典' },
    { name: '早茶点心', period: 'modern', description: '广府文化' },
    { name: '煲仔饭', period: 'modern', description: '广东特色' },
  ],
  '广西壮族自治区': [
    { name: '螺蛳粉', period: 'modern', description: '柳州名吃' },
    { name: '桂林米粉', period: 'modern', description: '桂林名片' },
    { name: '柠檬鸭', period: 'modern', description: '南宁名菜' },
  ],
  '海南省': [
    { name: '文昌鸡', period: 'modern', description: '海南四大名菜' },
    { name: '清补凉', period: 'modern', description: '热带甜品' },
  ],
  '重庆市': [
    { name: '火锅', period: 'modern', description: '山城名片' },
    { name: '小面', period: 'modern', description: '重庆早餐' },
    { name: '酸辣粉', period: 'modern', description: '川渝小吃' },
  ],
  '四川省': [
    { name: '麻婆豆腐', period: 'song', description: '川菜代表' },
    { name: '宫保鸡丁', period: 'ming', description: '官府名菜' },
    { name: '火锅', period: 'modern', description: '麻辣鲜香' },
    { name: '回锅肉', period: 'modern', description: '川菜之首' },
  ],
  '贵州省': [
    { name: '酸汤鱼', period: 'modern', description: '苗家名菜' },
    { name: '丝娃娃', period: 'modern', description: '贵阳小吃' },
    { name: '肠旺面', period: 'modern', description: '贵州面食' },
  ],
  '云南省': [
    { name: '过桥米线', period: 'modern', description: '云南名片' },
    { name: '汽锅鸡', period: 'modern', description: '滇味名菜' },
    { name: '鲜花饼', period: 'modern', description: '云南特产' },
  ],
  '西藏自治区': [
    { name: '酥油茶', period: 'prehistoric', description: '藏式饮品' },
    { name: '糌粑', period: 'prehistoric', description: '藏族主食' },
    { name: '青稞酒', period: 'prehistoric', description: '高原佳酿' },
  ],
  '陕西省': [
    { name: '肉夹馍', period: 'modern', description: '陕西名片' },
    { name: '羊肉泡馍', period: 'modern', description: '西安名吃' },
    { name: '凉皮', period: 'modern', description: '关中小吃' },
    { name: 'biangbiang面', period: 'modern', description: '关中面食' },
  ],
  '甘肃省': [
    { name: '兰州拉面', period: 'modern', description: '中华第一面' },
    { name: '手抓羊肉', period: 'prehistoric', description: '西北风味' },
    { name: '酿皮', period: 'han', description: '丝路美食' },
  ],
  '青海省': [
    { name: '手抓羊肉', period: 'prehistoric', description: '高原美味' },
    { name: '酸奶', period: 'prehistoric', description: '青海特产' },
  ],
  '宁夏回族自治区': [
    { name: '手抓羊肉', period: 'prehistoric', description: '回族美食' },
    { name: '羊杂碎', period: 'han', description: '宁夏早餐' },
  ],
  '新疆维吾尔自治区': [
    { name: '大盘鸡', period: 'modern', description: '新疆名菜' },
    { name: '烤羊肉串', period: 'prehistoric', description: '丝路风味' },
    { name: '馕', period: 'han', description: '新疆主食' },
    { name: '抓饭', period: 'han', description: '维吾尔美食' },
  ],
  '台湾省': [
    { name: '卤肉饭', period: 'modern', description: '台湾名吃' },
    { name: '珍珠奶茶', period: 'modern', description: '台湾发明' },
  ],
  '香港特别行政区': [
    { name: '港式奶茶', period: 'modern', description: '丝袜奶茶' },
    { name: '菠萝包', period: 'modern', description: '港式茶点' },
  ],
  '澳门特别行政区': [
    { name: '葡式蛋挞', period: 'modern', description: '澳门特色' },
    { name: '猪扒包', period: 'modern', description: '澳门小吃' },
  ],
};

// 作物数据 - 基于真实经纬度坐标，添加引入时间和传播路径
const foodData = [
  // 史前-先秦时期（本土起源）
  { id: 1, name: '粟', coords: [112.5, 37.9], color: '#DAA520', size: 10, region: '山西', period: 'prehistoric', type: 'native', introYear: -5000 },
  { id: 2, name: '黍', coords: [114.5, 38.0], color: '#DAA520', size: 10, region: '河北', period: 'prehistoric', type: 'native', introYear: -5000 },
  { id: 3, name: '大豆', coords: [126.6, 45.8], color: '#DAA520', size: 12, region: '黑龙江', period: 'prehistoric', type: 'native', introYear: -3000, isHero: true, group: '大豆' },
  { id: 4, name: '茶叶', coords: [120.2, 30.3], color: '#228B22', size: 12, region: '浙江', period: 'prehistoric', type: 'native', introYear: -2700, isHero: true, group: '茶' },
  { id: 5, name: '水稻', coords: [119.3, 26.1], color: '#DAA520', size: 10, region: '福建', period: 'prehistoric', type: 'native', introYear: -7000 },
  { id: 6, name: '小麦', coords: [108.9, 34.3], color: '#DAA520', size: 10, region: '陕西', period: 'prehistoric', type: 'native', introYear: -3000 },
  
  // 汉唐时期（丝绸之路引入）
  { id: 7, name: '葡萄', coords: [87.6, 43.8], color: '#9370DB', size: 10, region: '新疆', period: 'han', type: 'introduced', introYear: -200 },
  { id: 8, name: '核桃', coords: [106.3, 38.5], color: '#8B4513', size: 9, region: '宁夏', period: 'han', type: 'introduced', introYear: -100 },
  { id: 9, name: '石榴', coords: [112.4, 34.7], color: '#DC143C', size: 9, region: '河南', period: 'han', type: 'introduced', introYear: 100 },
  { id: 10, name: '芝麻', coords: [113.7, 34.8], color: '#F0E68C', size: 8, region: '河南', period: 'han', type: 'introduced', introYear: 50 },
  
  // 宋元时期（海上丝绸之路）
  { id: 11, name: '占城稻', coords: [110.3, 25.3], color: '#FFD700', size: 10, region: '广西', period: 'song', type: 'introduced', introYear: 1012 },
  { id: 12, name: '棉花', coords: [119.9, 32.4], color: '#F5F5DC', size: 10, region: '江苏', period: 'song', type: 'introduced', introYear: 1100 },
  
  // 明清时期（大航海时代引入）
  { id: 13, name: '玉米', coords: [102.7, 25.0], color: '#FFD700', size: 14, region: '云南', period: 'ming', type: 'introduced', introYear: 1530, isHero: true, group: '玉米土豆' },
  { id: 14, name: '土豆', coords: [103.8, 36.1], color: '#D2B48C', size: 14, region: '甘肃', period: 'ming', type: 'introduced', introYear: 1570, isHero: true, group: '玉米土豆' },
  { id: 15, name: '甘薯', coords: [113.3, 23.1], color: '#FF6347', size: 10, region: '广东', period: 'ming', type: 'introduced', introYear: 1580 },
  { id: 16, name: '辣椒', coords: [104.1, 30.7], color: '#FF4500', size: 10, region: '四川', period: 'ming', type: 'introduced', introYear: 1590 },
  { id: 17, name: '番茄', coords: [117.0, 36.7], color: '#FF6347', size: 9, region: '山东', period: 'ming', type: 'introduced', introYear: 1600 },
  { id: 18, name: '烟草', coords: [113.0, 28.2], color: '#8B7355', size: 9, region: '湖南', period: 'ming', type: 'introduced', introYear: 1600 },
  { id: 19, name: '花生', coords: [120.4, 36.4], color: '#DEB887', size: 9, region: '山东', period: 'ming', type: 'introduced', introYear: 1550 },
  { id: 20, name: '向日葵', coords: [118.8, 42.3], color: '#FFD700', size: 9, region: '内蒙古', period: 'ming', type: 'introduced', introYear: 1620 },
  
  // 近现代
  { id: 21, name: '橡胶', coords: [110.3, 20.0], color: '#2F4F4F', size: 8, region: '海南', period: 'modern', type: 'introduced', introYear: 1900 },
];

// 作物传播路径数据
const migrationPaths = [
  {
    id: 1,
    name: '丝绸之路',
    period: 'han',
    paths: [
      { from: [75.0, 39.0], to: [87.6, 43.8], crop: '葡萄' },
      { from: [75.0, 39.0], to: [106.3, 38.5], crop: '核桃' },
      { from: [75.0, 39.0], to: [112.4, 34.7], crop: '石榴' },
    ],
    color: '#DAA520'
  },
  {
    id: 2,
    name: '海上丝绸之路',
    period: 'song',
    paths: [
      { from: [110.0, 20.0], to: [110.3, 25.3], crop: '占城稻' },
      { from: [120.0, 30.0], to: [119.9, 32.4], crop: '棉花' },
    ],
    color: '#4682B4'
  },
  {
    id: 3,
    name: '大航海贸易',
    period: 'ming',
    paths: [
      { from: [120.0, 23.0], to: [102.7, 25.0], crop: '玉米' },
      { from: [120.0, 23.0], to: [103.8, 36.1], crop: '土豆' },
      { from: [120.0, 23.0], to: [113.3, 23.1], crop: '甘薯' },
      { from: [120.0, 23.0], to: [104.1, 30.7], crop: '辣椒' },
    ],
    color: '#FF6347'
  }
];



// 作物详情数据
const cropDetails = {
  '茶': {
    title: '茶：从解毒药到民族粘合剂',
    history: [
      { id: 1, text: '汉唐(初始利用/茶马互市初探)' },
      { id: 2, text: '宋元(设茶马司/制度化)' },
      { id: 3, text: '明清(滇藏茶马古道极盛/多民族共同参与)' },
      { id: 4, text: '宁可三日无粮，不可一日无茶' }
    ],
    science: [
      { id: 1, text: '酶促反应控制(绿茶到红茶的PPO酶氧化)' },
      { id: 2, text: '生理代谢互补(茶碱促进高寒民族脂类代谢)' },
      { id: 3, text: '表观遗传(海拔/紫外线导致大叶种与小叶种甲基化差异)' }
    ]
  },
  '玉米土豆': {
    title: '玉米与土豆：山地民族的生存密码',
    history: [
      { id: 1, text: '16世纪明中叶(经西南边疆土司领地秘密传入)' },
      { id: 2, text: '17-18世纪清(西南苗瑶高山抗饥荒主力)' },
      { id: 3, text: '18世纪后(反向输入中原/支撑人口突破4亿大关)' },
      { id: 4, text: '深山老林之区，包谷遍种，夷汉皆利之' }
    ],
    science: [
      { id: 1, text: 'C4光合优势(花环结构打破山地生存极限)' },
      { id: 2, text: '无性克隆繁殖(土豆块茎避开高寒生殖障碍)' },
      { id: 3, text: '基因多样性爆发(美洲基因注入增强农业抗逆性)' }
    ]
  },
  '大豆': {
    title: '大豆：王者之食的基因密码',
    history: [
      { id: 1, text: '先秦(《诗经》中原驯化/汉代发明豆腐)' },
      { id: 2, text: '魏晋辽金元(向游牧民族及东北女真传播酱豆豉技术)' },
      { id: 3, text: '近代(东北成为世界级产区/各族共育)' },
      { id: 4, text: '菽者，王者之食也' }
    ],
    science: [
      { id: 1, text: '根瘤共生体系(与根瘤菌互利共生/天然化肥隐喻民族共生)' },
      { id: 2, text: '蛋白质重组技术(点卤导致大豆蛋白空间构象交联重排/古代生物材料学)' }
    ]
  }
};

// ==================== 五条新路线数据 ====================

// 五条路线定义
const FIVE_ROUTES = [
  {
    id: 'soybean',
    name: '大豆',
    subtitle: '中原辐射线',
    theme: '技术熔炉里的青春创新',
    color: '#DAA520',
    pathColor: '#FFD700',
    icon: '🌱'
  },
  {
    id: 'barnyard',
    name: '稗子',
    subtitle: '极寒演替线',
    theme: '生态纽带中的青春担当',
    color: '#8B7355',
    pathColor: '#CD853F',
    icon: '🌾'
  },
  {
    id: 'highland',
    name: '青稞',
    subtitle: '高原本土线',
    theme: '双向奔赴中的青春援藏',
    color: '#4169E1',
    pathColor: '#6495ED',
    icon: '🏔️'
  },
  {
    id: 'southwest',
    name: '酸汤/苦荞',
    subtitle: '西南共生线',
    theme: '食物链中的青春创业',
    color: '#228B22',
    pathColor: '#32CD32',
    icon: '🍃'
  },
  {
    id: 'strait',
    name: '乌龙茶/芋头',
    subtitle: '海峡同源线',
    theme: '基因共鸣中的青春桥梁',
    color: '#9370DB',
    pathColor: '#BA55D3',
    icon: '🍵'
  }
];

// 五条路线的详细内容数据
const routeDetailsData = {
  'soybean': {
    periods: [
      {
        era: '史前-先秦',
        year: '公元前5000年-公元前221年',
        history: '《诗经》记载"中原有菽"，大豆是中原"五谷"之一，中原华夏先民驯化大豆，成为农耕文明核心作物',
        exchange: '大豆作为本土作物，奠定中原与周边民族（如东夷、戎狄）的饮食基础',
        science: '大豆是豆科植物，根系与根瘤菌形成互利共生体系（根瘤菌固氮，大豆提供碳源），隐喻中原农耕文明的"生态基础"'
      },
      {
        era: '汉代',
        year: '公元前206年-公元220年',
        history: '淮南王刘安发明豆腐技术，将大豆从"粮食作物"转化为"蛋白质食品"，成为素食文化载体',
        exchange: '豆腐技术通过丝绸之路传播至西域，被匈奴、鲜卑等游牧民族接受',
        science: '蛋白质空间构象交联（卤水中的钙镁离子打破大豆蛋白结构，形成凝胶网络），隐喻"文化重组"的融合逻辑'
      },
      {
        era: '魏晋南北朝-隋唐',
        year: '公元220年-907年',
        history: '豆腐技术传入北方游牧民族，如契丹、突厥，游牧民族用本地奶制品（牛奶、羊奶）改良豆腐，创造"奶豆腐""酸奶豆腐"等变种',
        exchange: '农牧民族在饮食技术上深度互鉴，大豆成为连接农耕与游牧的"技术桥梁"',
        science: '奶制品中的乳蛋白与大豆蛋白的复合凝胶（双重蛋白质交联），体现"多元融合"的生物学逻辑'
      },
      {
        era: '宋元明清',
        year: '公元960年-1912年',
        history: '大豆种植技术向东北扩展，清代"闯关东"移民潮中，汉族农民带去大豆，与满族旗人形成"满汉共耕"——汉族教满族种大豆，满族用奶制品改良豆腐',
        exchange: '大豆成为东北各民族（满、汉、蒙）的共同主食，体现"生计方式一体化"',
        science: '大豆的高蛋白特性（适应东北寒冷环境的能量需求），与满族奶制品的脂肪补充形成"营养互补"'
      },
      {
        era: '近现代',
        year: '1912年至今',
        history: '东北"90后"农业科技工作者用基因编辑培育"高蛋白大豆"；吉林大学生返乡创业团队开发"东北豆奶"，打造网红产品',
        exchange: '满汉共耕的团结基因，转化为青年在农业科技中的"同心筑梦"',
        science: '现代生物技术延续传统智慧，基因编辑技术与传统育种相结合',
        youthAction: '青年用创新让大豆成为"建功新时代"的载体'
      }
    ]
  },
  'barnyard': {
    periods: [
      {
        era: '新石器时代-唐宋',
        year: '约公元前5000年-公元1279年',
        history: '肃慎、靺鞨等东北渔猎民族在极寒环境中驯化稗子，稗子米成为"极寒军粮"（适应东北三江平原涝洼地）',
        exchange: '稗子是东北土著民族（如女真族先民）的生存底气，支撑其从渔猎向半农半猎转型',
        science: '稗子是C4植物，具有海绵体通气组织（茎秆能向根系输送氧气，适应深水涝洼地），体现"极端环境适应"的生物学智慧'
      },
      {
        era: '金元时期',
        year: '公元1115年-1368年',
        history: '女真族（满族先民）将稗子作为军粮，稗子米成为战略物资，支撑金朝军事扩张',
        exchange: '稗子成为女真族与周边民族（如蒙古、汉族）贸易的重要商品',
        science: '稗子的高淀粉含量（提供高能量，适应游牧/渔猎民族的能量需求），与蒙古族的"肉食-稗子"饮食结构形成"营养互补"'
      },
      {
        era: '清代',
        year: '公元1644年-1912年',
        history: '"闯关东"移民潮中，汉族带来大豆、高粱等高产作物，稗子逐渐退出主食，但满族与汉族形成"稗子-大豆"交换',
        exchange: '稗子成为两族共同适应环境的"过渡作物"，体现"生态智慧传承"',
        science: '稗子的耐涝特性（适应东北涝洼地）与大豆的耐旱特性（适应改良土壤）形成"生态位互补"'
      },
      {
        era: '近现代',
        year: '1912年至今',
        history: '辽宁"00后"环保社团种植稗子修复黑土地（稗子根系固氮保水，替代化肥）；黑龙江青年推广"稗子复种"技术',
        exchange: '满汉在生态适应中的团结，转化为青年在可持续发展中的"同心担当"',
        science: '传统生态智慧转化为"黑土地保护"实践，生态农业与青年行动相结合',
        youthAction: '青年用生态保护让稗子成为"筑梦未来"的纽带'
      }
    ]
  },
  'highland': {
    periods: [
      {
        era: '新石器时代',
        year: '约公元前3000年',
        history: '昌果沟遗址考古发现青稞驯化，是青藏高原最早的农作物，藏族先民驯化青稞，适应高海拔环境',
        exchange: '青稞成为藏区主食，支撑吐蕃王朝的社会结构，"糌粑"成为藏族饮食文化的核心',
        science: '青稞是C3植物，具有β-葡聚糖（高寒环境下提供稀缺代谢能量），适应低氧、强紫外线的极端环境'
      },
      {
        era: '唐宋',
        year: '公元618年-1279年',
        history: '文成公主入藏带去茶叶（汉族），藏区青稞传入内地，形成"茶-青稞"跨区域贸易',
        exchange: '茶马古道开启藏汉双向交流，茶叶与青稞成为"友谊符号"',
        science: '茶叶中的茶多酚（抗氧化）与青稞中的β-葡聚糖（调节血糖）形成"生理互补"，隐喻"藏汉健康共生"'
      },
      {
        era: '元明清',
        year: '公元1271年-1912年',
        history: '茶马古道核心市场康定，藏汉共市，青稞与茶叶在此交换，藏族商人用青稞换茶叶，汉族商人用茶叶换青稞',
        exchange: '藏汉两族在康定共同修建"锅庄"（贸易集散地），形成"藏汉共市"格局',
        science: '青稞的高纤维特性（促进肠道健康）与茶叶的咖啡因（提神）形成"功能互补"，体现"跨区域饮食协同"'
      },
      {
        era: '近现代',
        year: '1912年至今',
        history: '西藏"研究生支教团"教藏区孩子青稞加工技术（糌粑、青稞酒），通过电商销往全国；拉萨青年创办"青稞文创工坊"',
        exchange: '茶马古道的团结基因，转化为青年在藏区发展中的"同心筑梦"',
        science: '现代科技赋能传统产业，电商与文创结合推动青稞产业升级',
        youthAction: '青年用产业帮扶让青稞成为"建功新时代"的桥梁'
      }
    ]
  },
  'southwest': {
    periods: [
      {
        era: '先秦-汉代',
        year: '约公元前221年-公元220年',
        history: '苗族"以酸代盐"制作酸汤（利用天然乳酸菌发酵），彝族将苦荞视为"五谷之王"（适应西南山地贫瘠土壤）',
        exchange: '苗族用酸汤腌制蔬菜（如酸汤鱼），彝族用苦荞制作粑粑（如"苦荞饼"），通过节日交换食物',
        science: '酸汤中的乳酸菌群落（酶促反应，无盐条件下防腐与风味重塑），苦荞中的黄酮类生物碱（适应高寒贫瘠的次生代谢产物），体现"山地生态适应"的生物学智慧'
      },
      {
        era: '唐宋',
        year: '公元618年-1279年',
        history: '酸汤文化在西南形成独特体系，苦荞成为彝族婚礼、葬礼的仪式食品',
        exchange: '苗彝通过"食物外交"建立友谊，酸汤与苦荞成为"文化符号"',
        science: '酸汤中的有机酸（促进消化）与苦荞中的膳食纤维（调节血糖）形成"营养互补"，体现"山地饮食协同"'
      },
      {
        era: '明清',
        year: '公元1368年-1912年',
        history: '哈尼族梯田稻作系统发展成熟，与酸汤、苦荞形成"山地食物链"——哈尼族的稻米喂猪，猪粪用于梯田；苗族的酸汤用于腌制蔬菜；彝族的苦荞用于制作粑粑',
        exchange: '多民族在资源利用上形成"生态共生"，体现"美美与共"的生存哲学',
        science: '梯田的水循环系统（保持土壤湿度）与酸汤的发酵技术（保存蔬菜）、苦荞的耐贫瘠特性（适应山地土壤）形成"生态位互补"'
      },
      {
        era: '近现代',
        year: '1912年至今',
        history: '贵州"95后"大学生开发"酸汤苦荞饼""苦荞酸汤粉"，结合苗彝节庆做文旅活动；云南青年合作社带动苗族、彝族农民共同参与',
        exchange: '苗彝的食物互补，转化为青年在乡村振兴中的"同心创业"',
        science: '产业融合创新，传统食材与现代加工工艺结合',
        youthAction: '青年用产业融合让酸汤/苦荞成为"建功新时代"的抓手'
      }
    ]
  },
  'strait': {
    periods: [
      {
        era: '史前',
        year: '约公元前3000年',
        history: '南岛语系先民携带芋头从大陆东南沿海（如福建、浙江）跨海迁徙至台湾，芋头成为台湾原住民的重要粮食作物',
        exchange: '芋头成为两岸先民的"共同食物记忆"，形成"芋头神"崇拜（如台湾原住民的"丰收祭"与福建的"芋头节"）',
        science: '芋头是无性克隆植物（母体切块繁殖，保持100%相同基因），体现"史前迁徙的基因密码"'
      },
      {
        era: '唐代-宋代',
        year: '公元618年-1279年',
        history: '乌龙茶制作技术在福建形成，成为闽台地区的重要经济作物',
        exchange: '闽南移民（如泉州、漳州）将乌龙茶种带至台湾，与台湾原住民（如泰雅族）共同种植',
        science: '乌龙茶的半发酵工艺（保留茶多酚与氨基酸的平衡），适应福建与台湾的气候差异，体现"地域适应"的农业智慧'
      },
      {
        era: '清代',
        year: '公元1644年-1912年',
        history: '闽台茶农共同种植乌龙茶，闽南移民教原住民种茶，原住民提供山地经验（如阿里山的云雾环境适合种茶）',
        exchange: '乌龙茶成为两岸"共同产业"，两岸茶农形成"技术共同体"',
        science: '乌龙茶的表观遗传差异（闽台同基因型，因海洋季风导致DNA甲基化差异，风味不同），体现"地域微环境的基因表达"'
      },
      {
        era: '近现代',
        year: '1912年至今',
        history: '福建"90后"茶艺师与台湾"00后"芋头种植户合作，举办"两岸青年茶艺大赛"（用乌龙茶做"同心茶"，芋头做"两岸芋圆"）',
        exchange: '两岸的血脉相连，转化为青年在两岸融合中的"建功未来"',
        science: '两岸高校合作开发"乌龙茶文创""芋头文创"，推动文化认同',
        youthAction: '青年用文化交流让乌龙茶/芋头成为"同心筑梦"的载体'
      }
    ]
  }
};

// 五条路线的地理路径数据（用于地图动画）
const routePathsData = {
  'soybean': {
    // 大豆：中原 → 东北
    points: [
      { name: '中原起源', coord: [113.6, 34.8], year: -5000 },      // 河南
      { name: '中原驯化', coord: [114.3, 34.8], year: -3000 },      // 河南
      { name: '豆腐发明', coord: [117.0, 32.6], year: -200 },       // 安徽淮南
      { name: '向游牧传播', coord: [111.7, 40.8], year: 200 },      // 内蒙古
      { name: '东北扩展', coord: [123.4, 41.8], year: 960 },        // 辽宁
      { name: '黑龙江产区', coord: [126.6, 45.8], year: 1644 },     // 黑龙江
      { name: '现代创新', coord: [125.3, 43.8], year: 1912 }        // 吉林
    ],
    color: '#FFD700'
  },
  'barnyard': {
    // 稗子：三江平原 → 黑土地保护
    points: [
      { name: '三江平原起源', coord: [132.5, 47.0], year: -5000 },  // 黑龙江三江平原
      { name: '肃慎驯化', coord: [131.0, 46.6], year: -3000 },      // 黑龙江
      { name: '女真军粮', coord: [126.5, 45.8], year: 1115 },       // 哈尔滨
      { name: '满汉交换', coord: [123.4, 41.8], year: 1644 },        // 辽宁
      { name: '生态过渡', coord: [126.6, 45.8], year: 1912 },        // 黑龙江
      { name: '黑土地保护', coord: [122.0, 41.0], year: 2000 }       // 辽宁
    ],
    color: '#CD853F'
  },
  'highland': {
    // 青稞：西藏 → 内地
    points: [
      { name: '昌果沟起源', coord: [91.1, 29.6], year: -3000 },      // 西藏昌果沟
      { name: '吐蕃驯化', coord: [91.1, 29.7], year: -2000 },        // 拉萨
      { name: '文成公主入藏', coord: [91.1, 29.6], year: 641 },      // 拉萨
      { name: '茶马古道', coord: [101.9, 30.0], year: 960 },         // 康定
      { name: '藏汉共市', coord: [101.9, 30.0], year: 1271 },        // 康定
      { name: '现代援藏', coord: [91.1, 29.6], year: 1912 },         // 拉萨
      { name: '电商全国', coord: [104.0, 30.6], year: 2000 }         // 成都
    ],
    color: '#6495ED'
  },
  'southwest': {
    // 酸汤/苦荞：西南山地 → 全国
    points: [
      { name: '苗族酸汤', coord: [107.5, 26.6], year: -221 },        // 贵州
      { name: '彝族苦荞', coord: [102.7, 25.0], year: -221 },        // 云南
      { name: '苗彝交流', coord: [104.8, 25.1], year: 618 },         // 黔西南
      { name: '哈尼梯田', coord: [102.8, 23.4], year: 1368 },        // 云南红河
      { name: '生态共生', coord: [106.6, 26.6], year: 1644 },        // 贵州
      { name: '产业创新', coord: [106.7, 26.6], year: 1912 },        // 贵阳
      { name: '文旅融合', coord: [102.8, 25.1], year: 2000 }         // 昆明
    ],
    color: '#32CD32'
  },
  'strait': {
    // 乌龙茶/芋头：福建 → 台湾
    points: [
      { name: '福建起源', coord: [119.3, 26.1], year: -3000 },       // 福建
      { name: '跨海迁徙', coord: [121.5, 25.0], year: -3000 },       // 台湾
      { name: '乌龙茶形成', coord: [117.0, 25.1], year: 960 },        // 福建
      { name: '闽台共种', coord: [120.8, 24.5], year: 1100 },        // 台湾
      { name: '技术共同体', coord: [120.9, 23.5], year: 1644 },       // 阿里山
      { name: '两岸融合', coord: [119.3, 26.1], year: 1912 },        // 福建
      { name: '青年合作', coord: [121.5, 25.0], year: 2000 }          // 台湾
    ],
    color: '#BA55D3'
  }
};

// 标准地图配色方案
const MAP_COLORS = {
  // 海洋/水域
  water: '#B8D4E3',
  // 陆地基础色
  land: '#F5F5DC',
  // 省界
  border: '#8B7355',
  // 本土作物
  nativeCrop: '#228B22',
  // 引入作物
  introducedCrop: '#FF6347',
  // 重点作物
  heroCrop: '#4169E1',
  // 传播路径
  pathColor: '#FF8C00',
  // 文字
  text: '#333333',
  // 背景
  background: '#E8F4F8'
};



// 中国地图组件
const ChinaMap = ({ onCropClick, selectedCrop, currentPeriod, isPlaying, playbackSpeed, onChartInit, provinceFoodsData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const animationRef = useRef(null);

  // 获取当前时期可见的作物（只显示本土作物）
  const getVisibleCrops = useCallback(() => {
    const periodIndex = TIME_PERIODS.findIndex(p => p.id === currentPeriod);
    return foodData.filter(crop => {
      const cropPeriodIndex = TIME_PERIODS.findIndex(p => p.id === crop.period);
      // 只显示本土作物，过滤掉外来引入作物
      return cropPeriodIndex <= periodIndex && crop.type === 'native';
    });
  }, [currentPeriod]);

  // 获取当前时期的传播路径
  const getVisiblePaths = useCallback(() => {
    return migrationPaths.filter(path => path.period === currentPeriod);
  }, [currentPeriod]);
  
  // 获取省份中心坐标
  const getProvinceCenter = useCallback((name) => {
    const provinceCenters = {
      '北京市': [116.4074, 39.9042],
      '天津市': [117.2008, 39.0842],
      '河北省': [114.5149, 38.0423],
      '山西省': [112.5489, 37.8706],
      '内蒙古自治区': [111.7519, 40.8414],
      '辽宁省': [123.4315, 41.8057],
      '吉林省': [125.3235, 43.8171],
      '黑龙江省': [126.6617, 45.7423],
      '上海市': [121.4737, 31.2304],
      '江苏省': [118.7969, 32.0603],
      '浙江省': [120.1551, 30.2741],
      '安徽省': [117.2849, 31.8612],
      '福建省': [119.2965, 26.0745],
      '江西省': [115.8540, 28.6820],
      '山东省': [117.0208, 36.6685],
      '河南省': [113.6253, 34.7466],
      '湖北省': [114.3054, 30.5928],
      '湖南省': [112.9388, 28.2282],
      '广东省': [113.2644, 23.1291],
      '广西壮族自治区': [108.3275, 22.8155],
      '海南省': [110.3492, 20.0174],
      '重庆市': [106.5516, 29.5630],
      '四川省': [104.0668, 30.5728],
      '贵州省': [106.6302, 26.6477],
      '云南省': [102.8329, 24.8801],
      '西藏自治区': [91.1409, 29.6456],
      '陕西省': [108.9398, 34.3416],
      '甘肃省': [103.8263, 36.0594],
      '青海省': [101.7802, 36.6209],
      '宁夏回族自治区': [106.2309, 38.4872],
      '新疆维吾尔自治区': [87.6168, 43.8256],
      '台湾省': [121.5654, 25.0330],
      '香港特别行政区': [114.1694, 22.3193],
      '澳门特别行政区': [113.5491, 22.1987],
    };
    return provinceCenters[name] || [105, 35];
  }, []);
  
  // 获取当前时期可见的省份食物数据（用于ECharts渲染）
  const getVisibleProvinceFoods = useCallback(() => {
    const periodIndex = TIME_PERIODS.findIndex(p => p.id === currentPeriod);
    const foods = [];
    
    Object.entries(provinceFoodsData || provinceFoods).forEach(([provinceName, provinceFoodsList]) => {
      const centerCoord = getProvinceCenter(provinceName);
      const visibleFoods = provinceFoodsList.filter(food => {
        const foodPeriodIndex = TIME_PERIODS.findIndex(p => p.id === food.period);
        return foodPeriodIndex <= periodIndex;
      });
      
      // 为每个食物创建偏移坐标，避免重叠
      // 根据食物数量动态调整偏移半径
      const baseRadius = visibleFoods.length === 1 ? 0 : 
                         visibleFoods.length === 2 ? 0.5 :
                         visibleFoods.length === 3 ? 0.6 : 0.8;
      
      visibleFoods.forEach((food, index) => {
        // 均匀分布在圆周上
        const angle = visibleFoods.length === 1 ? 0 : 
                      (index / visibleFoods.length) * 2 * Math.PI - Math.PI / 2;
        
        // 如果有多个食物，使用更大的偏移半径
        const radius = visibleFoods.length === 1 ? 0 : baseRadius;
        const offsetLng = Math.cos(angle) * radius;
        const offsetLat = Math.sin(angle) * radius;
        
        foods.push({
          name: food.name,
          value: [centerCoord[0] + offsetLng, centerCoord[1] + offsetLat],
          provinceName,
          description: food.description,
          originalCoord: centerCoord
        });
      });
    });
    
    return foods;
  }, [currentPeriod, getProvinceCenter, provinceFoodsData]);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    
    // 将 chartInstance 传递给父组件
    if (onChartInit) {
      onChartInit(chartInstance.current);
    }

    // 直接使用导入的地图数据
    console.log('地图数据加载成功');
    echarts.registerMap('china', chinaGeoJson);
    updateChart();

    const handleResize = () => {
      chartInstance.current && chartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      chartInstance.current && chartInstance.current.dispose();
    };
  }, []);

  // 更新图表
  const updateChart = useCallback(() => {
    if (!chartInstance.current) return;

    const visibleCrops = getVisibleCrops();
    const visiblePaths = getVisiblePaths();
    const visibleProvinceFoods = getVisibleProvinceFoods();

    const series = [
      // 基础散点 - 所有可见作物
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        data: visibleCrops.map(item => ({
          name: item.name,
          value: [...item.coords, item.size],
          itemData: item
        })),
        symbolSize: function (val) {
          return val[2];
        },
        itemStyle: {
          color: function(params) {
            const crop = params.data.itemData;
            if (crop.isHero) return MAP_COLORS.heroCrop;
            return crop.type === 'native' ? MAP_COLORS.nativeCrop : MAP_COLORS.introducedCrop;
          },
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        emphasis: {
          scale: 1.5,
          itemStyle: {
            shadowBlur: 20
          }
        },
        animationDuration: 1000,
        animationEasing: 'elasticOut'
      },
      // 涟漪效果 - 重点作物
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: visibleCrops.filter(item => item.isHero).map(item => ({
          name: item.name,
          value: [...item.coords, item.size + 5],
          itemData: item
        })),
        symbolSize: function (val) {
          return val[2];
        },
        rippleEffect: {
          brushType: 'stroke',
          scale: 3,
          period: 4
        },
        itemStyle: {
          color: MAP_COLORS.heroCrop
        }
      },
      // 省份美食散点 - 使用ECharts渲染确保位置稳定
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        data: visibleProvinceFoods.map(item => ({
          name: item.name,
          value: [...item.value, 8], // 大小为8
          itemData: item
        })),
        symbolSize: 8,
        itemStyle: {
          color: '#667eea',
          borderColor: '#fff',
          borderWidth: 1,
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'top',
          distance: 8,
          fontSize: 9,
          fontWeight: 'bold',
          color: '#333',
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: [3, 5],
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#ccc',
          // 智能隐藏重叠标签
          hideOverlap: true,
          // 允许标签位置自适应调整
          moveOverlap: 'shiftY'
        },
        emphasis: {
          scale: 1.8,
          label: {
            show: true,
            fontSize: 11,
            backgroundColor: 'rgba(255,255,255,1)',
            borderColor: '#999'
          }
        },
        animationDuration: 500,
        animationEasing: 'elasticOut'
      },
      // 传播路径线
      ...visiblePaths.flatMap(path => 
        path.paths.map((p, idx) => ({
          type: 'lines',
          coordinateSystem: 'geo',
          data: [[{
            coord: p.from,
            lineStyle: { color: path.color }
          }, {
            coord: p.to
          }]],
          lineStyle: {
            color: path.color,
            width: 2,
            curveness: 0.2,
            type: 'solid'
          },
          effect: {
            show: true,
            period: 3,
            trailLength: 0.5,
            color: path.color,
            symbol: 'arrow',
            symbolSize: 8
          },
          animationDuration: 2000,
          animationDelay: idx * 500
        }))
      )
    ];

    const option = {
      backgroundColor: MAP_COLORS.background,
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [105, 36],
        label: {
          show: true,
          color: MAP_COLORS.text,
          fontSize: 10
        },
        itemStyle: {
          areaColor: MAP_COLORS.land,
          borderColor: MAP_COLORS.border,
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            areaColor: '#E0E0C0'
          },
          label: {
            show: true
          }
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          if (params.data && params.data.itemData) {
            const item = params.data.itemData;
            
            // 判断是作物数据还是省份美食数据
            if (item.period) {
              // 作物数据
              const period = TIME_PERIODS.find(p => p.id === item.period);
              return `
                <div style="padding: 8px;">
                  <strong style="font-size: 14px;">${item.name}</strong><br/>
                  <span style="color: #666;">地区: ${item.region || '未知'}</span><br/>
                  <span style="color: #666;">时期: ${period?.name || '未知'}</span><br/>
                  <span style="color: #666;">类型: ${item.type === 'native' ? '本土作物' : '外来引入'}</span>
                </div>
              `;
            } else if (item.provinceName) {
              // 省份美食数据
              return `
                <div style="padding: 8px;">
                  <strong style="font-size: 14px;">${item.name}</strong><br/>
                  <span style="color: #666;">地区: ${item.provinceName}</span><br/>
                  <span style="color: #666;">${item.description || ''}</span>
                </div>
              `;
            }
          }
          return params.name;
        }
      },
      series: series
    };

    chartInstance.current.setOption(option, true);

    // 点击事件
    chartInstance.current.off('click');
    chartInstance.current.on('click', function (params) {
      if (params.data && params.data.itemData && params.data.itemData.isHero) {
        onCropClick(params.data.itemData.group);
      }
    });
  }, [getVisibleCrops, getVisiblePaths, onCropClick]);

  // 当时期改变时更新图表
  useEffect(() => {
    updateChart();
  }, [currentPeriod, updateChart]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

// 时间轴组件
const Timeline = ({ currentPeriod, onPeriodChange, isPlaying, onPlayPause, playbackSpeed, onSpeedChange }) => {
  const currentIndex = TIME_PERIODS.findIndex(p => p.id === currentPeriod);

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200">
      <div className="flex items-center gap-4">
        {/* 播放控制 */}
        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* 速度控制 */}
        <select
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="px-3 py-1 rounded border border-gray-300 text-sm bg-white"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>

        {/* 时间轴 */}
        <div className="flex items-center gap-2">
          {TIME_PERIODS.map((period, index) => (
            <React.Fragment key={period.id}>
              <button
                onClick={() => onPeriodChange(period.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  index === currentIndex
                    ? 'bg-blue-500 text-white shadow-md'
                    : index < currentIndex
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <div className="text-xs opacity-75">{period.year}</div>
                <div>{period.name}</div>
              </button>
              {index < TIME_PERIODS.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  index < currentIndex ? 'bg-green-400' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// 图例组件
const Legend = () => {
  return (
    <motion.div
      className="absolute top-8 right-8 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5 }}
    >
      <h4 className="text-sm font-semibold text-gray-700 mb-3">图例</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MAP_COLORS.nativeCrop }}></div>
          <span className="text-sm text-gray-600">本土起源作物</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: MAP_COLORS.heroCrop, boxShadow: `0 0 8px ${MAP_COLORS.heroCrop}` }}></div>
          <span className="text-sm text-gray-600">重点作物 (可点击)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-0.5" style={{ backgroundColor: MAP_COLORS.pathColor }}></div>
          <span className="text-sm text-gray-600">传播路径</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{backgroundColor: '#667eea'}}></div>
          <span className="text-sm text-gray-600">省份美食</span>
        </div>
      </div>
    </motion.div>
  );
};

// 统计信息组件
const Statistics = ({ currentPeriod }) => {
  // 只统计本土作物
  const visibleCrops = foodData.filter(crop => {
    const periodIndex = TIME_PERIODS.findIndex(p => p.id === currentPeriod);
    const cropPeriodIndex = TIME_PERIODS.findIndex(p => p.id === crop.period);
    return cropPeriodIndex <= periodIndex && crop.type === 'native';
  });

  const nativeCount = visibleCrops.length;

  // 计算可见的省份食物数量
  const periodIndex = TIME_PERIODS.findIndex(p => p.id === currentPeriod);
  let visibleProvinceFoodsCount = 0;
  Object.values(provinceFoods).forEach(foods => {
    visibleProvinceFoodsCount += foods.filter(food => {
      const foodPeriodIndex = TIME_PERIODS.findIndex(p => p.id === food.period);
      return foodPeriodIndex <= periodIndex;
    }).length;
  });

  return (
    <motion.div
      className="absolute top-8 left-8 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <h4 className="text-sm font-semibold text-gray-700 mb-3">作物统计</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: MAP_COLORS.nativeCrop }}>{nativeCount}</div>
          <div className="text-xs text-gray-500">本土作物</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{visibleProvinceFoodsCount}</div>
          <div className="text-xs text-gray-500">省份美食</div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== 五条路线组件 ====================

// 五条路线切换按钮组件
const FiveRoutesButton = ({ onClick, isActive }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-20 px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all ${
        isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <span className="mr-2">{isActive ? '✕' : '✦'}</span>
      {isActive ? '返回全景图' : '五条路线'}
    </motion.button>
  );
};

// 五条路线选择器组件
const RouteSelector = ({ selectedRoute, onRouteSelect, onClose }) => {
  return (
    <motion.div
      className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">选择路线</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-3">
        {FIVE_ROUTES.map((route) => (
          <motion.button
            key={route.id}
            onClick={() => onRouteSelect(route.id)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all min-w-[100px] ${
              selectedRoute === route.id
                ? 'bg-gradient-to-br shadow-lg'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            style={{
              background: selectedRoute === route.id
                ? `linear-gradient(135deg, ${route.color}20, ${route.color}40)`
                : undefined,
              border: selectedRoute === route.id ? `2px solid ${route.color}` : '2px solid transparent'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl mb-1">{route.icon}</span>
            <span className="text-sm font-bold" style={{ color: route.color }}>{route.name}</span>
            <span className="text-xs text-gray-500">{route.subtitle}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// 五条路线地图组件
const FiveRoutesMap = ({ selectedRoute, onRouteClick }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    echarts.registerMap('china', chinaGeoJson);
    updateChart();

    const handleResize = () => {
      chartInstance.current && chartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      chartInstance.current && chartInstance.current.dispose();
    };
  }, []);

  useEffect(() => {
    updateChart();
  }, [selectedRoute]);

  const updateChart = () => {
    if (!chartInstance.current) return;

    const series = [];
    
    // 为每条路线创建路径
    FIVE_ROUTES.forEach((route) => {
      const routeData = routePathsData[route.id];
      const isSelected = selectedRoute === route.id;
      const isDimmed = selectedRoute && selectedRoute !== route.id;
      
      // 路线点
      const points = routeData.points.map((point, index) => ({
        name: point.name,
        value: [...point.coord, index + 1],
        itemData: point
      }));

      // 路线线
      const lines = [];
      for (let i = 0; i < points.length - 1; i++) {
        lines.push({
          coords: [points[i].value.slice(0, 2), points[i + 1].value.slice(0, 2)],
          lineStyle: {
            color: routeData.color,
            width: isSelected ? 4 : 2,
            opacity: isDimmed ? 0.2 : isSelected ? 1 : 0.6,
            curveness: 0.2
          }
        });
      }

      // 添加散点系列
      series.push({
        type: 'scatter',
        coordinateSystem: 'geo',
        data: points,
        symbolSize: isSelected ? 15 : 10,
        itemStyle: {
          color: routeData.color,
          opacity: isDimmed ? 0.3 : 1,
          shadowBlur: isSelected ? 20 : 10,
          shadowColor: routeData.color
        },
        label: {
          show: isSelected,
          formatter: '{b}',
          position: 'top',
          fontSize: 10,
          color: '#333',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: [2, 4],
          borderRadius: 4
        },
        emphasis: {
          scale: 1.5,
          label: { show: true }
        },
        z: isSelected ? 10 : 1
      });

      // 添加线条系列
      series.push({
        type: 'lines',
        coordinateSystem: 'geo',
        data: lines,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.3,
          color: routeData.color,
          symbol: 'arrow',
          symbolSize: isSelected ? 8 : 5
        },
        lineStyle: {
          width: isSelected ? 4 : 2,
          opacity: isDimmed ? 0.2 : isSelected ? 1 : 0.6,
          curveness: 0.2
        },
        z: isSelected ? 9 : 0
      });
    });

    const option = {
      backgroundColor: 'transparent',
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [105, 36],
        label: {
          show: true,
          color: MAP_COLORS.text,
          fontSize: 10
        },
        itemStyle: {
          areaColor: MAP_COLORS.land,
          borderColor: MAP_COLORS.border,
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            areaColor: '#E0E0C0'
          }
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          if (params.data && params.data.itemData) {
            const item = params.data.itemData;
            return `
              <div style="padding: 8px;">
                <strong style="font-size: 14px;">${item.name}</strong><br/>
                <span style="color: #666;">时期: ${item.year < 0 ? '公元前' + Math.abs(item.year) : item.year}年</span>
              </div>
            `;
          }
          return params.name;
        }
      },
      series: series
    };

    chartInstance.current.setOption(option, true);

    // 点击事件
    chartInstance.current.off('click');
    chartInstance.current.on('click', function (params) {
      if (params.data && params.data.itemData) {
        // 找到点击的点属于哪条路线
        for (const route of FIVE_ROUTES) {
          const routeData = routePathsData[route.id];
          const pointNames = routeData.points.map(p => p.name);
          if (pointNames.includes(params.data.name)) {
            onRouteClick(route.id);
            break;
          }
        }
      }
    });
  };

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

// 五条路线详情面板
const RouteDetailPanel = ({ routeId, onClose }) => {
  const route = FIVE_ROUTES.find(r => r.id === routeId);
  const details = routeDetailsData[routeId];
  
  if (!route || !details) return null;

  return (
    <motion.div
      className="absolute right-0 top-0 h-full w-[50%] bg-white/95 backdrop-blur-lg border-l border-gray-300 overflow-y-auto shadow-2xl z-30"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(135deg, ${route.color}15, ${route.color}05)` }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{route.icon}</span>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: route.color }}>{route.name}</h2>
                <p className="text-sm text-gray-500">{route.subtitle}</p>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-700 mt-3">{route.theme}</p>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 时间轴内容 */}
      <div className="p-6">
        <div className="relative">
          {/* 时间轴线 */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(to bottom, ${route.color}, ${route.color}40)` }} />
          
          {/* 各时期内容 */}
          <div className="space-y-6">
            {details.periods.map((period, index) => (
              <motion.div
                key={index}
                className="relative pl-12"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* 时间点 */}
                <div 
                  className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: route.color }}
                >
                  {index + 1}
                </div>
                
                {/* 内容卡片 */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: route.color }}>
                      {period.era}
                    </span>
                    <span className="text-xs text-gray-400">{period.year}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">📜 历史事件</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{period.history}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">🤝 民族交流</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{period.exchange}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">🔬 科学原理</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{period.science}</p>
                    </div>
                    
                    {period.youthAction && (
                      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${route.color}15` }}>
                        <h4 className="text-sm font-bold mb-1" style={{ color: route.color }}>🌟 当代青年行动</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{period.youthAction}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* 底部总结 */}
        <motion.div
          className="mt-8 p-4 rounded-xl text-center"
          style={{ background: `linear-gradient(135deg, ${route.color}20, ${route.color}10)` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm font-medium" style={{ color: route.color }}>
            "{route.theme}"——历史基因在青年手中的传承与创新
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

function App() {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(TIME_PERIODS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chartInstance, setChartInstance] = useState(null);
  
  // 五条路线相关状态
  const [showFiveRoutes, setShowFiveRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteSelector, setShowRouteSelector] = useState(false);

  // 模拟加载动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // 自动播放时间轴
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentPeriod(prev => {
        const currentIndex = TIME_PERIODS.findIndex(p => p.id === prev);
        if (currentIndex >= TIME_PERIODS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return TIME_PERIODS[currentIndex + 1].id;
      });
    }, 3000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // 处理作物点击
  const handleCropClick = (cropGroup) => {
    setSelectedCrop(cropGroup);
  };

  // 处理返回按钮点击
  const handleBackClick = () => {
    setSelectedCrop(null);
    setHoveredIndex(null);
  };

  // 处理播放/暂停
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 处理五条路线按钮点击
  const handleFiveRoutesClick = () => {
    if (showFiveRoutes) {
      // 返回全景图
      setShowFiveRoutes(false);
      setSelectedRoute(null);
      setShowRouteSelector(false);
    } else {
      // 进入五条路线模式
      setShowFiveRoutes(true);
      setShowRouteSelector(true);
    }
  };

  // 处理路线选择
  const handleRouteSelect = (routeId) => {
    setSelectedRoute(routeId);
  };

  // 处理路线详情关闭
  const handleRouteDetailClose = () => {
    setSelectedRoute(null);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden" style={{ backgroundColor: MAP_COLORS.background }}>
      {/* 加载动画 */}
      {isLoading && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: MAP_COLORS.background }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-4xl font-bold"
            style={{ color: MAP_COLORS.heroCrop }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            中华餐桌作物基因图谱
          </motion.div>
        </motion.div>
      )}

      {/* 五条路线切换按钮 */}
      <FiveRoutesButton 
        onClick={handleFiveRoutesClick}
        isActive={showFiveRoutes}
      />

      {/* 宏观全览层 */}
      <AnimatePresence>
        {!selectedCrop && !showFiveRoutes && (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.5 }}
          >
            {/* 中国地图 */}
            <div className="w-full h-full relative">
              <ChinaMap 
                onCropClick={handleCropClick} 
                currentPeriod={currentPeriod}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onChartInit={setChartInstance}
                provinceFoodsData={provinceFoods}
              />
              
              {/* 统计信息 */}
              <Statistics currentPeriod={currentPeriod} />

              {/* 图例 */}
              <Legend />

              {/* 时间轴 */}
              <Timeline 
                currentPeriod={currentPeriod}
                onPeriodChange={setCurrentPeriod}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 五条路线层 */}
      <AnimatePresence>
        {showFiveRoutes && (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 五条路线地图 */}
            <div className="w-full h-full relative">
              <FiveRoutesMap 
                selectedRoute={selectedRoute}
                onRouteClick={handleRouteSelect}
              />
              
              {/* 路线选择器 */}
              <AnimatePresence>
                {showRouteSelector && !selectedRoute && (
                  <RouteSelector
                    selectedRoute={selectedRoute}
                    onRouteSelect={handleRouteSelect}
                    onClose={() => setShowRouteSelector(false)}
                  />
                )}
              </AnimatePresence>

              {/* 路线详情面板 */}
              <AnimatePresence>
                {selectedRoute && (
                  <RouteDetailPanel
                    routeId={selectedRoute}
                    onClose={handleRouteDetailClose}
                  />
                )}
              </AnimatePresence>

              {/* 路线图例 */}
              <motion.div
                className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-3">五条路线</h4>
                <div className="space-y-2">
                  {FIVE_ROUTES.map((route) => (
                    <div 
                      key={route.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                      onClick={() => handleRouteSelect(route.id)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="text-xs text-gray-600">{route.name}</span>
                      <span className="text-xs text-gray-400">{route.subtitle}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 提示文字 */}
              <motion.div
                className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-200 max-w-xs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">💡 提示：</span>
                  点击地图上的路线点或左侧图例查看详细信息。每条路线展示了从史前到近现代的作物传播与民族交融历程。
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 微观深潜层 */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 模糊背景 */}
            <motion.div 
              className="absolute inset-0 backdrop-blur-md"
              style={{ backgroundColor: 'rgba(232, 244, 248, 0.8)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* 详情面板 */}
            <motion.div 
              className="absolute right-0 top-0 h-full w-[60%] bg-white/95 backdrop-blur-lg border-l border-gray-300 overflow-y-auto shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* 头部 */}
              <div className="p-6 border-b border-gray-300 flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: MAP_COLORS.heroCrop }}>{cropDetails[selectedCrop].title}</h2>
                <button 
                  className="text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded border border-gray-300 hover:bg-blue-50"
                  onClick={handleBackClick}
                >
                  返回全景图
                </button>
              </div>
              
              {/* 核心内容 */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* 历史轴 */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">历史时间轴</h3>
                    <div className="space-y-6">
                      {cropDetails[selectedCrop].history.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className={`p-4 rounded-lg border transition-all ${
                            hoveredIndex === index 
                              ? 'bg-blue-50 border-blue-400 shadow-md' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="text-gray-700">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 科学轴 */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">生物学暗线</h3>
                    <div className="space-y-6">
                      {cropDetails[selectedCrop].science.map((item, index) => (
                        <motion.div
                          key={item.id}
                          className={`p-4 rounded-lg border transition-all ${
                            hoveredIndex === index + 10 
                              ? 'bg-green-50 border-green-400 shadow-md' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          onMouseEnter={() => setHoveredIndex(index + 10)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="text-gray-700">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
