<template>
  <div class="rules-panel">
    <h3>游戏规则</h3>
    <ul>
      <li><b>目标：</b>骑士从起点出发，走遍棋盘所有 64 格，每格只走一次。</li>
      <li><b>走法：</b>马走"日"字 — 横向 2 格 + 纵向 1 格，或横向 1 格 + 纵向 2 格。</li>
      <li><b>手动模式：</b>点击棋盘高亮格子，按马步规则逐格前进。</li>
      <li><b>自动模式：</b>算法自动求解并动画演示完整路径。</li>
    </ul>
  </div>
</template>

<style scoped>
.rules-panel {
  background: #16213e;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 320px;
  font-size: 13px;
  line-height: 1.7;
}

.rules-panel h3 {
  font-size: 15px;
  color: #f5c518;
  margin-bottom: 12px;
}

.rules-panel ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rules-panel li {
  color: #aaa;
  padding-left: 16px;
  position: relative;
}

.rules-panel li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: #e94560;
  font-weight: bold;
}

.rules-panel b {
  color: #e2e2e2;
}
</style>