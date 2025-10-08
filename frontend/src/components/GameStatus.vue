<template>
  <div class="status">
    <p>回合: {{ gameStore.round }} / {{ gameStore.maxRounds }}</p>
    <p>阶段: {{ stageText }}</p>
    <p>当前陷阱数: {{ gameStore.trapNum }}</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'GameStatus',
  setup() {
    const gameStore = useGameStore()
    
    const stageText = computed(() => {
      const map = {
        'selection': '选择阶段',
        'judgment': '判定阶段',
        'settlement': '结算阶段'
      }
      return map[gameStore.gameStage] || ''
    })
    
    return { gameStore, stageText }
  }
}
</script>

<style scoped>
.status {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px 0;
}
</style>
