import { and, eq } from 'drizzle-orm/sql/expressions/conditions'
import { ImageResponse } from 'next/og'
import { getDb } from '@/drizzle/client'
import { article } from '@/drizzle/schema/d1/article-schema'
import { userProfile } from '@/drizzle/schema/d1/user-profile-schema'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/jpeg'

// Image generation
export default async function Image({ params }: { params: { articleId: string } }) {
  const { articleId } = await params

  const db = await getDb()
  const [selectedArticle] = await db
    .select({
      title: article.title,
      theme: article.theme,
      userDisplayName: userProfile.name,
    }) //
    .from(article)
    .leftJoin(userProfile, eq(article.authorId, userProfile.userId))
    .where(
      and(
        eq(article.id, articleId), //
        // eq(article.published, true),
      ),
    )

  const fontSemiBold = await fetch('https://assets.thisis.ooo/NotoSansJP-SemiBold.ttf')
  const image = await fetch('https://assets.thisis.ooo/logo.jpg')
  const imageBuffer = await image.arrayBuffer()

  const Component = () => {
    return (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
        }}
      >
        <div
          style={{
            borderRadius: '1rem',
            background: 'white',
            padding: '6rem 0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '3rem',
              fontFamily: 'NotoSansJP SemiBold',
              width: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedArticle.title}
          </span>
          <span
            style={{
              fontSize: '2.5rem',
              fontFamily: 'NotoSansJP SemiBold',
              width: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            {selectedArticle.userDisplayName}
          </span>
          <img
            //@ts-ignore
            src={imageBuffer} //
            style={{
              position: 'absolute',
              bottom: '3rem',
              right: '3rem',
            }}
            width={150}
            alt=""
          />
        </div>
      </div>
    )
  }

  return new ImageResponse(
    <Component />,
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: 'NotoSansJP SemiBold',
          data: await fontSemiBold.arrayBuffer(),
          style: 'normal',
          weight: 600,
        },
      ],
    },
  )
}
