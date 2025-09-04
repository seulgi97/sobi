export interface PaymentMethod {
  id: string
  type: 'card' | 'pay' | 'bank'
  name: string
  discountRate: number
  cashback: number
  monthlyLimit: number
  specialCategories: string[]
  icon: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PriceSearchRequest {
  productName: string
  category: string
  targetPrice?: number
}

export interface PriceSearchResult {
  productName: string
  category: string
  sources: PriceSource[]
  recommendations: PaymentRecommendation[]
  totalSavings: number
  searchedAt: Date
}

export interface PriceSource {
  platform: string
  price: number
  url: string
  availability: boolean
  shipping: number
  rating?: number
}

export interface PaymentRecommendation {
  paymentMethod: PaymentMethod
  finalPrice: number
  savings: number
  discountBreakdown: {
    baseDiscount: number
    categoryBonus: number
    cashback: number
    total: number
  }
}

export interface UserPreferences {
  favoritePaymentMethods: string[]
  defaultCategory: string
  savingsGoal: number
  notificationSettings: {
    priceAlerts: boolean
    newOffers: boolean
    monthlyReport: boolean
  }
}

export interface DashboardStats {
  totalSavings: number
  monthlyTransactions: number
  favoritePaymentMethod: PaymentMethod | null
  recentSearches: PriceSearchResult[]
}