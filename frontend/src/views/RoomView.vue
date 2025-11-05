<template>
  <section class="room-view glass-panel">
    <transition name="fade-up" mode="out-in">
      <div v-if="gameStore.eventMessage" key="banner" class="event-banner">
        {{ gameStore.eventMessage }}
      </div>
    </transition>

    <header class="section-header">
      <div>
        <h2>🏛️ 房间等待区</h2>
        <p class="subtitle">房间号：<strong>{{ roomLabel }}</strong></p>
      </div>
      <div class="status-pill" :class="statusClass">
        <span>{{ statusText }}</span>
      </div>
    </header>

    <div class="room-body">
      <ul class="player-grid">
        <li
          v-for="player in players"
          :key="player.playerId"
          :class="['player-card', { self: player.playerId === gameStore.playerId, ready: readySet.has(player.playerId) }]"
        >
          <span class="avatar">{{ initials(player.playerName) }}</span>
          <div class="info">
            <span class="name">
              {{ player.playerName }}
              <span v-if="player.playerId === gameStore.playerId" class="tag">你</span>
            </span>
            <span class="stats">营地：{{ player.goldInCamp }} · 手中：{{ player.goldCarried }}</span>
          </div>
          <span class="state" :class="{ ready: readySet.has(player.playerId) }">
            {{ readySet.has(player.playerId) ? '已准备' : '等待中' }}
          </span>
        </li>
      </ul>

      <aside class="room-info">
        <div class="stat">
          <span class="label">玩家人数</span>
          <span class="value">{{ players.length }}/3</span>
        </div>
        <div class="stat">
          <span class="label">已确认</span>
          <span class="value">{{ readySet.size }}</span>
        </div>
        <div class="stat">
          <span class="label">缺少</span>
          <span class="value">{{ Math.max(0, 3 - players.length) }}</span>
        </div>
      </aside>
    </div>

    <div class="actions">
      <button class="secondary" @click="gameStore.leaveRoom">离开房间</button>
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

    const statusText = computed(() => {
      const total = players.value.length
      if (gameStore.isQueued && !gameStore.roomId) return '匹配中'
      if (total === 0) return '等待玩家'
      if (total < 3) return `还差 ${3 - total} 位探险家`
      if (readySet.value.size === total && total > 0) return '全部就绪'
      if (readySet.value.size > 0) return `已准备 ${readySet.value.size}/${total}`
      return '等待确认'
    })

    const statusClass = computed(() => ({
      full: players.value.length === 3,
      ready: readySet.value.size === players.value.length && players.value.length > 0
    }))

    const roomLabel = computed(() => gameStore.roomId || (gameStore.isQueued ? '匹配中' : '尚未分配'))

    const initials = (name = '') => {
      const trimmed = name.trim()
      if (!trimmed) return '探'
      return trimmed.slice(0, 2).toUpperCase()
    }

    return { gameStore, players, readySet, statusText, statusClass, roomLabel, initials }
  }
}
</script>

<style scoped>
.room-view {
  padding: 30px 34px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.event-banner {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: rgba(244, 193, 93, 0.16);
  border: 1px solid rgba(244, 193, 93, 0.35);
  color: var(--accent);
  font-size: 13px;
  text-align: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.section-header h2 {
  font-size: 24px;
}

.subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.status-pill {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(120, 141, 176, 0.35);
  background: rgba(16, 26, 44, 0.75);
  color: var(--text-secondary);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-pill.ready {
  border-color: rgba(244, 193, 93, 0.45);
  color: var(--accent);
}

.status-pill.full {
  border-color: rgba(135, 220, 167, 0.45);
  color: var(--success);
}

.room-body {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.8fr);
  gap: 22px;
}

.player-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.player-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  background: rgba(16, 24, 38, 0.82);
  border: 1px solid rgba(120, 141, 176, 0.28);
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.player-card.self {
  border-color: rgba(244, 193, 93, 0.45);
  box-shadow: 0 0 0 1px rgba(244, 193, 93, 0.25);
}

.player-card.ready {
  border-color: rgba(135, 220, 167, 0.45);
}

.player-card .avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(244, 193, 93, 0.18);
  border: 1px solid rgba(244, 193, 93, 0.24);
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info .name {
  color: var(--text-primary);
  font-weight: 600;
}

.tag {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(244, 193, 93, 0.2);
  border: 1px solid rgba(244, 193, 93, 0.3);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.stats {
  font-size: 12px;
  color: var(--text-muted);
}

.state {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.state.ready {
  color: var(--success);
}

.room-info {
  display: grid;
  gap: 16px;
  padding: 20px 22px;
  border-radius: var(--radius-md);
  background: rgba(10, 18, 32, 0.75);
  border: 1px solid rgba(120, 141, 176, 0.28);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.stat .value {
  font-size: 20px;
  font-family: var(--font-heading, 'Cinzel', serif);
  color: var(--text-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .room-view {
    padding: 26px 24px;
  }
  .room-body {
    grid-template-columns: 1fr;
  }
  .room-info {
    order: -1;
  }
}

@media (max-width: 600px) {
  .player-card {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .state {
    order: -1;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
