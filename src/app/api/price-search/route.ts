import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화 (환경변수에서 API 키 읽기)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface PriceSearchRequest {
  productName: string
  category: string
  targetPrice?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceSearchRequest = await request.json()
    const { productName, category, targetPrice } = body

    // 기본 검증
    if (!productName || !category) {
      return NextResponse.json(
        {
          success: false,
          error: '상품명과 카테고리는 필수입니다.'
        },
        { status: 400 }
      )
    }

    // OpenAI API 키가 없는 경우 목업 데이터 반환
    if (!process.env.OPENAI_API_KEY) {
      const mockResponse = generateMockPriceData(productName, category, targetPrice)
      return NextResponse.json({
        success: true,
        data: mockResponse,
        message: '가격 검색이 완료되었습니다. (목업 데이터)'
      })
    }

    // ChatGPT를 활용한 가격 검색 프롬프트
    const prompt = `
다음 상품의 온라인 쇼핑몰별 가격 정보를 JSON 형태로 제공해주세요:

상품명: ${productName}
카테고리: ${category}
${targetPrice ? `목표 가격: ${targetPrice.toLocaleString()}원` : ''}

다음 형태의 JSON으로 응답해주세요:
{
  "productName": "${productName}",
  "category": "${category}",
  "sources": [
    {
      "platform": "쇼핑몰 이름",
      "price": 가격(숫자),
      "url": "상품 URL",
      "availability": true/false,
      "shipping": 배송비(숫자),
      "rating": 평점(선택사항)
    }
  ],
  "averagePrice": 평균가격,
  "lowestPrice": 최저가격,
  "recommendedPlatform": "추천 쇼핑몰"
}

주요 온라인 쇼핑몰 (네이버쇼핑, 쿠팡, 11번가, G마켓, 옥션, 인터파크 등)을 포함해서 5-8개 정도의 결과를 제공해주세요.
실제 검색 결과가 아니라면 합리적인 가격 범위로 예상 데이터를 생성해주세요.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 온라인 쇼핑 가격 비교 전문가입니다. 사용자가 요청한 상품의 가격 정보를 정확한 JSON 형태로 제공합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    })

    const responseText = completion.choices[0]?.message?.content
    
    if (!responseText) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.')
    }

    // JSON 파싱 시도
    let priceData
    try {
      priceData = JSON.parse(responseText)
    } catch (parseError) {
      // JSON 파싱 실패 시 목업 데이터 반환
      priceData = generateMockPriceData(productName, category, targetPrice)
    }

    return NextResponse.json({
      success: true,
      data: priceData,
      message: '가격 검색이 완료되었습니다.',
      searchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Price search error:', error)
    
    // 오류 시 목업 데이터 반환
    const { productName, category, targetPrice } = await request.json()
    const mockResponse = generateMockPriceData(productName, category, targetPrice)
    
    return NextResponse.json({
      success: true,
      data: mockResponse,
      message: '가격 검색이 완료되었습니다. (목업 데이터)',
      warning: '실제 검색 중 오류가 발생하여 예상 데이터를 제공합니다.'
    })
  }
}

// 목업 데이터 생성 함수
function generateMockPriceData(productName: string, category: string, targetPrice?: number) {
  const basePrice = targetPrice || getBasePriceByCategory(category)
  const platforms = ['네이버쇼핑', '쿠팡', '11번가', 'G마켓', '옥션', '인터파크', '롯데온', '위메프']
  
  const sources = platforms.slice(0, 6).map((platform, index) => {
    const priceVariation = (Math.random() - 0.5) * 0.3 // ±15% 변동
    const price = Math.round(basePrice * (1 + priceVariation))
    
    return {
      platform,
      price,
      url: `https://shopping.${platform.toLowerCase()}.com/search?q=${encodeURIComponent(productName)}`,
      availability: Math.random() > 0.1, // 90% 확률로 재고 있음
      shipping: Math.random() > 0.5 ? 0 : 3000,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10
    }
  })

  const prices = sources.map(s => s.price)
  const averagePrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
  const lowestPrice = Math.min(...prices)
  const recommendedPlatform = sources.find(s => s.price === lowestPrice)?.platform || sources[0].platform

  return {
    productName,
    category,
    sources: sources.sort((a, b) => a.price - b.price),
    averagePrice,
    lowestPrice,
    recommendedPlatform
  }
}

// 카테고리별 기본 가격 추정
function getBasePriceByCategory(category: string): number {
  const categoryPrices: Record<string, number> = {
    '온라인쇼핑': 50000,
    '편의점': 3000,
    '마트': 15000,
    '백화점': 100000,
    '카페': 5000,
    '배달음식': 20000,
    '서점': 15000,
    '영화관': 12000,
    '기타': 30000
  }
  
  return categoryPrices[category] || 30000
}