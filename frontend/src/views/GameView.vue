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
            <li v-for="player in players" :key="player.playerId" :class="{ self: player.playerId === gameStore.playerId }">
              <div class="name">{{ player.playerName }}</div>
              <div class="stats">
                <span>营地: {{ player.goldInCamp }}</span>
                <span>手上: {{ player.goldCarried }}</span>
                <span>位置: {{ player.position }}</span>
              </div>
              <div class="status" v-if="player.hasMadeChoice">
                已选择: {{ player.choice === 'return' ? '返回营地' : '继续前进' }}
              </div>
              <div class="status" v-else-if="player.isOnRoad">
                正在探索
              </div>
              <div class="status" v-else>
                营地等待
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
    const players = computed(() => gameStore.game.players || [])
    return { gameStore, players }
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

li {
  border: 1px solid #f0f2f5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  background: #fafafa;
}

li.self {
  border-color: #4dabf7;
  background: #e8f4ff;
}

.name {
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #555;
  margin-top: 6px;
}

.status {
  font-size: 12px;
  color: #8a8a8a;
  margin-top: 4px;
}

@media (max-width: 820px) {
  .content {
    flex-direction: column;
  }
}
</style>
