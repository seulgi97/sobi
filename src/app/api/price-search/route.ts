import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화 (환경변수에서 API 키 읽기)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'pay' | 'bank'
  discountRate: number
  cashback: number
  monthlyLimit: number
  specialCategories: string[]
  isActive: boolean
}

interface PriceSearchRequest {
  productName: string
  category: string
  targetPrice?: number
  location?: string
  userPaymentMethods?: PaymentMethod[]
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceSearchRequest = await request.json()
    const { productName, category, targetPrice, location, userPaymentMethods } = body

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

    // 브랜드명 감지 및 처리
    const detectBrandSpecificQuery = (query: string) => {
      const brandPatterns = [
        // 카페 브랜드
        { brands: ['스타벅스', '스벅'], category: '카페' },
        { brands: ['메가커피', '메가'], category: '카페' },
        { brands: ['컴포즈커피', '컴포즈'], category: '카페' },
        { brands: ['탐앤탐스', '탐탐'], category: '카페' },
        { brands: ['이디야', '이디야커피'], category: '카페' },
        { brands: ['할리스', '할리스커피'], category: '카페' },
        { brands: ['투썸플레이스', '투썸'], category: '카페' },
        { brands: ['빽다방', '빽'], category: '카페' },
        { brands: ['엔젤리너스', '엔젤'], category: '카페' },
        { brands: ['폴바셋', '폴'], category: '카페' },
        { brands: ['커피빈', '빈'], category: '카페' },
        { brands: ['파스쿠찌'], category: '카페' },
        // 편의점 브랜드
        { brands: ['GS25', 'GS'], category: '편의점' },
        { brands: ['세븐일레븐', '7일레븐', '세븐'], category: '편의점' },
        { brands: ['CU', '씨유'], category: '편의점' },
        { brands: ['이마트24'], category: '편의점' },
        // 마트 브랜드
        { brands: ['이마트'], category: '마트' },
        { brands: ['롯데마트'], category: '마트' },
        { brands: ['홈플러스'], category: '마트' },
        { brands: ['코스트코'], category: '마트' }
      ]

      for (const pattern of brandPatterns) {
        for (const brand of pattern.brands) {
          if (query.includes(brand)) {
            return { brand, category: pattern.category, isBrandSpecific: true }
          }
        }
      }
      return { isBrandSpecific: false }
    }

    const brandInfo = detectBrandSpecificQuery(productName)
    
    // 온라인/오프라인 구분하여 프롬프트 생성
    const isOffline = ['편의점', '마트', '백화점', '카페', '주유소', '병원', '약국', '미용실', '헬스장'].includes(category) || brandInfo.isBrandSpecific
    
    const prompt = isOffline ? `
다음 상품/서비스에 대한 ${brandInfo.isBrandSpecific ? `${brandInfo.brand} 브랜드 중심의` : '오프라인'} 매장 정보와 결제수단별 혜택을 정확한 JSON 형태로 제공해주세요.

상품/서비스 정보:
- 상품명: "${productName}"
- 카테고리: "${category}"
${brandInfo.isBrandSpecific ? `- 중심 브랜드: "${brandInfo.brand}"` : ''}
${location ? `- 지역: ${location}` : ''}
${targetPrice ? `- 목표 가격: ${targetPrice.toLocaleString()}원` : ''}

요구사항:
1. 반드시 유효한 JSON 형태로만 응답하세요
2. 가격은 반드시 숫자 타입으로 설정하세요
3. 결제수단별 혜택을 포함하세요
4. 실제 매장 체인명을 사용하세요
${brandInfo.isBrandSpecific ? `5. ${brandInfo.brand}를 포함하여 같은 카테고리의 경쟁 브랜드들과 비교하세요
6. 특정 브랜드에서 해당 상품을 가장 싸게 사는 방법을 중점적으로 제공하세요` : ''}

JSON 형태:
{
  "productName": "${productName}",
  "category": "${category}",
  "sources": [
    {
      "platform": "매장명 (예: ${brandInfo.isBrandSpecific ? brandInfo.brand + ', ' : ''}GS25, 세븐일레븐, 롯데마트, 스타벅스 등)",
      "price": 숫자,
      "url": "매장 홈페이지 또는 앱 링크",
      "availability": true,
      "shipping": 0,
      "rating": 소수점포함숫자,
      "paymentBenefits": [
        {"method": "결제수단명", "discount": 할인금액, "description": "혜택설명"}
      ]
    }
  ],
  "averagePrice": 숫자,
  "lowestPrice": 숫자,
  "recommendedPlatform": "최저가매장명"
}

포함할 매장: ${brandInfo.isBrandSpecific ? `${brandInfo.brand}를 포함한 ` : ''}${category}에 맞는 실제 브랜드 매장들
${category === '카페' || brandInfo.category === '카페' ? `
카페 브랜드: ${brandInfo.isBrandSpecific ? `${brandInfo.brand} (우선포함), ` : ''}스타벅스, 이디야, 메가커피, 컴포즈커피, 탐앤탐스, 할리스, 투썸플레이스, 커피빈, 엔젤리너스, 빽다방, 폴바셋, 파스쿠찌, 카페베네, 커피나무, 그라찌에, 드롭탑, 더벤티, 매머드커피, 커피에반하다, 니코스케이터
${brandInfo.isBrandSpecific ? `- ${brandInfo.brand}의 실제 메뉴 가격을 기준으로 하되, 다른 브랜드들과 비교하여 표시하세요
- ${brandInfo.brand}에서 해당 음료를 가장 저렴하게 구매할 수 있는 결제수단과 할인 방법을 제공하세요` : ''}
` : ''}
- 결제수단별 할인혜택 포함 (신용카드, 간편결제, 멤버십 등)
- ${category} 카테고리에 적합한 합리적인 가격 범위 사용

중요: JSON 형태 외에는 다른 텍스트를 포함하지 마세요.` : `
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

    // 사용자 결제수단을 고려한 실제 최저가 계산
    if (userPaymentMethods && userPaymentMethods.length > 0) {
      priceData = calculateActualBestPrices(priceData, userPaymentMethods, category)
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
  
  // 카테고리별 플랫폼 설정
  const getPlatformsByCategory = (cat: string) => {
    switch(cat) {
      case '카페':
        return ['스타벅스', '메가커피', '이디야', '컴포즈커피', '탐앤탐스', '할리스', '투썸플레이스', '빽다방', '엔젤리너스', '폴바셋']
      case '편의점':
        return ['GS25', '세븐일레븐', 'CU', '이마트24', '미니스톱']
      case '마트':
        return ['이마트', '홈플러스', '롯데마트', '코스트코', '농협하나로마트']
      case '백화점':
        return ['롯데백화점', '신세계백화점', '현대백화점', '갤러리아']
      case '주유소':
        return ['SK에너지', 'GS칼텍스', 'S-Oil', '현대오일뱅크']
      default:
        return ['네이버쇼핑', '쿠팡', '11번가', 'G마켓', '옥션', '인터파크', '롯데온', '위메프']
    }
  }
  
  const platforms = getPlatformsByCategory(category)
  
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
    '편의점': 2000,
    '마트': 15000,
    '백화점': 100000,
    '카페': 4000,  // 아메리카노 기준 4000원
    '배달음식': 20000,
    '서점': 15000,
    '영화관': 12000,
    '주유소': 1600, // 리터당 1600원
    '병원': 30000,
    '약국': 8000,
    '헬스장': 80000, // 월 이용료
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

// 사용자 결제수단을 고려한 실제 최저가 계산
function calculateActualBestPrices(data: any, userPaymentMethods: PaymentMethod[], category: string) {
  if (!data.sources || !Array.isArray(data.sources)) {
    return data
  }

  // 활성화된 결제수단만 필터링
  const activePaymentMethods = userPaymentMethods.filter(pm => pm.isActive)
  
  if (activePaymentMethods.length === 0) {
    return data
  }

  // 각 매장별로 최적의 결제수단과 실제 가격 계산
  data.sources = data.sources.map((source: any) => {
    const bestPaymentOption = findBestPaymentMethod(source, activePaymentMethods, category)
    
    if (bestPaymentOption) {
      return {
        ...source,
        originalPrice: source.price,
        actualPrice: bestPaymentOption.finalPrice,
        bestPaymentMethod: bestPaymentOption.paymentMethod,
        discount: bestPaymentOption.discount,
        paymentBenefits: [{
          method: bestPaymentOption.paymentMethod.name,
          discount: bestPaymentOption.discount,
          description: `${bestPaymentOption.paymentMethod.name}로 결제시 ${bestPaymentOption.discount}원 할인`
        }]
      }
    }
    
    return source
  })

  // actualPrice 기준으로 정렬
  data.sources.sort((a: any, b: any) => {
    const priceA = a.actualPrice || a.price
    const priceB = b.actualPrice || b.price
    return priceA - priceB
  })

  // 최저가와 추천 플랫폼 업데이트
  const lowestPriceSource = data.sources[0]
  data.lowestPrice = lowestPriceSource.actualPrice || lowestPriceSource.price
  data.recommendedPlatform = lowestPriceSource.platform

  // 평균가격도 actualPrice 기준으로 재계산
  const actualPrices = data.sources.map((s: any) => s.actualPrice || s.price)
  data.averagePrice = Math.round(actualPrices.reduce((sum: number, price: number) => sum + price, 0) / actualPrices.length)

  return data
}

// 특정 매장에서 최적의 결제수단 찾기
function findBestPaymentMethod(source: any, paymentMethods: PaymentMethod[], category: string) {
  let bestOption = null
  let maxDiscount = 0

  for (const pm of paymentMethods) {
    const discount = calculateDiscount(source.price, pm, category)
    
    if (discount > maxDiscount) {
      maxDiscount = discount
      bestOption = {
        paymentMethod: pm,
        discount: discount,
        finalPrice: source.price - discount
      }
    }
  }

  return bestOption
}

// 할인 금액 계산
function calculateDiscount(originalPrice: number, paymentMethod: PaymentMethod, category: string): number {
  let discount = 0

  // 기본 할인율 적용
  discount += originalPrice * paymentMethod.discountRate

  // 특별 카테고리 추가 할인 (cashback을 할인으로 계산)
  if (paymentMethod.specialCategories.includes(category)) {
    discount += originalPrice * paymentMethod.cashback
  }

  return Math.round(discount)
}