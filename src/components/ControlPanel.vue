<template>
  <div class="control-panel">
    <div class="status-card">
      <div class="stat">
        <span class="stat-label">步数</span>
        <span class="stat-value">{{ stepCount }} / {{ boardSize * boardSize }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">耗时</span>
        <span class="stat-value">{{ elapsedTime }}s</span>
      </div>
      <div class="stat">
        <span class="stat-label">状态</span>
        <span class="stat-value" :class="{ success: isComplete }">
          {{ statusText }}
        </span>
      </div>
    </div>

    <div class="button-group">
      <button
        class="btn btn-primary"
        :disabled="!startPos || isRunning"
        @click="$emit('startManual')"
      >手动模式</button>

      <button
        class="btn btn-accent"
        :disabled="!startPos || isRunning"
        @click="$emit('startAuto')"
      >自动求解</button>

      <button class="btn btn-outline" @click="$emit('reset')">重置</button>
    </div>

    <div v-if="isAutoMode" class="speed-control">
      <label>动画速度</label>
      <input type="range" min="50" max="800" step="10" :value="animSpeed"
        @input="$emit('update:animSpeed', Number($event.target.value))" />
      <span>{{ animSpeed }}ms</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stepCount: { type: Number, default: 0 },
  elapsedTime: { type: Number, default: 0 },
  isComplete: { type: Boolean, default: false },
  isRunning: { type: Boolean, default: false },
  isAutoMode: { type: Boolean, default: false },
  startPos: { type: Array, default: null },
  boardSize: { type: Number, default: 8 },
  animSpeed: { type: Number, default: 200 },
})

defineEmits(['startManual', 'startAuto', 'reset', 'update:animSpeed'])

const statusText = computed(() => {
  if (props.isComplete) return '成功！'
  if (props.isRunning) return '运行中...'
  if (props.startPos) return '已选起点'
  return '等待选择起点'
})
</script>

<style scoped>
.control-panel {
  background: #16213e;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
}

.status-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #0f3460;
}

.stat-label { color: #888; font-size: 14px; }

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #e2e2e2;
}

.stat-value.success { color: #4ecca3; }

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  padding: 14px 16px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-primary {
  background: #533483;
  color: #fff;
}
.btn-primary:hover:not(:disabled) { background: #6b47b5; }
.btn-primary:active:not(:disabled) { background: #3d2666; }

.btn-accent {
  background: #e94560;
  color: #fff;
}
.btn-accent:hover:not(:disabled) { background: #f0627a; }
.btn-accent:active:not(:disabled) { background: #c2304a; }

.btn-outline {
  background: transparent;
  color: #aaa;
  border: 1px solid #333;
}
.btn-outline:hover { color: #fff; border-color: #666; }
.btn-outline:active { background: #1a1a2e; }

.speed-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #888;
}

.speed-control input[type="range"] {
  flex: 1;
  accent-color: #e94560;
  height: 20px;
}

.speed-control span {
  min-width: 45px;
  text-align: right;
  color: #eee;
  font-size: 13px;
}
</style>