import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface CommandMeta {
  title: string
  description: string
}

declare const data: Record<string, CommandMeta>
export { data }

export default {
  watch: ['../commands/*.md'],
  load(watchedFiles: string[]): Record<string, CommandMeta> {
    const commands: Record<string, CommandMeta> = {}

    for (const file of watchedFiles) {
      // _template.md と index.md はスキップ
      const basename = path.basename(file)
      if (basename.startsWith('_') || basename === 'index.md') continue

      const content = fs.readFileSync(file, 'utf-8')
      const { data: frontmatter } = matter(content)

      // /commands/setup のような形式のキーにする
      const commandName = basename.replace('.md', '')
      const key = `/commands/${commandName}`

      commands[key] = {
        title: frontmatter.title || `/${commandName}`,
        description: (frontmatter.description || '').replace(/。$/, '').replace(/します$/, '')
      }
    }

    return commands
  }
}
