<template>
  <section class="game-view">
    <div v-if="gameStore.eventMessage" class="event-banner">{{ gameStore.eventMessage }}</div>
    <GameStatus />

    <div class="content">
      <div class="primary">
        <GameBoard />
        <PlayerActions />
      </div>
      <aside class="sidebar">
        <PlayerInfo />
        <div class="players-card">
          <h3>玩家列表</h3>
          <ul>
            <li
              v-for="row in playerRows"
              :key="row.player.playerId"
              :class="['player-entry', row.status.className, { self: row.player.playerId === gameStore.playerId }]"
            >
              <div class="name">
                {{ row.player.playerName }}
                <span v-if="row.player.playerId === gameStore.playerId" class="tag">你</span>
              </div>
              <div class="coins">💰 手上金币: {{ row.player.goldCarried }}</div>
              <div class="status-line">
                <span class="emoji">{{ row.status.emoji }}</span>
                <span>{{ row.status.text }}</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import GameStatus from '../components/GameStatus.vue'
import PlayerInfo from '../components/PlayerInfo.vue'
import GameBoard from '../components/GameBoard.vue'
import PlayerActions from '../components/PlayerActions.vue'

export default {
  name: 'GameView',
  components: { GameStatus, PlayerInfo, GameBoard, PlayerActions },
  setup() {
    const gameStore = useGameStore()

    const playerRows = computed(() => {
      const players = gameStore.game.players || []
      return players.map((player) => {
        let status = { text: '等待选择', emoji: '🕒', className: 'awaiting' }

        if (player.hasMadeChoice) {
          if (player.choice === 'advance') {
            status = { text: '已决定继续探索', emoji: '🏃', className: 'decided-forward' }
          } else if (player.choice === 'return') {
            status = { text: '已决定返回营地', emoji: '🏕️', className: 'decided-retreat' }
          } else {
            status = { text: '已完成选择', emoji: '✅', className: 'decided-ready' }
          }
        } else if (!player.isOnRoad) {
          status = { text: '营地休整中', emoji: '⛺', className: 'camping' }
        }

        return { player, status }
      })
    })

    return { gameStore, playerRows }
  }
}
</script>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.event-banner {
  background: #fdf3d7;
  color: #a66d03;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
}

.content {
  display: flex;
  gap: 20px;
}

.primary {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.players-card {
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}

.players-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.player-entry {
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fafafa;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.player-entry.self {
  border-color: #4dabf7;
  background: #e8f4ff;
}

.player-entry.awaiting {
  border-color: #f59f00;
  background: #fff7e6;
}

.player-entry.decided-forward {
  border-color: #2f9e44;
  background: #e9f7ef;
}

.player-entry.decided-retreat {
  border-color: #748ffc;
  background: #eef2ff;
}

.player-entry.decided-ready {
  border-color: #51cf66;
  background: #ecfdf3;
}

.player-entry.camping {
  border-color: #adb5bd;
  background: #f1f3f5;
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

.coins {
  margin-top: 6px;
  font-size: 13px;
  color: #444;
}

.status-line {
  margin-top: 4px;
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
}

.emoji {
  font-size: 14px;
}

@media (max-width: 820px) {
  .content {
    flex-direction: column;
  }
}
</style>
