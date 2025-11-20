<template>
  <div class="updates-wrapper">
    <!-- Left Column: Today's Updates -->
    <div class="section-column">
      <h3 class="section-title">
        今日动态
        <span class="daily-badge">日更</span>
      </h3>
      <div class="list-container">
        <div v-for="item in updates" :key="item.text" class="list-item">
          <div class="item-content">
            <p class="item-text">{{ item.text }}</p>
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
        <div v-for="order in workOrders" :key="order.id" class="list-item work-order-item">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const updates = ref([
  { time: '16:45', text: '李四 在「用户认证模块」上传了新的设计稿。' },
  { time: '15:32', text: '张三 将任务「完成API文档撰写」标记为已完成。' },
  { time: '14:20', text: '项目经理 王五 添加了新的里程碑「V2.1版本发布」。' },
  { time: '11:10', text: '赵六 提交了代码变更，修复了登录页面的一个显示BUG。' },
  { time: '09:30', text: '系统自动构建成功，版本号 v2.0.1-beta。' },
  { time: '09:00', text: '张三 创建了新的任务「数据库性能优化」。' },
  { time: '17:20', text: '王五 发起了「Q4季度规划」的代码评审请求。' },
  { time: '16:15', text: '测试团队 报告了「支付网关」模块的 2 个新缺陷。' },
  { time: '13:45', text: '运维组 完成了生产环境的服务器安全补丁更新。' },
  { time: '10:30', text: '产品经理 更新了「移动端适配」的需求规格说明书。' },
])

const workOrders = ref([
  { id: 'WO001', title: '服务器资源扩容申请 - 生产环境', date: '11-20', time: '剩余 4 小时', overdue: false },
  { id: 'WO002', title: '用户登录接口高延迟排查', date: '11-19', time: '逾期 1 天', overdue: true },
  { id: 'WO003', title: '第三方支付证书过期预警处理', date: '11-21', time: '剩余 1 天', overdue: false },
  { id: 'WO004', title: '数据报表导出功能异常修复', date: '11-18', time: '逾期 2 天', overdue: true },
  { id: 'WO005', title: '前端组件库安全补丁升级', date: '11-22', time: '剩余 2 天', overdue: false },
  { id: 'WO006', title: '新员工入职账号权限配置', date: '11-22', time: '剩余 2 天', overdue: false },
  { id: 'WO007', title: 'Q4 季度财务审计数据准备', date: '11-25', time: '剩余 5 天', overdue: false },
  { id: 'WO008', title: '移动端 APP 崩溃日志分析', date: '11-17', time: '逾期 3 天', overdue: true },
])
</script>

<style scoped>
.updates-wrapper {
  background-color: var(--card);
  padding: 0 12px 12px 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.section-column {
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  position: sticky;
  top: 0;
  background: var(--card);
  z-index: 1;
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
}

.list-item {
  position: relative;
  padding-left: 20px;
  padding-bottom: 12px;
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


