<template>
  <div class="board">
    <h3>探索路径</h3>
    <div class="path">
      <div class="tile camp">
        <strong>营地</strong>
        <div class="players" v-if="campPlayers.length">
          <span v-for="p in campPlayers" :key="p.playerId">{{ shortName(p.playerName) }}</span>
        </div>
      </div>

      <div
        v-for="tile in tiles"
        :key="tile.position"
        class="tile"
        :class="{ trap: isTrap(tile.position), current: isCurrent(tile.position) }"
      >
        <div class="pos">{{ tile.position }}</div>
        <div class="gold">金币: {{ tile.gold }}</div>
        <div class="players" v-if="playersByTile.get(tile.position)?.length">
          <span v-for="p in playersByTile.get(tile.position)" :key="p.playerId">{{ shortName(p.playerName) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'GameBoard',
  setup() {
    const gameStore = useGameStore()

    const tiles = computed(() => gameStore.pathTiles)

    const playersByTile = computed(() => {
      const map = new Map()
      gameStore.game.players.forEach(player => {
        if (player.position > 0 && player.isOnRoad) {
          const list = map.get(player.position) || []
          list.push(player)
          map.set(player.position, list)
        }
      })
      return map
    })

    const campPlayers = computed(() => gameStore.game.players.filter(player => !player.isOnRoad))

    const currentPositions = computed(() => {
      return new Set(gameStore.game.players.filter(p => p.isOnRoad).map(p => p.position))
    })

    const trapPositions = computed(() => {
      const trapSet = new Set()
      const road = gameStore.game.roadGolds || []
      road.forEach((value, index) => {
        if (value === -1) trapSet.add(index)
      })
      return trapSet
    })

    const shortName = (name = '') => (name.length > 4 ? `${name.slice(0, 3)}…` : name)

    const isCurrent = position => currentPositions.value.has(position)
    const isTrap = position => trapPositions.value.has(position)

    return { tiles, playersByTile, campPlayers, shortName, isCurrent, isTrap }
  }
}
</script>

<style scoped>
.board {
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}

.path {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.tile {
  min-width: 90px;
  border: 1px solid #dfe3e6;
  border-radius: 10px;
  padding: 10px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.camp {
  background: #eaf7f0;
  border-color: #b8e0c6;
}

.trap {
  background: #fff1f0;
  border-color: #f5c6c6;
}

.current {
  box-shadow: 0 0 0 2px #4dabf7 inset;
}

.pos {
  font-weight: 600;
}

.players {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.players span {
  background: rgba(45, 127, 249, 0.12);
  color: #2d7ff9;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 12px;
}

.camp .players span {
  background: rgba(76, 175, 80, 0.15);
  color: #2b8a3e;
}

.gold {
  color: #555;
}
</style>
