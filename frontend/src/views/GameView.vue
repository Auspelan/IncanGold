<template>
  <section class="game-view glass-panel">
    <transition name="fade-up" mode="out-in">
      <div v-if="gameStore.eventMessage" key="game-banner" class="event-banner">{{ gameStore.eventMessage }}</div>
    </transition>

    <GameStatus class="status-strip" />

    <div class="content">
      <div class="primary">
        <GameBoard />
        <PlayerActions />
      </div>
      <aside class="sidebar">
        <PlayerInfo />
        <div class="players-card">
          <h3>玩家情报</h3>
          <ul>
            <li
              v-for="row in playerRows"
              :key="row.player.playerId"
              :class="['player-entry', row.status.className, { self: row.player.playerId === gameStore.playerId }]"
            >
              <div class="heading">
                <span class="name">
                  {{ row.player.playerName }}
                  <span v-if="row.player.playerId === gameStore.playerId" class="tag">你</span>
                </span>
                <span class="coins">💰 {{ row.player.goldCarried }}</span>
              </div>
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
  gap: 22px;
  padding: 30px 34px;
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

.status-strip {
  border-radius: var(--radius-md);
  padding: 16px 18px;
  background: rgba(10, 18, 32, 0.72);
  border: 1px solid rgba(120, 141, 176, 0.28);
}

.content {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  gap: 24px;
}

.primary {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.players-card {
  border-radius: var(--radius-md);
  border: 1px solid rgba(120, 141, 176, 0.28);
  background: rgba(10, 18, 32, 0.78);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.players-card h3 {
  font-size: 18px;
}

.players-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-entry {
  border-radius: var(--radius-md);
  border: 1px solid rgba(120, 141, 176, 0.25);
  background: rgba(16, 24, 38, 0.85);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.player-entry.self {
  border-color: rgba(244, 193, 93, 0.45);
  box-shadow: 0 0 0 1px rgba(244, 193, 93, 0.25);
}

.heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.name {
  font-weight: 600;
  color: var(--text-primary);
}

.tag {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(244, 193, 93, 0.18);
  border: 1px solid rgba(244, 193, 93, 0.28);
  font-size: 11px;
  letter-spacing: 0.08em;
}

.coins {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.player-entry.awaiting {
  border-color: rgba(250, 204, 21, 0.35);
}

.player-entry.decided-forward {
  border-color: rgba(74, 222, 128, 0.45);
}

.player-entry.decided-retreat {
  border-color: rgba(129, 140, 248, 0.4);
}

.player-entry.decided-ready {
  border-color: rgba(59, 130, 246, 0.4);
}

.player-entry.camping {
  border-color: rgba(148, 163, 184, 0.35);
}

@media (max-width: 960px) {
  .game-view {
    padding: 26px 24px;
  }
  .content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .heading {
    flex-direction: column;
    align-items: flex-start;
  }
  .coins {
    align-self: flex-start;
  }
}
</style>
