<template>
  <div class="status-card">
    <div class="item">
      <span class="icon">🌀</span>
      <div class="copy">
        <span class="label">当前回合</span>
        <span class="value">{{ round }}</span>
      </div>
    </div>
    <div class="item">
      <span class="icon">🗺️</span>
      <div class="copy">
        <span class="label">当前步数</span>
        <span class="value">{{ step }}</span>
      </div>
    </div>
    <div class="item">
      <span class="icon">⚠️</span>
      <div class="copy">
        <span class="label">陷阱状态</span>
        <span class="value" :class="{ danger: trapEncountered }">
          {{ trapEncountered ? '已遇到陷阱' : '未触发' }}
        </span>
      </div>
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: rgba(16, 24, 38, 0.85);
  border: 1px solid rgba(120, 141, 176, 0.28);
}

.icon {
  font-size: 20px;
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.value.danger {
  color: var(--danger);
}

@media (max-width: 540px) {
  .status-card {
    grid-template-columns: 1fr;
  }
}
</style>
