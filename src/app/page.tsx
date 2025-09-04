'use client'

import { useState } from 'react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (query?: string) => {
    const searchText = query || searchQuery
    if (!searchText.trim()) return
    
    setIsSearching(true)
    
    try {
      const response = await fetch('/api/price-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: searchText,
          category: '카페'
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCardClick = (searchText: string) => {
    setSearchQuery(searchText)
    handleSearch(searchText)
  }

  const handlePaymentMethodRegistration = () => {
    // 결제수단 등록 페이지로 이동
    window.location.href = '/payment-methods'
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto bg-white min-h-screen md:min-h-0 md:rounded-3xl md:shadow-2xl md:max-h-[800px] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <button 
              onClick={() => setShowResults(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
              메가커피 검색 가
            </div>
          </div>

          {/* 검색 결과 설명 */}
          <div className="p-6 text-center">
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              현재 등록된 신용카드로 메가커피 아이스아메리카노를<br />
              구매하면 1,000원을 절약할 수 있습니다.
            </p>
            
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              내 소비에서 가장 저렴하게 구매하는 방법.
            </h2>
          </div>

          {/* 결제수단별 할인 정보 */}
          <div className="px-4 space-y-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="font-medium text-gray-900 mb-2">
                홍길동님의 KB국민은행 0002카드 사용으로 1,000원 할인
              </div>
              <div className="text-sm text-gray-600">• 온라인 결제 5% 추가 할인</div>
            </div>

            <div className="text-lg font-bold text-gray-900 mb-3 px-2">그외,</div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="font-medium text-gray-900 mb-2">네이버페이 500원 할인</div>
              <div className="text-sm text-gray-600">• 간편결제 적립 혜택</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="font-medium text-gray-900 mb-2">카카오페이 300원 할인</div>
              <div className="text-sm text-gray-600">• 첫 결제 보너스</div>
            </div>
          </div>

          {/* 하단 검색창 */}
          <div className="fixed bottom-4 left-4 right-4 md:relative md:bottom-0 md:left-0 md:right-0 md:p-4">
            <div className="max-w-sm mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-2">
                <input
                  placeholder="소비에게 질문해보세요!"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent px-4 py-2 focus:outline-none text-sm placeholder-gray-400"
                />
                <button 
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white min-h-screen md:min-h-0 md:rounded-3xl md:shadow-2xl md:max-h-[800px] overflow-hidden">
        {/* 상태표시줄 - 모바일에서만 표시 */}
        <div className="flex justify-between items-center px-4 pt-4 pb-2 text-sm md:hidden">
          <div className="font-medium">9:41</div>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-3 bg-black rounded-full"></div>
              <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
            </div>
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <div className="w-6 h-3 border border-black rounded-sm">
              <div className="w-4 h-1.5 bg-black rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 md:py-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-bold text-lg md:text-xl">SOBI</span>
          </div>
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L3 10h14l-7-8zM10 18l7-8H3l7 8z"/>
          </svg>
        </div>

        {/* 총 절약 금액과 프로필 */}
        <div className="px-4 py-6 md:py-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                106,550원
              </div>
              <div className="text-gray-600 text-sm md:text-base">
                홍길동님의 어제의 절약 금액.
              </div>
            </div>
            
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 ml-4">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* 추천 카드 */}
        <div className="px-4 mb-4">
          <div className="bg-gray-800 text-white rounded-2xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-base font-medium">
                  804,200원 → 697,650원으로 절약하였어!
                </div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6 md:mb-8">
          <div 
            className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={handlePaymentMethodRegistration}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm md:text-base font-medium text-gray-900">
                  카드를 등록하면 더 정확한 추천이 가능해요!
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 빠른 액세스 카드들 */}
        <div className="px-4 mb-24 md:mb-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div 
              className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick("아이스 아메리카노 1,000원 저렴하게 마시는 방법")}
            >
              <div className="text-2xl md:text-3xl mb-2">☕</div>
              <div className="text-sm md:text-base font-medium text-gray-900 mb-1">
                아이스 아메리카노 1,000원
              </div>
              <div className="text-xs md:text-sm text-gray-600">저렴하게 마시는 방법</div>
            </div>
            
            <div 
              className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick("피자헛이선 올리브팬에서 10% 할인 받는 방법")}
            >
              <div className="text-2xl md:text-3xl mb-2">🍕</div>
              <div className="text-sm md:text-base font-medium text-gray-900 mb-1">
                피자헛이선 올리브팬에서
              </div>
              <div className="text-xs md:text-sm text-gray-600">10% 할인 받는 방법</div>
            </div>
          </div>
        </div>

        {/* 하단 검색창 */}
        <div className="fixed bottom-4 left-4 right-4 md:relative md:bottom-0 md:left-0 md:right-0 md:p-4">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-2 md:p-3">
              <input
                placeholder="소비에게 질문해보세요!"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent px-4 py-2 focus:outline-none text-sm md:text-base placeholder-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-gray-800 text-white p-2 md:p-2.5 rounded-full hover:bg-gray-700 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                {isSearching ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}