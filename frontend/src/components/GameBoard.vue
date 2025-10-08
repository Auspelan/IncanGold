<template>
  <div class="board">
    <h3>游戏棋盘</h3>
    <div class="path">
      <div class="tile camp">营地</div>
      <div 
        v-for="(gold, index) in gameStore.pathGold" 
        :key="index"
        class="tile"
        :class="{ current: index === gameStore.position }"
      >
        位置 {{ index + 1 }}<br>
        金币: {{ gold }}
      </div>
    </div>
    
    <div class="players-on-path">
      <h4>路上的玩家</h4>
      <p v-for="player in playersOnPath" :key="player.id">
        {{ player.name }} - 位置: {{ player.position }}
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'GameBoard',
  setup() {
    const gameStore = useGameStore()
    
    const playersOnPath = computed(() => {
      return gameStore.players.filter(p => !p.inCamp)
    })
    
    return { gameStore, playersOnPath }
  }
}
</script>

<style scoped>
.board { margin: 20px 0; }
.path {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}
.tile {
  min-width: 80px;
  height: 80px;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
}
.tile.camp { background: #90ee90; }
.tile.current { border: 3px solid red; }
.players-on-path { margin-top: 10px; }
</style>
