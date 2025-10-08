<template>
  <div class="actions">
    <h3>你的选择</h3>
    <div v-if="!gameStore.hasChosen">
      <button @click="gameStore.chooseAdvance">前进</button>
      <button @click="gameStore.chooseReturn">返回营地</button>
    </div>
    <div v-else-if="gameStore.waitingForOthers">
      <p>已选择，等待其他玩家...</p>
    </div>
    <div v-else>
      <p>已选择</p>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '../stores/game'

export default {
  name: 'PlayerActions',
  setup() {
    const gameStore = useGameStore()
    return { gameStore }
  }
}
</script>

<style scoped>
.actions {
  border: 2px solid #333;
  padding: 15px;
  margin: 20px 0;
  text-align: center;
}
</style>
