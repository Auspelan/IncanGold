<template>
  <section class="result-view">
    <h2>游戏结束</h2>
    <p class="summary">以下为本局结算结果，可选择继续游戏或返回大厅。</p>

    <div class="results">
      <div v-if="enrichedResults.length" class="card">
        <h3>最终排名</h3>
        <ol>
          <li v-for="item in enrichedResults" :key="item.playerId">
            <div class="row-primary">
              <span class="rank">#{{ item.rank }}</span>
              <span class="name">{{ item.playerName }}</span>
              <span class="gold">{{ item.finalGold }} 金币</span>
            </div>
            <div class="row-secondary">
              <span class="payout">分配 {{ item.rewardLabel }}</span>
              <span :class="['net', item.netClass]">净收益 {{ item.netLabel }}</span>
            </div>
          </li>
        </ol>
      </div>

      <div v-else class="card">
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
      <button @click="gameStore.leaveRoom">返回大厅</button>
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
    const baseEntranceWei = computed(() => parseEthToWei(gameStore.defaultEntranceEth))
    const baseEntranceLabel = computed(() => `${gameStore.defaultEntranceEth} ETH`)

    const enrichedResults = computed(() => {
      const entry = baseEntranceWei.value
      return finalResults.value.map((item) => {
        const rewardWei = safeBigInt(item.etherChange)
        const netWei = rewardWei - entry
        return {
          ...item,
          rewardLabel: `${formatWeiValue(rewardWei)} ETH`,
          netLabel: formatWeiWithSign(netWei),
          netClass: netWei === 0n ? 'neutral' : (netWei > 0n ? 'positive' : 'negative')
        }
      })
    })

    const fallback = computed(() => {
      const players = Array.isArray(gameStore.game.players) ? gameStore.game.players : []
      return [...players].sort((a, b) => b.goldInCamp - a.goldInCamp)
    })

    return { gameStore, enrichedResults, fallback, baseEntranceLabel }
  }
}
</script>

<style scoped>
.result-view {
  text-align: center;
  padding: 24px;
  background: #fafbfc;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.summary {
  color: #666;
  font-size: 14px;
}

.results {
  margin: 20px auto;
  max-width: 420px;
}

.card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e1e4e8;
  padding: 16px;
}

h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

ol {
  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  padding: 10px 0;
  border-bottom: 1px solid #f1f3f5;
}

li:last-child {
  border-bottom: none;
}

.row-primary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.row-secondary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 13px;
  color: #555;
  gap: 12px;
  flex-wrap: wrap;
}

.rank {
  font-weight: 600;
  width: 20px;
  text-align: left;
}

.name {
  flex: 1;
  text-align: left;
  font-weight: 600;
}

.gold {
  color: #2d7ff9;
  font-weight: 600;
}

.payout {
  color: #555;
}

.net {
  font-weight: 600;
}

.net.positive {
  color: #2f9e44;
}

.net.negative {
  color: #e03131;
}

.net.neutral {
  color: #6c757d;
}

.entrance-note {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}

.actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
