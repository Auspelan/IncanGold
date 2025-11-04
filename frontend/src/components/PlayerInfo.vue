<template>
  <div class="player-info" v-if="player">
    <h3>我的状态</h3>
    <div class="row"><span>营地金币</span><strong>{{ player.goldInCamp }}</strong></div>
    <div class="row"><span>手中金币</span><strong>{{ player.goldCarried }}</strong></div>
  </div>
  <div class="player-info" v-else>
    <h3>我的状态</h3>
    <p>等待加入房间...</p>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'PlayerInfo',
  setup() {
    const gameStore = useGameStore()
    const player = computed(() => gameStore.selfPlayer)
    return { player }
  }
}
</script>

<style scoped>
.player-info {
  border: 1px solid #e1e4e8;
  padding: 14px 16px;
  border-radius: 10px;
  background: #fff;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
}

.row span {
  color: #666;
}

.row strong {
  color: #111;
}

p {
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>
