<template>
  <div class="updates-wrapper" ref="wrapperRef">
    <!-- Left Column: Today's Updates -->
    <div class="section-column">
      <h3 class="section-title">
        今日动态
        <span class="daily-badge">日更</span>
      </h3>
      <div class="list-container">
        <div v-if="updates.length === 0" class="list-item">
          <div class="item-content">
            <p class="item-text">暂无数据</p>
          </div>
        </div>
        <div v-for="item in updates" :key="item.text" class="list-item">
          <div class="item-content">
            <p class="item-text" @mouseenter="onTextEnter(item.text, $event)" @mouseleave="onTextLeave">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Work Order Progress -->
    <div class="section-column">
      <h3 class="section-title">
        工单进度
        <span class="daily-badge status-badge">实时</span>
      </h3>
      <div class="list-container">
        <div v-if="sortedWorkOrders.length === 0" class="list-item work-order-item">
          <div class="item-content">
            <div class="order-info">
              <span class="order-date">--</span>
              <span class="order-time">暂无数据</span>
            </div>
            <p class="item-text">暂无数据</p>
          </div>
        </div>
        <div v-for="order in sortedWorkOrders" :key="order.id" class="list-item work-order-item">
          <div class="item-content">
            <div class="order-info">
              <span class="order-date">{{ order.date }}</span>
              <span :class="['order-time', { 'is-overdue': order.overdue }]">{{ order.time }}</span>
            </div>
            <p class="item-text">{{ order.title }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="bubble.visible" class="tooltip-bubble" :style="{ top: bubble.top + 'px', left: bubble.left + 'px' }">{{ bubble.text }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as dataService from '../services/dataService'

const updates = ref([])

const workOrders = ref([])

onMounted(async () => {
  const u = await dataService.getProjectUpdates()
  updates.value = Array.isArray(u) ? u : []
  const w = await dataService.getWorkOrders()
  workOrders.value = Array.isArray(w) ? w : []
})

const sortedWorkOrders = computed(() => {
  return [...workOrders.value].sort((a, b) => (Number(a?.sortValue ?? 0) - Number(b?.sortValue ?? 0)))
})

const wrapperRef = ref(null)
const bubble = ref({ visible: false, text: '', top: 0, left: 0 })

function onTextEnter(text, e) {
  const el = e.currentTarget || e.target
  if (!el) return
  const truncated = el.scrollWidth > el.clientWidth
  if (!truncated) return
  const r = el.getBoundingClientRect()
  const w = wrapperRef.value ? wrapperRef.value.getBoundingClientRect() : { top: 0, left: 0 }
  bubble.value.text = text
  bubble.value.top = r.top - w.top - 8
  bubble.value.left = r.left - w.left + 6
  bubble.value.visible = true
}

function onTextLeave() {
  bubble.value.visible = false
}
</script>

<style scoped>
.updates-wrapper {
  background-color: var(--card);
  padding: 0 12px 12px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  position: relative;
}

.section-column {
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Ensure column doesn't overflow */
}

.section-title {
  margin: 0;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  /* Removed sticky positioning as the container itself will scroll */
  display: flex;
  align-items: center;
  gap: 6px;
}

.daily-badge {
  font-size: 11px;
  font-weight: normal;
  color: var(--accent);
  background-color: var(--accent-soft);
  padding: 1.5px 7px;
  border-radius: 4px;
  line-height: 1.4;
  border: 1px solid rgba(88, 158, 248, 0.2);
}

.status-badge {
  color: #e6a23c;
  background-color: rgba(230, 162, 60, 0.1);
  border-color: rgba(230, 162, 60, 0.2);
}

.list-container {
  display: flex;
  flex-direction: column;
  height: 260px; /* Fixed height for approx 5-6 items */
  overflow-y: auto;
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.list-container::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.list-item {
  position: relative;
  padding-left: 20px;
  padding-bottom: 12px;
  flex-shrink: 0; /* Prevent items from shrinking */
}

.list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  top: -1px;
  width: 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--accent);
  text-align: left;
}

.work-order-item::before {
  color: #e6a23c; /* Different color for work orders bullet */
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-text {
  font-size: 13px;
  color: var(--text);
  margin: 0;
  line-height: 1.5;
}

/* 今日动态文本强制不换行并截断 */
.section-column:first-child .item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



.order-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 2px;
}

.order-date {
  color: var(--muted);
}

.order-time {
  color: var(--accent);
  font-weight: 500;
}

.order-time.is-overdue {
  color: #f56c6c; /* Red for overdue */
}
</style>


