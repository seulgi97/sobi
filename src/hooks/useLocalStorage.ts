import { useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 서버 사이드와 클라이언트 사이드 하이드레이션 불일치 방지
  const [storedValue, setStoredValue] = useState<T>(() => {
    // 서버 사이드에서는 기본값 반환
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // localStorage에 값 저장하는 함수
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // 클라이언트 사이드에서만 localStorage 업데이트
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}