<template>
  <section class="lobby">
    <h2>游戏大厅</h2>
    <p class="subtitle">输入昵称与入场费后加入匹配，集齐 3 名玩家即可开始游戏。</p>

    <div class="form-grid">
      <label>
        昵称
        <input v-model.trim="gameStore.playerName" placeholder="输入你的名字" />
      </label>
      <label>
        入场费
        <input v-model.number="gameStore.entranceFee" type="number" min="0" />
      </label>
    </div>

    <div class="actions">
      <button @click="gameStore.joinRoom" :disabled="!canJoin">{{ joinLabel }}</button>
    </div>

    <p v-if="!gameStore.isConnected" class="hint">未连接到服务器，请稍候...</p>
    <p v-else-if="gameStore.isQueued" class="hint">已加入匹配队列，等待其他玩家...</p>

    <div v-if="gameStore.roomPlayers.length" class="waiting-card">
      <h3>已加入玩家 ({{ gameStore.roomPlayers.length }}/3)</h3>
      <ul>
        <li v-for="player in gameStore.roomPlayers" :key="player.playerId">
          {{ player.playerName }}
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'LobbyView',
  setup() {
    const gameStore = useGameStore()

    const joinLabel = computed(() => {
      if (!gameStore.isConnected) return '等待连接...'
      if (gameStore.isJoining) return '提交中...'
      if (gameStore.isQueued) return '匹配中...'
      return '加入游戏'
    })

    const canJoin = computed(() => {
      if (!gameStore.isConnected) return false
      if (!gameStore.playerName) return false
      if (gameStore.isJoining) return false
      if (gameStore.isQueued) return false
      return true
    })

    return { gameStore, joinLabel, canJoin }
  }
}
</script>

<style scoped>
.lobby {
  text-align: center;
  padding: 24px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-bottom: 18px;
}

.form-grid {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #444;
}

input {
  margin-top: 6px;
  width: 200px;
}

.actions {
  margin: 20px 0;
}

.hint {
  color: #666;
  margin-top: 12px;
}

.waiting-card {
  margin-top: 20px;
  text-align: left;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fff;
}

.waiting-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li + li {
  margin-top: 4px;
}
</style>
