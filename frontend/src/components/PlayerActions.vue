<template>
  <div class="actions">
    <h3>选择行动</h3>
    <p class="desc">所有玩家同时决定前进或返回，等待结果更新。</p>

    <div class="buttons">
      <button
        @click="gameStore.chooseAdvance"
        :disabled="actionLocked"
        :class="{ locked: actionLocked, blocked: choiceBlocked && !actionLocked }"
      >前进探险</button>
      <button
        @click="gameStore.chooseReturn"
        :disabled="actionLocked"
        :class="{ locked: actionLocked, blocked: choiceBlocked && !actionLocked }"
      >返回营地</button>
    </div>

    <p v-if="statusHint" class="hint">{{ statusHint }}</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'PlayerActions',
  setup() {
    const gameStore = useGameStore()
    const actionLocked = computed(() => !gameStore.selfPlayer || !gameStore.isConnected)
    const choiceBlocked = computed(() => {
      const self = gameStore.selfPlayer
      if (!self) return false
      if (!self.isOnRoad) return true
      if (self.hasMadeChoice) return true
      return gameStore.hasPendingChoice
    })
    const statusHint = computed(() => {
      const self = gameStore.selfPlayer
      if (!self) return ''
      if (!self.isOnRoad) return '你已返回营地，等待下一轮开始。'
      if (self.hasMadeChoice || gameStore.waitingForOthers) return '已提交选择，等待其他玩家...'
      return ''
    })
    return { gameStore, actionLocked, choiceBlocked, statusHint }
  }
}
</script>

<style scoped>
.actions {
  border: 1px solid rgba(120, 141, 176, 0.28);
  padding: 18px 20px;
  border-radius: var(--radius-md);
  background: rgba(10, 18, 32, 0.78);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.actions h3 {
  font-size: 18px;
}

.desc {
  color: var(--text-muted);
  font-size: 13px;
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.buttons button {
  flex: 1;
  min-width: 140px;
}

.buttons button.locked {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.buttons button.blocked {
  background: rgba(45, 63, 104, 0.7);
  color: var(--text-primary);
  border: 1px solid rgba(84, 105, 150, 0.45);
}

.hint {
  color: var(--text-muted);
  font-size: 12px;
}

@media (max-width: 520px) {
  .buttons {
    flex-direction: column;
  }
}
</style>
