import { PaymentMethod, PaymentRecommendation } from '@/types'

export const calculateDiscountedPrice = (
  originalPrice: number,
  paymentMethod: PaymentMethod,
  category: string
): PaymentRecommendation => {
  let finalPrice = originalPrice
  let baseDiscount = 0
  let categoryBonus = 0
  let cashback = 0

  // 기본 할인률 적용
  if (paymentMethod.discountRate > 0) {
    baseDiscount = originalPrice * paymentMethod.discountRate
    finalPrice -= baseDiscount
  }

  // 카테고리별 추가 할인 (5% 보너스)
  if (paymentMethod.specialCategories.includes(category)) {
    categoryBonus = originalPrice * 0.05
    finalPrice -= categoryBonus
  }

  // 캐시백 계산 (최종 결제금액 기준)
  if (paymentMethod.cashback > 0) {
    cashback = finalPrice * paymentMethod.cashback
  }

  const totalDiscount = baseDiscount + categoryBonus
  const savings = totalDiscount + cashback

  return {
    paymentMethod,
    finalPrice: Math.round(finalPrice),
    savings: Math.round(savings),
    discountBreakdown: {
      baseDiscount: Math.round(baseDiscount),
      categoryBonus: Math.round(categoryBonus),
      cashback: Math.round(cashback),
      total: Math.round(savings)
    }
  }
}

export const calculateBestPaymentOptions = (
  originalPrice: number,
  paymentMethods: PaymentMethod[],
  category: string
): PaymentRecommendation[] => {
  return paymentMethods
    .filter(method => method.isActive)
    .map(method => calculateDiscountedPrice(originalPrice, method, category))
    .sort((a, b) => a.finalPrice - b.finalPrice)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount)
}

export const calculateSavingsPercentage = (originalPrice: number, savings: number): number => {
  return Math.round((savings / originalPrice) * 100 * 100) / 100
}