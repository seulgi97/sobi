import { NextRequest, NextResponse } from 'next/server'
import { POPULAR_PAYMENT_METHODS } from '@/data/paymentMethods'

// GET: 인기 결제수단 목록 조회
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: POPULAR_PAYMENT_METHODS,
      message: '인기 결제수단 목록을 성공적으로 조회했습니다.'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '결제수단 목록 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST: 사용자 결제수단 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type } = body

    // 기본 검증
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: '결제수단 이름과 타입은 필수입니다.'
        },
        { status: 400 }
      )
    }

    // 인기 결제수단에서 찾기
    const foundMethod = POPULAR_PAYMENT_METHODS.find(
      method => method.name === name && method.type === type
    )

    if (foundMethod) {
      return NextResponse.json({
        success: true,
        data: foundMethod,
        message: '결제수단이 확인되었습니다.'
      })
    } else {
      // 사용자 정의 결제수단으로 처리
      return NextResponse.json({
        success: true,
        data: {
          name,
          type,
          icon: type === 'card' ? '💳' : type === 'pay' ? '📱' : '🏦',
          discountRate: 0,
          cashback: 0,
          monthlyLimit: 1000000,
          specialCategories: []
        },
        message: '사용자 정의 결제수단으로 등록되었습니다.'
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '결제수단 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}