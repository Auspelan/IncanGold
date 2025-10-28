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
  border: 1px solid #e1e4e8;
  padding: 16px;
  border-radius: 10px;
  background: #fff;
}

.desc {
  color: #666;
  font-size: 13px;
  margin-bottom: 12px;
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 10px;
}

.buttons button.locked {
  background: #f0f2f5;
  color: #999;
  cursor: not-allowed;
}

.buttons button.blocked {
  background: #f5f8ff;
  color: #5470c6;
}

.hint {
  color: #888;
  font-size: 13px;
  text-align: center;
}
</style>
