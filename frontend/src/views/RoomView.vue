<template>
  <section class="room-view">
    <div v-if="gameStore.eventMessage" class="event-banner">{{ gameStore.eventMessage }}</div>
    <h2>房间等待区</h2>
    <p class="summary">房间号：<strong>{{ roomLabel }}</strong></p>

    <div class="players-card">
      <header>
        <span>当前玩家 ({{ players.length }}/3)</span>
        <span v-if="statusText" :class="['status', statusClass]">{{ statusText }}</span>
      </header>
      <ul>
        <li v-for="player in players" :key="player.playerId" :class="{ self: player.playerId === gameStore.playerId }">
          <div class="name">
            {{ player.playerName }}
            <span v-if="player.playerId === gameStore.playerId" class="tag">你</span>
            <span v-if="readySet.has(player.playerId)" class="tag ready">已准备</span>
          </div>
          <div class="details">
            <span>营地金币: {{ player.goldInCamp }}</span>
            <span>携带金币: {{ player.goldCarried }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="actions">
      <button @click="gameStore.leaveRoom">离开房间</button>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'RoomView',
  setup() {
    const gameStore = useGameStore()

    const players = computed(() => {
      if (gameStore.roomPlayers.length) return gameStore.roomPlayers
      return gameStore.game.players || []
    })

    const readySet = computed(() => new Set(gameStore.roomReadyPlayers || []))

    const needed = computed(() => Math.max(0, 3 - players.value.length))

    const status = computed(() => {
      const total = players.value.length
      if (gameStore.isQueued && !gameStore.roomId) {
        return { text: '匹配中，等待分配房间...', cls: 'waiting' }
      }
      if (total === 0) {
        return { text: '暂无玩家，等待加入...', cls: 'waiting' }
      }
      if (needed.value > 0) {
        return { text: `还差 ${needed.value} 名玩家`, cls: 'waiting' }
      }
      if (readySet.value.size > 0 && readySet.value.size < total) {
        return { text: `已准备 ${readySet.value.size}/${total}，等待其他玩家`, cls: 'waiting' }
      }
      if (readySet.value.size === total && total > 0) {
        return { text: '玩家已准备完毕，即将开始...', cls: 'ready' }
      }
      return { text: '玩家已满，等待开始...', cls: 'ready' }
    })

    const roomLabel = computed(() => gameStore.roomId || (gameStore.isQueued ? '匹配中' : '尚未分配'))

    const statusText = computed(() => status.value.text)
    const statusClass = computed(() => status.value.cls)

    return { gameStore, players, needed, readySet, statusText, statusClass, roomLabel }
  }
}
</script>

<style scoped>
.room-view {
  padding: 24px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  text-align: center;
}

.summary {
  color: #444;
  margin-bottom: 18px;
  font-size: 15px;
}

.players-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e1e4e8;
  padding: 16px;
  text-align: left;
}

.players-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 12px;
}

.status {
  font-size: 13px;
}

.waiting {
  color: #f39c12;
}

.ready {
  color: #2ecc71;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  background: #fdfdfd;
}

li.self {
  border-color: #4dabf7;
  background: #e9f4ff;
}

.name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.tag {
  background: #4dabf7;
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.tag.ready {
  background: #2ecc71;
}

.details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}

.actions {
  margin-top: 20px;
}

.actions button {
  background: #fff;
}
</style>
.event-banner {
  background: #fdf3d7;
  color: #a66d03;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}
