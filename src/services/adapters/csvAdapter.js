/**
 * CSV数据适配器
 * 从CSV文件加载数据，实现dataService的适配器接口
 */

import urumqiTaskCsvUrl from '../../../test_data/template_test.csv?url'
import urumqiPeopleCsvUrl from '../../../test_data/template_test_people.csv?url'

export const TEST_DATA_PATH = '@test_data'

// ============================================================================
// 缓存管理
// ============================================================================

let __urumqiTasksCache = null
let __urumqiTasksCachePromise = null
let __urumqiPeopleCache = null
let __urumqiPeopleCachePromise = null
let __projectRegionMapCache = null
let __projectRegionMapCachePromise = null

// ============================================================================
// 辅助函数
// ============================================================================

function getRowProjectLabel(row) {
  return String(row?.['项目简称'] || row?.['项目名称'] || '').trim()
}

function getRowRegion(row) {
  return String(row?.['区域'] || row?.['地区'] || '').trim()
}

function normalizeProjectKey(projectIdOrName) {
  return String(projectIdOrName ?? '')
    .replace(/[\uFEFF\u200B\u00A0]/g, '')
    .trim()
    .toLowerCase()
}

function parseCsv(text) {
  if (!text) return []
  const s = String(text).replace(/^\uFEFF/, '')

  function cleanCell(v) {
    return String(v ?? '')
      .replace(/[\uFEFF\u200B\u00A0]/g, '')
      .trim()
  }

  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      continue
    }
    if (ch === '\r') {
      continue
    }
    if (ch === '\n') {
      row.push(field)
      const hasAny = row.some(x => String(x || '').trim() !== '')
      if (hasAny) rows.push(row)
      row = []
      field = ''
      continue
    }
    field += ch
  }

  if (field.length || row.length) {
    row.push(field)
    const hasAny = row.some(x => String(x || '').trim() !== '')
    if (hasAny) rows.push(row)
  }

  if (rows.length < 2) return []
  const header = rows[0].map(x => cleanCell(x))
  const objects = []
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r]
    const obj = {}
    for (let c = 0; c < header.length; c++) {
      obj[header[c]] = cleanCell(cols[c])
    }
    objects.push(obj)
  }
  return objects
}

function parseDateYmd(s) {
  const v = String(s || '').trim()
  if (!v) return null
  const m = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (!Number.isFinite(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

function formatMMDD(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return mm + '-' + dd
}

function addDays(d, days) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  x.setHours(0, 0, 0, 0)
  return x
}

function dateRangeInclusive(start, end) {
  const out = []
  if (!start || !end) return out
  const s = new Date(start)
  const e = new Date(end)
  s.setHours(0, 0, 0, 0)
  e.setHours(0, 0, 0, 0)
  for (let d = s; d <= e; d = addDays(d, 1)) {
    out.push(new Date(d))
  }
  return out
}

// ============================================================================
// 数据加载函数
// ============================================================================

async function getAllTasks() {
  if (__urumqiTasksCache) return __urumqiTasksCache
  if (__urumqiTasksCachePromise) return __urumqiTasksCachePromise

  __urumqiTasksCachePromise = (async () => {
    try {
      const resp = await fetch(urumqiTaskCsvUrl)
      if (!resp.ok) throw new Error('Failed to fetch task csv: ' + resp.status)
      const buf = await resp.arrayBuffer()
      const bytes = new Uint8Array(buf)

      function tryDecode(encoding) {
        try {
          return new TextDecoder(encoding).decode(bytes)
        } catch (e) {
          return null
        }
      }

      const candidates = [
        { enc: 'utf-8', text: tryDecode('utf-8') },
        { enc: 'gb18030', text: tryDecode('gb18030') },
        { enc: 'gbk', text: tryDecode('gbk') },
        { enc: 'gb2312', text: tryDecode('gb2312') }
      ].filter(x => typeof x.text === 'string')

      let text = candidates.length ? candidates[0].text : ''
      let picked = candidates.length ? candidates[0].enc : ''
      for (const c of candidates) {
        if ((c.text.includes('项目简称') || c.text.includes('项目名称')) && 
            c.text.includes('计划完成时间') && c.text.includes('工作项名称')) {
          text = c.text
          picked = c.enc
          break
        }
      }

      if (!((text.includes('项目简称') || text.includes('项目名称')) && 
            text.includes('计划完成时间') && text.includes('工作项名称'))) {
        console.warn('[csvAdapter] header markers not found after decode', { picked })
      }

      const rows = parseCsv(text)
      const looksOk = Array.isArray(rows) && rows.length && (
        Object.prototype.hasOwnProperty.call(rows[0], '计划完成时间') ||
        Object.prototype.hasOwnProperty.call(rows[0], '工作项名称')
      )
      if (!looksOk) {
        console.warn('[csvAdapter] parsed rows do not contain expected headers', { picked })
        __urumqiTasksCache = []
        return []
      }

      const tasks = rows.map(r => {
        const planStart = parseDateYmd(r['计划开始时间'])
        const actualStart = parseDateYmd(r['实际开始时间'])
        const planEnd = parseDateYmd(r['计划完成时间'])
        const actualEnd = parseDateYmd(r['实际完成时间'])
        const planDurationRaw = String(r['计划工期'] || '').trim()
        const actualDurationRaw = String(r['实际工期'] || '').trim()
        const planDuration = (planDurationRaw && Number.isFinite(Number(planDurationRaw))) 
          ? Number(planDurationRaw) : null
        const actualDuration = (actualDurationRaw && Number.isFinite(Number(actualDurationRaw))) 
          ? Number(actualDurationRaw) : null
        const projectLabel = getRowProjectLabel(r)
        return {
          projectId: projectLabel,
          projectName: projectLabel,
          stage: r['阶段'] || '',
          seq: r['序号'] || '',
          name: r['工作项名称'] || '',
          id: r['工作项ID'] || '',
          parentName: r['父级工作项'] || '',
          owner: r['责任人'] || '',
          executor: r['执行人'] || '',
          status: r['工作项状态'] || '',
          planStart,
          actualStart,
          planEnd,
          actualEnd,
          planDuration,
          actualDuration,
          raw: r
        }
      })

      __urumqiTasksCache = tasks
      return tasks
    } catch (e) {
      console.warn('[csvAdapter] getAllTasks failed', e)
      __urumqiTasksCache = []
      return []
    } finally {
      __urumqiTasksCachePromise = null
    }
  })()

  return __urumqiTasksCachePromise
}

async function getTasksByProject(projectId) {
  const key = normalizeProjectKey(projectId)
  const tasks = await getAllTasks()
  if (!key) return tasks
  return tasks.filter(t => {
    const keyById = normalizeProjectKey(t.projectId)
    const keyByName = normalizeProjectKey(t.projectName)
    return keyById === key || keyByName === key
  })
}

async function getUrumqiPeopleRows() {
  if (__urumqiPeopleCache) return __urumqiPeopleCache
  if (__urumqiPeopleCachePromise) return __urumqiPeopleCachePromise

  __urumqiPeopleCachePromise = (async () => {
    try {
      const resp = await fetch(urumqiPeopleCsvUrl)
      if (!resp.ok) throw new Error('Failed to fetch people csv: ' + resp.status)
      const buf = await resp.arrayBuffer()
      const bytes = new Uint8Array(buf)

      function tryDecode(encoding) {
        try {
          return new TextDecoder(encoding).decode(bytes)
        } catch (e) {
          return null
        }
      }

      const candidates = [
        { enc: 'utf-8', text: tryDecode('utf-8') },
        { enc: 'gb18030', text: tryDecode('gb18030') },
        { enc: 'gbk', text: tryDecode('gbk') },
        { enc: 'gb2312', text: tryDecode('gb2312') }
      ].filter(x => typeof x.text === 'string')

      let text = candidates.length ? candidates[0].text : ''
      let picked = candidates.length ? candidates[0].enc : ''
      for (const c of candidates) {
        if ((c.text.includes('项目简称') || c.text.includes('项目名称')) && c.text.includes('干系人')) {
          text = c.text
          picked = c.enc
          break
        }
      }

      const rows = parseCsv(text)
      const looksOk = Array.isArray(rows) && rows.length && (
        Object.prototype.hasOwnProperty.call(rows[0], '项目简称') ||
        Object.prototype.hasOwnProperty.call(rows[0], '项目名称') ||
        Object.prototype.hasOwnProperty.call(rows[0], '干系人')
      )
      if (!looksOk) {
        console.warn('[csvAdapter] people rows do not contain expected headers', { picked })
        return []
      }

      __urumqiPeopleCache = rows
      return rows
    } catch (e) {
      console.warn('[csvAdapter] getUrumqiPeopleRows failed', e)
      return []
    } finally {
      __urumqiPeopleCachePromise = null
    }
  })()

  return __urumqiPeopleCachePromise
}

async function getProjectRegionMap() {
  if (__projectRegionMapCache) return __projectRegionMapCache
  if (__projectRegionMapCachePromise) return __projectRegionMapCachePromise

  __projectRegionMapCachePromise = (async () => {
    try {
      const rows = await getUrumqiPeopleRows()
      const map = new Map()
      for (const r of rows) {
        const project = getRowProjectLabel(r)
        const region = getRowRegion(r)
        if (!project || !region) continue
        const key = normalizeProjectKey(project)
        if (!key) continue
        if (!map.has(key)) map.set(key, region)
      }
      __projectRegionMapCache = map
      return map
    } finally {
      __projectRegionMapCachePromise = null
    }
  })()

  return __projectRegionMapCachePromise
}

// ============================================================================
// 数据计算函数
// ============================================================================

function buildCompletionSeries(tasks) {
  const valid = tasks.filter(t => t.planEnd && Number.isFinite(t.planEnd.getTime()))
  const total = valid.length || 0
  if (!total) return { xAxis: [], actualRates: [], planRates: [] }

  const allPlanEnds = valid.map(t => t.planEnd)
  const allActualEnds = valid.map(t => t.actualEnd).filter(d => d && Number.isFinite(d.getTime()))

  const minDate = new Date(Math.min(...allPlanEnds.map(d => d.getTime())))
  const maxCandidates = [
    Math.max(...allPlanEnds.map(d => d.getTime())),
    allActualEnds.length ? Math.max(...allActualEnds.map(d => d.getTime())) : null,
    new Date().setHours(0, 0, 0, 0)
  ].filter(x => x != null)
  const maxDate = new Date(Math.max(...maxCandidates))

  const days = dateRangeInclusive(minDate, maxDate)
  const xAxis = days.map(d => formatMMDD(d))
  const planRates = days.map(d => {
    const c = valid.filter(t => t.planEnd && t.planEnd <= d).length
    return c / total
  })
  const actualRates = days.map(d => {
    const c = valid.filter(t => t.actualEnd && t.actualEnd <= d).length
    return c / total
  })

  return { xAxis, actualRates, planRates }
}

function buildOverdueSeries(tasks) {
  const valid = tasks.filter(t => t.planEnd && Number.isFinite(t.planEnd.getTime()))
  const total = valid.length || 0
  if (!total) return { xAxis: [], actualRates: [], planRates: [] }

  const allPlanEnds = valid.map(t => t.planEnd)
  const allActualEnds = valid.map(t => t.actualEnd).filter(d => d && Number.isFinite(d.getTime()))

  const minDate = new Date(Math.min(...allPlanEnds.map(d => d.getTime())))
  const maxCandidates = [
    Math.max(...allPlanEnds.map(d => d.getTime())),
    allActualEnds.length ? Math.max(...allActualEnds.map(d => d.getTime())) : null,
    new Date().setHours(0, 0, 0, 0)
  ].filter(x => x != null)
  const maxDate = new Date(Math.max(...maxCandidates))

  const days = dateRangeInclusive(minDate, maxDate)
  const xAxis = days.map(d => formatMMDD(d))

  const actualRates = days.map(d => {
    const overdueCount = valid.filter(t => {
      const st = String(t.status || '').trim()
      if (st === '逾期完成') return false
      if (st === '已完成') return false
      if (!t.planEnd) return false
      if (!(t.planEnd < d)) return false
      if (!t.actualEnd) return true
      return t.actualEnd > d
    }).length
    return overdueCount / total
  })

  const planRates = days.map(d => {
    const c = valid.filter(t => t.planEnd && t.planEnd <= d).length
    return c / total
  })
  return { xAxis, actualRates, planRates }
}

function buildOnTimeMetrics(tasks) {
  function computeStartRateWithTotal(asOf) {
    const startScope = tasks.filter(t => t.planStart && t.planStart <= asOf)
    const total = startScope.length || 0
    const rate = total
      ? (startScope.filter(t => t.actualStart && t.actualStart <= t.planStart).length / total)
      : 0
    return { rate, total }
  }

  function computeCompleteRateWithTotal(asOf) {
    const completeScope = tasks.filter(t => t.planEnd && t.planEnd <= asOf)
    const total = completeScope.length || 0
    const rate = total
      ? (completeScope.filter(t => t.actualEnd && t.actualEnd <= t.planEnd).length / total)
      : 0
    return { rate, total }
  }

  function computeAvgDurationRatioWithTotal(asOf) {
    const scope = tasks.filter(t => {
      if (!Number.isFinite(t?.planDuration) || t.planDuration <= 0) return false
      if (!Number.isFinite(t?.actualDuration) || t.actualDuration <= 0) return false
      if (!t.actualEnd || t.actualEnd > asOf) return false
      return true
    })
    const total = scope.length || 0
    const avg = total
      ? (scope.reduce((s, t) => s + (t.actualDuration / t.planDuration), 0) / total)
      : 0
    return { avg, total }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const prev = addDays(now, -1)

  const startNow = computeStartRateWithTotal(now)
  const startPrev = computeStartRateWithTotal(prev)
  const startOnTimeRate = startNow.rate
  const startOnTimeRateDelta = (startNow.total > 0 && startPrev.total > 0)
    ? (startNow.rate - startPrev.rate) : 0

  const completeNow = computeCompleteRateWithTotal(now)
  const completePrev = computeCompleteRateWithTotal(prev)
  const completeOnTimeRate = completeNow.rate
  const completeOnTimeRateDelta = (completeNow.total > 0 && completePrev.total > 0)
    ? (completeNow.rate - completePrev.rate) : 0

  const durationNow = computeAvgDurationRatioWithTotal(now)
  const durationPrev = computeAvgDurationRatioWithTotal(prev)
  const avgDurationRatio = durationNow.avg
  const avgDurationRatioDelta = (durationNow.total > 0 && durationPrev.total > 0)
    ? (durationNow.avg - durationPrev.avg) : 0

  return {
    startOnTimeRate,
    startOnTimeRateDelta,
    completeOnTimeRate,
    completeOnTimeRateDelta,
    avgDurationRatio,
    avgDurationRatioDelta
  }
}

// ============================================================================
// CSV适配器接口实现
// ============================================================================

export const csvAdapter = {
  async getProjects() {
    const allTasks = await getAllTasks()
    const keyToName = new Map()
    for (const t of allTasks) {
      const label = String(t?.projectName || t?.projectId || '').trim()
      if (!label) continue
      const key = normalizeProjectKey(label)
      if (!keyToName.has(key)) keyToName.set(key, label)
    }

    const peopleRows = await getUrumqiPeopleRows()
    for (const r of peopleRows) {
      const label = getRowProjectLabel(r)
      if (!label) continue
      const key = normalizeProjectKey(label)
      if (!keyToName.has(key)) keyToName.set(key, label)
    }

    const keys = Array.from(keyToName.keys())
    if (!keys.length) return []

    const out = []
    for (let idx = 0; idx < keys.length; idx++) {
      const key = keys[idx]
      const name = keyToName.get(key) || key
      const tasks = await getTasksByProject(key)
      const expandedMetrics = buildOnTimeMetrics(tasks)
      out.push({
        id: key,
        name,
        sector: '',
        isWatched: idx === 0,
        series: [0, 0],
        expandedMetrics
      })
    }
    return out
  },

  async getKpis(projectId) {
    const tasks = await getTasksByProject(projectId)
    const completion = buildCompletionSeries(tasks)
    const overdue = buildOverdueSeries(tasks)
   
    const completionLast = completion.actualRates.length 
      ? completion.actualRates[completion.actualRates.length - 1] : 0
    const completionPlanLast = completion.planRates.length 
      ? completion.planRates[completion.planRates.length - 1] : null
    const completionDelta = (completionPlanLast != null) 
      ? Math.abs(completionLast - completionPlanLast) : 0
    const completionUp = (completionPlanLast != null) 
      ? (completionLast - completionPlanLast) >= 0 : true
   
    const overdueLast = overdue.actualRates.length 
      ? overdue.actualRates[overdue.actualRates.length - 1] : 0
    const overduePrev = overdue.actualRates.length > 1 
      ? overdue.actualRates[overdue.actualRates.length - 2] : overdueLast
    const overdueDelta = Math.abs(overdueLast - overduePrev)
    const overdueUp = (overdueLast - overduePrev) <= 0
   
    const personnelData = await this.getPersonnelData(projectId)
    const members = personnelData.members || []
    const totalMembers = members.length
    let healthScore = 0
    if (totalMembers > 0) {
      const riskCount = members.filter(m => m.projectCount > 3).length
      const normalCount = totalMembers - riskCount
      healthScore = Math.round((normalCount / totalMembers) * 100)
    }

    return [
      { title: '资金到账率', value: '0%', delta: '0%', up: true },
      { title: '任务完成率', value: Math.round(completionLast * 100) + '%', 
        delta: Math.round(completionDelta * 100) + '%', up: completionUp },
      { title: '项目支出金额', value: '¥ 0', delta: '0', up: true },
      { title: '人员健康度', value: healthScore + '%', delta: '0%', up: true },
      { title: '逾期任务率', value: Math.round(overdueLast * 100) + '%', 
        delta: Math.round(overdueDelta * 100) + '%', up: overdueUp }
    ]
  },

  async getFundData(projectId) {
    // CSV数据暂不支持资金数据，返回空结构
    return {
      totals: {
        totalDueAmount: 0,
        totalReceivedAmount: 0,
        totalPendingAmount: 0,
        arrivalRate: 0
      },
      fundStages: [],
      overdueItems: [],
      stats: { last: 0, prev: null, planLast: null, isUp: true }
    }
  },

  async getExpenditureData(projectId) {
    // CSV数据暂不支持支出数据，返回空结构
    return {
      totals: { totalBudget: 0, totalExpenditure: 0 },
      monthlyTrend: { xAxis: [], personnel: [], labor: [], other: [] },
      topExpenditures: []
    }
  },

  async getPersonnelData(projectId) {
    const rows = await getUrumqiPeopleRows()
    const key = normalizeProjectKey(projectId)
    
    // 按人员聚合项目
    const personMap = new Map()
    for (const r of rows) {
      const projectLabel = getRowProjectLabel(r)
      const personName = String(r['干系人'] || '').trim()
      const role = String(r['角色'] || '').trim()
      
      if (!personName) continue
      
      if (!personMap.has(personName)) {
        personMap.set(personName, {
          id: personName,
          name: personName,
          role: role,
          projectCount: 0,
          projects: []
        })
      }
      
      const person = personMap.get(personName)
      if (projectLabel && !person.projects.includes(projectLabel)) {
        person.projects.push(projectLabel)
        person.projectCount = person.projects.length
      }
    }
    
    // 如果指定了项目ID，只返回该项目相关的人员
    let members = Array.from(personMap.values())
    if (key) {
      members = members.filter(m => 
        m.projects.some(p => normalizeProjectKey(p) === key)
      )
    }
    
    return { members }
  },

  async getTaskData(projectId, kpi) {
    const tasks = await getTasksByProject(projectId)
    
    if (kpi === '逾期任务率') {
      return buildOverdueSeries(tasks)
    }
    // 默认返回任务完成率数据
    return buildCompletionSeries(tasks)
  },

  async getRiskProjects(region) {
    const projects = await this.getProjects()
    // 简单风险判断：逾期率超过阈值的项目
    const riskProjects = []
    
    for (const p of projects) {
      const tasks = await getTasksByProject(p.id)
      const overdue = buildOverdueSeries(tasks)
      const overdueRate = overdue.actualRates.length 
        ? overdue.actualRates[overdue.actualRates.length - 1] : 0
      
      if (overdueRate > 0.15) {
        riskProjects.push({
          id: p.id,
          name: p.name,
          overdueRate,
          riskLevel: overdueRate > 0.3 ? 'high' : 'medium'
        })
      }
    }
    
    return riskProjects
  },

  async getProjectSeries(projectId) {
    const tasks = await getTasksByProject(projectId)
    const completion = buildCompletionSeries(tasks)
    // 返回实际完成率序列作为项目进度指数
    return completion.actualRates.map(r => Math.round(r * 100))
  },

  async getCompanyInsights() {
    const projects = await this.getProjects()
    const totalProjects = projects.length
    
    // 计算整体健康指数
    let totalHealthScore = 0
    for (const p of projects) {
      const tasks = await getTasksByProject(p.id)
      const completion = buildCompletionSeries(tasks)
      const completionRate = completion.actualRates.length 
        ? completion.actualRates[completion.actualRates.length - 1] : 0
      totalHealthScore += completionRate
    }
    const avgHealth = totalProjects > 0 ? Math.round((totalHealthScore / totalProjects) * 100) : 0
    
    return {
      summaryText: `共 ${totalProjects} 个项目，整体健康度 ${avgHealth}%`,
      metrics: {
        healthIndex: avgHealth,
        healthLabel: avgHealth >= 80 ? '良好' : avgHealth >= 60 ? '一般' : '需关注',
        personnelHealth: 0,
        fundReturnRatio: 0,
        deliveryEfficiencyLabel: ''
      },
      trend: {
        xAxis: [],
        plan: [],
        actual: []
      }
    }
  },

  async getRegionalData(region) {
    const projects = await this.getProjects()
    const riskProjects = await this.getRiskProjects(region)
    
    return {
      insightText: `区域 ${region} 共 ${projects.length} 个项目`,
      metrics: {
        activeProjects: projects.length,
        plannedDeliveryThisMonth: 0,
        deliveredThisMonth: 0,
        deliveredRatio: 0,
        riskProjects: riskProjects.length
      },
      projects: projects.slice(0, 10),
      riskProjects,
      resourceLoad: {
        categories: [],
        load: [],
        threshold: []
      }
    }
  },

  async getProjectUpdates() {
    // CSV数据暂不支持项目更新，返回空数组
    return []
  },

  async getWorkOrders() {
    // CSV数据暂不支持工单，返回空数组
    return []
  },

  async getAttributionData(kpi) {
    return {
      type: kpi || '',
      summary: '数据分析中...',
      factors: [],
      recommendations: []
    }
  }
}
