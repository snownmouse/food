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

function App() {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(TIME_PERIODS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [chartInstance, setChartInstance] = useState(null);

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

      {/* 宏观全览层 */}
      <AnimatePresence>
        {!selectedCrop && (
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
