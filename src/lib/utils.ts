import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// プラグイン有効化
dayjs.extend(utc)
dayjs.extend(timezone)

// デフォルトタイムゾーンを日本時間に設定
dayjs.tz.setDefault('Asia/Tokyo')

export const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY年M月D日')
}
