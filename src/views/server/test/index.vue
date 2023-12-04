<template>
  <div class="px-5 pt-5">
    <div class="w-full h-200">
      <!-- <iframe :src="link" width="100%" height="100%"></iframe> -->
      <el-button @click="open">测试</el-button>
      <a target="_blank"></a>
    </div>
  </div>
</template>

<script setup>
import { test } from '@/api/server/cluster'

const open = () => {
  console.log('object')
}
</script>

<style lang="scss" scoped></style>
