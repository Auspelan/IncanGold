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
  border: 1px solid rgba(120, 141, 176, 0.3);
  border-radius: var(--radius-md);
  background: rgba(10, 18, 32, 0.78);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.board h3 {
  font-size: 18px;
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
  border: 1px solid rgba(120, 141, 176, 0.28);
  border-radius: var(--radius-sm);
  padding: 10px;
  background: rgba(16, 24, 38, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  box-shadow: inset 0 0 12px rgba(8, 15, 26, 0.35);
}

.camp {
  background: rgba(27, 46, 42, 0.9);
  border-color: rgba(74, 222, 128, 0.35);
  color: #9de3b2;
}

.trap {
  background: rgba(63, 33, 38, 0.9);
  border-color: rgba(248, 113, 113, 0.45);
  color: var(--danger);
}

.current {
  box-shadow: 0 0 0 2px rgba(244, 193, 93, 0.35), inset 0 0 12px rgba(244, 193, 93, 0.18);
}

.pos {
  font-weight: 600;
  color: var(--text-primary);
}

.players {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.players span {
  background: rgba(244, 193, 93, 0.18);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
  border: 1px solid rgba(244, 193, 93, 0.28);
}

.camp .players span {
  background: rgba(74, 222, 128, 0.18);
  border-color: rgba(74, 222, 128, 0.35);
  color: var(--text-primary);
}

.gold {
  color: var(--text-muted);
}

.trap-label {
  color: var(--danger);
  font-weight: 600;
}

.unknown {
  background: rgba(35, 44, 62, 0.8);
  color: var(--text-muted);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px dashed rgba(120, 141, 176, 0.32);
}

</style>
