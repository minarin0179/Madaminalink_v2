<script setup lang="ts">
type Permission = 'write' | 'read' | 'none'

interface ChannelPermission {
  channel: string
  gm: Permission
  pl: Permission
  individualPl: Permission
  spectator: Permission
  isVoice?: boolean
}

defineProps<{
  permissions: ChannelPermission[]
}>()

const getLabel = (permission: Permission, isVoice: boolean) => {
  if (isVoice) {
    switch (permission) {
      case 'write': return '◯ 発言'
      case 'read': return '△ 聞くだけ'
      case 'none': return '✕ 見れない'
    }
  }
  switch (permission) {
    case 'write': return '◯ 読み書き'
    case 'read': return '△ 読むだけ'
    case 'none': return '✕ 見れない'
  }
}
</script>

<template>
  <table class="permission-table">
    <thead>
      <tr>
        <th></th>
        <th scope="col">GM</th>
        <th scope="col">PL</th>
        <th scope="col">各PC</th>
        <th scope="col">観戦</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in permissions" :key="row.channel">
        <th scope="row">{{ row.channel }}</th>
        <td :class="row.gm">{{ getLabel(row.gm, row.isVoice ?? false) }}</td>
        <td :class="row.pl">{{ getLabel(row.pl, row.isVoice ?? false) }}</td>
        <td :class="row.individualPl">{{ getLabel(row.individualPl, row.isVoice ?? false) }}</td>
        <td :class="row.spectator">{{ getLabel(row.spectator, row.isVoice ?? false) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.permission-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}
.permission-table th,
.permission-table td {
  border: 1px solid var(--vp-c-divider);
  padding: 0.5rem;
  text-align: center;
}
.permission-table td:first-child,
.permission-table th:first-child {
  text-align: left;
}
.permission-table th {
  background-color: var(--vp-c-bg-soft);
}
.permission-table .write {
  background-color: #d4edda;
  color: #155724;
}
.permission-table .read {
  background-color: #fff3cd;
  color: #856404;
}
.permission-table .none {
  background-color: #f8d7da;
  color: #721c24;
}
.dark .permission-table .write {
  background-color: #1e4620;
  color: #a3d9a5;
}
.dark .permission-table .read {
  background-color: #5c4813;
  color: #f5d67a;
}
.dark .permission-table .none {
  background-color: #4a1a1d;
  color: #f5a6a8;
}
</style>
