<script setup lang="ts">
import { computed } from 'vue'
import { data as commandsData } from '../../commands.data.mts'

const props = defineProps<{
  commands: string[]
}>()

const items = computed(() =>
  props.commands.map(name => {
    const path = `/commands/${name}`
    return { path, title: commandsData[path]?.title }
  })
)
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.path">
      <a :href="item.path">{{ item.title }}</a>
    </li>
  </ul>
</template>
