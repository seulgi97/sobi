# SOBI - 스마트 결제 비교 플랫폼

최저가 결제수단 비교로 최대 절약을 도와주는 모바일 중심의 반응형 웹 애플리케이션입니다.

## 🚀 주요 기능

### 📱 모바일 우선 설계
- SOBI 스타일의 직관적인 모바일 UI/UX
- 반응형 디자인으로 모든 디바이스 지원
- 터치 친화적인 인터페이스

### 💳 결제수단 관리
- 신용카드, 간편결제, 은행 등록 및 관리
- 할인율, 적립율, 월 한도 설정
- 카테고리별 특별 혜택 관리
- 인기 결제수단 빠른 추가

### 🔍 AI 기반 가격 검색
- ChatGPT API 연동으로 실시간 가격 비교
- 다양한 온라인 쇼핑몰 가격 정보
- 상품별 최적 결제수단 추천
- 절약 금액 및 할인율 계산

### 📊 대시보드 및 통계
- 총 절약 금액 추적
- 월간 거래 통계
- 결제수단별 성과 분석
- 개인화된 추천 시스템

## 🛠 기술 스택

### Frontend
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Zustand** - 상태 관리

### Backend
- **Next.js API Routes** - 서버리스 API
- **OpenAI API** - ChatGPT 연동 가격 검색
- **localStorage** - 클라이언트 데이터 저장

### Development
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포매팅
- **TypeScript** - 정적 타입 검사

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd sobi-payment-platform
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env.local` 파일을 생성하고 다음을 추가하세요:
```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=SOBI 스마트 결제 비교 플랫폼
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

### 5. 빌드
```bash
npm run build
npm start
```

## 🎯 주요 페이지

### 메인 대시보드 (`/`)
- 총 절약 금액 표시
- 추천 결제수단 카드
- 빠른 검색 인터페이스
- 인기 상품 바로가기

### 결제수단 관리 (`/payment-methods`)
- 등록된 결제수단 목록
- 활성화/비활성화 관리
- 인기 결제수단 빠른 추가
- 사용자 정의 결제수단 등록

## 🔧 API 엔드포인트

### `GET /api/payment-methods`
인기 결제수단 목록 조회

### `POST /api/payment-methods`
결제수단 검증 및 추가

### `POST /api/price-search`
AI 기반 상품 가격 검색 및 비교
- ChatGPT API를 활용한 실시간 가격 정보
- 다중 쇼핑몰 가격 비교
- 최적 결제수단 추천

## 📱 모바일 최적화

### 반응형 브레이크포인트
- **Mobile**: 기본 (320px~767px)
- **Tablet**: `md:` (768px~1023px)
- **Desktop**: `lg:` (1024px+)

### 모바일 UX 특화
- 하단 고정 검색바
- 터치 친화적 버튼 크기
- 스와이프 제스처 지원
- 모바일 키보드 최적화

## 🎨 디자인 시스템

### 색상 팔레트
```css
:root {
  --primary-bg: #f8f9fa;      /* 연한 회색 배경 */
  --card-bg: #ffffff;         /* 카드 배경 */
  --dark-bg: #2d3748;         /* 다크 버튼/강조 */
  --accent-blue: #3182ce;     /* 포인트 블루 */
  --text-primary: #2d3748;    /* 메인 텍스트 */
  --text-secondary: #718096;  /* 보조 텍스트 */
  --success: #38a169;         /* 성공/절약 */
  --border: #e2e8f0;          /* 테두리 */
}
```

### 컴포넌트 아키텍처
- **Atomic Design** 원칙 적용
- 재사용 가능한 UI 컴포넌트
- 일관성 있는 디자인 토큰

## 📊 데이터 구조

### 결제수단 (PaymentMethod)
```typescript
interface PaymentMethod {
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
```

### 가격 검색 결과 (PriceSearchResult)
```typescript
interface PriceSearchResult {
  productName: string
  category: string
  sources: PriceSource[]
  recommendations: PaymentRecommendation[]
  totalSavings: number
  searchedAt: Date
}
```

## 🚀 배포

### Vercel 배포 (권장)
```bash
npm install -g vercel
vercel --prod
```

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- 프로젝트 관련 문의: [GitHub Issues](https://github.com/your-username/sobi-payment-platform/issues)
- 버그 리포트 및 기능 요청 환영

---

**SOBI**로 스마트한 소비 습관을 만들어보세요! 💳✨# sobi
