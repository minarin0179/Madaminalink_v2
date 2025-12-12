#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REPO_OWNER = 'minarin0179';
const REPO_NAME = 'Madaminalink_v2';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;
const CACHE_FILE = join(__dirname, 'releases-cache.json');
const OUTPUT_PATH = join(__dirname, '..', 'docs', 'releases.md');

/**
 * キャッシュを読み込む
 */
function loadCache() {
  try {
    if (existsSync(CACHE_FILE)) {
      return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (error) {
    console.log('キャッシュの読み込みに失敗しました（新規取得します）');
  }
  return null;
}

/**
 * キャッシュを保存
 */
function saveCache(releases) {
  try {
    const cacheDir = dirname(CACHE_FILE);
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify({
      timestamp: new Date().toISOString(),
      latestTag: releases[0]?.tag_name || null,
      latestPublishedAt: releases[0]?.published_at || null,
      releases
    }, null, 2), 'utf-8');
  } catch (error) {
    console.log('キャッシュの保存に失敗しました:', error.message);
  }
}

/**
 * 最新リリースのみ取得して変更があるか確認
 */
async function checkForUpdates(cache) {
  try {
    const response = await fetch(`${API_URL}?per_page=1`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Madaminalink-Docs-Generator'
      }
    });

    if (!response.ok) {
      // rate limit等の場合はキャッシュを使用
      console.log(`GitHub API応答: ${response.status} - キャッシュを使用します`);
      return { hasUpdates: false, useCache: true };
    }

    const [latest] = await response.json();

    if (!latest) {
      return { hasUpdates: true, useCache: false };
    }

    // キャッシュと比較
    if (cache &&
        cache.latestTag === latest.tag_name &&
        cache.latestPublishedAt === latest.published_at) {
      console.log('リリース情報に変更はありません（キャッシュを使用）');
      return { hasUpdates: false, useCache: true };
    }

    return { hasUpdates: true, useCache: false };
  } catch (error) {
    console.log('更新確認に失敗しました - キャッシュを使用します:', error.message);
    return { hasUpdates: false, useCache: true };
  }
}

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
  const cache = loadCache();

  // 既存のreleases.mdがあるか確認
  const hasExistingOutput = existsSync(OUTPUT_PATH);

  // 更新チェック（キャッシュと既存ファイルがある場合のみ）
  if (cache && hasExistingOutput) {
    const { hasUpdates, useCache } = await checkForUpdates(cache);

    if (!hasUpdates && useCache) {
      // キャッシュからMarkdownを再生成（ファイルが古い場合に備えて）
      const markdown = generateMarkdown(cache.releases);
      writeFileSync(OUTPUT_PATH, markdown, 'utf-8');
      console.log('✓ キャッシュからリリースノートを生成しました');
      return;
    }
  }

  // 全リリースを取得
  const releases = await fetchReleases();

  // 取得失敗時はキャッシュを使用
  if (releases.length === 0 && cache && cache.releases.length > 0) {
    console.log('取得失敗 - キャッシュを使用します');
    const markdown = generateMarkdown(cache.releases);
    writeFileSync(OUTPUT_PATH, markdown, 'utf-8');
    console.log('✓ キャッシュからリリースノートを生成しました');
    return;
  }

  const markdown = generateMarkdown(releases);
  writeFileSync(OUTPUT_PATH, markdown, 'utf-8');

  // キャッシュを更新
  if (releases.length > 0) {
    saveCache(releases);
  }

  console.log(`✓ リリースノートを生成しました: ${OUTPUT_PATH}`);
}

main();
