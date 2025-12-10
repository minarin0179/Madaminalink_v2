import { defineConfig } from 'vitepress'

export default defineConfig({
  // サイト基本設定
  title: 'マダミナリンク',
  description: 'マーダーミステリー向けDiscord Bot ユーザーガイド',
  lang: 'ja-JP',

  // カスタムドメイン用（docs.madaminalink.com）
  base: '/',

  // 未作成ページへのリンクを許可（コンテンツ移植時に順次作成）
  ignoreDeadLinks: true,

  // ヘッド設定
  head: [
    ['meta', { name: 'theme-color', content: '#5865F2' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'ja_JP' }],
    ['meta', { property: 'og:title', content: 'マダミナリンク - ユーザーガイド' }],
    ['meta', { property: 'og:site_name', content: 'マダミナリンク' }],
    ['meta', { property: 'og:description', content: 'マーダーミステリー向けDiscord Botのユーザーガイド' }],
  ],

  // テーマ設定
  themeConfig: {
    // ナビゲーション
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'はじめに', link: '/guide/getting-started' },
      { text: 'コマンド一覧', link: '/commands/' },
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
      '/commands/': [
        {
          text: 'セットアップ系',
          items: [
            { text: '/setup - カテゴリ作成', link: '/commands/setup' },
            { text: '/role - ロール管理', link: '/commands/role' }
          ]
        },
        {
          text: '進行管理',
          items: [
            { text: '/open - チャンネル公開', link: '/commands/open' },
            { text: '/gather - VC移動', link: '/commands/gather' },
            { text: '/dice - ダイスロール', link: '/commands/dice' },
            { text: '/poll - 投票', link: '/commands/poll' },
            { text: '/remind - リマインダー', link: '/commands/remind' },
            { text: '/order - 順番決め', link: '/commands/order' }
          ]
        },
        {
          text: 'ログ・アーカイブ',
          items: [
            { text: '/archive - スレッド保存', link: '/commands/archive' },
            { text: '/transfer - メッセージ転送', link: '/commands/transfer' },
            { text: '/log - ログ化', link: '/commands/log' }
          ]
        },
        {
          text: 'クリーンアップ',
          items: [
            { text: '/cleanup - メッセージ削除', link: '/commands/cleanup' },
            { text: '/delete - カテゴリ削除', link: '/commands/delete' },
            { text: '/rename - ニックネーム変更', link: '/commands/rename' }
          ]
        },
        {
          text: 'その他',
          items: [
            { text: '/copy - チャンネル複製', link: '/commands/copy' },
            { text: '/sync - 権限同期', link: '/commands/sync' },
            { text: '/server - サーバー情報', link: '/commands/server' },
            { text: '/profile - アイコン設定', link: '/commands/profile' },
            { text: '/ping - 稼働確認', link: '/commands/ping' }
          ]
        }
      ],
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
      message: 'マダミナリンク - マーダーミステリー向けDiscord Bot | <a href="/legal/privacy-policy">プライバシーポリシー</a> | <a href="/legal/terms">利用規約</a>',
      copyright: 'Copyright 2024 minarin0179'
    },

    // ローカル検索
    search: {
      provider: 'local',
      options: {
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

    // 編集リンク
    editLink: {
      pattern: 'https://github.com/minarin0179/Madaminalink_v2/edit/main/docs/:path',
      text: 'このページを編集する'
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
  lastUpdated: true
})
