import { PaymentMethod } from '@/types'
import { useLocalStorage } from './useLocalStorage'
import { POPULAR_PAYMENT_METHODS } from '@/data/paymentMethods'

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useLocalStorage<PaymentMethod[]>('paymentMethods', [])

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date()
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    }
    setPaymentMethods(prev => [...prev, newMethod])
    return newMethod
  }

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethod>) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id
          ? { ...method, ...updates, updatedAt: new Date() }
          : method
      )
    )
  }

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id
          ? { ...method, isActive: !method.isActive, updatedAt: new Date() }
          : method
      )
    )
  }

  const addPopularPaymentMethod = (templateName: string) => {
    const template = POPULAR_PAYMENT_METHODS.find(pm => pm.name === templateName)
    if (template) {
      const existingMethod = paymentMethods.find(pm => pm.name === templateName)
      if (!existingMethod) {
        addPaymentMethod({
          ...template,
          isActive: true
        })
      }
    }
  }

  const getActivePaymentMethods = () => {
    return paymentMethods.filter(method => method.isActive)
  }

  const getPaymentMethodsByType = (type: PaymentMethod['type']) => {
    return paymentMethods.filter(method => method.type === type)
  }

  return {
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    togglePaymentMethod,
    addPopularPaymentMethod,
    getActivePaymentMethods,
    getPaymentMethodsByType
  }
}