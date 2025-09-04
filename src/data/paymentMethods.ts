import { PaymentMethod } from '@/types'

export const POPULAR_PAYMENT_METHODS: Omit<PaymentMethod, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>[] = [
  // 신용카드
  {
    name: '신한카드',
    type: 'card',
    icon: '💳',
    discountRate: 0.01,
    cashback: 0.005,
    monthlyLimit: 500000,
    specialCategories: ['온라인쇼핑', '편의점']
  },
  {
    name: '삼성카드',
    type: 'card',
    icon: '💳',
    discountRate: 0.015,
    cashback: 0.01,
    monthlyLimit: 800000,
    specialCategories: ['백화점', '마트']
  },
  {
    name: 'KB국민카드',
    type: 'card',
    icon: '💳',
    discountRate: 0.01,
    cashback: 0.005,
    monthlyLimit: 600000,
    specialCategories: ['주유소', '대중교통']
  },
  {
    name: '현대카드',
    type: 'card',
    icon: '💳',
    discountRate: 0.02,
    cashback: 0.01,
    monthlyLimit: 1000000,
    specialCategories: ['온라인쇼핑', '카페']
  },

  // 간편결제
  {
    name: '네이버페이',
    type: 'pay',
    icon: '📱',
    discountRate: 0.01,
    cashback: 0.01,
    monthlyLimit: 300000,
    specialCategories: ['온라인쇼핑', '배달음식']
  },
  {
    name: '카카오페이',
    type: 'pay',
    icon: '📱',
    discountRate: 0.01,
    cashback: 0.005,
    monthlyLimit: 300000,
    specialCategories: ['택시', '편의점']
  },
  {
    name: '토스페이',
    type: 'pay',
    icon: '📱',
    discountRate: 0.005,
    cashback: 0.02,
    monthlyLimit: 500000,
    specialCategories: ['송금', '투자']
  },
  {
    name: '페이코',
    type: 'pay',
    icon: '📱',
    discountRate: 0.008,
    cashback: 0.01,
    monthlyLimit: 200000,
    specialCategories: ['온라인쇼핑']
  },

  // 은행
  {
    name: '신한은행',
    type: 'bank',
    icon: '🏦',
    discountRate: 0.003,
    cashback: 0.001,
    monthlyLimit: 1000000,
    specialCategories: ['ATM']
  },
  {
    name: 'KB국민은행',
    type: 'bank',
    icon: '🏦',
    discountRate: 0.003,
    cashback: 0.001,
    monthlyLimit: 1000000,
    specialCategories: ['인터넷뱅킹']
  }
]

export const CATEGORIES = [
  '온라인쇼핑',
  '편의점',
  '마트',
  '백화점',
  '주유소',
  '카페',
  '배달음식',
  '택시',
  '대중교통',
  '병원',
  '약국',
  '서점',
  '영화관',
  '헬스장',
  '미용실',
  '기타'
]