'use client'

import { useEffect, useState } from 'react'

export const useVirtualKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    // Visual Viewport APIが利用可能かチェック
    if (typeof window === 'undefined' || !window.visualViewport) {
      return
    }

    const handleViewportChange = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      const windowHeight = window.innerHeight
      const viewportHeight = viewport.height

      // キーボードが表示されている場合、viewportの高さが小さくなる
      const heightDifference = windowHeight - viewportHeight

      if (heightDifference > 150) {
        // 150px以上の差がある場合はキーボードが表示されていると判断
        setKeyboardHeight(heightDifference)
        setIsKeyboardVisible(true)
      } else {
        setKeyboardHeight(0)
        setIsKeyboardVisible(false)
      }
    }

    // イベントリスナーを追加
    window.visualViewport.addEventListener('resize', handleViewportChange)
    window.visualViewport.addEventListener('scroll', handleViewportChange)

    // 初期値を設定
    handleViewportChange()

    // クリーンアップ
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
        window.visualViewport.removeEventListener('scroll', handleViewportChange)
      }
    }
  }, [])

  return {
    keyboardHeight,
    isKeyboardVisible,
  }
}
