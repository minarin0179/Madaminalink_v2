<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";
import { data as commandsData } from "../../commands.data.mts";

const { theme } = useData();

// サイドバーからコマンドカテゴリを取得
const categories = computed(() => {
    const sidebar = theme.value.sidebar?.["/commands/"];
    if (!Array.isArray(sidebar)) return [];
    return sidebar;
});
</script>

<template>
  <div>
    <div v-for="category in categories" :key="category.text">
      <h2 :id="category.text">{{ category.text }}</h2>
      <table>
        <thead>
          <tr>
            <th>コマンド</th>
            <th>説明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in category.items" :key="item.link">
            <td>
              <a :href="item.link">{{ commandsData[item.link]?.title || item.text }}</a>
            </td>
            <td>{{ commandsData[item.link]?.description || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
