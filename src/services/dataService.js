 import urumqiTaskCsv from '../../test_data/template_test.csv?raw'
import urumqiPeopleCsvUrl from '../../test_data/template_test_people.csv?url'

export const TEST_DATA_PATH = '@test_data'

let __urumqiTasksCache = null
let __urumqiPeopleCache = null
let __urumqiPeopleCachePromise = null

function parseCsv(text) {
  if (!text) return []
  const s = String(text).replace(/^\uFEFF/, '')

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
  const header = rows[0].map(x => String(x || '').trim())
  const objects = []
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r]
    const obj = {}
    for (let c = 0; c < header.length; c++) {
      obj[header[c]] = (cols[c] != null ? String(cols[c]) : '').trim()
    }
    objects.push(obj)
  }
  return objects
}

function parseDateYmd(s) {
  const v = String(s || '').trim()
  if (!v) return null
  // 支持 2025-09-01 或 2025/9/1 格式
  const m = v.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
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
 
 function getUrumqiTasks() {
   if (__urumqiTasksCache) return __urumqiTasksCache
   const rows = parseCsv(urumqiTaskCsv)
   const tasks = rows.map(r => {
     const planStart = parseDateYmd(r['计划开始时间'])
     const actualStart = parseDateYmd(r['实际开始时间'])
     const planEnd = parseDateYmd(r['计划完成时间'])
     const actualEnd = parseDateYmd(r['实际完成时间'])
     const planDurationRaw = String(r['计划工期'] || '').trim()
     const actualDurationRaw = String(r['实际工期'] || '').trim()
     const planDuration = (planDurationRaw && Number.isFinite(Number(planDurationRaw))) ? Number(planDurationRaw) : null
     const actualDuration = (actualDurationRaw && Number.isFinite(Number(actualDurationRaw))) ? Number(actualDurationRaw) : null
     return {
       projectName: r['项目名称'] || '',
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
 }
 
 function getTasksByProject(projectId) {
   const pid = String(projectId || '').toLowerCase()
   if (pid === 'urumqi' || pid === '乌鲁木齐') return getUrumqiTasks()
   return []
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
         if (c.text.includes('项目名称') && c.text.includes('干系人')) {
           text = c.text
           picked = c.enc
           break
         }
       }

       if (!(text.includes('项目名称') && text.includes('干系人'))) {
         console.warn('[getUrumqiPeopleRows] header markers not found after decode; please save template_test_people.csv as UTF-8', { picked })
       }

       const rows = parseCsv(text)
       const looksOk = Array.isArray(rows) && rows.length && (Object.prototype.hasOwnProperty.call(rows[0], '项目名称') || Object.prototype.hasOwnProperty.call(rows[0], '干系人'))
       if (!looksOk) {
         console.warn('[getUrumqiPeopleRows] parsed rows do not contain expected headers; returning empty', { picked })
         return []
       }
       __urumqiPeopleCache = rows
       return rows
     } catch (e) {
       console.warn('[getUrumqiPeopleRows] failed', e)
       return []
     } finally {
       __urumqiPeopleCachePromise = null
     }
   })()

   return __urumqiPeopleCachePromise
 }
 
 function buildCompletionSeries(tasks) {
   const valid = tasks.filter(t => t.planEnd)
   const total = valid.length || 0
   if (!total) return { xAxis: [], actualRates: [], planRates: [] }
 
   const allPlanEnds = valid.map(t => t.planEnd)
   const allActualEnds = valid.map(t => t.actualEnd).filter(Boolean)
 
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
   const valid = tasks.filter(t => t.planEnd)
   const total = valid.length || 0
   if (!total) return { xAxis: [], actualRates: [], planRates: [] }
 
   const allPlanEnds = valid.map(t => t.planEnd)
   const allActualEnds = valid.map(t => t.actualEnd).filter(Boolean)
 
   const minDate = new Date(Math.min(...allPlanEnds.map(d => d.getTime())))
   const maxCandidates = [
     Math.max(...allPlanEnds.map(d => d.getTime())),
     allActualEnds.length ? Math.max(...allActualEnds.map(d => d.getTime())) : null,
     new Date().setHours(0, 0, 0, 0)
   ].filter(x => x != null)
   const maxDate = new Date(Math.max(...maxCandidates))
 
   const days = dateRangeInclusive(minDate, maxDate)
   const xAxis = days.map(d => formatMMDD(d))
 
   // 逾期任务：仅统计“当前逾期未完成”
   // 判定：计划完成时间 < 当天，且（实际完成时间为空 或 实际完成时间 > 当天）
   const actualRates = days.map(d => {
     const overdueCount = valid.filter(t => {
       if (t.status === '逾期完成') return false
       if (!t.planEnd) return false
       if (!(t.planEnd < d)) return false
       if (!t.actualEnd) return true
       return t.actualEnd > d
     }).length
     return overdueCount / total
   })
 
   // 计划任务完成率（与任务完成率图表一致）
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
     ? (startNow.rate - startPrev.rate)
     : 0

   const completeNow = computeCompleteRateWithTotal(now)
   const completePrev = computeCompleteRateWithTotal(prev)
   const completeOnTimeRate = completeNow.rate
   const completeOnTimeRateDelta = (completeNow.total > 0 && completePrev.total > 0)
     ? (completeNow.rate - completePrev.rate)
     : 0

   const durationNow = computeAvgDurationRatioWithTotal(now)
   const durationPrev = computeAvgDurationRatioWithTotal(prev)
   const avgDurationRatio = durationNow.avg
   const avgDurationRatioDelta = (durationNow.total > 0 && durationPrev.total > 0)
     ? (durationNow.avg - durationPrev.avg)
     : 0

   return {
     startOnTimeRate,
     startOnTimeRateDelta,
     completeOnTimeRate,
     completeOnTimeRateDelta,
     avgDurationRatio,
     avgDurationRatioDelta
   }
 }

export async function getProjects() {
  const urumqiOnTime = buildOnTimeMetrics(getTasksByProject('urumqi'))
  return [
    {
      id: 'urumqi',
      name: '乌鲁木齐',
      sector: '新疆',
      isWatched: true,
      series: [0, 0],
      expandedMetrics: urumqiOnTime
    }
  ]
}

export async function getKpis(projectId) {
  const tasks = getTasksByProject(projectId)
  const completion = buildCompletionSeries(tasks)
  const overdue = buildOverdueSeries(tasks)
 
  const completionLast = completion.actualRates.length ? completion.actualRates[completion.actualRates.length - 1] : 0
  const completionPlanLast = completion.planRates.length ? completion.planRates[completion.planRates.length - 1] : null
  const completionDelta = (completionPlanLast != null) ? Math.abs(completionLast - completionPlanLast) : 0
  const completionUp = (completionPlanLast != null) ? (completionLast - completionPlanLast) >= 0 : true
 
  const overdueLast = overdue.actualRates.length ? overdue.actualRates[overdue.actualRates.length - 1] : 0
  const overduePrev = overdue.actualRates.length > 1 ? overdue.actualRates[overdue.actualRates.length - 2] : overdueLast
  // 逾期率：下降是好事
  const overdueDelta = Math.abs(overdueLast - overduePrev)
  const overdueUp = (overdueLast - overduePrev) <= 0
 
  return [
    { title: '资金到账率', value: '0%', delta: '0%', up: true },
    { title: '任务完成率', value: Math.round(completionLast * 100) + '%', delta: Math.round(completionDelta * 100) + '%', up: completionUp },
    { title: '项目支出金额', value: '¥ 0', delta: '0', up: true },
    { title: '人员健康度', value: '0%', delta: '0%', up: true },
    { title: '逾期任务率', value: Math.round(overdueLast * 100) + '%', delta: Math.round(overdueDelta * 100) + '%', up: overdueUp }
  ]
}

export async function getRiskProjects(region) {
  return []
}

export async function getProjectSeries(projectId) {
  return []
}

export async function getCompanyInsights() {
  return {
    summaryText: '',
    metrics: {
      healthIndex: 0,
      healthLabel: '',
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
}

export async function getRegionalData(region) {
  return {
    insightText: '',
    metrics: {
      activeProjects: 0,
      plannedDeliveryThisMonth: 0,
      deliveredThisMonth: 0,
      deliveredRatio: 0,
      riskProjects: 0
    },
    projects: [],
    riskProjects: [],
    resourceLoad: {
      categories: [],
      load: [],
      threshold: []
    }
  }
}

export async function getProjectUpdates() {
  return []
}

export async function getWorkOrders() {
  return []
}

export async function getAttributionData(kpi) {
  return {
    type: '',
    summary: '',
    factors: [],
    recommendations: []
  }
}

export async function getFundData(projectId) {
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
}

export async function getExpenditureData(projectId) {
  return {
    totals: {
      totalBudget: 0,
      totalExpenditure: 0
    },
    monthlyTrend: {
      xAxis: [],
      personnel: [],
      labor: [],
      other: []
    },
    topExpenditures: []
  }
}

export async function getPersonnelData(projectId) {
  const pidRaw = String(projectId || '').trim()
  const pid = pidRaw.toLowerCase()
  const rows = await getUrumqiPeopleRows()

  function matchProject(row) {
    if (!pid) return true
    const rowPid = String(row['项目id'] || '').trim().toLowerCase()
    const rowName = String(row['项目名称'] || '').trim()
    if (rowPid && rowPid === pid) return true
    if (rowName && rowName === pidRaw) return true
    if ((pid === 'urumqi' || pidRaw === 'urumqi') && rowName === '乌鲁木齐') return true
    if ((pid === '乌鲁木齐') && rowPid === 'urumqi') return true
    return false
  }

  const scoped = rows.filter(matchProject)
  const byName = new Map()

  for (const r of scoped) {
    const name = String(r['干系人'] || '').trim()
    if (!name) continue
    const role = String(r['项目角色'] || '').trim()
    const projectName = String(r['项目名称'] || '').trim()

    let m = byName.get(name)
    if (!m) {
      m = { id: name, name, role: role || '', projectCount: 0, projects: [] }
      byName.set(name, m)
    }
    if (!m.role && role) m.role = role
    if (projectName && !m.projects.includes(projectName)) {
      m.projects.push(projectName)
      m.projectCount = m.projects.length
    }
    if (!projectName) {
      m.projectCount = Math.max(m.projectCount, 1)
    }
  }

  return { members: Array.from(byName.values()) }
}

export async function getTaskData(projectId, kpi) {
  const tasks = getTasksByProject(projectId)
  if (kpi === '任务完成率') {
    return buildCompletionSeries(tasks)
  }
  if (kpi === '逾期任务率') {
    return buildOverdueSeries(tasks)
  }
  return { xAxis: [], actualRates: [], planRates: [] }
}
