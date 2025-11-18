<template>
  <div class="updates-card">
    <h3 class="updates-title">今日动态</h3>
    <div class="updates-list">
      <div v-for="item in updates" :key="item.text" class="update-item">
        <div class="update-content">
          <p class="update-text">{{ item.text }}</p>
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
])
</script>

<style scoped>
.updates-card {
  background-color: var(--card);
  padding: 0 12px 12px 12px;
}

.updates-title {
  margin: 0;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  position: sticky;
  top: 0;
  background: var(--card);
  z-index: 1;
}

.updates-list {
  /* No special properties needed here anymore */
}

.update-item {
  position: relative;
  padding-left: 20px; /* Space for the bullet */
  padding-bottom: 12px;
}

.update-item::before {
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

.update-content {
  /* No changes needed here */
}

.update-text {
  font-size: 13px;
  color: var(--text);
  margin: 0;
  line-height: 1.5;
}
</style>


