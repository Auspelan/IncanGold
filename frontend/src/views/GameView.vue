<template>
  <div class="game">
    <GameStatus />
    <PlayerInfo />
    <GameBoard />
    <PlayerActions v-if="gameStore.gameStage === 'selection'" />
  </div>
</template>

<script>
import { useGameStore } from '../stores/game'
import GameStatus from '../components/GameStatus.vue'
import PlayerInfo from '../components/PlayerInfo.vue'
import GameBoard from '../components/GameBoard.vue'
import PlayerActions from '../components/PlayerActions.vue'

export default {
  name: 'GameView',
  components: { GameStatus, PlayerInfo, GameBoard, PlayerActions },
  setup() {
    const gameStore = useGameStore()
    return { gameStore }
  }
}
</script>
