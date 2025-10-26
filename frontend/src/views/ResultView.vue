<template>
  <section class="result-view">
    <h2>游戏结束</h2>
    <p class="summary">以下为本局结算结果，可选择继续游戏或返回大厅。</p>

    <div class="results">
      <div v-if="finalResults.length" class="card">
        <h3>最终排名（后端结算）</h3>
        <ol>
          <li v-for="item in finalResults" :key="item.playerId">
            <span class="rank">#{{ item.rank }}</span>
            <span class="name">{{ item.playerName }}</span>
            <span class="gold">{{ item.finalGold }} 金币</span>
          </li>
        </ol>
      </div>

      <div v-else class="card">
        <h3>最终排名（本地推算）</h3>
        <ol>
          <li v-for="player in fallback" :key="player.playerId">
            <span class="name">{{ player.playerName }}</span>
            <span class="gold">{{ player.goldInCamp }} 金币</span>
          </li>
        </ol>
      </div>
    </div>

    <div class="actions">
      <button @click="gameStore.continueGame">继续游戏</button>
      <button @click="gameStore.leaveRoom">返回大厅</button>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'ResultView',
  setup() {
    const gameStore = useGameStore()
    const finalResults = computed(() => gameStore.finalResults)
    const fallback = computed(() => {
      return [...gameStore.game.players].sort((a, b) => b.goldInCamp - a.goldInCamp)
    })
    return { gameStore, finalResults, fallback }
  }
}
</script>

<style scoped>
.result-view {
  text-align: center;
  padding: 24px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.summary {
  color: #666;
  font-size: 14px;
}

.results {
  margin: 20px auto;
  max-width: 420px;
}

.card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e1e4e8;
  padding: 16px;
}

h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

ol {
  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f5;
}

li:last-child {
  border-bottom: none;
}

.rank {
  font-weight: 600;
  width: 40px;
  text-align: left;
}

.name {
  flex: 1;
  text-align: left;
}

.gold {
  color: #2d7ff9;
  font-weight: 600;
}

.actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
