import { promptForAchievementInterview } from '@/app/interviews/_prompts/achievement'
import { promptForCareerInterview } from '@/app/interviews/_prompts/career-interview'
import { promptForFavoriteArtistInterview } from '@/app/interviews/_prompts/favorite-artist'
import { promptForFavoriteBookInterview } from '@/app/interviews/_prompts/favorite-book'
import { promptForFavoriteGameInterview } from '@/app/interviews/_prompts/favorite-game'
import { promptForFavoriteMovieInterview } from '@/app/interviews/_prompts/favorite-movie'
import { promptForHobbyInterview } from '@/app/interviews/_prompts/hobby'
import { promptForProductInterview } from '@/app/interviews/_prompts/product-interview'
import { promptForRecentEffortInterview } from '@/app/interviews/_prompts/recent-effort'
import { promptForRecentRestaurantInterview } from '@/app/interviews/_prompts/recent-restaurant'
import { promptForSelfIntroductionInterview } from '@/app/interviews/_prompts/self-introduction'
import { promptForThoughtReasonInterview } from '@/app/interviews/_prompts/thought-reason'

export const prompts = {
  achievement: promptForAchievementInterview,
  career: promptForCareerInterview,
  recentEffort: promptForRecentEffortInterview,
  hobby: promptForHobbyInterview,
  favoriteArtist: promptForFavoriteArtistInterview,
  favoriteBook: promptForFavoriteBookInterview,
  favoriteMovie: promptForFavoriteMovieInterview,
  favoriteGame: promptForFavoriteGameInterview,
  recentRestaurant: promptForRecentRestaurantInterview,
  selfIntroduction: promptForSelfIntroductionInterview,
  product: promptForProductInterview,
  thoughtReason: promptForThoughtReasonInterview,
}
export type InterviewTheme = keyof typeof prompts

export const THEME_TO_TITLE = {
  achievement: 'アチーブメント',
  career: 'キャリア',
  recentEffort: '直近の頑張り',
  hobby: '趣味',
  favoriteArtist: '好きなアーティスト',
  favoriteBook: '好きな本',
  favoriteMovie: '好きな映画',
  favoriteGame: '好きなゲーム',
  recentRestaurant: '最近行った飲食店',
  selfIntroduction: '自己紹介',
  product: 'プロダクト',
  thoughtReason: '考え',
} as const
