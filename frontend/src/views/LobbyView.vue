<template>
  <section class="lobby glass-panel">
    <div class="hero-canvas" aria-hidden="true">
      <div class="hero-orb orb-one"></div>
      <div class="hero-orb orb-two"></div>
      <div class="hero-glyph"></div>
      <div class="hero-ring ring-a"></div>
      <div class="hero-ring ring-b"></div>
    </div>
    <header class="section-header">
      <div class="titles">
        <h2>🏠 冒险大厅</h2>
        <p class="subtitle">输入个人信息与入场费，集结 3 名探险家即可启程。</p>
      </div>
      <div v-if="pill" class="status-pill glass-chip">
        <span class="chip-label">{{ pill.label }}</span>
        <span class="chip-value">{{ pill.value }}</span>
      </div>
    </header>

    <div class="lobby-body">
      <form class="join-form" @submit.prevent="gameStore.joinRoom">
        <div class="field-grid">
          <label>
            昵称
            <input v-model.trim="gameStore.playerName" placeholder="输入你的名字" />
          </label>
          <label>
            钱包地址
            <input v-model.trim="gameStore.playerAccount" placeholder="输入账户地址" />
          </label>
        </div>

        <div class="fee-block">
          <span class="fee-label">入场费</span>
          <div class="fee-selector">
            <button
              v-for="option in feeOptions"
              :key="option.value"
              type="button"
              class="fee-option"
              :class="{ active: isSelected(option.value) }"
              @click="selectFee(option.value)"
            >
              <span class="value">{{ option.label }}</span>
              <span class="note">{{ option.note }}</span>
            </button>
          </div>
        </div>

        <div class="actions">
          <button type="submit" :disabled="!canJoin">{{ joinLabel }}</button>
          <button
            v-if="gameStore.playerAccount"
            type="button"
            class="secondary ghost"
            @click="resetAccount"
          >清除地址</button>
        </div>

        <p v-if="!gameStore.isConnected" class="connection-hint warning">未连接到服务器，请稍候...</p>
        <p v-else-if="gameStore.isQueued" class="connection-hint">已加入匹配队列，等待其他玩家...</p>
        <p v-else class="connection-hint subtle">准备就绪，点击加入即可开始匹配。</p>
      </form>

      <aside class="lobby-sidebar">
        <h3>当前房间</h3>
        <p class="sidebar-copy">房间号：<strong>{{ roomLabel }}</strong></p>
        <ul v-if="gameStore.roomPlayers.length" class="player-list">
          <li v-for="player in gameStore.roomPlayers" :key="player.playerId">
            <span class="avatar">{{ initials(player.playerName) }}</span>
            <div class="player-copy">
              <span class="name">{{ player.playerName }}</span>
              <span class="meta">ID {{ player.playerId.slice(-4) }}</span>
            </div>
          </li>
        </ul>
        <div v-else class="placeholder">
          <span>暂无玩家加入</span>
          <small>等待先锋探险家加入队伍</small>
        </div>
      </aside>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'LobbyView',
  setup() {
    const gameStore = useGameStore()

    const joinLabel = computed(() => {
      if (!gameStore.isConnected) return '等待连接...'
      if (gameStore.isJoining) return '提交中...'
      if (gameStore.isQueued) return '匹配中...'
      return '加入游戏'
    })

    const canJoin = computed(() => {
      if (!gameStore.isConnected) return false
      if (!gameStore.playerName) return false
      if (gameStore.isJoining || gameStore.isQueued) return false
      return true
    })

    const feeOptions = computed(() => [
      { value: '0.01', label: '0.01 ETH', note: '基础' },
      { value: '0.1', label: '0.1 ETH', note: '进阶' },
      { value: '1', label: '1 ETH', note: '高阶' }
    ])

    const selectFee = (value) => {
      gameStore.setEntranceFee(value)
    }

    const isSelected = (value) => gameStore.entranceFee === value

    const roomLabel = computed(() => gameStore.roomId || (gameStore.isQueued ? '匹配中' : '尚未分配'))

    const pill = computed(() => {
      if (gameStore.isQueued) {
        return {
          label: '匹配中',
          value: `${gameStore.roomPlayers.length}/3 位探险家`
        }
      }
      if (gameStore.roomPlayers.length) {
        return {
          label: '房间就绪',
          value: `${gameStore.roomPlayers.length}/3`
        }
      }
      return null
    })

    const initials = (name = '') => {
      const trimmed = name.trim()
      if (!trimmed) return '探'
      const tokens = trimmed.split(/\s+/)
      if (tokens.length > 1) {
        return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase()
      }
      return trimmed.slice(0, 2).toUpperCase()
    }

    const resetAccount = () => {
      gameStore.playerAccount = ''
    }

    return {
      gameStore,
      joinLabel,
      canJoin,
      feeOptions,
      selectFee,
      isSelected,
      roomLabel,
      pill,
      initials,
      resetAccount
    }
  }
}
</script>

<style scoped>
.lobby {
  position: relative;
  overflow: hidden;
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.hero-canvas {
  position: absolute;
  inset: -60px -80px -40px;
  pointer-events: none;
  z-index: 0;
  filter: blur(0.2px);
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  opacity: 0.5;
  animation: heroOrbFloat 18s ease-in-out infinite;
}

.hero-orb.orb-one {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 40% 40%, rgba(244, 193, 93, 0.45), rgba(244, 193, 93, 0));
  top: 4%;
  left: 6%;
}

.hero-orb.orb-two {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 60% 60%, rgba(56, 189, 248, 0.38), rgba(56, 189, 248, 0));
  bottom: -6%;
  right: -4%;
  animation-duration: 22s;
  animation-delay: -6s;
}

.hero-glyph {
  position: absolute;
  inset: 28% 45% 30% 10%;
  border-radius: 50%;
  border: 1px solid rgba(244, 193, 93, 0.28);
  box-shadow: 0 0 60px rgba(244, 193, 93, 0.26);
  opacity: 0.45;
  animation: heroPulse 12s ease-in-out infinite alternate;
}

.hero-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(120, 141, 176, 0.38);
  opacity: 0.28;
  animation: heroRingSpin 18s linear infinite;
}

.hero-ring.ring-a {
  inset: 14% 35% 46% -6%;
}

.hero-ring.ring-b {
  inset: 46% -14% 8% 48%;
  animation-duration: 28s;
}

.section-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

@keyframes heroOrbFloat {
  0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
  50% { transform: translate3d(12px, -10px, 0) scale(1.08); opacity: 0.55; }
  100% { transform: translate3d(-14px, 14px, 0) scale(1); opacity: 0.45; }
}

@keyframes heroPulse {
  0% { transform: scale(0.92); opacity: 0.35; }
  100% { transform: scale(1.05); opacity: 0.55; }
}

@keyframes heroRingSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.section-header h2 {
  font-size: 26px;
}

.subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-muted);
}

.status-pill {
  align-self: flex-start;
}

.lobby-body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: 28px;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.fee-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fee-label {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.fee-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fee-option {
  flex: 1 1 120px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: rgba(16, 26, 44, 0.85);
  border: 1px solid rgba(120, 141, 176, 0.35);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
}

.fee-option .value {
  font-weight: 600;
  color: var(--text-primary);
}

.fee-option .note {
  font-size: 12px;
  color: var(--text-muted);
}

.fee-option:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
  box-shadow: 0 12px 22px -18px rgba(244, 193, 93, 0.45);
}

.fee-option.active {
  border-color: var(--accent);
  background: rgba(244, 193, 93, 0.16);
  box-shadow: inset 0 0 0 1px rgba(244, 193, 93, 0.25);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button.ghost {
  color: var(--text-secondary);
}

.connection-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.connection-hint.warning {
  color: var(--warning);
}

.connection-hint.subtle {
  color: rgba(183, 197, 242, 0.7);
}

.lobby-sidebar {
  padding: 22px 24px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(120, 141, 176, 0.35);
  background: rgba(10, 18, 32, 0.72);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lobby-sidebar h3 {
  font-size: 18px;
}

.sidebar-copy {
  font-size: 13px;
  color: var(--text-muted);
}

.player-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(16, 24, 38, 0.85);
  border: 1px solid rgba(120, 141, 176, 0.28);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(244, 193, 93, 0.18);
  border: 1px solid rgba(244, 193, 93, 0.28);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.player-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-copy .name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.player-copy .meta {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.placeholder {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

.placeholder small {
  font-size: 11px;
  letter-spacing: 0.06em;
}

@media (max-width: 960px) {
  .lobby {
    padding: 28px 24px;
  }
  .lobby-body {
    grid-template-columns: 1fr;
  }
  .lobby-sidebar {
    order: -1;
  }
}

@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
  .fee-selector {
    flex-direction: column;
  }
  .fee-option {
    width: 100%;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .status-pill {
    align-self: stretch;
  }
}
</style>
