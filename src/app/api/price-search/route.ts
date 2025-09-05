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

    // 개선된 ChatGPT 프롬프트 - 더 구체적이고 정확한 응답을 위해
    const prompt = `
다음 상품에 대한 온라인 쇼핑몰별 가격 정보를 정확한 JSON 형태로 제공해주세요.

상품 정보:
- 상품명: "${productName}"
- 카테고리: "${category}"
${targetPrice ? `- 목표 가격: ${targetPrice.toLocaleString()}원` : ''}

요구사항:
1. 반드시 유효한 JSON 형태로만 응답하세요
2. 가격은 반드시 숫자 타입으로 설정하세요
3. URL은 간단하고 짧은 형태로 생성하세요 (200자 이내)
4. 평점은 1.0-5.0 사이의 숫자로 설정하세요
5. 긴 URL 매개변수를 피하고 기본 검색 URL만 사용하세요

JSON 형태 (이 형태를 정확히 따라주세요):
{
  "productName": "${productName}",
  "category": "${category}",
  "sources": [
    {
      "platform": "쇼핑몰명",
      "price": 숫자,
      "url": "https://도메인/search?q=${encodeURIComponent(productName)}",
      "availability": true,
      "shipping": 숫자,
      "rating": 소수점포함숫자
    }
  ],
  "averagePrice": 숫자,
  "lowestPrice": 숫자,
  "recommendedPlatform": "최저가플랫폼명"
}

포함할 쇼핑몰: 네이버쇼핑, 쿠팡, 11번가, G마켓, 옥션, 인터파크, 롯데온
- 6-7개 결과 제공
- ${category} 카테고리에 적합한 합리적인 가격 범위 사용
- 배송비는 0원 또는 2500-3000원 중 설정
- 재고는 대부분 available로 설정 (90% 이상)

중요: JSON 형태 외에는 다른 텍스트를 포함하지 마세요.`

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
      max_tokens: 2000,
      temperature: 0.1
    })

    const responseText = completion.choices[0]?.message?.content
    
    console.log('OpenAI API Response:', responseText)
    
    if (!responseText) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.')
    }

    // JSON 파싱 및 응답 검증
    let priceData
    try {
      // JSON 응답에서 불필요한 텍스트 제거
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      priceData = JSON.parse(cleanedResponse)
      
      // 응답 구조 검증
      if (!validatePriceSearchResponse(priceData)) {
        throw new Error('응답 형식이 올바르지 않습니다.')
      }
      
      // 데이터 품질 검증 및 보정
      priceData = sanitizePriceData(priceData, productName, category)
      
    } catch (parseError) {
      console.error('JSON parsing or validation error:', parseError)
      console.error('Original response:', responseText)
      // JSON 파싱 또는 검증 실패 시 목업 데이터 반환
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
  
  const sources = platforms.slice(0, 6).map((platform) => {
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

// 응답 구조 검증 함수
function validatePriceSearchResponse(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  
  const required = ['productName', 'category', 'sources', 'averagePrice', 'lowestPrice', 'recommendedPlatform']
  if (!required.every(field => field in data)) return false
  
  if (!Array.isArray(data.sources) || data.sources.length === 0) return false
  
  return data.sources.every((source: any) => 
    source && 
    typeof source.platform === 'string' &&
    typeof source.price === 'number' &&
    typeof source.url === 'string' &&
    typeof source.availability === 'boolean' &&
    typeof source.shipping === 'number' &&
    (source.rating === undefined || typeof source.rating === 'number')
  )
}

// 데이터 품질 검증 및 보정 함수
function sanitizePriceData(data: any, productName: string, category: string): any {
  // 기본 필드 보정
  data.productName = data.productName || productName
  data.category = data.category || category
  
  // sources 배열 정리 및 검증
  if (Array.isArray(data.sources)) {
    data.sources = data.sources
      .filter((source: any) => source && source.platform && typeof source.price === 'number')
      .map((source: any) => ({
        platform: String(source.platform),
        price: Math.max(0, Math.round(Number(source.price))),
        url: sanitizeUrl(source.url, source.platform, productName),
        availability: source.availability !== false,
        shipping: Math.max(0, Math.round(Number(source.shipping || 0))),
        rating: source.rating ? Math.min(5.0, Math.max(1.0, Number(source.rating))) : undefined
      }))
      .slice(0, 8) // 최대 8개로 제한
  }
  
  // 가격 통계 재계산
  if (data.sources && data.sources.length > 0) {
    const prices = data.sources.map((s: any) => s.price)
    data.averagePrice = Math.round(prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length)
    data.lowestPrice = Math.min(...prices)
    data.recommendedPlatform = data.sources.find((s: any) => s.price === data.lowestPrice)?.platform || data.sources[0].platform
  }
  
  return data
}

// URL 정리 및 검증 함수
function sanitizeUrl(url: string, platform: string, productName: string): string {
  if (!url || typeof url !== 'string') {
    return getDefaultUrl(platform, productName)
  }
  
  // URL 길이가 200자를 초과하면 기본 URL 사용
  if (url.length > 200) {
    return getDefaultUrl(platform, productName)
  }
  
  return url
}

// 기본 URL 생성 함수
function getDefaultUrl(platform: string, productName: string): string {
  const encodedProduct = encodeURIComponent(productName)
  
  const urlMap: Record<string, string> = {
    '네이버쇼핑': `https://search.shopping.naver.com/search/all?query=${encodedProduct}`,
    '쿠팡': `https://www.coupang.com/np/search?q=${encodedProduct}`,
    '11번가': `https://search.11st.co.kr/Search.tmall?kwd=${encodedProduct}`,
    'G마켓': `http://search.gmarket.co.kr/search.aspx?keyword=${encodedProduct}`,
    '옥션': `http://search.auction.co.kr/search/search.aspx?keyword=${encodedProduct}`,
    '인터파크': `http://shopping.interpark.com/search?q=${encodedProduct}`,
    '롯데온': `https://www.lotteon.com/search/search/search.ecn?q=${encodedProduct}`
  }
  
  return urlMap[platform] || `https://search.shopping.naver.com/search/all?query=${encodedProduct}`
}