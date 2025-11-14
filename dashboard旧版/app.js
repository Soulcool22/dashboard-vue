(() => {
  const app = Vue.createApp({
    data() {
      return {
        expandedLeft: false,
        regularCollapsed: false,
        searchQuery: '',
        messages: [],
        projects: [
          { name: '项目A', sector: '工程', series: [65,72,68,75,71,82,79,87,74,81,78,85,73,88,82,90] },
          { name: '项目B', sector: '制造', series: [72,68,65,62,58,61,67,64,69,66,63,59,65,62,68,65] },
          { name: '项目C', sector: '研发', series: [62,68,65,72,69,75,71,78,74,80,76,82,79,85,81,87] },
          { name: '项目D', sector: '施工', series: [68,72,75,78,81,84,87,85,82,79,83,86,84,88,85,90] },
          { name: '项目E', sector: '采购', series: [75,71,78,74,81,77,84,80,76,83,79,86,82,88,85,89] },
          { name: '项目F', sector: '云计算', series: [65,69,73,76,80,83,87,84,81,78,82,85,88,86,89,90] },
          { name: '项目G', sector: '新能源', series: [62,66,70,74,77,81,84,88,85,82,86,89,87,90,88,85] },
          { name: '项目H', sector: '医疗', series: [70,73,76,79,82,85,88,86,84,87,89,85,82,86,88,90] }
        ],
        regulars: [
          { name: '项目1', sector: '通信', series: [72,75,78,81,84,87,85,88,86,89,87,90,88,85,87,90] },
          { name: '项目2', sector: '财务', series: [65,68,71,74,77,80,83,86,84,87,85,88,86,89,87,90] },
          { name: '项目3', sector: '主食', series: [82,79,76,73,70,74,77,80,78,81,84,82,85,88,86,89] },
          { name: '项目4', sector: '工业', series: [62,65,68,71,74,77,80,83,81,84,87,85,88,86,89,90] },
          { name: '项目5', sector: '云计算', series: [75,78,81,84,87,85,88,86,89,87,90,88,85,87,89,90] },
          { name: '项目6', sector: '智能制造', series: [68,71,74,77,80,83,86,84,87,85,88,86,89,87,90,88] },
          { name: '项目7', sector: '新能源', series: [70,73,76,79,82,85,88,86,89,87,90,88,85,87,89,86] },
          { name: '项目8', sector: '医疗', series: [72,75,78,81,84,87,85,88,86,89,87,90,88,85,87,90] },
          { name: '项目9', sector: '数字科技', series: [78,81,84,87,85,88,86,89,87,90,88,85,87,89,86,88] },
          { name: '项目10', sector: '供应链', series: [73,76,79,82,85,88,86,89,87,90,88,85,87,89,86,88] }
        ],
        kpis: [
          { title: '任务完成率', value: '76%', delta: '+3%', up: true },
          { title: '开工准点率', value: '78%', delta: '+2%', up: true },
          { title: '完工准点率', value: '81%', delta: '+1%', up: true },
          { title: '关键里程碑达成率', value: '72%', delta: '-3%', up: false },
          { title: '逾期任务率', value: '22%', delta: '-1%', up: true }
        ]
      };
    },
    methods: {
      toggleLeftExpand() { this.expandedLeft = !this.expandedLeft; },
      toggleRegularCollapsed() { this.regularCollapsed = !this.regularCollapsed; },
      lastValue(p) { const a = p.series; return a[a.length-1]; },
      deltaSign(p) { const a = p.series; return a[a.length-1] - a[a.length-2]; },
      deltaText(p) { const a = p.series; const prev = a[a.length-2]; const last = a[a.length-1]; const pct = prev ? ((last - prev)/prev*100).toFixed(2) : '0.00'; const s = (last - prev)>=0 ? '↑ ' : '↓ '; return s + Math.abs(pct) + '%'; },
      kDeltaText(k) { const s = k.up ? '↑ ' : '↓ '; const p = k.title === '关键里程碑达成率' ? '较计划 ' : '环比 '; return p + s + k.delta; },
      onSearch() { const v = (this.searchQuery||'').trim(); if(!v) return; this.pushMsg(v, 'user'); this.searchQuery=''; setTimeout(()=> this.reply(v), 400); },
      pushMsg(text, role){ this.messages.push({ text, role }); this.$nextTick(()=>{ const box = document.querySelector('.dialogue-list'); if(box) box.scrollTop = box.scrollHeight; }); },
      quickAsk(text){ if(!text) return; this.pushMsg(text, 'user'); setTimeout(()=> this.reply(text), 300); },
      reply(text){ const r = '占位回复：已记录问题“' + text + '”，将在接入真实数据后提供分析。'; this.pushMsg(r, 'ai'); }
    },
    mounted() {
      this.$nextTick(() => {
        this.pushMsg('你好，可点击下方假设问题或直接提问。', 'ai');
        this.projects.forEach((p, idx) => initSpark('wl-spark-'+idx, p.series));
        this.regulars.forEach((p, idx) => initSpark('rl-spark-'+idx, p.series));
        initCompletionLine();
        initBullet();
        initInfoTooltip();
      });
      window.addEventListener('resize', () => {
        this.projects.forEach((p, idx) => {
          const el = document.getElementById('wl-spark-'+idx); if(!el) return; const c = echarts.getInstanceByDom(el); if(c) c.resize();
        });
        this.regulars.forEach((p, idx) => {
          const el = document.getElementById('rl-spark-'+idx); if(!el) return; const c = echarts.getInstanceByDom(el); if(c) c.resize();
        });
        ['lineCompletion','bulletDuration'].forEach(id => { const el = document.getElementById(id); if(!el) return; const c = echarts.getInstanceByDom(el); if(c) c.resize(); });
      });
    }
  });
  app.use(ElementPlus);
  app.mount('#app');

  function initInfoTooltip(){
    const icons = document.querySelectorAll('.info-icon'); if(!icons.length) return;
    let bubble = null;
    function show(icon){ const tip = icon.getAttribute('data-tip'); if(!tip) return; hide(); bubble = document.createElement('div'); bubble.className='tooltip-bubble'; bubble.textContent = tip; document.body.appendChild(bubble); const rect = icon.getBoundingClientRect(); const bRect = bubble.getBoundingClientRect(); const top = rect.top + rect.height/2 - bRect.height/2; const left = rect.right + 8; bubble.style.top = top + 'px'; bubble.style.left = left + 'px'; }
    function hide(){ if(bubble && bubble.parentNode){ bubble.parentNode.removeChild(bubble); bubble = null; } }
    icons.forEach(icon => { icon.addEventListener('mouseenter', () => show(icon)); icon.addEventListener('mouseleave', hide); });
  }
  function initSpark(id, series) {
    const el = document.getElementById(id); if(!el || !window.echarts) return;
    const chart = echarts.init(el);
    const prev = series[series.length-2]; const last = series[series.length-1]; const isUp = (last - prev) >= 0;
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
      grid: { left: -8, right: 6, top: 4, bottom: 6 },
      xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: false }, data: series.map((_,i)=>i) },
      yAxis: { type: 'value', min: 50, max: 100, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: false } },
      series: [{ type: 'line', data: series, smooth: true, showSymbol: true, symbol: 'circle', symbolSize: 3, lineStyle: { width: 2, color: isUp ? '#16a34a' : '#dc2626' }, itemStyle: { color: isUp ? '#16a34a' : '#dc2626' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[ { offset: 0, color: isUp ? 'rgba(22,163,58,0.25)' : 'rgba(220,38,38,0.25)' }, { offset: 1, color: 'rgba(255,255,255,0)' } ]) }, markLine: { data: [{ yAxis: 80, lineStyle: { type: 'dashed', color: '#d1d5db', width: 1 } }], symbol: 'none', label: { show: false } } }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  function initCompletionLine(){
    const el = document.getElementById('lineCompletion'); if(!el || !window.echarts) return;
    const chart = echarts.init(el);
    const days = 60;
    function fmt(d){ const m = (d.getMonth()+1).toString().padStart(2,'0'); const day = d.getDate().toString().padStart(2,'0'); return m+'-'+day; }
    const dates = []; const base = new Date(); base.setHours(0,0,0,0);
    for(let i=days-1;i>=0;i--){ const d = new Date(base); d.setDate(base.getDate()-i); dates.push(fmt(d)); }
    const planStart = 0.12, planEnd = 0.98;
    const planRates = [];
    for(let i=0;i<days;i++){
      const t = i/(days-1);
      let rate;
      if(t < 0.15){ rate = planStart + (0.25 - planStart) * (t/0.15) * (t/0.15); }
      else if(t < 0.4){ const lt = (t - 0.15)/0.25; rate = 0.25 + (0.45 - 0.25) * (1 - Math.pow(1 - lt, 2.5)); }
      else if(t < 0.7){ const lt = (t - 0.4)/0.3; rate = 0.45 + (0.75 - 0.45) * lt * (2 - lt); }
      else { const lt = (t - 0.7)/0.3; rate = 0.75 + (planEnd - 0.75) * (1 - Math.pow(1 - lt, 1.5)); }
      const variation = (Math.sin(i * 0.3) * 0.02 + Math.sin(i * 0.7) * 0.01);
      planRates.push(Math.min(1, Math.max(0, rate + variation))); }
    const actualRates = [];
    for(let i=0;i<days;i++){
      const planRate = planRates[i]; let actualRate;
      if(i < 10){ const lag = 0.20 + 0.10 * (1 - i/10) + Math.sin(i * 0.5) * 0.03; actualRate = Math.max(0.02, planRate - lag); }
      else if(i < 25){ const cu = 0.15 - 0.08 * ((i - 10)/15) + Math.sin(i * 0.4) * 0.04; actualRate = Math.min(1, planRate - cu); }
      else if(i < 45){ const ph = Math.sin((i - 25) * 0.25) * 0.08; const tr = -0.05 + 0.15 * ((i - 25)/20); actualRate = Math.min(1, Math.max(0.1, planRate + tr + ph)); }
      else if(i < 65){ const sg = 0.08 + 0.12 * ((i - 45)/20) + Math.sin(i * 0.35) * 0.05; actualRate = Math.min(1, planRate + sg); }
      else { const mt = 0.15 + Math.sin((i - 65) * 0.4) * 0.06; actualRate = Math.min(1, planRate + mt); }
      if(i > 0 && actualRate < actualRates[i-1] * 0.85){ actualRate = actualRates[i-1] * 0.92; }
      actualRates.push(Math.max(0.01, actualRate)); }
    const axisLine = getComputedStyle(document.documentElement).getPropertyValue('--color-axis-line').trim() || '#d7dceb';
    const axisLabel = getComputedStyle(document.documentElement).getPropertyValue('--color-axis-label').trim() || '#6b7280';
    const gridLine = getComputedStyle(document.documentElement).getPropertyValue('--color-grid-line').trim() || '#eef1f7';
    const actualLine = getComputedStyle(document.documentElement).getPropertyValue('--color-actual-line').trim() || '#34d399';
    const areaStart = getComputedStyle(document.documentElement).getPropertyValue('--color-actual-area-start').trim() || 'rgba(52,211,153,0.32)';
    const areaEnd = getComputedStyle(document.documentElement).getPropertyValue('--color-actual-area-end').trim() || 'rgba(52,211,153,0.06)';
    const planLine = getComputedStyle(document.documentElement).getPropertyValue('--color-plan-line').trim() || '#94a3b8';
    const lineWidthActual = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-width-actual').trim()) || 2;
    const lineWidthPlan = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-width-plan').trim()) || 2;
    chart.setOption({
      legend: { top: 0, right: 16, itemGap: 10 },
      grid: { left: 50, right: 24, top: 40, bottom: 28 },
      xAxis: { type: 'category', data: dates, boundaryGap: false, axisLine: { lineStyle: { color: axisLine } }, axisTick: { show: false }, axisLabel: { color: axisLabel } },
      yAxis: { type: 'value', min: 0, max: 1, axisLine: { show: false }, splitLine: { show: true, lineStyle: { color: gridLine } }, axisLabel: { color: axisLabel, formatter: v => Math.round(v*100)+'%' } },
      dataZoom: [{ type: 'inside', start: 0, end: 100, filterMode: 'none' }],
      tooltip: { trigger: 'axis', formatter: function(params){ let a=null, p=null; params.forEach(x=>{ if(x.seriesName==='实际任务完成率') a=x.value; if(x.seriesName==='计划完成率') p=x.value; }); const lines = params.map(x=> x.seriesName + ': ' + (x.value*100).toFixed(1) + '%'); const diff = (a!=null && p!=null) ? ((a-p)*100).toFixed(1) + '%' : ''; const s = diff ? (parseFloat(diff)>0 ? '超前' : parseFloat(diff)<0 ? '落后' : '持平') : ''; return params[0].axisValue + '<br/>' + lines.join('<br/>') + (diff?('<br/>差异(实-计): ' + diff + ' ' + s):''); } },
      series: [
        { name: '实际任务完成率', type: 'line', data: actualRates, smooth: true, showSymbol: false, lineStyle: { width: lineWidthActual, color: actualLine }, emphasis: { focus: 'series', lineStyle: { width: lineWidthActual + 1 } }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[ { offset: 0, color: areaStart }, { offset: 1, color: areaEnd } ]) } },
        { name: '计划完成率', type: 'line', data: planRates, smooth: true, showSymbol: false, lineStyle: { width: lineWidthPlan + 0.5, color: planLine, type: 'dashed', opacity: 1, dashOffset: 0, cap: 'round' } }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  function initBullet(){
    const el = document.getElementById('bulletDuration'); if(!el || !window.echarts) return;
    const chart = echarts.init(el);
    const depts = ['深化','采购','生产','开发','实施'];
    const planDays = [11,7,13,10,8];
    const actualDays = [13,10,18,12,9];
    const diffDays = actualDays.map((v,i)=>Math.max(0, v - planDays[i]));
    const axisLine = getComputedStyle(document.documentElement).getPropertyValue('--color-axis-line').trim() || '#d7dceb';
    const axisLabel = getComputedStyle(document.documentElement).getPropertyValue('--color-axis-label').trim() || '#8a94a6';
    chart.setOption({
      legend: { top: 6, right: 10, textStyle: { color: axisLabel }, icon: 'roundRect' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: function(params){ const idx = params[0].dataIndex; const delta = actualDays[idx] - planDays[idx]; const rate = Math.round(actualDays[idx] / planDays[idx] * 100); const sign = delta >= 0 ? '+' : ''; return ['部门：'+depts[idx],'计划平均工期：'+planDays[idx]+' 天','实际平均工期：'+actualDays[idx]+' 天','工期比：'+rate+'%','差异：'+sign+delta+' 天'].join('<br/>'); } },
      grid: { left: 45, right: 75, top: 24, bottom: 32, containLabel: true },
      xAxis: { type: 'value', axisLine: { show: true, lineStyle: { color: axisLine } }, splitLine: { show: false }, axisLabel: { color: axisLabel } },
      yAxis: { type: 'category', data: depts, axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: '#2f3b52' } },
      series: [
        { name: '计划', type: 'bar', stack: 'total', data: planDays, barWidth: 22, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0,[ { offset: 0, color: '#f0f4f8' }, { offset: 1, color: '#e2e8f0' } ]), borderRadius: [6,0,0,6], shadowColor: 'rgba(0,0,0,0.04)', shadowBlur: 4 }, label: { show: true, position: 'inside', formatter: p => p.value + '天', color: '#4b5563', fontSize: 11, fontWeight: 500 }, emphasis: { focus: 'self', itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.18)' } }, animationEasing: 'cubicOut', animationDelay: idx => idx * 80, animationDuration: 600, animationDurationUpdate: 400 },
        { name: '实际超出', type: 'bar', stack: 'total', data: diffDays, barWidth: 22, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0,[ { offset: 0, color: '#ffb54d' }, { offset: 1, color: '#ff9a3d' } ]), borderRadius: [0,6,6,0], shadowColor: 'rgba(0,0,0,0.08)', shadowBlur: 4 }, label: { show: true, position: 'insideRight', formatter: p => p.value>0 ? ('+'+p.value+'天') : '', color: '#ffffff', fontSize: 11, fontWeight: 500 }, emphasis: { focus: 'self', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' } }, animationEasing: 'cubicOut', animationDelay: idx => idx * 80 + 40, animationDuration: 600, animationDurationUpdate: 400, universalTransition: true }
      ]
    });
    window.addEventListener('resize', () => chart.resize());
  }
})();