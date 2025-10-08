<template>
  <div id="app">
    <h1>印加宝藏</h1>
    <LobbyView v-if="gameStore.phase === 'lobby'" />
    <GameView v-else-if="gameStore.phase === 'game'" />
    <ResultView v-else-if="gameStore.phase === 'result'" />
  </div>
</template>

<script>
import { useGameStore } from './stores/game'
import LobbyView from './views/LobbyView.vue'
import GameView from './views/GameView.vue'
import ResultView from './views/ResultView.vue'

export default {
  name: 'App',
  components: { LobbyView, GameView, ResultView },
  setup() {
    const gameStore = useGameStore()
    gameStore.initSocket()
    return { gameStore }
  }
}
</script>

<style>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
h1 { text-align: center; }
button { padding: 10px; margin: 5px; cursor: pointer; }
input { padding: 8px; margin: 5px; }
</style>
