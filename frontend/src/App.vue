<template>
  <div id="app">
    <header class="app-header">
      <h1>印加宝藏 Incan Gold</h1>
      <div class="connection" :class="{ online: gameStore.isConnected, offline: !gameStore.isConnected }">
        <span v-if="gameStore.isConnected">已连接</span>
        <span v-else>未连接</span>
        <span v-if="gameStore.connectionError" class="error">{{ gameStore.connectionError }}</span>
      </div>
    </header>

    <main>
      <LobbyView v-if="gameStore.phase === 'lobby'" />
      <RoomView v-else-if="gameStore.phase === 'room'" />
      <GameView v-else-if="gameStore.phase === 'game'" />
      <ResultView v-else-if="gameStore.phase === 'result'" />
    </main>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useGameStore } from './stores/game'
import LobbyView from './views/LobbyView.vue'
import RoomView from './views/RoomView.vue'
import GameView from './views/GameView.vue'
import ResultView from './views/ResultView.vue'

export default {
  name: 'App',
  components: { LobbyView, RoomView, GameView, ResultView },
  setup() {
    const gameStore = useGameStore()
    onMounted(() => {
      gameStore.initSocket()
    })
    return { gameStore }
  }
}
</script>

<style>
#app {
  max-width: 880px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #222;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e2e2;
  padding-bottom: 12px;
}

h1 {
  font-size: 28px;
  margin: 0;
}

.connection {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.connection.online::before,
.connection.offline::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.connection.online::before {
  background: #2ecc71;
}

.connection.offline::before {
  background: #e74c3c;
}

.connection .error {
  color: #e67e22;
}

main {
  min-height: 480px;
}

button {
  padding: 10px 16px;
  margin: 6px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f7f7f7;
  transition: background 0.2s ease;
}

button:hover {
  background: #ececec;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

input {
  padding: 8px;
  margin: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
