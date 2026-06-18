<template>
  <div class="app">
    <h1 class="title">马踏棋盘 · 骑士周游</h1>

    <div class="game-layout">
      <div class="board-col">
        <ChessBoard
          :board="board"
          :knight-pos="knightPos"
          :start-pos="startPos"
          :highlighted-moves="highlightedMoves"
          :board-size="BOARD_SIZE"
          :is-manual-mode="mode === 'manual'"
          @cell-click="handleCellClick"
        />
        <div class="hint-text">{{ hintText }}</div>
      </div>

      <div class="side-col">
        <ControlPanel
          :step-count="stepCount"
          :elapsed-time="elapsedTime"
          :is-complete="isComplete"
          :is-running="isRunning"
          :is-auto-mode="mode === 'auto'"
          :start-pos="startPos"
          :board-size="BOARD_SIZE"
          :anim-speed="animSpeed"
          @start-manual="handleStartManual"
          @start-auto="handleStartAuto"
          @reset="handleReset"
          @update:anim-speed="animSpeed = $event"
        />
        <GameRules />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed } from 'vue'
import ChessBoard from './components/ChessBoard.vue'
import ControlPanel from './components/ControlPanel.vue'
import GameRules from './components/GameRules.vue'
import { useKnightTour } from './composables/useKnightTour.js'
import { useSound } from './composables/useSound.js'

const {
  board,
  startPos,
  knightPos,
  stepCount,
  mode,
  isRunning,
  isComplete,
  elapsedTime,
  animSpeed,
  BOARD_SIZE,
  setStart,
  startManual,
  startAuto,
  tryMove,
  getHighlightedMoves,
  reset,
} = useKnightTour()

const { playStep, playStart, playError, playVictory, playAutoStep } = useSound()

const prevStep = ref(0)

watch(stepCount, (newVal) => {
  if (newVal > prevStep.value) {
    if (mode.value === 'auto') {
      playAutoStep()
    } else {
      playStep()
    }
  }
  prevStep.value = newVal
})

watch(isComplete, (val) => {
  if (val) {
    setTimeout(() => playVictory(), 200)
  }
})

const highlightedMoves = computed(() => {
  if (mode.value === 'manual' && !isComplete.value) {
    return getHighlightedMoves()
  }
  return []
})

const hintText = computed(() => {
  if (!startPos.value) return '点击棋盘任意格子选择起点'
  if (mode.value === 'manual' && !isComplete.value) return '点击高亮格子进行移动'
  if (mode.value === 'auto') return '算法自动演示中...'
  if (isComplete.value) return '恭喜！骑士完成了全部 64 步周游！'
  return '选择手动或自动模式开始'
})

function handleCellClick(row, col) {
  if (!startPos.value) {
    setStart(row, col)
    playStart()
  } else if (mode.value === 'manual') {
    const ok = tryMove(row, col)
    if (!ok) playError()
  }
}

function handleStartManual() {
  startManual()
  prevStep.value = stepCount.value
}

function handleStartAuto() {
  prevStep.value = stepCount.value
  startAuto()
}

function handleReset() {
  reset()
  prevStep.value = 0
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #1a1a2e;
  color: #eee;
  min-height: 100vh;
  -webkit-tap-highlight-color: transparent;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 16px 40px;
}

.title {
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 700;
  color: #f5c518;
  text-align: center;
  text-shadow: 0 2px 8px rgba(245, 197, 24, 0.3);
}

.game-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 960px;
}

.board-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: stretch;
  flex: 1;
  min-width: 260px;
  max-width: 320px;
}

.hint-text {
  color: #888;
  font-size: 13px;
  text-align: center;
  min-height: 20px;
}
</style>