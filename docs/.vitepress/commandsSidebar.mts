import type { DefaultTheme } from 'vitepress'

/**
 * コマンドのサイドバー設定
 * この設定はサイドバーとindex.md自動生成の両方で使用される
 */
export const commandsSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '事前準備',
    items: [
      { text: '/setup - カテゴリ作成', link: '/commands/setup' },
      { text: '/role - ロール管理', link: '/commands/role' },
      { text: '/copy - チャンネル複製', link: '/commands/copy' },
      { text: '/transfer - メッセージ転送', link: '/commands/transfer' },
      { text: '/open - チャンネル公開', link: '/commands/open' },
      { text: '/remind - リマインダー', link: '/commands/remind' }
    ]
  },
  {
    text: '進行管理',
    items: [
      { text: '/dice - ダイスロール', link: '/commands/dice' },
      { text: '/poll - 投票', link: '/commands/poll' },
      { text: '/order - 順番決め', link: '/commands/order' },
      { text: '/gather - VC移動', link: '/commands/gather' }
    ]
  },
  {
    text: '事後処理',
    items: [
      { text: '/cleanup - メッセージ削除', link: '/commands/cleanup' },
      { text: '/delete - カテゴリ削除', link: '/commands/delete' },
      { text: '/rename - ニックネーム変更', link: '/commands/rename' },
      { text: '/sync - 権限同期', link: '/commands/sync' },
      { text: '/archive - スレッド保存', link: '/commands/archive' },
      { text: '/log - ログ化', link: '/commands/log' }
    ]
  },
  {
    text: 'その他',
    items: [
      { text: '/ping - 稼働確認', link: '/commands/ping' },
      { text: '/server - サーバー情報', link: '/commands/server' },
      { text: '/profile - アイコン設定', link: '/commands/profile' }
    ]
  }
]
