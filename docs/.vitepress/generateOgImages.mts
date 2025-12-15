import { ImageResponse } from '@vercel/og'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join, resolve } from 'path'
import matter from 'gray-matter'
import { globSync } from 'glob'

const DOCS_DIR = resolve(import.meta.dirname, '..')
const OUTPUT_DIR = join(DOCS_DIR, '.vitepress/dist/og')
const ICON_PATH = join(DOCS_DIR, 'public/images/common/icon.png')

// OGP画像のサイズ（推奨: 1200x630）
const OG_WIDTH = 1200
const OG_HEIGHT = 630

// Discord Blurpleカラー
const DISCORD_BLURPLE = '#5865F2'
const BACKGROUND_COLOR = '#1a1b26'

// テキスト切り詰め設定
const MAX_TITLE_LENGTH = 20
const MAX_DESCRIPTION_LENGTH = 100

interface PageInfo {
  title: string
  description: string
  path: string
}

/**
 * Markdownファイルからページ情報を取得
 */
function getPageInfo(filePath: string): PageInfo {
  const content = readFileSync(filePath, 'utf-8')
  const { data: frontmatter, content: mdContent } = matter(content)

  const relativePath = filePath
    .replace(DOCS_DIR + '/', '')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')

  // タイトルの取得（frontmatter優先）
  const title =
    frontmatter.title ||
    frontmatter.hero?.name ||
    relativePath.split('/').pop() ||
    'マダミナリンク 公式ガイド'

  // 説明の取得（frontmatter優先）
  const description =
    frontmatter.description ||
    frontmatter.hero?.tagline ||
    'マーダーミステリー向けDiscord Bot ユーザーガイド'

  return {
    title,
    description,
    path: relativePath || 'index',
  }
}

/**
 * OGP画像を生成
 * @param pageInfo ページ情報（タイトル、説明、パスを含む）
 * @param iconBase64 Data URL形式のBase64エンコード済みアイコン画像
 * @returns 生成されたOGP画像のバイナリデータ
 */
async function generateOgImage(pageInfo: PageInfo, iconBase64: string): Promise<Buffer> {
  // タイトルが長い場合は切り詰め
  const displayTitle =
    pageInfo.title.length > MAX_TITLE_LENGTH
      ? pageInfo.title.substring(0, MAX_TITLE_LENGTH - 2) + '...'
      : pageInfo.title

  // 説明が長い場合は切り詰め（2行程度）
  const displayDescription =
    pageInfo.description.length > MAX_DESCRIPTION_LENGTH
      ? pageInfo.description.substring(0, MAX_DESCRIPTION_LENGTH - 2) + '...'
      : pageInfo.description

  const html = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BACKGROUND_COLOR,
        padding: '50px 60px',
        fontFamily: 'sans-serif',
        position: 'relative',
      },
      children: [
        // 右上: アイコンとサービス名
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '50px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
            },
            children: [
              {
                type: 'img',
                props: {
                  src: iconBase64,
                  width: 56,
                  height: 56,
                  style: {
                    borderRadius: '50%',
                  },
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    marginLeft: '16px',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#cccccc',
                  },
                  children: 'マダミナリンク 公式ガイド',
                },
              },
            ],
          },
        },
        // メインコンテンツエリア
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              marginTop: '60px',
              marginBottom: '-40px',
            },
            children: [
              // メインタイトル（大きく）
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '96px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    lineHeight: 1.1,
                    marginBottom: '30px',
                    whiteSpace: 'pre-wrap',
                  },
                  children: displayTitle,
                },
              },
              // 説明（読めるサイズで）
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '32px',
                    color: '#cccccc',
                    lineHeight: 1.5,
                    maxWidth: '1050px',
                  },
                  children: displayDescription,
                },
              },
            ],
          },
        },
        // 下部アクセント
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              backgroundColor: DISCORD_BLURPLE,
            },
          },
        },
      ],
    },
  }

  const response = new ImageResponse(html, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
  })

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * 全ページのOGP画像を生成
 */
async function generateAllOgImages(): Promise<void> {
  console.log('🖼️  OGP画像の生成を開始します...')

  const iconBuffer = readFileSync(ICON_PATH)
  const iconBase64 = `data:image/png;base64,${iconBuffer.toString('base64')}`

  const mdFiles = globSync('**/*.md', {
    cwd: DOCS_DIR,
    ignore: ['node_modules/**', '.vitepress/**'],
  })

  console.log(`📄 ${mdFiles.length}個のMarkdownファイルを検出`)

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  let generated = 0
  let skipped = 0

  for (const mdFile of mdFiles) {
    const filePath = join(DOCS_DIR, mdFile)

    if (mdFile.includes('_template')) {
      skipped++
      continue
    }

    try {
      const pageInfo = getPageInfo(filePath)
      const outputPath = join(OUTPUT_DIR, `${pageInfo.path || 'index'}.png`)
      const outputDir = dirname(outputPath)

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
      }

      const imageBuffer = await generateOgImage(pageInfo, iconBase64)
      writeFileSync(outputPath, imageBuffer)

      console.log(`  ✅ ${pageInfo.path}.png (${pageInfo.title})`)
      generated++
    } catch (error) {
      console.error(`  ❌ ${mdFile}: ${error}`)
    }
  }

  console.log(`\n🎉 完了: ${generated}個生成, ${skipped}個スキップ`)
}

generateAllOgImages().catch(console.error)
