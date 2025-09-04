'use client'

import { useState } from 'react'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { POPULAR_PAYMENT_METHODS, CATEGORIES } from '@/data/paymentMethods'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PaymentMethod } from '@/types'

export default function PaymentMethodsPage() {
  const {
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    togglePaymentMethod,
    addPopularPaymentMethod
  } = usePaymentMethods()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customMethod, setCustomMethod] = useState({
    name: '',
    type: 'card' as const,
    discountRate: 0,
    cashback: 0,
    monthlyLimit: 1000000,
    specialCategories: [] as string[]
  })

  const handleAddPopularMethod = (methodName: string) => {
    addPopularPaymentMethod(methodName)
    setIsModalOpen(false)
  }

  const handleAddCustomMethod = () => {
    addPaymentMethod({
      ...customMethod,
      icon: customMethod.type === 'card' ? '💳' : customMethod.type === 'pay' ? '📱' : '🏦',
      isActive: true
    })
    setIsModalOpen(false)
    setCustomMethod({
      name: '',
      type: 'card',
      discountRate: 0,
      cashback: 0,
      monthlyLimit: 1000000,
      specialCategories: []
    })
  }

  const getMethodsByType = (type: PaymentMethod['type']) => {
    return paymentMethods.filter(method => method.type === type)
  }

  const renderMethodCard = (method: PaymentMethod) => (
    <Card key={method.id} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{method.icon}</span>
          <div>
            <div className="font-medium text-gray-900">{method.name}</div>
            <div className="text-sm text-gray-600">
              할인 {(method.discountRate * 100).toFixed(1)}% • 적립 {(method.cashback * 100).toFixed(1)}%
            </div>
            {method.specialCategories.length > 0 && (
              <div className="text-xs text-blue-600 mt-1">
                {method.specialCategories.join(', ')} 추가혜택
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={method.isActive ? 'primary' : 'outline'}
            onClick={() => togglePaymentMethod(method.id)}
          >
            {method.isActive ? '활성' : '비활성'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removePaymentMethod(method.id)}
            className="text-red-600 hover:text-red-700"
          >
            삭제
          </Button>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">결제수단 관리</h1>
            <p className="text-gray-600 mt-1">등록된 결제수단으로 최적의 할인을 찾아드려요</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            결제수단 추가
          </Button>
        </div>

        {/* 활성 결제수단 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {paymentMethods.filter(m => m.isActive).length}
            </div>
            <div className="text-sm text-gray-600">활성 결제수단</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(paymentMethods.filter(m => m.isActive).reduce((avg, m) => avg + m.discountRate, 0) / Math.max(paymentMethods.filter(m => m.isActive).length, 1) * 100)}%
            </div>
            <div className="text-sm text-gray-600">평균 할인율</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(paymentMethods.filter(m => m.isActive).reduce((avg, m) => avg + m.cashback, 0) / Math.max(paymentMethods.filter(m => m.isActive).length, 1) * 100)}%
            </div>
            <div className="text-sm text-gray-600">평균 적립율</div>
          </Card>
        </div>

        {/* 결제수단 목록 */}
        <div className="space-y-6">
          {/* 신용카드 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💳 신용카드 ({getMethodsByType('card').length})
            </h2>
            <div className="space-y-3">
              {getMethodsByType('card').map(renderMethodCard)}
            </div>
          </div>

          {/* 간편결제 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📱 간편결제 ({getMethodsByType('pay').length})
            </h2>
            <div className="space-y-3">
              {getMethodsByType('pay').map(renderMethodCard)}
            </div>
          </div>

          {/* 은행 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🏦 은행 ({getMethodsByType('bank').length})
            </h2>
            <div className="space-y-3">
              {getMethodsByType('bank').map(renderMethodCard)}
            </div>
          </div>
        </div>

        {/* 결제수단 추가 모달 */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="결제수단 추가"
          size="lg"
        >
          <div className="space-y-6">
            {/* 인기 결제수단 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">인기 결제수단</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {POPULAR_PAYMENT_METHODS.map((method) => {
                  const isAlreadyAdded = paymentMethods.some(pm => pm.name === method.name)
                  return (
                    <Card
                      key={method.name}
                      className={`p-3 cursor-pointer ${isAlreadyAdded ? 'opacity-50' : 'hover:shadow-md'}`}
                      onClick={() => !isAlreadyAdded && handleAddPopularMethod(method.name)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{method.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{method.name}</div>
                          <div className="text-xs text-gray-600">
                            할인 {(method.discountRate * 100).toFixed(1)}% • 적립 {(method.cashback * 100).toFixed(1)}%
                          </div>
                        </div>
                        {isAlreadyAdded && (
                          <span className="text-xs text-green-600">✓ 추가됨</span>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* 사용자 정의 결제수단 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">직접 추가</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="결제수단 이름"
                    value={customMethod.name}
                    onChange={(e) => setCustomMethod(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 우리카드"
                    fullWidth
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">타입</label>
                    <select
                      value={customMethod.type}
                      onChange={(e) => setCustomMethod(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="card">신용카드</option>
                      <option value="pay">간편결제</option>
                      <option value="bank">은행</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="기본 할인율 (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customMethod.discountRate * 100}
                    onChange={(e) => setCustomMethod(prev => ({ ...prev, discountRate: Number(e.target.value) / 100 }))}
                    fullWidth
                  />
                  <Input
                    label="적립율 (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={customMethod.cashback * 100}
                    onChange={(e) => setCustomMethod(prev => ({ ...prev, cashback: Number(e.target.value) / 100 }))}
                    fullWidth
                  />
                </div>

                <Input
                  label="월 한도 (원)"
                  type="number"
                  min="0"
                  value={customMethod.monthlyLimit}
                  onChange={(e) => setCustomMethod(prev => ({ ...prev, monthlyLimit: Number(e.target.value) }))}
                  fullWidth
                />

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddCustomMethod}
                    disabled={!customMethod.name}
                    className="flex-1"
                  >
                    추가하기
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}