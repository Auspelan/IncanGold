<template>
  <div class="player-info" v-if="player">
    <h3>我的状态</h3>
    <div class="row">
      <span class="label">营地金币</span>
      <strong>{{ player.goldInCamp }}</strong>
    </div>
    <div class="row">
      <span class="label">手中金币</span>
      <strong>{{ player.goldCarried }}</strong>
    </div>
  </div>
  <div class="player-info" v-else>
    <h3>我的状态</h3>
    <p>等待加入房间...</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'PlayerInfo',
  setup() {
    const gameStore = useGameStore()
    const player = computed(() => gameStore.selfPlayer)
    return { player }
  }
}
</script>

<style scoped>
.player-info {
  border: 1px solid rgba(120, 141, 176, 0.28);
  padding: 18px 20px;
  border-radius: var(--radius-md);
  background: rgba(10, 18, 32, 0.78);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary);
}

.label {
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 12px;
}

strong {
  color: var(--text-primary);
}

p {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
}
</style>
