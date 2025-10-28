<template>
  <div class="board">
    <h3>探索路径</h3>
    <div class="grid" :style="gridStyle">
      <div class="tile camp">
        <strong>营地</strong>
        <div class="players" v-if="campPlayers.length">
          <span v-for="p in campPlayers" :key="p.playerId">{{ shortName(p.playerName) }}</span>
        </div>
      </div>

      <template v-if="tiles.length">
        <div
          v-for="tile in tiles"
          :key="tile.position"
          class="tile"
          :class="{ trap: tile.isTrap, current: isCurrent(tile.position) }"
        >
          <div class="pos">{{ tile.position }}</div>
          <div class="gold" v-if="!tile.isTrap">金币: {{ tile.gold }}</div>
          <div class="gold trap-label" v-else>陷阱</div>
          <div class="players" v-if="playersByTile.get(tile.position)?.length">
            <span v-for="p in playersByTile.get(tile.position)" :key="p.playerId">{{ shortName(p.playerName) }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="tile unknown">
          <span>尚未探索</span>
        </div>
      </template>
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

    const maxKnownStep = computed(() => gameStore.game.currentStep || 0)
    const roadGolds = computed(() => gameStore.game.roadGolds || [])
    const tiles = computed(() => {
      const maxStep = Math.min(maxKnownStep.value, roadGolds.value.length - 1)
      if (maxStep <= 0) return []
      const list = []
      for (let position = 1; position <= maxStep; position += 1) {
        const value = roadGolds.value[position]
        list.push({
          position,
          gold: value >= 0 ? value : 0,
          isTrap: value === -1
        })
      }
      return list
    })

    const columns = computed(() => Math.min(6, Math.max(4, Math.ceil(Math.sqrt(Math.max(tiles.value.length, 12))))))
    const gridStyle = computed(() => ({
      gridTemplateColumns: `repeat(${columns.value}, minmax(80px, 1fr))`
    }))

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

    const shortName = (name = '') => (name.length > 4 ? `${name.slice(0, 3)}…` : name)

    const isCurrent = position => currentPositions.value.has(position)
    
    return { tiles, playersByTile, campPlayers, gridStyle, shortName, isCurrent }
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

.grid {
  display: grid;
  gap: 12px;
  overflow-y: auto;
  max-height: 320px;
  padding: 6px 0;
  grid-auto-rows: minmax(90px, auto);
  align-content: start;
}

.tile {
  min-width: 70px;
  min-height: 70px;
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

.trap-label {
  color: #e74c3c;
  font-weight: 600;
}

.unknown {
  background: #f3f4f6;
  color: #888;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
