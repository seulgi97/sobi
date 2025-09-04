import { Card } from '../ui/Card'
import { formatNumber } from '@/utils/paymentCalculator'

interface SavingsCardProps {
  totalSavings: number
  monthlyTransactions: number
  description?: string
}

export const SavingsCard: React.FC<SavingsCardProps> = ({
  totalSavings,
  monthlyTransactions,
  description = '이번 달 총 절약 금액'
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
      <div className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="text-3xl sm:text-4xl font-bold mb-1">
              {formatNumber(totalSavings)}원
            </div>
            <div className="text-blue-100 text-sm sm:text-base">
              {description}
            </div>
          </div>
          
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-semibold">
              {monthlyTransactions}회
            </div>
            <div className="text-blue-100 text-sm">
              이번 달 비교 횟수
            </div>
          </div>
        </div>
        
        {totalSavings > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-400 border-opacity-30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-blue-100">
              <span>평균 절약률</span>
              <span className="font-medium text-white">
                {monthlyTransactions > 0 ? Math.round((totalSavings / monthlyTransactions / 10000) * 100) : 0}%
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}