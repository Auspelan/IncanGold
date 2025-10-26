<template>
  <div class="status-card">
    <div class="item">
      <span class="label">当前回合</span>
      <span class="value">{{ round }}</span>
    </div>
    <div class="item">
      <span class="label">当前步数</span>
      <span class="value">{{ step }}</span>
    </div>
    <div class="item">
      <span class="label">陷阱状态</span>
      <span class="value" :class="{ danger: trapEncountered }">
        {{ trapEncountered ? '已遇到陷阱' : '未触发' }}
      </span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'GameStatus',
  setup() {
    const gameStore = useGameStore()
    const round = computed(() => gameStore.game.currentRound || 0)
    const step = computed(() => gameStore.game.currentStep || 0)
    const trapEncountered = computed(() => Boolean(gameStore.game.trapEncountered))
    return { round, step, trapEncountered }
  }
}
</script>

<style scoped>
.status-card {
  display: flex;
  gap: 18px;
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  padding: 12px 18px;
  background: #fff;
}

.item {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.label {
  color: #666;
  margin-bottom: 4px;
}

.value {
  font-weight: 600;
  color: #222;
}

.danger {
  color: #e74c3c;
}

@media (max-width: 600px) {
  .status-card {
    flex-direction: column;
  }
}
</style>
