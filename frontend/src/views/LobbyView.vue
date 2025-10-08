<template>
  <div class="lobby">
    <h2>游戏大厅</h2>
    <div>
      <input v-model="playerName" placeholder="输入你的名字" />
    </div>
    <div>
      <input v-model="entranceFee" type="number" placeholder="入场费" />
    </div>
    <button @click="join" :disabled="!playerName || !entranceFee">加入游戏</button>
    
    <div v-if="gameStore.roomId">
      <p>房间ID: {{ gameStore.roomId }}</p>
      <p>等待玩家 ({{ gameStore.players.length }}/3)</p>
      <ul>
        <li v-for="player in gameStore.players" :key="player.id">
          {{ player.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'LobbyView',
  setup() {
    const gameStore = useGameStore()
    const playerName = ref('')
    const entranceFee = ref(100)
    
    const join = () => {
      gameStore.joinRoom(playerName.value, entranceFee.value)
    }
    
    return { gameStore, playerName, entranceFee, join }
  }
}
</script>

<style scoped>
.lobby { text-align: center; }
ul { list-style: none; padding: 0; }
</style>
