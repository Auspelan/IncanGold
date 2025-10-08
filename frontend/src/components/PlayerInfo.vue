<template>
  <div class="player-info">
    <h3>我的状态</h3>
    <p>营地金币: {{ gameStore.campGold }}</p>
    <p>手中金币: {{ gameStore.handGold }}</p>
    <p>当前位置: {{ gameStore.position }}</p>
  </div>
</template>

<script>
import { useGameStore } from '../stores/game'

export default {
  name: 'PlayerInfo',
  setup() {
    const gameStore = useGameStore()
    return { gameStore }
  }
}
</script>

<style scoped>
.player-info {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
}
</style>
