<template>
  <div id="app">
    <header class="app-header glass-panel">
      <div class="brand">
        <span class="brand-glyph">🪙</span>
        <div class="brand-copy">
          <h1>Incan Gold</h1>
          <p class="tagline">Blockchain Expedition Game</p>
        </div>
      </div>

      <div class="header-metadata">
        <div class="chip-row">
          <div class="glass-chip">
            <span class="chip-label">Network</span>
            <span class="chip-value">Local Devnet</span>
          </div>
          <div v-if="gameStore.playerName" class="glass-chip identity-chip">
            <span class="chip-label">Explorer</span>
            <span class="chip-value">{{ gameStore.playerName }}</span>
          </div>
        </div>

        <div class="connection" :class="{ online: gameStore.isConnected, offline: !gameStore.isConnected }">
          <span class="indicator"></span>
          <span class="status-text">{{ gameStore.isConnected ? '已连接' : '未连接' }}</span>
          <span v-if="gameStore.connectionError" class="error">{{ gameStore.connectionError }}</span>
        </div>
      </div>
    </header>

    <main class="view-host">
      <transition name="fade-scale" mode="out-in">
        <component :is="phaseComponent" :key="gameStore.phase" />
      </transition>
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
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

    const phaseComponent = computed(() => {
      const mapping = {
        lobby: LobbyView,
        room: RoomView,
        game: GameView,
        result: ResultView
      }
      return mapping[gameStore.phase] || LobbyView
    })

    return { gameStore, phaseComponent }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Inter:wght@400;500;600&display=swap');

:root {
  color-scheme: dark;
  --bg-base: #050b14;
  --bg-gradient: radial-gradient(circle at 16% -10%, rgba(244, 193, 93, 0.26) 0%, rgba(7, 12, 24, 0.92) 60%, rgba(3, 6, 13, 1) 100%);
  --panel-bg: rgba(13, 20, 36, 0.78);
  --panel-border: rgba(244, 193, 93, 0.22);
  --panel-shadow: 0 28px 65px -40px rgba(3, 8, 17, 0.85);
  --chip-bg: rgba(244, 193, 93, 0.16);
  --chip-border: rgba(244, 193, 93, 0.38);
  --accent: #f4c15d;
  --accent-strong: #ffd97a;
  --accent-soft: rgba(244, 193, 93, 0.28);
  --accent-contrast: #0b1321;
  --text-primary: #f8fafc;
  --text-secondary: #b7c5f2;
  --text-muted: #8491bf;
  --success: #4ade80;
  --danger: #f87171;
  --warning: #facc15;
  --radius-lg: 22px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --transition-fast: 0.22s ease;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  margin: 0;
  background: var(--bg-gradient), var(--bg-base);
  font-family: var(--font-body, 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif);
  color: var(--text-secondary);
  -webkit-font-smoothing: antialiased;
}

#app {
  max-width: 1040px;
  margin: 0 auto;
  padding: 36px 30px 48px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

h1, h2, h3, h4, h5 {
  font-family: var(--font-heading, 'Cinzel', 'Times New Roman', serif);
  color: var(--text-primary);
  margin: 0;
}

p {
  margin: 0;
  color: var(--text-muted);
}

.glass-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(18px);
}

.glass-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--chip-bg);
  border: 1px solid var(--chip-border);
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
}

.glass-chip .chip-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: var(--text-muted);
}

.glass-chip .chip-value {
  color: var(--text-primary);
  font-weight: 600;
}

.identity-chip .chip-value {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand-glyph {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 26px;
  background: var(--accent-soft);
  border: 1px solid var(--chip-border);
  box-shadow: inset 0 0 20px rgba(244, 193, 93, 0.22);
}

.brand-copy h1 {
  font-size: 28px;
  letter-spacing: 0.04em;
}

.tagline {
  margin-top: 6px;
  font-size: 13px;
  letter-spacing: 0.06em;
}

.header-metadata {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.chip-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.connection {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(15, 26, 43, 0.9);
  border: 1px solid rgba(84, 105, 150, 0.45);
  color: var(--text-muted);
}

.connection .indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--danger);
  box-shadow: 0 0 12px rgba(248, 113, 113, 0.6);
}

.connection.online .indicator {
  background: var(--success);
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.65);
}

.connection .status-text {
  color: var(--text-primary);
  font-weight: 600;
}

.connection .error {
  color: var(--warning);
}

.view-host {
  position: relative;
  min-height: 520px;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  border-radius: var(--radius-sm);
  border: none;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: var(--accent-contrast);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), filter var(--transition-fast);
  box-shadow: 0 12px 24px -16px rgba(244, 193, 93, 0.7);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px -18px rgba(244, 193, 93, 0.8);
}

button:active:not(:disabled) {
  transform: translateY(1px);
  filter: brightness(0.96);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

button.secondary {
  background: transparent;
  border: 1px solid var(--chip-border);
  color: var(--text-primary);
  box-shadow: none;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  letter-spacing: 0.02em;
}

input, select {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(120, 141, 176, 0.35);
  background: rgba(14, 20, 34, 0.85);
  color: var(--text-primary);
  font-family: var(--font-body, 'Inter', sans-serif);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

input:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(244, 193, 93, 0.25);
}

@media (max-width: 960px) {
  #app {
    padding: 28px 20px 36px;
  }
  .app-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  .header-metadata {
    align-items: center;
  }
  .chip-row {
    justify-content: center;
  }
}

@media (max-width: 620px) {
  .brand {
    flex-direction: column;
    gap: 12px;
  }
  .brand-glyph {
    width: 46px;
    height: 46px;
    font-size: 22px;
  }
}
</style>
