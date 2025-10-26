<template>
  <div class="actions">
    <h3>选择行动</h3>
    <p class="desc">所有玩家同时决定前进或返回，等待结果更新。</p>

    <div class="buttons">
      <button @click="gameStore.chooseAdvance" :disabled="disableButtons">前进探险</button>
      <button @click="gameStore.chooseReturn" :disabled="disableButtons">返回营地</button>
    </div>

    <p v-if="gameStore.waitingForOthers" class="hint">已提交选择，等待其他玩家...</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'PlayerActions',
  setup() {
    const gameStore = useGameStore()
    const disableButtons = computed(() => gameStore.hasPendingChoice || !gameStore.selfPlayer)
    return { gameStore, disableButtons }
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

.hint {
  color: #888;
  font-size: 13px;
  text-align: center;
}
</style>
