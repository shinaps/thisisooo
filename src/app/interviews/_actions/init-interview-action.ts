'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { promptForCareerInterview } from '@/app/interviews/_prompts/career-interview'
import { promptForFavoriteArtistInterview } from '@/app/interviews/_prompts/favorite-artist'
import { promptForFavoriteBookInterview } from '@/app/interviews/_prompts/favorite-book'
import { promptForFavoriteGameInterview } from '@/app/interviews/_prompts/favorite-game'
import { promptForFavoriteMovieInterview } from '@/app/interviews/_prompts/favorite-movie'
import { promptForHobbyInterview } from '@/app/interviews/_prompts/hobby'
import { promptForRecentEffortInterview } from '@/app/interviews/_prompts/recent-effort'
import { promptForRecentRestaurantInterview } from '@/app/interviews/_prompts/recent-restaurant'
import { promptForSelfIntroductionInterview } from '@/app/interviews/_prompts/self-introduction'
import { getDb } from '@/drizzle/client'
import { type InsertInterview, interview } from '@/drizzle/schema/d1/interview-schema'
import { auth } from '@/lib/auth'

const prompts = {
  career: promptForCareerInterview,
  recentEffort: promptForRecentEffortInterview,
  hobby: promptForHobbyInterview,
  favoriteArtist: promptForFavoriteArtistInterview,
  favoriteBook: promptForFavoriteBookInterview,
  favoriteMovie: promptForFavoriteMovieInterview,
  favoriteGame: promptForFavoriteGameInterview,
  recentRestaurant: promptForRecentRestaurantInterview,
  selfIntroduction: promptForSelfIntroductionInterview,
}
export type InterviewTheme = keyof typeof prompts

const THEME_TO_TITLE = {
  career: 'キャリア',
  recentEffort: '直近の頑張り',
  hobby: '趣味',
  favoriteArtist: '好きなアーティスト',
  favoriteBook: '好きな本',
  favoriteMovie: '好きな映画',
  favoriteGame: '好きなゲーム',
  recentRestaurant: '最近行った飲食店',
  selfIntroduction: '自己紹介',
} as const

export const initInterviewAction = async (theme: InterviewTheme) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const newContent = {
    id: crypto.randomUUID(),
    type: 'text',
    role: 'system',
    content: prompts[theme],
    createdAt: new Date(),
  } satisfies InsertInterview['content'][number]

  const newInterview = {
    title: `${THEME_TO_TITLE[theme]}に関するインタビュー`,
    content: [newContent],
    authorId: session.user.id,
    theme: THEME_TO_TITLE[theme],
  } satisfies InsertInterview

  const db = await getDb()
  const [insertedInterview] = await db
    .insert(interview)
    .values({ ...newInterview })
    .returning()

  redirect(`/interviews/${insertedInterview.id}`)
}
