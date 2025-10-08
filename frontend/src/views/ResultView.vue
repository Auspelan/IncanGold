<template>
  <div class="result">
    <h2>游戏结束</h2>
    <div v-for="(player, index) in sortedPlayers" :key="player.id">
      <p>
        第{{ index + 1 }}名: {{ player.name }} - 
        营地金币: {{ player.campGold }}
      </p>
    </div>
    <button @click="gameStore.restart">返回大厅</button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'ResultView',
  setup() {
    const gameStore = useGameStore()
    
    const sortedPlayers = computed(() => {
      return [...gameStore.players].sort((a, b) => b.campGold - a.campGold)
    })
    
    return { gameStore, sortedPlayers }
  }
}
</script>

<style scoped>
.result { text-align: center; }
</style>
