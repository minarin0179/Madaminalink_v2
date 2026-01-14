import { defineConfig } from 'vitepress'
import type { HeadConfig } from 'vitepress'
import { slugify as defaultSlugify } from '@mdit-vue/shared'
import { commandsSidebar } from './commandsSidebar.mts'

// 環境変数でサイトURLを切り替え可能（トンネルテスト用）
const SITE_URL = process.env.SITE_URL || 'https://docs.madaminalink.com'

// 構造化データ: WebSite
const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'マダミナリンク 公式ガイド',
  'url': SITE_URL,
  'description': 'マーダーミステリー向けDiscord Bot ユーザーガイド',
  'inLanguage': 'ja-JP',
  'publisher': {
    '@type': 'Person',
    'name': 'minarin0179',
    'url': 'https://github.com/minarin0179'
  }
}

// 構造化データ: Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'マダミナリンク',
  'url': SITE_URL,
  'logo': `${SITE_URL}/images/common/icon.png`,
  'sameAs': [
    'https://github.com/minarin0179/Madaminalink_v2',
    'https://x.com/Madaminalink',
    'https://discord.com/discovery/applications/926051893728403486'
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'customer support',
    'url': 'https://discord.gg/JMqcQstFSK',
    'email': 'contact@madaminalink.com'
  }
}

// 構造化データ: SoftwareApplication
const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'マダミナリンク',
  'applicationCategory': 'UtilityApplication',
  'operatingSystem': 'Discord',
  'description': 'マーダーミステリー向けDiscord Bot。GMの作業を効率化する多機能Bot。',
  'url': SITE_URL,
  'author': {
    '@type': 'Person',
    'name': 'minarin0179',
    'url': 'https://github.com/minarin0179'
  },
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'JPY'
  }
}

// インデックスページがあるカテゴリ（パンくずにリンクを含める）
const categoriesWithIndex: Record<string, string> = {
  'commands': 'コマンド'
}

/**
 * パンくずリストの構造化データを生成
 * @param path ページのパス
 * @param pageTitle ページのタイトル（frontmatterから取得）
 */
function generateBreadcrumbSchema(path: string, pageTitle: string): object | null {
  if (!path || path === 'index') return null

  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const items: object[] = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'ホーム',
      'item': SITE_URL
    }
  ]

  let currentPath = ''
  let position = 2

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLastSegment = index === segments.length - 1

    if (isLastSegment) {
      // 最後のセグメントはページタイトルを使用
      items.push({
        '@type': 'ListItem',
        'position': position++,
        'name': pageTitle,
        'item': `${SITE_URL}${currentPath}`
      })
    } else if (categoriesWithIndex[segment]) {
      // インデックスがあるカテゴリのみパンくずに含める
      items.push({
        '@type': 'ListItem',
        'position': position++,
        'name': categoriesWithIndex[segment],
        'item': `${SITE_URL}${currentPath}`
      })
    }
    // インデックスがないカテゴリはスキップ
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items
  }
}

/**
 * HowToスキーマを生成（導入ガイド用）
 */
function generateHowToSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'マダミナリンクの導入方法',
    'description': 'マダミナリンクをDiscordサーバーに導入し、使い始めるまでの手順を説明します。',
    'totalTime': 'PT5M',
    'step': [
      {
        '@type': 'HowToStep',
        'position': 1,
        'name': 'Botを招待',
        'text': '招待リンクからマダミナリンクをサーバーに追加します。管理者権限の付与を推奨します。',
        'url': `${SITE_URL}/guide/getting-started#botの招待`
      },
      {
        '@type': 'HowToStep',
        'position': 2,
        'name': 'ロールの並び替え',
        'text': 'サーバー設定からマダミナリンクのロールを操作対象ロールより上位に配置します。',
        'url': `${SITE_URL}/guide/getting-started#_1-ロールの並び替え`
      },
      {
        '@type': 'HowToStep',
        'position': 3,
        'name': '動作確認',
        'text': '/pingコマンドを実行してBotが正しく動作しているか確認します。',
        'url': `${SITE_URL}/guide/getting-started#_2-スラッシュコマンドの動作確認`
      }
    ]
  }
}

/**
 * TechArticleスキーマを生成
 */
function generateTechArticleSchema(
  title: string,
  description: string,
  path: string,
  dateModified?: string
): object {
  // OGP画像パスを生成
  const imagePath = path ? `og/${path}.png` : 'og/index.png'

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': title,
    'description': description,
    'url': `${SITE_URL}/${path}`,
    'image': `${SITE_URL}/${imagePath}`,
    'inLanguage': 'ja-JP',
    'author': {
      '@type': 'Person',
      'name': 'minarin0179',
      'url': 'https://github.com/minarin0179'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'マダミナリンク',
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/images/common/icon.png`
      }
    },
    ...(dateModified && { 'dateModified': dateModified })
  }
}

export default defineConfig({
  // Markdown設定
  markdown: {
    anchor: {
      // デフォルトのslugify（NFKD）後にNFKC正規化（日本語の濁点などを合成文字として保持）
      slugify: (s) => defaultSlugify(s).normalize('NFKC')
    }
  },

  // サイト基本設定
  title: 'マダミナリンク 公式ガイド',
  description: 'マーダーミステリー向けDiscord Bot ユーザーガイド',
  lang: 'ja-JP',

  // カスタムドメイン用（docs.madaminalink.com）
  base: '/',

  // クリーンURL（.htmlなし）を使用
  cleanUrls: true,

  // サイトマップ生成
  sitemap: {
    hostname: 'https://docs.madaminalink.com'
  },

  // リンク切れチェック
  ignoreDeadLinks: false,

  // ビルドから除外するファイル（テンプレートファイルなど）
  srcExclude: ['**/_template.md'],

  // ページごとのメタタグを動的に生成
  transformHead: ({ pageData, siteData }) => {
    const head: HeadConfig[] = []
    const path = pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '').replace(/\/$/, '')
    const canonicalUrl = `${SITE_URL}/${path}`

    // OGP画像パスの生成（ビルド時に生成される画像を参照）
    const ogImagePath = path ? `og/${path}.png` : 'og/index.png'
    const ogImageUrl = `${SITE_URL}/${ogImagePath}`

    // ページタイトルの生成（VitePressの<title>タグと同じ形式）
    const pageTitle = pageData.title
      ? `${pageData.title} | ${siteData.title}`
      : siteData.title

    // ページの説明（frontmatterまたはデフォルト）
    const pageDescription = pageData.frontmatter.description || siteData.description

    // canonical & og:url
    head.push(['link', { rel: 'canonical', href: canonicalUrl }])
    head.push(['meta', { property: 'og:url', content: canonicalUrl }])

    // 動的なOGPタイトル・説明
    head.push(['meta', { property: 'og:title', content: pageTitle }])
    head.push(['meta', { property: 'og:description', content: pageDescription }])

    // 動的なOGP画像
    head.push(['meta', { property: 'og:image', content: ogImageUrl }])
    head.push(['meta', { property: 'og:image:width', content: '1200' }])
    head.push(['meta', { property: 'og:image:height', content: '630' }])
    head.push(['meta', { property: 'og:image:alt', content: pageTitle }])
    head.push(['meta', { property: 'og:image:type', content: 'image/png' }])

    // Twitter Card
    head.push(['meta', { name: 'twitter:card', content: 'summary_large_image' }])
    head.push(['meta', { name: 'twitter:title', content: pageTitle }])
    head.push(['meta', { name: 'twitter:description', content: pageDescription }])
    head.push(['meta', { name: 'twitter:image', content: ogImageUrl }])
    head.push(['meta', { name: 'twitter:image:alt', content: pageTitle }])

    // 構造化データ: BreadcrumbList（動的生成）
    const breadcrumbSchema = generateBreadcrumbSchema(path, pageData.title || path)
    if (breadcrumbSchema) {
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(breadcrumbSchema)])
    }

    // 構造化データ: HowTo（導入ガイドページのみ）
    if (path === 'guide/getting-started') {
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(generateHowToSchema())])
    }

    // 構造化データ: TechArticle（コマンドページとガイドページ）
    if (path.startsWith('commands/') || path.startsWith('guide/')) {
      const articleSchema = generateTechArticleSchema(
        pageData.title || path,
        pageDescription,
        path,
        pageData.lastUpdated ? new Date(pageData.lastUpdated).toISOString() : undefined
      )
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(articleSchema)])
    }

    return head
  },

  // ヘッド設定
  head: [
    // LCP画像のプリロード（パフォーマンス最適化）
    ['link', { rel: 'preload', as: 'image', href: '/images/common/icon.webp', type: 'image/webp', fetchpriority: 'high' }],

    // ファビコン（複数サイズ対応）
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],

    // SEO基本設定
    ['meta', { name: 'keywords', content: 'マダミナリンク,マーダーミステリー,Discord,Bot,GM,TRPG,シナリオ管理,ログ保存,チャンネル管理' }],
    ['meta', { name: 'author', content: 'minarin0179' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'theme-color', content: '#5865F2' }],

    // Open Graph / Discord embed（og:title, og:description, og:imageはtransformHeadで動的生成）
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'ja_JP' }],
    ['meta', { property: 'og:site_name', content: 'マダミナリンク 公式ガイド' }],

    // Twitter Card（twitter:card, twitter:title, twitter:description, twitter:imageはtransformHeadで動的生成）
    ['meta', { name: 'twitter:site', content: '@Madaminalink' }],
    ['meta', { name: 'twitter:creator', content: '@minarin0179' }],

    // その他のSEO設定
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }],

    // 構造化データ (JSON-LD) - グローバル
    ['script', { type: 'application/ld+json' }, JSON.stringify(webSiteSchema)],
    ['script', { type: 'application/ld+json' }, JSON.stringify(organizationSchema)],
    ['script', { type: 'application/ld+json' }, JSON.stringify(softwareAppSchema)],
  ],

  // テーマ設定
  themeConfig: {
    // サイトタイトルとロゴ
    siteTitle: 'マダミナリンク 公式ガイド',
    logo: '/images/common/icon.webp',

    // ナビゲーション
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'はじめに', link: '/guide/getting-started' },
      { text: 'コマンド一覧', link: '/commands/' },
      { text: 'リリースノート', link: '/releases' },
      { text: 'サポート', link: 'https://discord.gg/JMqcQstFSK' }
    ],

    // サイドバー
    sidebar: {
      '/guide/': [
        {
          text: 'はじめに',
          items: [
            { text: '導入方法', link: '/guide/getting-started' },
            // 必要に応じて追加
            // { text: '基本的な使い方', link: '/guide/basic-usage' },
            // { text: '権限について', link: '/guide/permissions' }
          ]
        }
      ],
      '/commands/': commandsSidebar,
      '/legal/': [
        {
          text: '法的情報',
          items: [
            { text: 'プライバシーポリシー', link: '/legal/privacy-policy' },
            { text: '利用規約', link: '/legal/terms' }
          ]
        }
      ]
    },

    // ソーシャルリンク
    socialLinks: [
      { icon: 'github', link: 'https://github.com/minarin0179/Madaminalink_v2' },
      { icon: 'discord', link: 'https://discord.com/discovery/applications/926051893728403486' },
      { icon: 'x', link: 'https://x.com/Madaminalink' },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
        },
        link: 'mailto:contact@madaminalink.com',
        ariaLabel: 'Email'
      }
    ],

    // フッター
    footer: {
      message: 'マダミナリンク 公式ガイド - マーダーミステリー向けDiscord Bot | <a href="/legal/privacy-policy">プライバシーポリシー</a> | <a href="/legal/terms">利用規約</a>',
      copyright: 'Copyright 2025 minarin0179'
    },

    // ローカル検索
    search: {
      provider: 'local',
      options: {
        // frontmatterのtitle/descriptionを検索インデックスに含める
        _render(src, env, md) {
          const html = md.render(src, env)
          const { title, description } = env.frontmatter || {}
          let prefix = ''
          // 本文に # で始まる見出しがない場合のみtitleを追加（重複ID防止）
          if (title && !/^# /m.test(src)) {
            prefix += `# ${title}\n\n`
          }
          if (description) {
            prefix += `${description}\n\n`
          }
          if (prefix) {
            return md.render(prefix) + html
          }
          return html
        },
        translations: {
          button: {
            buttonText: '検索',
            buttonAriaLabel: '検索'
          },
          modal: {
            noResultsText: '結果が見つかりませんでした',
            resetButtonTitle: 'リセット',
            footer: {
              selectText: '選択',
              navigateText: '移動'
            }
          }
        }
      }
    },

    // 最終更新日表示
    lastUpdated: {
      text: '最終更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // 目次設定
    outline: {
      label: '目次',
      level: [2, 3]
    },

    // 前後のページナビ
    docFooter: {
      prev: '前のページ',
      next: '次のページ'
    }
  },

  // 最終更新日を有効化
  lastUpdated: true,

  // トップページのtitleを空にしてサイトタイトルのみにする（重複防止）
  transformPageData(pageData) {
    if (pageData.relativePath === 'index.md') {
      pageData.title = ''
    }
  }
})
