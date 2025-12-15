export const TEST_DATA_PATH = '@test_data'

export async function getProjects() {
  return [
    {
      id: 'urumqi',
      name: '乌鲁木齐',
      sector: '新疆',
      isWatched: true,
      series: [0, 0]
    }
  ]
}

export async function getKpis(projectId) {
  return [
    { title: '资金到账率', value: '0%', delta: '0%', up: true },
    { title: '任务完成率', value: '0%', delta: '0%', up: true },
    { title: '项目支出金额', value: '¥ 0', delta: '0', up: true },
    { title: '人员健康度', value: '0%', delta: '0%', up: true },
    { title: '逾期任务率', value: '0%', delta: '0%', up: true }
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
  return {
    members: []
  }
}

export async function getTaskData(projectId, kpi) {
  return {
    xAxis: [],
    actualRates: [],
    planRates: []
  }
}
