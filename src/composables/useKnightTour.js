import { ref, reactive } from 'vue'

// 马的 8 个可能移动方向（相对坐标）
const KNIGHT_MOVES = [
  [-2, -1], [-1, -2], [1, -2], [2, -1],
  [2, 1], [1, 2], [-1, 2], [-2, 1]
]

const BOARD_SIZE = 8

export function useKnightTour() {
  // 棋盘数据：board[row][col] = stepNumber (0 表示未访问)
  const board = ref(createEmptyBoard())
  // 起点
  const startPos = ref(null)
  // 当前马的位置
  const knightPos = ref(null)
  // 当前步数
  const stepCount = ref(0)
  // 游戏模式：null=未开始, 'manual'=手动, 'auto'=自动
  const mode = ref(null)
  // 状态
  const isRunning = ref(false)
  const isComplete = ref(false)
  const elapsedTime = ref(0)
  // 自动模式：存储完整路径用于动画
  const solutionPath = ref([])
  // 自动模式动画速度（ms/步）
  const animSpeed = ref(200)

  let timerInterval = null
  let animTimer = null

  function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
  }

  // 判断坐标是否在棋盘内
  function isValidPos(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
  }

  // 从 (r,c) 出发，计算所有合法的下一步位置
  function getValidMoves(r, c, currentBoard) {
    const moves = []
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr
      const nc = c + dc
      if (isValidPos(nr, nc) && currentBoard[nr][nc] === 0) {
        moves.push([nr, nc])
      }
    }
    return moves
  }

  // 贪心排序：按每个候选位置的下一步可选数量升序排列（Warnsdorff 规则）
  function sortByAccessibility(moves, currentBoard) {
    return moves
      .map(([r, c]) => ({ pos: [r, c], count: getValidMoves(r, c, currentBoard).length }))
      .sort((a, b) => a.count - b.count)
      .map(({ pos }) => pos)
  }

  // DFS + 贪心优化：求解完整路径
  function solve(currentBoard, r, c, step) {
    if (step === BOARD_SIZE * BOARD_SIZE) {
      return [[r, c]] // 最后一步
    }

    const nextMoves = sortByAccessibility(getValidMoves(r, c, currentBoard), currentBoard)

    for (const [nr, nc] of nextMoves) {
      currentBoard[nr][nc] = step + 1
      const result = solve(currentBoard, nr, nc, step + 1)
      if (result) {
        return [[r, c], ...result]
      }
      currentBoard[nr][nc] = 0 // 回溯
    }

    return null
  }

  // 选择起点
  function setStart(row, col) {
    if (isRunning.value) return

    reset()
    board.value[row][col] = 1
    startPos.value = [row, col]
    knightPos.value = [row, col]
    stepCount.value = 1
    mode.value = null
  }

  // 开始手动模式
  function startManual() {
    if (!startPos.value || isRunning.value) return
    mode.value = 'manual'
    startTimer()
  }

  // 开始自动模式
  function startAuto() {
    if (!startPos.value || isRunning.value) return
    mode.value = 'auto'
    isRunning.value = true

    const startTime = performance.now()

    // 深拷贝棋盘用于求解
    const workBoard = board.value.map(row => [...row])
    const [sr, sc] = startPos.value
    const path = solve(workBoard, sr, sc, 1)

    elapsedTime.value = Number(((performance.now() - startTime) / 1000).toFixed(3))

    if (path) {
      solutionPath.value = path
      // 清空棋盘只保留起点
      board.value = createEmptyBoard()
      board.value[sr][sc] = 1
      stepCount.value = 1
      knightPos.value = [sr, sc]
      // 开始动画
      animateSolution(1) // 从路径索引 1 开始
    } else {
      isComplete.value = false
      isRunning.value = false
      mode.value = null
    }
  }

  function animateSolution(index) {
    if (index >= solutionPath.value.length) {
      // 动画完成
      isComplete.value = true
      isRunning.value = false
      return
    }

    animTimer = setTimeout(() => {
      const [r, c] = solutionPath.value[index]
      board.value[r][c] = index + 1
      knightPos.value = [r, c]
      stepCount.value = index + 1
      animateSolution(index + 1)
    }, animSpeed.value)
  }

  // 手动模式：尝试移动到指定位置
  function tryMove(row, col) {
    if (mode.value !== 'manual' || isComplete.value) return false
    if (board.value[row][col] !== 0) return false

    const [kr, kc] = knightPos.value
    const isValid = KNIGHT_MOVES.some(([dr, dc]) => kr + dr === row && kc + dc === col)

    if (!isValid) return false

    stepCount.value++
    board.value[row][col] = stepCount.value
    knightPos.value = [row, col]

    // 检查是否完成（64 步）
    if (stepCount.value === BOARD_SIZE * BOARD_SIZE) {
      isComplete.value = true
      mode.value = null
      stopTimer()
    }

    return true
  }

  // 高亮当前马可跳到的合法位置
  function getHighlightedMoves() {
    if (!knightPos.value || isComplete.value) return []
    const [r, c] = knightPos.value
    return getValidMoves(r, c, board.value)
  }

  function startTimer() {
    const startTime = performance.now()
    timerInterval = setInterval(() => {
      elapsedTime.value = Number(((performance.now() - startTime) / 1000).toFixed(1))
    }, 100)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function reset() {
    stopTimer()
    if (animTimer) {
      clearTimeout(animTimer)
      animTimer = null
    }
    board.value = createEmptyBoard()
    startPos.value = null
    knightPos.value = null
    stepCount.value = 0
    mode.value = null
    isRunning.value = false
    isComplete.value = false
    elapsedTime.value = 0
    solutionPath.value = []
  }

  return {
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
  }
}
