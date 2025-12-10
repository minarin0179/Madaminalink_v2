#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REPO_OWNER = 'minarin0179';
const REPO_NAME = 'Madaminalink_v2';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;

async function fetchReleases() {
  try {
    console.log('GitHub Releasesから情報を取得中...');

    const response = await fetch(API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Madaminalink-Docs-Generator'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    const releases = await response.json();
    console.log(`${releases.length}件のリリースを取得しました`);

    return releases;
  } catch (error) {
    console.error('リリース情報の取得に失敗しました:', error.message);
    // エラー時は空の配列を返す（ビルドは継続）
    return [];
  }
}

function generateMarkdown(releases) {
  let markdown = `---
title: リリースノート
description: マダミナリンクの更新履歴
---

# リリースノート

マダミナリンクの更新履歴です。最新版から順に表示されています。

`;

  if (releases.length === 0) {
    markdown += `:::warning
リリース情報を取得できませんでした。[GitHubのリリースページ](https://github.com/${REPO_OWNER}/${REPO_NAME}/releases)をご確認ください。
:::
`;
    return markdown;
  }

  for (const release of releases) {
    const version = release.tag_name;
    const title = release.name || version;
    const date = new Date(release.published_at).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const isPrerelease = release.prerelease;
    const isDraft = release.draft;

    // ドラフトはスキップ
    if (isDraft) continue;

    markdown += `## ${title}`;

    if (isPrerelease) {
      markdown += ` :badge[プレリリース]{type="warning"}`;
    }

    markdown += `\n\n`;
    markdown += `**リリース日**: ${date}  \n`;
    markdown += `**タグ**: [\`${version}\`](https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${version})\n\n`;

    // リリースノート本文
    if (release.body && release.body.trim()) {
      markdown += `${release.body.trim()}\n\n`;
    } else {
      markdown += `_リリースノートはありません_\n\n`;
    }

    markdown += `---\n\n`;
  }

  // フッター
  markdown += `\n:::tip\n`;
  markdown += `すべてのリリースは[GitHubのリリースページ](https://github.com/${REPO_OWNER}/${REPO_NAME}/releases)でも確認できます。\n`;
  markdown += `:::\n`;

  return markdown;
}

async function main() {
  const releases = await fetchReleases();
  const markdown = generateMarkdown(releases);

  const outputPath = join(__dirname, '..', 'docs', 'releases.md');
  writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`✓ リリースノートを生成しました: ${outputPath}`);
}

main();
