<template>
  <div class="attribution-wrapper">
    <div class="attribution-header">
      <h3 class="attribution-title">
        <icon-analysis theme="outline" size="16" :strokeWidth="3" />
        归因分析
      </h3>
      <span class="insight-badge" :class="badgeToneClass">{{ attribution.type }}</span>
    </div>

    <div class="summary-section" :class="sectionToneClass">
      <div class="summary-text">{{ summaryText }}</div>
    </div>

    <div class="factors-section">
      <h4 class="section-subtitle">主要影响因素</h4>
      <div class="factor-list">
        <div 
          v-for="(factor, index) in attribution.factors" 
          :key="index" 
          class="factor-item"
          :class="factor.impact"
        >
          <div class="factor-header">
            <icon-check-one 
              v-if="factor.impact === 'positive'" 
              theme="filled" 
              size="16" 
              fill="#15803d"
            />
            <icon-close-one 
              v-if="factor.impact === 'negative'" 
              theme="filled" 
              size="16" 
              fill="#dc2626"
            />
            <icon-info 
              v-if="factor.impact === 'neutral'" 
              theme="filled" 
              size="16" 
              fill="#64748b"
            />
            <span class="factor-title">{{ factor.title }}</span>
            <span class="factor-value">{{ factor.value }}</span>
          </div>
          <p class="factor-description">{{ factor.description }}</p>
        </div>
      </div>
    </div>

    <div class="recommendations-section" v-if="attribution.recommendations && attribution.recommendations.length > 0">
      <h4 class="section-subtitle">
        <icon-tips-one theme="outline" size="14" :strokeWidth="3" />
        改进建议
      </h4>
      <div class="recommendation-list">
        <div v-for="(rec, index) in attribution.recommendations" :key="index" class="recommendation-item">
          <span class="rec-bullet">{{ index + 1 }}</span>
          <span class="rec-text">{{ rec }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedKpi: { type: String, required: true },
  metrics: { type: Object, default: () => null },
  compareMode: { type: String, default: '' }
})

// 归因数据库 - 每个 KPI 对应的归因分析
const attributionData = {
  '任务完成率': {
    type: '正向提升',
    summary: '本期任务完成率为 76%，较计划 ↑ +3%。主要得益于关键阻塞问题的解决和团队协作效率的提升。',
    factors: [
      {
        title: '核心阻塞问题修复',
        value: '+1.8%',
        impact: 'positive',
        description: '解决了「用户认证模块」的技术债务，使得后续 5 个依赖任务得以顺利推进，贡献了 1.8% 的完成率提升。'
      },
      {
        title: '团队协作流程优化',
        value: '+1.0%',
        impact: 'positive',
        description: '引入了每日站会和看板管理，任务移交效率提升 25%，减少了等待时间。'
      },
      {
        title: '资源补充到位',
        value: '+0.5%',
        impact: 'positive',
        description: '新增 2 名开发人员加入项目，关键路径任务得到了人力支持。'
      },
      {
        title: '需求变更影响',
        value: '-0.3%',
        impact: 'negative',
        description: '客户临时增加了 3 个功能需求，导致部分计划任务被推迟。'
      }
    ],
    recommendations: [
      '继续保持每日站会机制，及时识别和解决新的阻塞问题',
      '对新增需求进行优先级评估，避免影响核心里程碑',
      '建立技术债务清理计划，预防类似阻塞问题再次发生'
    ]
  },
  '开工准点率': {
    type: '正向提升',
    summary: '本期开工准点率为 78%，较计划 ↑ +2%。主要原因是前置任务完成及时，资源调配更加合理。',
    factors: [
      {
        title: '前置任务按时交付',
        value: '+1.2%',
        impact: 'positive',
        description: '上游「需求评审」和「设计稿确认」环节提前完成,为开发任务创造了良好的启动条件。'
      },
      {
        title: '资源预分配机制',
        value: '+0.8%',
        impact: 'positive',
        description: '项目管理办公室提前 3 天完成资源预分配，避免了开工时的资源争抢。'
      },
      {
        title: '外部依赖延迟',
        value: '-0.2%',
        impact: 'negative',
        description: '第三方 API 接口文档延迟 1 天发布，导致「支付接口对接」任务推迟开工。'
      }
    ],
    recommendations: [
      '将资源预分配机制常态化，提前 5 天进行资源锁定',
      '建立外部依赖风险清单，提前与第三方确认时间节点',
      '对关键路径任务设置 buffer 时间，降低延迟风险'
    ]
  },
  '完工准点率': {
    type: '正向提升',
    summary: '本期完工准点率为 81%，较计划 ↑ +1%。代码审查效率提升和自动化测试覆盖是主要贡献因素。',
    factors: [
      {
        title: '代码审查效率提升',
        value: '+0.7%',
        impact: 'positive',
        description: '采用自动化代码检查工具，代码审查时间从平均 8 小时缩短到 5 小时，加快了任务交付。'
      },
      {
        title: '自动化测试覆盖',
        value: '+0.5%',
        impact: 'positive',
        description: '单元测试覆盖率达到 75%，减少了返工次数，提高了一次通过率。'
      },
      {
        title: '测试环境不稳定',
        value: '-0.2%',
        impact: 'negative',
        description: '测试环境在 11-18 当天出现故障，导致 2 个任务的验收延迟 1 天。'
      }
    ],
    recommendations: [
      '继续提升自动化测试覆盖率目标至 85%',
      '建立测试环境监控告警机制，及时发现和处理故障',
      '推广代码审查最佳实践到更多团队'
    ]
  },
  '关键里程碑达成率': {
    type: '风险预警',
    summary: '本期关键里程碑达成率为 72%，较计划 ↓ -3%。主要受到技术方案调整和人员变动的影响。',
    factors: [
      {
        title: '技术方案重大调整',
        value: '-2.0%',
        impact: 'negative',
        description: '「数据库架构」在评审中发现性能瓶颈，需要重新设计，导致 Q4 里程碑延期。'
      },
      {
        title: '核心人员离职',
        value: '-1.2%',
        impact: 'negative',
        description: '架构师和前端负责人离职，知识交接需要 2 周时间，影响了「V2.0 上线」里程碑。'
      },
      {
        title: '风险储备任务完成',
        value: '+0.5%',
        impact: 'positive',
        description: '提前完成了「性能优化」备选任务，为关键路径腾出了缓冲空间。'
      },
      {
        title: '客户需求冻结',
        value: '+0.4%',
        impact: 'positive',
        description: '与客户达成一致，需求在 11-15 后冻结，避免了进一步的范围蔓延。'
      }
    ],
    recommendations: [
      '立即启动技术方案补救计划，邀请外部专家进行评审',
      '加快新人招聘和知识转移，建立关键岗位备份机制',
      '重新评估 Q4 里程碑可行性，必要时向客户申请延期',
      '建立每周里程碑健康度检查机制'
    ]
  },
  '逾期任务率': {
    type: '正向改善',
    summary: '本期逾期任务率为 22%，环比 ↓ -1%。通过优先级管理和风险预警机制，逾期情况有所改善。',
    factors: [
      {
        title: '优先级管理强化',
        value: '-0.8%',
        impact: 'positive',
        description: '实施「P0/P1/P2」优先级机制，确保高优先级任务获得足够关注，减少了关键任务逾期。'
      },
      {
        title: '风险预警机制',
        value: '-0.5%',
        impact: 'positive',
        description: '建立任务健康度仪表盘，提前 3 天预警可能逾期的任务，及时调配资源。'
      },
      {
        title: '延期任务清理',
        value: '+0.3%',
        impact: 'negative',
        description: '历史遗留的 5 个低优先级任务持续逾期，拖累了整体指标。'
      }
    ],
    recommendations: [
      '对历史遗留逾期任务进行清理决策：关闭或重新规划',
      '将风险预警时间提前到 5 天，留出更多应对空间',
      '建立逾期任务复盘机制，分析根本原因并持续改进'
    ]
  }
}

attributionData['资金到账率'] = {
  type: '风险预警',
  summary: '本期资金到账率为 76%，环比 ↑ +3%。进度款-3期逾期未付是主要风险点。',
  factors: [
    { title: '预付款与前两期进度款结清', value: '+2.0%', impact: 'positive', description: '预付款与前两期进度款均已到账，形成正向贡献。' },
    { title: '进度款-3期逾期', value: '-1.5%', impact: 'negative', description: '第 3 期进度款到账仅 30%，且逾期 15 天，拖累整体到账率。' },
    { title: '结算资料准备效率', value: '+0.5%', impact: 'positive', description: '财务与项目组协同，提升了结算资料的准备效率。' }
  ],
  recommendations: [
    '建立逾期款项红黄灯机制，超过 7 天自动升级催收',
    '与客户确认结算节奏，提前锁定下一期付款节点',
    '对逾期阶段设置负责人与时限，形成闭环'
  ]
}

attributionData['项目支出金额'] = {
  type: '中性观察',
  summary: '本期项目支出金额为 81%，整体与预算匹配度良好。材料与外包支出是主要构成。',
  factors: [
    { title: '材料采购集中期', value: '+1.2%', impact: 'neutral', description: '二期材料集中采购导致当期支出抬升，但在预算内。' },
    { title: '外包服务进度款', value: '+0.8%', impact: 'neutral', description: '外包合同按节点支付，支出随交付节奏释放。' },
    { title: '人员成本稳定', value: '±0.0%', impact: 'neutral', description: '人员编制稳定，人工成本基本维持在预算线附近。' }
  ],
  recommendations: [
    '继续按里程碑控制采购与外包付款节奏',
    '对大额支出设置事前评审与事后复盘',
    '月度对比预算偏差，超过 5% 触发预警'
  ]
}

attributionData['人员健康度'] = {
  type: '风险预警',
  summary: '本期人员健康度为 72%，环比 ↓ -3%。核心成员负载偏高与人员变动导致健康度下滑。',
  factors: [
    { title: '核心成员负载过高', value: '-2.0%', impact: 'negative', description: '关键岗位连续两周工时超过阈值，影响效率与稳定性。' },
    { title: '人员流动与交接', value: '-1.0%', impact: 'negative', description: '人员变动导致知识交接耗时，对短期产能造成影响。' },
    { title: '弹性与调休机制', value: '+0.5%', impact: 'positive', description: '弹性工作与调休机制缓解了部分负载压力。' }
  ],
  recommendations: [
    '对关键岗位设置双人备份与轮岗计划',
    '控制周工时阈值，超过即触发调整与支援',
    '加速新人融入与交接文档标准化'
  ]
}

const attribution = computed(() => {
  return attributionData[props.selectedKpi] || {
    type: '数据分析中',
    summary: '正在收集该指标的归因数据...',
    factors: [],
    recommendations: []
  }
})

const summaryText = computed(() => {
  const base = attribution.value.summary || ''
  const m = props.metrics
  if (!m || !m.value) return base
  const arrow = m.up ? '↑' : '↓'
  const sign = m.up ? '+' : '-'
  const mode = props.compareMode || (props.selectedKpi === '关键里程碑达成率' || props.selectedKpi === '任务完成率' ? '较计划' : '环比')
  const s = attribution.value.summary || ''
  const parts = s.split('。')
  const supp = parts.length > 1 ? parts.slice(1).join('。') : ''
  return '本期' + props.selectedKpi + '为 ' + m.value + '，' + mode + ' ' + arrow + ' ' + sign + m.delta + '。' + supp
})

const badgeToneClass = computed(() => {
  const t = (attribution.value.type || '')
  return t.includes('风险') ? 'red' : 'blue'
})

const sectionToneClass = computed(() => {
  const t = (attribution.value.type || '')
  return t.includes('风险') ? 'red-mode' : 'blue-mode'
})
</script>

<style scoped>
.attribution-wrapper {
  background-color: var(--card);
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.attribution-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.insight-badge {
  font-size: 11px;
  font-weight: normal;
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.insight-badge {
  color: var(--accent);
  background-color: var(--accent-soft);
  border: 1px solid rgba(88, 158, 248, 0.2);
}

.insight-badge.blue {
  color: var(--accent);
  background-color: var(--accent-soft);
  border-color: rgba(88, 158, 248, 0.2);
}


.insight-badge.red {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.22);
}

.summary-section {
  background: linear-gradient(135deg, rgba(88, 158, 248, 0.05) 0%, rgba(88, 158, 248, 0.02) 100%);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid var(--accent);
}

.summary-section.blue-mode {
  background: linear-gradient(135deg, rgba(88, 158, 248, 0.05) 0%, rgba(88, 158, 248, 0.02) 100%);
  border-left-color: var(--accent);
}


.summary-section.red-mode {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(239, 68, 68, 0.015) 100%);
  border-left-color: #ef4444;
}

.summary-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
}

.factors-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-subtitle {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.factor-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor-item {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.factor-item:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.factor-item.positive {
  background: linear-gradient(135deg, rgba(21, 128, 61, 0.03) 0%, rgba(21, 128, 61, 0.01) 100%);
}

.factor-item.negative {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.03) 0%, rgba(220, 38, 38, 0.01) 100%);
}

.factor-item.neutral {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.03) 0%, rgba(100, 116, 139, 0.01) 100%);
}

.factor-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.factor-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.factor-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}

.factor-item.positive .factor-value {
  color: #15803d;
}

.factor-item.negative .factor-value {
  color: #dc2626;
}

.factor-description {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--muted);
  padding-left: 22px;
}

.recommendations-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text);
}

.rec-bullet {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.rec-text {
  flex: 1;
  padding-top: 1px;
}
</style>
