<template>
  <section class="result-view glass-panel">
    <h2>🏆 收益结算</h2>
    <p class="summary">以下为本局链上收益结算，可选择继续冒险或返回大厅。</p>

    <div class="results">
      <div v-if="enrichedResults.length" class="card scoreboard">
        <ol>
          <li v-for="item in enrichedResults" :key="item.playerId">
            <div class="row-primary">
              <span class="rank-pill">#{{ item.rank }}</span>
              <div class="info">
                <span class="name">{{ item.playerName }}</span>
                <span class="gold">金币 {{ item.finalGold }}</span>
              </div>
              <span class="reward">{{ item.rewardLabel }}</span>
            </div>
            <div class="row-secondary">
              <span class="entry">投入 {{ item.entranceFeeLabel }}</span>
              <span :class="['net', item.netClass]">净收益 {{ item.netLabel }}</span>
            </div>
          </li>
        </ol>
      </div>

      <div v-else class="card fallback">
        <h3>最终排名（推算）</h3>
        <ol>
          <li v-for="player in fallback" :key="player.playerId">
            <span class="name">{{ player.playerName }}</span>
            <span class="gold">{{ player.goldInCamp }} 金币</span>
          </li>
        </ol>
      </div>
    </div>

    <div class="actions">
      <button @click="gameStore.continueGame">继续游戏</button>
      <button class="secondary" @click="gameStore.leaveRoom">返回大厅</button>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

export default {
  name: 'ResultView',
  setup() {
    const gameStore = useGameStore()

    const WEI_PER_ETH = 10n ** 18n

    const safeBigInt = (value) => {
      try {
        return BigInt(value ?? '0')
      } catch (err) {
        return 0n
      }
    }

    const formatWeiValue = (wei, decimals = 4) => {
      const big = safeBigInt(wei)
      const negative = big < 0n
      const abs = negative ? -big : big
      const scale = 10n ** BigInt(decimals)
      const rounded = (abs * scale + WEI_PER_ETH / 2n) / WEI_PER_ETH
      const intPart = rounded / scale
      const fracPart = rounded % scale
      if (decimals === 0) {
        return `${negative ? '-' : ''}${intPart.toString()}`
      }
      const fracStr = fracPart.toString().padStart(Number(decimals), '0')
      return `${negative ? '-' : ''}${intPart.toString()}.${fracStr}`
    }

    const formatWeiWithSign = (wei, decimals = 4) => {
      const big = safeBigInt(wei)
      if (big === 0n) {
        return '+0.0000 ETH'
      }
      const base = formatWeiValue(big, decimals)
      if (base.startsWith('-')) {
        return `${base} ETH`
      }
      return `+${base} ETH`
    }

    const parseEthToWei = (value) => {
      const raw = String(value ?? '').trim()
      if (!raw) return 0n
      const negative = raw.startsWith('-')
      const sanitized = negative ? raw.slice(1) : raw
      const [intPart = '0', fracPart = ''] = sanitized.split('.')
      const integerWei = BigInt(intPart || '0') * WEI_PER_ETH
      const fractionalPadded = (fracPart + '0'.repeat(18)).slice(0, 18)
      const fractionWei = BigInt(fractionalPadded || '0')
      let result = integerWei + fractionWei
      if (negative) result = -result
      return result
    }

    const finalResults = computed(() => Array.isArray(gameStore.finalResults) ? gameStore.finalResults : [])

    const resolveEntryWei = (item) => {
      if (item && item.entranceFeeWei != null) {
        return safeBigInt(item.entranceFeeWei)
      }
      if (item && item.entranceFeeEth != null) {
        return parseEthToWei(item.entranceFeeEth)
      }
      return parseEthToWei(gameStore.defaultEntranceEth)
    }

    const enrichedResults = computed(() => {
      return finalResults.value.map((item) => {
        const rewardWei = safeBigInt(item.etherChange)
        const entryWei = resolveEntryWei(item)
        const netWei = item && item.netChangeWei != null
          ? safeBigInt(item.netChangeWei)
          : (rewardWei - entryWei)
        return {
          ...item,
          rewardLabel: `${formatWeiValue(rewardWei)} ETH`,
          netLabel: formatWeiWithSign(netWei),
          netClass: netWei === 0n ? 'neutral' : (netWei > 0n ? 'positive' : 'negative'),
          entranceFeeLabel: `${formatWeiValue(entryWei)} ETH`
        }
      })
    })

    const fallback = computed(() => {
      const players = Array.isArray(gameStore.game.players) ? gameStore.game.players : []
      return [...players].sort((a, b) => b.goldInCamp - a.goldInCamp)
    })

    return { gameStore, enrichedResults, fallback }
  }
}
</script>

<style scoped>
.result-view {
  text-align: center;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h2 {
  font-size: 26px;
}

.summary {
  color: var(--text-muted);
  font-size: 14px;
  letter-spacing: 0.02em;
}

.results {
  display: flex;
  justify-content: center;
}

.card {
  width: 100%;
  max-width: 520px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(120, 141, 176, 0.3);
  background: rgba(10, 18, 32, 0.78);
  padding: 20px 24px;
}

.scoreboard ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.scoreboard li {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: rgba(16, 24, 38, 0.88);
  border: 1px solid rgba(120, 141, 176, 0.28);
}

.row-primary {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
}

.rank-pill {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid rgba(244, 193, 93, 0.4);
  background: rgba(244, 193, 93, 0.18);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.info .name {
  color: var(--text-primary);
  font-weight: 600;
}

.info .gold {
  font-size: 12px;
  color: var(--text-muted);
}

.reward {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.row-secondary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
}

.entry {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.net {
  font-weight: 600;
}

.net.positive {
  color: var(--success);
}

.net.negative {
  color: var(--danger);
}

.net.neutral {
  color: var(--text-muted);
}

.fallback h3 {
  margin-bottom: 16px;
}

.fallback ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fallback li {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(16, 24, 38, 0.85);
  border-radius: var(--radius-sm);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 640px) {
  .result-view {
    padding: 26px 22px;
  }
  .row-primary {
    flex-direction: column;
    align-items: flex-start;
  }
  .row-secondary {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .actions {
    flex-direction: column;
  }
}
</style>
