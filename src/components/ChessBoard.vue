<template>
  <canvas
    ref="canvasRef"
    :width="canvasSize"
    :height="canvasSize"
    class="chess-canvas"
    @click="handleClick"
    @touchend.prevent="handleTouch"
  />
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'

const props = defineProps({
  board: { type: Array, required: true },
  knightPos: { type: Array, default: null },
  startPos: { type: Array, default: null },
  highlightedMoves: { type: Array, default: () => [] },
  boardSize: { type: Number, default: 8 },
  isManualMode: { type: Boolean, default: false },
})

const emit = defineEmits(['cellClick'])

const canvasRef = ref(null)
const canvasWidth = ref(590)

const cellSize = computed(() => (canvasWidth.value - 60) / props.boardSize)
const padding = 30
const canvasSize = computed(() => cellSize.value * props.boardSize + padding * 2)

function calcCellSize() {
  const w = window.innerWidth
  canvasWidth.value = Math.min(590, w - 40)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const size = props.boardSize
  const cs = cellSize.value
  const total = canvasSize.value

  ctx.clearRect(0, 0, total, total)

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, total, total)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = padding + c * cs
      const y = padding + r * cs

      const isStart = props.startPos && props.startPos[0] === r && props.startPos[1] === c
      const isHighlighted = props.highlightedMoves.some(([hr, hc]) => hr === r && hc === c)
      const isKnight = props.knightPos && props.knightPos[0] === r && props.knightPos[1] === c

      if (isStart) {
        ctx.fillStyle = '#e94560'
      } else if (isKnight) {
        ctx.fillStyle = '#0f3460'
      } else if (isHighlighted) {
        ctx.fillStyle = '#16213e'
      } else {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863'
      }

      ctx.fillRect(x, y, cs, cs)

      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, cs, cs)

      const step = props.board[r][c]
      if (step > 0) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#333' : '#fff'
        const fontSize = Math.max(10, cs * 0.23)
        ctx.font = 'bold ' + fontSize + 'px "Segoe UI", system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(step, x + cs / 2, y + cs / 2)
      }

      if (isKnight) {
        ctx.fillStyle = '#f5c518'
        const fontSize = Math.max(16, cs * 0.46)
        ctx.font = 'bold ' + fontSize + 'px "Segoe UI", system-ui'
        ctx.fillText('K', x + cs / 2, y + cs / 2 - 1)
      }
    }
  }

  ctx.fillStyle = '#aaa'
  const lblSize = Math.max(9, cs * 0.17)
  ctx.font = lblSize + 'px "Segoe UI", system-ui'
  ctx.textAlign = 'center'
  for (let i = 0; i < size; i++) {
    ctx.fillText(String.fromCharCode(65 + i), padding + i * cs + cs / 2, padding - 10)
    ctx.fillText(i + 1, padding - 15, padding + i * cs + cs / 2 + 5)
  }
}

function getCellFromEvent(clientX, clientY) {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = (clientX - rect.left) * scaleX
  const y = (clientY - rect.top) * scaleY
  const cs = cellSize.value

  const col = Math.floor((x - padding) / cs)
  const row = Math.floor((y - padding) / cs)

  if (row >= 0 && row < props.boardSize && col >= 0 && col < props.boardSize) {
    return [row, col]
  }
  return null
}

function handleClick(e) {
  const cell = getCellFromEvent(e.clientX, e.clientY)
  if (cell) emit('cellClick', cell[0], cell[1])
}

function handleTouch(e) {
  if (e.changedTouches.length > 0) {
    const t = e.changedTouches[0]
    const cell = getCellFromEvent(t.clientX, t.clientY)
    if (cell) emit('cellClick', cell[0], cell[1])
  }
}

onMounted(() => {
  calcCellSize()
  window.addEventListener('resize', () => { calcCellSize(); nextTick(draw) })
  nextTick(draw)
})

watch(
  () => [props.board, props.knightPos, props.startPos, props.highlightedMoves],
  () => nextTick(draw),
  { deep: true }
)
</script>

<style scoped>
.chess-canvas {
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  max-width: 100%;
}
</style>