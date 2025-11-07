<template>
  <div id="app" :class="['app-shell', themeClass]">
    
    <div class="background-frame" aria-hidden="true">
      <!--
      <div class="background-layer aurora"></div>

      <div class="background-layer grid"></div>
      <div class="background-layer dust"></div>
      -->
    </div>
    
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
          <span class="status-text">{{ gameStore.isConnected ? 'Connected' : 'Disconnected' }}</span>
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

    const themeClass = computed(() => {
      const mapping = {
        lobby: 'phase-lobby',
        room: 'phase-room',
        game: 'phase-game',
        result: 'phase-result'
      }
      return mapping[gameStore.phase] || 'phase-lobby'
    })

    return { gameStore, phaseComponent, themeClass }
  }
}
</script>

<style>
@import './assets/fonts.css';

:root {
  color-scheme: dark;
  --bg-base: #040a18;
  --bg-layer-soft: linear-gradient(180deg, rgba(10, 18, 34, 0.96) 0%, rgba(6, 12, 24, 0.98) 55%, #02050c 100%);
  --bg-highlight-top: radial-gradient(ellipse at 14% -18%, rgba(244, 193, 93, 0.32) 0%, rgba(12, 20, 36, 0) 55%);
  --bg-highlight-bottom: radial-gradient(ellipse at 50% 118%, rgba(44, 74, 128, 0.18) 0%, rgba(5, 11, 22, 0) 62%);
  --bg-falloff: linear-gradient(180deg, rgba(8, 15, 30, 0) 0%, rgba(8, 15, 30, 0.55) 65%, rgba(8, 15, 30, 0.82) 100%);
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
  --aurora-top: rgba(244, 193, 93, 0.32);
  --aurora-bottom: rgba(104, 184, 255, 0.18);
  --grid-glow: rgba(244, 193, 93, 0.12);
  --dust-color: rgba(255, 255, 255, 0.12);
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  margin: 0;
  background-color: var(--bg-base);
  font-family: var(--font-body, 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif);
  color: var(--text-secondary);
  -webkit-font-smoothing: antialiased;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  background-image: var(--bg-highlight-top), var(--bg-highlight-bottom), var(--bg-falloff), var(--bg-layer-soft);
  background-repeat: no-repeat;
  background-size: 130% 130%, 140% 140%, 100% 100%, 100% 100%;
}

.background-frame {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.background-layer {
  position: absolute;
  inset: -20% -25%;
  will-change: transform, opacity;
  transition: opacity 1.2s ease;
  filter: saturate(120%);
}

.background-layer.aurora {
  background: radial-gradient(60% 60% at 20% 20%, var(--aurora-top) 0%, rgba(12, 20, 36, 0) 72%),
              radial-gradient(70% 70% at 78% 40%, var(--aurora-bottom) 0%, rgba(12, 20, 36, 0) 75%);
  mix-blend-mode: screen;
  opacity: 0.85;
  animation: auroraShift 24s ease-in-out infinite alternate;
}

.background-layer.grid {
  background-image: linear-gradient(120deg, transparent 0 46%, var(--grid-glow) 48%, transparent 50%),
    linear-gradient(-120deg, transparent 0 46%, var(--grid-glow) 48%, transparent 50%);
  background-size: 420px 420px;
  opacity: 0.16;
  mix-blend-mode: screen;
  animation: gridPulse 18s linear infinite;
}

.background-layer.dust {
  background-image: radial-gradient(circle at 24% 30%, var(--dust-color) 0 1px, transparent 1px),
    radial-gradient(circle at 68% 82%, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px),
    radial-gradient(circle at 82% 24%, rgba(255, 255, 255, 0.06) 0 1px, transparent 1px);
  background-size: 360px 360px, 520px 520px, 440px 440px;
  opacity: 0.4;
  animation: dustDrift 38s linear infinite;
}

.app-shell {
  position: relative;
  z-index: 0;
}


.app-shell.phase-lobby {
  --aurora-top: rgba(244, 193, 93, 0.34);
  --aurora-bottom: rgba(104, 184, 255, 0.2);
  --grid-glow: rgba(244, 193, 93, 0.14);
  --dust-color: rgba(255, 255, 255, 0.12);
}
.app-shell.phase-room {
  --accent: #7dd3fc;
  --accent-strong: #bae6fd;
  --chip-bg: rgba(125, 211, 252, 0.18);
  --chip-border: rgba(125, 211, 252, 0.38);
  --aurora-top: rgba(99, 210, 255, 0.35);
  --aurora-bottom: rgba(49, 120, 255, 0.28);
  --grid-glow: rgba(125, 211, 252, 0.12);
  --dust-color: rgba(200, 235, 255, 0.14);
}

.app-shell.phase-game {
  --accent: #f97316;
  --accent-strong: #fb923c;
  --chip-bg: rgba(251, 146, 60, 0.18);
  --chip-border: rgba(251, 146, 60, 0.4);
  --aurora-top: rgba(252, 165, 94, 0.35);
  --aurora-bottom: rgba(244, 63, 94, 0.25);
  --grid-glow: rgba(253, 186, 116, 0.12);
  --dust-color: rgba(255, 204, 173, 0.14);
}

.app-shell.phase-result {
  --accent: #a855f7;
  --accent-strong: #c084fc;
  --chip-bg: rgba(168, 85, 247, 0.2);
  --chip-border: rgba(168, 85, 247, 0.42);
  --aurora-top: rgba(168, 85, 247, 0.32);
  --aurora-bottom: rgba(56, 189, 248, 0.24);
  --grid-glow: rgba(196, 116, 255, 0.14);
  --dust-color: rgba(216, 180, 254, 0.16);
}

@keyframes auroraShift {
  0% { transform: translate3d(-4%, -6%, 0) scale(1.08); opacity: 0.78; }
  50% { transform: translate3d(2%, 4%, 0) scale(1.04); opacity: 0.9; }
  100% { transform: translate3d(6%, -2%, 0) scale(1.1); opacity: 0.8; }
}

@keyframes gridPulse {
  0% { transform: translate3d(0, 0, 0); opacity: 0.12; }
  50% { transform: translate3d(-2%, -3%, 0); opacity: 0.18; }
  100% { transform: translate3d(-4%, -6%, 0); opacity: 0.12; }
}

@keyframes dustDrift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(2%, -3%, 0) scale(1.06); }
  100% { transform: translate3d(-3%, -6%, 0) scale(1.1); }
}

.app-shell {
  max-width: 1100px;
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
  /*backdrop-filter: blur(18px);*/
}

.view-host {
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
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
  .app-shell {
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
