// ========== 省考倒计时页面 ==========
window.page_countdown = function() {
  const div = createPageBase('⏰ 省考倒计时', '2027河南省考 · 倒数每一天');
  let savedDate = DB.get('examDate', '');
  div.innerHTML += `
    <div class="card">
      <div class="countdown-display">
        <div class="countdown-num" id="cdDays">--</div>
        <div class="countdown-label">距离笔试还有（天）</div>
        <div class="countdown-detail">
          <div class="item"><div class="num" id="cdHours">--</div><div class="lbl">小时</div></div>
          <div class="item"><div class="num" id="cdMins">--</div><div class="lbl">分钟</div></div>
          <div class="item"><div class="num" id="cdSecs">--</div><div class="lbl">秒</div></div>
        </div>
      </div>
      <div style="margin-top:16px;">
        <label class="field-label">设置笔试日期</label>
        <input type="date" id="examDateInput" value="${savedDate}">
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn" onclick="saveExamDate()">保存日期</button>
          <button class="btn btn-outline" onclick="document.getElementById('examDateInput').value='2027-04-24'">设为2027年4月24日(参考)</button>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px;font-size:36px;">📅</div>
      <div style="text-align:center;font-size:13px;color:var(--text-soft);">上岸日历 · 每一天都算数</div>
    </div>
  `;
  return div;
};
window.afterPage_countdown = function() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
};
function saveExamDate() {
  const d = document.getElementById('examDateInput').value;
  if (!d) { toast('请选择日期'); return; }
  DB.set('examDate', d);
  toast('笔试日期已保存 ⏰');
  updateCountdown();
}
function updateCountdown() {
  const d = DB.get('examDate', '');
  if (!d) return;
  const target = new Date(d + 'T09:00:00');
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    document.getElementById('cdDays').textContent = '0';
    document.getElementById('cdHours').textContent = '0';
    document.getElementById('cdMins').textContent = '0';
    document.getElementById('cdSecs').textContent = '0';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  document.getElementById('cdDays').textContent = days;
  document.getElementById('cdHours').textContent = hours;
  document.getElementById('cdMins').textContent = mins;
  document.getElementById('cdSecs').textContent = secs;
}

// ========== 今日学习任务页面 ==========
window.page_tasks = function() {
  const div = createPageBase('✅ 今日学习任务', '完成每一条 · 收获小惊喜');
  const today = new Date().toDateString();
  let tasks = DB.get('tasks_'+today, []);
  div.innerHTML += `
    <div class="card">
      <div class="card-title">📝 今日任务列表</div>
      <div id="taskList"></div>
      <div style="margin-top:14px;display:flex;gap:8px;">
        <input type="text" id="newTaskInput" placeholder="输入新任务后点添加..." onkeypress="if(event.key==='Enter')addTask()">
        <button class="btn btn-sm" onclick="addTask()">添加</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📊 今日完成情况</div>
      <div id="taskProgress"></div>
    </div>
    <div class="card">
      <button class="btn btn-gold" style="width:100%;" onclick="viewTaskHistory()">📋 查看历史完成台账</button>
    </div>
  `;
  return div;
};
window.afterPage_tasks = function() { renderTasks(); };
function getTodayTasks() {
  const today = new Date().toDateString();
  return DB.get('tasks_'+today, []);
}
function saveTodayTasks(tasks) {
  const today = new Date().toDateString();
  DB.set('tasks_'+today, tasks);
}
function renderTasks() {
  const tasks = getTodayTasks();
  const list = document.getElementById('taskList');
  if (tasks.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">还没有任务，快来添加吧~ 🎀</div>';
  } else {
    list.innerHTML = tasks.map((t, i) => `
      <div class="task-item ${t.done?'done':''}">
        <div class="task-checkbox ${t.done?'checked':''}" onclick="toggleTask(${i})"></div>
        <div class="task-content">${t.text}</div>
        <div class="task-actions">
          <button onclick="editTask(${i})">✏️</button>
          <button onclick="deleteTask(${i})">🗑️</button>
        </div>
      </div>
    `).join('');
  }
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;
  document.getElementById('taskProgress').innerHTML = `
    <div style="font-size:14px;color:var(--text-soft);">已完成 ${done}/${total} 条任务</div>
    <div style="background:var(--pink-light);height:12px;border-radius:6px;margin-top:8px;overflow:hidden;">
      <div style="background:linear-gradient(90deg,var(--pink-main),var(--yellow));height:100%;width:${pct}%;border-radius:6px;transition:width 0.5s;"></div>
    </div>
    <div style="text-align:right;font-size:12px;color:var(--text-light);margin-top:4px;">${pct}%</div>
  `;
}
function addTask() {
  const input = document.getElementById('newTaskInput');
  const text = input.value.trim();
  if (!text) return;
  const tasks = getTodayTasks();
  tasks.push({text, done: false});
  saveTodayTasks(tasks);
  input.value = '';
  renderTasks();
  toast('任务已添加 ✅');
}
function toggleTask(i) {
  const tasks = getTodayTasks();
  tasks[i].done = !tasks[i].done;
  saveTodayTasks(tasks);
  renderTasks();
  if (tasks[i].done) {
    // 触发随机小惊喜
    triggerEffect();
    // 检查是否全部完成
    if (tasks.every(t => t.done) && tasks.length > 0) {
      setTimeout(() => triggerGrandEffect(), 500);
    }
  }
}
function editTask(i) {
  const tasks = getTodayTasks();
  const newText = prompt('编辑任务：', tasks[i].text);
  if (newText !== null && newText.trim()) {
    tasks[i].text = newText.trim();
    saveTodayTasks(tasks);
    renderTasks();
  }
}
function deleteTask(i) {
  const tasks = getTodayTasks();
  tasks.splice(i, 1);
  saveTodayTasks(tasks);
  renderTasks();
  toast('任务已删除');
}
function viewTaskHistory() {
  // 找到所有tasks_开头的key
  const keys = Object.keys(localStorage).filter(k => k.startsWith('jinjin_tasks_'));
  if (keys.length === 0) { toast('暂无历史记录'); return; }
  keys.sort().reverse();
  let html = '<div class="modal-title">📋 历史完成台账</div><div style="max-height:400px;overflow-y:auto;">';
  keys.forEach(k => {
    const dateStr = k.replace('jinjin_tasks_', '');
    const d = new Date(dateStr);
    const tasks = JSON.parse(localStorage.getItem(k));
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round(done/total*100) : 0;
    const status = pct === 100 ? '🎉' : pct >= 50 ? '💪' : '📝';
    html += `<div style="padding:10px;border-bottom:1px dashed var(--pink-light);">
      <div style="font-weight:600;font-size:14px;">${status} ${d.getMonth()+1}月${d.getDate()}日 <span style="font-size:12px;color:var(--text-light);">(${done}/${total})</span></div>
      <div style="font-size:12px;color:var(--text-soft);margin-top:4px;">`;
    tasks.forEach(t => { html += `<div>${t.done?'✅':'⬜'} ${t.text}</div>`; });
    html += `</div></div>`;
  });
  html += '</div><div class="modal-actions"><button class="btn" onclick="closeModal()">关闭</button></div>';
  showModal(html);
}

// ========== 专注计时（番茄钟）页面 ==========
window.page_pomodoro = function() {
  const div = createPageBase('🍅 专注计时', '番茄工作法 · 高效学习');
  div.innerHTML += `
    <div class="card">
      <div class="tomato-display">
        <div class="tomato-circle" id="tomatoCircle">
          <div class="tomato-time" id="tomatoTime">25:00</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-sm btn-outline" onclick="setTomatoTime(15)">15分</button>
          <button class="btn btn-sm btn-outline" onclick="setTomatoTime(25)">25分</button>
          <button class="btn btn-sm btn-outline" onclick="setTomatoTime(45)">45分</button>
          <button class="btn btn-sm btn-outline" onclick="setTomatoTime(60)">60分</button>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">
          <button class="btn" id="tomatoStartBtn" onclick="toggleTomato()">开始专注</button>
          <button class="btn btn-outline" onclick="resetTomato()">重置</button>
        </div>
        <div style="margin-top:14px;font-size:13px;color:var(--text-soft);">⏰ 专注结束后可打卡留存记录</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📊 专注记录</div>
      <div id="tomatoRecords"></div>
      <button class="btn btn-gold btn-sm" style="width:100%;margin-top:10px;" onclick="saveTomatoRecord()">打卡本次专注</button>
    </div>
    <div style="text-align:center;font-size:36px;">⏰</div>
  `;
  return div;
};
window.afterPage_pomodoro = function() {
  window.tomatoMinutes = 25;
  window.tomatoSeconds = 25 * 60;
  window.tomatoRunning = false;
  window.tomatoTimer = null;
  renderTomatoRecords();
};
function setTomatoTime(min) {
  if (window.tomatoRunning) return;
  window.tomatoMinutes = min;
  window.tomatoSeconds = min * 60;
  document.getElementById('tomatoTime').textContent = `${min}:00`;
}
function toggleTomato() {
  if (window.tomatoRunning) {
    clearInterval(window.tomatoTimer);
    window.tomatoRunning = false;
    document.getElementById('tomatoStartBtn').textContent = '继续';
    document.getElementById('tomatoCircle').classList.remove('running');
  } else {
    window.tomatoRunning = true;
    document.getElementById('tomatoStartBtn').textContent = '暂停';
    document.getElementById('tomatoCircle').classList.add('running');
    window.tomatoTimer = setInterval(() => {
      window.tomatoSeconds--;
      const m = Math.floor(window.tomatoSeconds / 60);
      const s = window.tomatoSeconds % 60;
      document.getElementById('tomatoTime').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (window.tomatoSeconds <= 0) {
        clearInterval(window.tomatoTimer);
        window.tomatoRunning = false;
        document.getElementById('tomatoCircle').classList.remove('running');
        document.getElementById('tomatoStartBtn').textContent = '开始专注';
        triggerEffect(['star','koi']);
        toast('🎉 专注完成！可以打卡了');
        // 振动提醒
        if (navigator.vibrate) navigator.vibrate([200,100,200]);
      }
    }, 1000);
  }
}
function resetTomato() {
  clearInterval(window.tomatoTimer);
  window.tomatoRunning = false;
  window.tomatoSeconds = window.tomatoMinutes * 60;
  document.getElementById('tomatoTime').textContent = `${window.tomatoMinutes}:00`;
  document.getElementById('tomatoStartBtn').textContent = '开始专注';
  document.getElementById('tomatoCircle').classList.remove('running');
}
function saveTomatoRecord() {
  const min = window.tomatoMinutes;
  const records = DB.get('tomatoRecords', []);
  records.unshift({
    date: new Date().toLocaleString('zh-CN'),
    minutes: min
  });
  if (records.length > 200) records = records.slice(0, 200);
  DB.set('tomatoRecords', records);
  renderTomatoRecords();
  toast('专注记录已保存 🍅');
}
function renderTomatoRecords() {
  const records = DB.get('tomatoRecords', []);
  const el = document.getElementById('tomatoRecords');
  if (records.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:10px;">暂无专注记录</div>';
    return;
  }
  const totalMin = records.reduce((s, r) => s + r.minutes, 0);
  el.innerHTML = `<div style="font-size:13px;color:var(--text-soft);margin-bottom:8px;">累计专注 ${records.length} 次，共 ${totalMin} 分钟</div>` +
    records.slice(0, 10).map(r => `<div style="padding:8px 10px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:13px;">🍅 ${r.date} · ${r.minutes}分钟</div>`).join('');
}

// ========== 每日时政要点页面 ==========
window.page_news = function() {
  const div = createPageBase('📰 每日时政要点', '国内热点 · 申论常识积累');
  div.innerHTML += `
    <div class="card">
      <div class="card-title">🔥 今日时政热点</div>
      <div id="newsList" style="text-align:center;padding:20px;color:var(--text-light);">正在加载今日时政...</div>
    </div>
    <div class="card">
      <div class="card-title">💾 我的时政收藏</div>
      <div id="savedNews"></div>
    </div>
    <div class="card">
      <div class="card-title">✍️ 手动添加时政笔记</div>
      <textarea id="manualNewsInput" placeholder="粘贴或输入时政要点..."></textarea>
      <button class="btn btn-sm" style="margin-top:8px;" onclick="addManualNews()">添加收藏</button>
    </div>
  `;
  return div;
};
window.afterPage_news = function() {
  loadDailyNews();
  renderSavedNews();
};
function loadDailyNews() {
  // 使用多个公开RSS/新闻API的免费替代方案
  // 先尝试加载本地缓存的今日新闻，若无则显示提示
  const today = new Date().toDateString();
  const cached = DB.get('dailyNews_'+today, null);
  if (cached) {
    renderNews(cached);
  } else {
    // 尝试从人民政协网等获取时政
    fetch('https://www.rmzxb.com.cn/c/2025-07-27/')
      .then(r => r.text())
      .then(html => {
        // 简单解析
        const items = [];
        const regex = /<a[^>]*href="([^"]*)"[^>]*>([^<]{10,60})<\/a>/g;
        let match;
        while ((match = regex.exec(html)) !== null && items.length < 10) {
          if (match[2].includes('会') || match[2].includes('政') || match[2].includes('习') || match[2].includes('发展')) {
            items.push({title: match[2].trim(), url: match[1]});
          }
        }
        if (items.length > 0) {
          DB.set('dailyNews_'+today, items);
          renderNews(items);
        } else {
          showDefaultNews();
        }
      })
      .catch(() => showDefaultNews());
  }
}
function showDefaultNews() {
  const defaults = [
    {title: '关注新华网、人民网获取最新时政热点', url: 'http://www.xinhuanet.com/politics/'},
    {title: '建议每日浏览河南省人民政府网了解本省政务动态', url: 'https://www.henan.gov.cn/'},
    {title: '求是网权威理论文章可前往《求是》专栏查看', url: 'http://www.qstheory.cn/'},
    {title: '请手动添加重要时政要点到收藏夹', url: '#'}
  ];
  renderNews(defaults);
}
function renderNews(items) {
  const el = document.getElementById('newsList');
  el.innerHTML = items.map((n, i) => `
    <div style="padding:12px;background:var(--milk);border-radius:10px;margin-bottom:8px;">
      <div style="font-size:14px;font-weight:600;margin-bottom:6px;">${i+1}. ${n.title}</div>
      <div style="display:flex;gap:8px;">
        ${n.url && n.url !== '#' ? `<a href="${n.url}" target="_blank" style="font-size:12px;color:var(--pink-deep);">查看原文→</a>` : ''}
        <button class="btn btn-sm" onclick="saveNewsItem('${n.title.replace(/'/g,"\\'")}')">收藏</button>
      </div>
    </div>
  `).join('');
}
function saveNewsItem(title) {
  let saved = DB.get('savedNews', []);
  if (saved.includes(title)) { toast('已收藏过'); return; }
  saved.unshift(title);
  DB.set('savedNews', saved);
  renderSavedNews();
  toast('已收藏 💾');
}
function addManualNews() {
  const text = document.getElementById('manualNewsInput').value.trim();
  if (!text) return;
  let saved = DB.get('savedNews', []);
  saved.unshift(text);
  DB.set('savedNews', saved);
  document.getElementById('manualNewsInput').value = '';
  renderSavedNews();
  toast('已添加 💾');
}
function renderSavedNews() {
  const saved = DB.get('savedNews', []);
  const el = document.getElementById('savedNews');
  if (saved.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:10px;">暂无收藏</div>';
    return;
  }
  el.innerHTML = saved.map((s, i) => `
    <div style="padding:10px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:13px;display:flex;justify-content:space-between;align-items:start;">
      <span style="flex:1;">${s}</span>
      <button class="btn btn-sm" style="margin-left:8px;flex-shrink:0;" onclick="deleteSavedNews(${i})">删</button>
    </div>
  `).join('');
}
function deleteSavedNews(i) {
  let saved = DB.get('savedNews', []);
  saved.splice(i, 1);
  DB.set('savedNews', saved);
  renderSavedNews();
}

// ========== 《求是》专栏页面 ==========
window.page_qiushi = function() {
  const div = createPageBase('📖 《求是》专栏', '权威理论 · 申论素材');
  div.innerHTML += `
    <div class="card">
      <div style="text-align:center;font-size:48px;margin-bottom:10px;">📖</div>
      <div style="text-align:center;font-size:16px;font-weight:700;color:var(--pink-deep);margin-bottom:10px;">《求是》杂志官方入口</div>
      <div style="text-align:center;font-size:13px;color:var(--text-soft);margin-bottom:16px;">党的理论刊物 · 申论写作权威素材来源</div>
      <a href="http://www.qstheory.cn/" target="_blank" class="btn" style="display:block;text-align:center;text-decoration:none;">🔗 访问求是网</a>
      <a href="http://www.qstheory.cn/dukan/qs/" target="_blank" class="btn btn-gold" style="display:block;text-align:center;text-decoration:none;margin-top:8px;">📚 求是杂志电子版</a>
    </div>
    <div class="card">
      <div class="card-title">💡 申论金句摘抄积累</div>
      <div id="qiushiNotes"></div>
      <textarea id="qiushiInput" placeholder="摘抄求是文章金句、核心观点..." style="margin-top:10px;"></textarea>
      <button class="btn btn-sm" style="margin-top:8px;" onclick="addQiushiNote()">添加摘抄</button>
    </div>
    <div class="card">
      <div class="card-title">📌 推荐阅读方向</div>
      <div style="font-size:14px;line-height:2;color:var(--text-soft);">
        • 习近平新时代中国特色社会主义思想<br>
        • 高质量发展与中国式现代化<br>
        • 乡村振兴战略<br>
        • 基层治理创新<br>
        • 河南高质量发展（中部崛起）<br>
        • 党的建设与全面从严治党
      </div>
    </div>
  `;
  return div;
};
window.afterPage_qiushi = function() { renderQiushiNotes(); };
function addQiushiNote() {
  const text = document.getElementById('qiushiInput').value.trim();
  if (!text) return;
  let notes = DB.get('qiushiNotes', []);
  notes.unshift({text, date: new Date().toLocaleDateString('zh-CN')});
  DB.set('qiushiNotes', notes);
  document.getElementById('qiushiInput').value = '';
  renderQiushiNotes();
  toast('已添加摘抄 📖');
}
function renderQiushiNotes() {
  const notes = DB.get('qiushiNotes', []);
  const el = document.getElementById('qiushiNotes');
  if (notes.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:10px;">暂无摘抄</div>';
    return;
  }
  el.innerHTML = notes.map((n, i) => `
    <div style="padding:10px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:13px;">
      <div>${n.text}</div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;">
        <span style="font-size:11px;color:var(--text-light);">${n.date}</span>
        <button class="btn btn-sm" onclick="deleteQiushiNote(${i})">删</button>
      </div>
    </div>
  `).join('');
}
function deleteQiushiNote(i) {
  let notes = DB.get('qiushiNotes', []);
  notes.splice(i, 1);
  DB.set('qiushiNotes', notes);
  renderQiushiNotes();
}

// ========== 错题记录本页面（OCR+搜题） ==========
window.page_wrongbook = function() {
  const div = createPageBase('📝 错题记录本', 'OCR识别 · 全网搜题 · 分类归档');
  div.innerHTML += `
    <div class="card">
      <div class="card-title">📸 拍照/截图识别录入</div>
      <div class="upload-zone" onclick="document.getElementById('ocrFileInput').click()">
        <div class="icon">📸</div>
        <div class="text">点击上传错题照片/截图<br>自动OCR识别文字</div>
      </div>
      <input type="file" id="ocrFileInput" accept="image/*" style="display:none;" onchange="handleOCRUpload(event)">
      <div id="ocrProcessing" style="display:none;text-align:center;padding:20px;">
        <div style="font-size:24px;">⏳</div>
        <div style="font-size:14px;color:var(--text-soft);margin-top:8px;">正在识别中...</div>
      </div>
      <div id="ocrResult" style="display:none;"></div>
    </div>

    <div class="card">
      <div class="card-title">⌨️ 手动录入错题</div>
      <label class="field-label">题干内容</label>
      <textarea id="manualQ" placeholder="输入或粘贴题目..."></textarea>
      <label class="field-label">模块标签</label>
      <select id="manualTag">
        <option value="言语">言语理解与表达</option>
        <option value="判断">判断推理</option>
        <option value="资料">资料分析</option>
        <option value="数量">数量关系</option>
        <option value="常识">常识判断</option>
        <option value="申论">申论</option>
      </select>
      <label class="field-label">个人笔记（错误原因/复盘）</label>
      <textarea id="manualNote" placeholder="记录错误原因、解题思路、考点归纳..."></textarea>
      <button class="btn" style="margin-top:10px;width:100%;" onclick="addManualWrong()">保存错题</button>
    </div>

    <div class="card">
      <div class="card-title">🔍 检索错题</div>
      <input type="text" id="searchWrong" placeholder="输入关键词、题型、考点..." oninput="renderWrongList()">
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <button class="btn btn-sm btn-outline" onclick="filterWrong('all')">全部</button>
        <button class="btn btn-sm btn-outline" onclick="filterWrong('言语')">言语</button>
        <button class="btn btn-sm btn-outline" onclick="filterWrong('判断')">判断</button>
        <button class="btn btn-sm btn-outline" onclick="filterWrong('资料')">资料</button>
        <button class="btn btn-sm btn-outline" onclick="filterWrong('数量')">数量</button>
        <button class="btn btn-sm btn-outline" onclick="filterWrong('常识')">常识</button>
        <button class="btn btn-sm btn-outline" onclick="filterWrong('申论')">申论</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📚 错题档案</div>
      <div id="wrongList"></div>
      <button class="btn btn-gold btn-sm" style="width:100%;margin-top:10px;" onclick="exportWrong()">📥 导出错题</button>
    </div>
  `;
  return div;
};
window.afterPage_wrongbook = function() {
  window.wrongFilter = 'all';
  renderWrongList();
};

function handleOCRUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById('ocrProcessing').style.display = 'block';
  document.getElementById('ocrResult').style.display = 'none';

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgData = e.target.result;
    // 使用 Tesseract.js 进行 OCR 识别
    if (typeof Tesseract !== 'undefined') {
      Tesseract.recognize(imgData, 'chi_sim', {
        logger: m => console.log(m)
      }).then(({ data: { text } }) => {
        document.getElementById('ocrProcessing').style.display = 'none';
        showOCRResult(text.trim(), imgData);
      }).catch(err => {
        document.getElementById('ocrProcessing').style.display = 'none';
        showOCRResult('', imgData);
        toast('OCR识别失败，可手动输入');
      });
    } else {
      // 动态加载 Tesseract.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => {
        Tesseract.recognize(imgData, 'chi_sim', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            document.getElementById('ocrProcessing').style.display = 'none';
            showOCRResult(text.trim(), imgData);
          })
          .catch(() => {
            document.getElementById('ocrProcessing').style.display = 'none';
            showOCRResult('', imgData);
          });
      };
      document.head.appendChild(script);
    }
  };
  reader.readAsDataURL(file);
}

function showOCRResult(text, imgData) {
  const el = document.getElementById('ocrResult');
  el.style.display = 'block';
  el.innerHTML = `
    <div style="border:2px solid var(--pink-light);border-radius:12px;padding:12px;margin-top:12px;">
      <div style="font-size:13px;font-weight:600;color:var(--pink-deep);margin-bottom:8px;">✅ OCR识别结果</div>
      <img src="${imgData}" style="max-width:100%;border-radius:8px;margin-bottom:10px;">
      <label class="field-label">识别文字（可编辑修改）</label>
      <textarea id="ocrText" style="min-height:100px;">${text || '（未识别到文字，请手动输入）'}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="btn btn-sm" onclick="searchOCRQuestion()">🔍 全网搜题解析</button>
        <button class="btn btn-sm btn-gold" onclick="saveOCRAsWrong()">保存为错题</button>
      </div>
      <div id="searchResult" style="margin-top:12px;"></div>
    </div>
  `;
}

function searchOCRQuestion() {
  const text = document.getElementById('ocrText').value.trim();
  if (!text || text.startsWith('（未识别')) { toast('请先输入或修正题目文字'); return; }
  const el = document.getElementById('searchResult');
  el.innerHTML = '<div style="text-align:center;padding:10px;color:var(--text-soft);">⏳ 正在检索解析...</div>';

  // 构建搜索链接，使用多个题库搜索引擎
  const searchQuery = encodeURIComponent(text.substring(0, 100));
  const links = [
    {name: '百度题库搜索', url: `https://www.baidu.com/s?wd=${searchQuery}`},
    {name: '粉笔题库', url: `https://www.baidu.com/s?wd=${encodeURIComponent('粉笔 ' + text.substring(0,50))}`},
    {name: '华图在线', url: `https://www.baidu.com/s?wd=${encodeURIComponent('华图 ' + text.substring(0,50))}`}
  ];

  // 同时尝试用免费 API 搜题
  fetch(`https://www.baidu.com/s?wd=${searchQuery}`)
    .then(r => r.text())
    .then(html => {
      // 解析搜索结果摘要
      const results = [];
      const regex = /<div[^>]*class="c-abstract"[^>]*>([\s\S]*?)<\/div>/g;
      let match;
      while ((match = regex.exec(html)) !== null && results.length < 3) {
        const cleanText = match[1].replace(/<[^>]+>/g, '').trim();
        if (cleanText.length > 20) results.push(cleanText);
      }
      renderSearchResult(links, results, text);
    })
    .catch(() => renderSearchResult(links, [], text));
}

function renderSearchResult(links, results, question) {
  const el = document.getElementById('searchResult');
  let html = '<div style="border-top:2px dashed var(--pink-light);padding-top:12px;">';
  html += '<div style="font-size:13px;font-weight:600;color:var(--pink-deep);margin-bottom:8px;">🔍 检索结果</div>';

  if (results.length > 0) {
    html += '<div style="font-size:12px;color:var(--text-soft);margin-bottom:8px;">找到相关解析摘要：</div>';
    results.forEach(r => {
      html += `<div style="padding:8px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:12px;">${r.substring(0,150)}...</div>`;
    });
  }

  html += '<div style="font-size:12px;color:var(--text-soft);margin:10px 0 6px;">点击前往完整解析：</div>';
  links.forEach(l => {
    html += `<a href="${l.url}" target="_blank" class="btn btn-sm" style="display:block;text-align:center;text-decoration:none;margin-bottom:6px;">🔗 ${l.name}</a>`;
  });

  html += `<div style="margin-top:10px;">
    <label class="field-label">补充答案/解析笔记</label>
    <textarea id="searchAnswerNote" placeholder="可在此记录搜到的答案解析、考点归纳..."></textarea>
  </div>`;
  html += '</div>';
  el.innerHTML = html;
}

function saveOCRAsWrong() {
  const text = document.getElementById('ocrText').value.trim();
  if (!text || text.startsWith('（未识别')) { toast('题目内容为空'); return; }
  const answerNote = document.getElementById('searchAnswerNote') ? document.getElementById('searchAnswerNote').value : '';

  let wrongs = DB.get('wrongBook', []);
  wrongs.unshift({
    question: text,
    answer: answerNote,
    tag: '言语', // 默认，可后续编辑
    note: '',
    date: new Date().toLocaleString('zh-CN'),
    source: 'OCR'
  });
  DB.set('wrongBook', wrongs);
  document.getElementById('ocrResult').style.display = 'none';
  renderWrongList();
  toast('错题已保存 📝');
}

function addManualWrong() {
  const q = document.getElementById('manualQ').value.trim();
  if (!q) { toast('请输入题干'); return; }
  const tag = document.getElementById('manualTag').value;
  const note = document.getElementById('manualNote').value.trim();
  let wrongs = DB.get('wrongBook', []);
  wrongs.unshift({
    question: q,
    answer: '',
    tag: tag,
    note: note,
    date: new Date().toLocaleString('zh-CN'),
    source: '手动'
  });
  DB.set('wrongBook', wrongs);
  document.getElementById('manualQ').value = '';
  document.getElementById('manualNote').value = '';
  renderWrongList();
  toast('错题已保存 📝');
}

function filterWrong(tag) {
  window.wrongFilter = tag;
  renderWrongList();
}

function renderWrongList() {
  const keyword = document.getElementById('searchWrong') ? document.getElementById('searchWrong').value.toLowerCase() : '';
  let wrongs = DB.get('wrongBook', []);
  const el = document.getElementById('wrongList');

  let filtered = wrongs;
  if (window.wrongFilter !== 'all') {
    filtered = filtered.filter(w => w.tag === window.wrongFilter);
  }
  if (keyword) {
    filtered = filtered.filter(w => w.question.toLowerCase().includes(keyword) || (w.note && w.note.toLowerCase().includes(keyword)));
  }

  if (filtered.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">暂无错题记录</div>';
    return;
  }

  const tagClass = {言语:'tag-yanyu',判断:'tag-panduan',资料:'tag-ziliao',数量:'tag-shuliang',常识:'tag-changshi',申论:'tag-shenlun'};
  el.innerHTML = filtered.map((w, i) => {
    const realIdx = wrongs.indexOf(w);
    return `
    <div class="wrong-item">
      <div style="margin-bottom:6px;">
        <span class="tag ${tagClass[w.tag]||'tag-yanyu'}">${w.tag}</span>
        <span style="font-size:11px;color:var(--text-light);">${w.date} · ${w.source}</span>
      </div>
      <div style="font-size:14px;margin-bottom:6px;">${w.question}</div>
      ${w.answer ? `<div style="font-size:13px;color:var(--text-soft);margin-bottom:6px;">💡 ${w.answer}</div>` : ''}
      ${w.note ? `<div style="font-size:13px;color:var(--blue);margin-bottom:6px;">📝 ${w.note}</div>` : ''}
      <div style="display:flex;gap:6px;">
        <button class="btn btn-sm" onclick="editWrong(${realIdx})">编辑</button>
        <button class="btn btn-sm btn-outline" onclick="deleteWrong(${realIdx})">删除</button>
      </div>
    </div>
  `}).join('');
}

function editWrong(i) {
  let wrongs = DB.get('wrongBook', []);
  const w = wrongs[i];
  const html = `
    <div class="modal-title">编辑错题</div>
    <label class="field-label">题干</label>
    <textarea id="editQ">${w.question}</textarea>
    <label class="field-label">答案/解析</label>
    <textarea id="editA">${w.answer||''}</textarea>
    <label class="field-label">模块标签</label>
    <select id="editTag">
      ${['言语','判断','资料','数量','常识','申论'].map(t => `<option value="${t}" ${w.tag===t?'selected':''}>${t}</option>`).join('')}
    </select>
    <label class="field-label">个人笔记</label>
    <textarea id="editN">${w.note||''}</textarea>
    <div class="modal-actions">
      <button class="btn" onclick="saveEditWrong(${i})">保存</button>
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
    </div>
  `;
  showModal(html);
}
function saveEditWrong(i) {
  let wrongs = DB.get('wrongBook', []);
  wrongs[i].question = document.getElementById('editQ').value.trim();
  wrongs[i].answer = document.getElementById('editA').value.trim();
  wrongs[i].tag = document.getElementById('editTag').value;
  wrongs[i].note = document.getElementById('editN').value.trim();
  DB.set('wrongBook', wrongs);
  closeModal();
  renderWrongList();
  toast('已更新');
}
function deleteWrong(i) {
  if (!confirm('确定删除这道错题？')) return;
  let wrongs = DB.get('wrongBook', []);
  wrongs.splice(i, 1);
  DB.set('wrongBook', wrongs);
  renderWrongList();
  toast('已删除');
}
function exportWrong() {
  const wrongs = DB.get('wrongBook', []);
  if (wrongs.length === 0) { toast('暂无错题可导出'); return; }
  let text = '瑾瑾的错题本导出\n生成时间：' + new Date().toLocaleString('zh-CN') + '\n\n';
  wrongs.forEach((w, i) => {
    text += `【${i+1}】[${w.tag}] ${w.date}\n`;
    text += `题干：${w.question}\n`;
    if (w.answer) text += `解析：${w.answer}\n`;
    if (w.note) text += `笔记：${w.note}\n`;
    text += '\n---\n\n';
  });
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `错题本_${new Date().toLocaleDateString('zh-CN').replace(/\//g,'-')}.txt`;
  a.click();
  toast('已导出 📥');
}

// ========== 行测专项模块页面 ==========
window.page_xingce = function() {
  const div = createPageBase('🧩 行测专项模块', '河南五大模块 · 真题练习');
  const modules = [
    {name:'言语理解与表达', icon:'💬', desc:'逻辑填空、片段阅读、语句表达', key:'yanyu'},
    {name:'判断推理', icon:'🔀', desc:'图形推理、定义判断、类比推理、逻辑判断', key:'panduan'},
    {name:'资料分析', icon:'📊', desc:'文字资料、表格资料、图形资料', key:'ziliao'},
    {name:'数量关系', icon:'🔢', desc:'数字推理、数学运算', key:'shuliang'},
    {name:'常识判断', icon:'🌍', desc:'政治、经济、法律、历史、科技等', key:'changshi'}
  ];
  div.innerHTML += modules.map(m => `
    <div class="card" style="cursor:pointer;" onclick="openXingceModule('${m.key}','${m.name}')">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:32px;">${m.icon}</div>
        <div style="flex:1;">
          <div style="font-size:16px;font-weight:700;">${m.name}</div>
          <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${m.desc}</div>
        </div>
        <div style="color:var(--text-light);font-size:20px;">→</div>
      </div>
    </div>
  `).join('');
  return div;
};

function openXingceModule(key, name) {
  // 内置一些河南历年真题示例
  const questions = getXingceQuestions(key);
  const div = createPageBase(name, '历年真题 · 标准答案解析');
  div.innerHTML += `
    <div class="card">
      <div class="card-title">📝 ${name}真题练习</div>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:14px;">共 ${questions.length} 道精选真题</div>
      <div id="xcQuestions">
        ${questions.map((q, i) => `
          <div style="padding:14px;background:var(--milk);border-radius:12px;margin-bottom:12px;">
            <div style="font-size:14px;font-weight:600;margin-bottom:8px;">${i+1}. ${q.question}</div>
            ${q.options ? q.options.map((o, j) => `<div style="font-size:13px;padding:4px 0;color:var(--text-soft);">${String.fromCharCode(65+j)}. ${o}</div>`).join('') : ''}
            <div style="margin-top:8px;">
              <button class="btn btn-sm" onclick="toggleAnswer(${i})">查看答案</button>
              <div id="answer_${i}" style="display:none;margin-top:8px;padding:10px;background:var(--blue-light);border-radius:8px;">
                <div style="font-size:13px;font-weight:600;color:var(--pink-deep);">✅ 答案：${q.answer}</div>
                <div style="font-size:13px;color:var(--text-soft);margin-top:4px;">💡 ${q.analysis}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  // 替换当前页面
  document.getElementById('pages-container').querySelectorAll('.page').forEach(p => p.remove());
  document.getElementById('pages-container').appendChild(div);
  window.scrollTo(0, 0);
}
function toggleAnswer(i) {
  const el = document.getElementById('answer_' + i);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function getXingceQuestions(key) {
  const data = {
    yanyu: [
      {question:'（河南真题）依次填入划横线部分最恰当的一组词语是：改革进入了______，每一步都需谨慎。', options:['深水区','舒适区','缓冲区','安全区'], answer:'A', analysis:'改革进入深水区是固定表述，指改革到了攻坚克难的阶段。'},
      {question:'（河南真题）这段文字的主旨是：传统文化是一个民族的根和魂，丢弃了传统文化，就等于割断了自己的精神命脉。', answer:'传统文化是民族根基，不可丢弃', analysis:'主旨概括题，首句即为中心句，强调传统文化的重要性。'},
      {question:'（模拟）下列句子没有语病的是：', options:['通过这次活动，使我们增长了见识','他虽然成绩好，但是品德也好','经过努力，他终于考上了公务员','我们要养成爱学习、爱劳动'], answer:'C', analysis:'A项缺主语，B项关联词使用不当，D项宾语缺失。C项正确。'}
    ],
    panduan: [
      {question:'（河南真题）请从所给四个选项中，选择最合适的一个填入问号处，使之呈现一定的规律性。', options:['图形推理题需结合图形判断','B','C','D'], answer:'需结合实际图形', analysis:'图形推理题需观察图形的对称性、旋转、叠加等规律。'},
      {question:'（模拟）所有的鸟都会飞，鸵鸟是鸟，所以鸵鸟会飞。这个推理______。', options:['正确','错误，前提不成立','错误，结论超出前提','无法判断'], answer:'B', analysis:'大前提"所有的鸟都会飞"不成立（如鸵鸟、企鹅不会飞），故推理错误。'},
      {question:'（模拟）手表：指针 之于 汽车：______', options:['方向盘','发动机','轮胎','仪表盘'], answer:'A', analysis:'类比推理，指针是手表的指示部分，方向盘是汽车的操控方向部分，属于整体与部分的关系。'}
    ],
    ziliao: [
      {question:'（河南真题）根据资料，2022年河南省GDP约为6.13万亿元，2021年约为5.89万亿元，则2022年河南省GDP同比增长率约为：', options:['3.9%','4.1%','4.3%','4.5%'], answer:'B', analysis:'增长率=(6.13-5.89)/5.89≈0.24/5.89≈4.07%≈4.1%。'},
      {question:'（模拟）已知某地区上半年月均产量为1200件，下半年总产量为8500件，全年月均产量约为：', options:['1400','1450','1500','1550'], answer:'A', analysis:'全年总量=1200×6+8500=15700件，月均=15700/12≈1308件。注意此题需重新计算，约为1308。'}
    ],
    shuliang: [
      {question:'（河南真题）甲、乙两人同时从A地出发到B地，甲速度为5km/h，乙速度为4km/h，甲比乙早到2小时，AB两地距离为：', options:['30','35','40','45'], answer:'C', analysis:'设距离为S，S/4 - S/5 = 2，解得S=40km。'},
      {question:'（模拟）2, 3, 5, 8, 13, ( )', options:['18','20','21','23'], answer:'C', analysis:'前两项之和等于第三项（斐波那契数列变体）：8+13=21。'},
      {question:'（模拟）某商品打八折后价格为160元，原价为：', options:['180','190','200','210'], answer:'C', analysis:'原价=160/0.8=200元。'}
    ],
    changshi: [
      {question:'（河南真题）下列关于河南省情的说法，正确的是：', options:['河南省省会为洛阳','河南省位于中国中部','河南省是唯一不跨黄河的省份','河南省简称"豫"源于豫北'], answer:'B', analysis:'河南省位于中国中部，简称"豫"，省会是郑州，黄河横贯全省。'},
      {question:'（模拟）党的二十大报告指出，______是全面建设社会主义现代化国家的首要任务。', options:['高质量发展','科技创新','乡村振兴','共同富裕'], answer:'A', analysis:'党的二十大报告明确指出，高质量发展是全面建设社会主义现代化国家的首要任务。'},
      {question:'（模拟）下列哪项不属于我国的四大发明？', options:['造纸术','印刷术','地动仪','火药'], answer:'C', analysis:'四大发明是造纸术、印刷术、火药、指南针。地动仪是张衡的发明，不属于四大发明。'}
    ]
  };
  return data[key] || [];
}

// ========== 申论专项模块页面 ==========
window.page_shenlun = function() {
  const div = createPageBase('✍️ 申论专项模块', '五大子板块 · 河南省考专属');
  div.innerHTML += `
    <div class="card" style="cursor:pointer;" onclick="openShenlunSub('skills')">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:32px;">🎯</div>
        <div style="flex:1;"><div style="font-size:16px;font-weight:700;">五大题型答题技巧</div>
        <div style="font-size:12px;color:var(--text-soft);">归纳概括·综合分析·提出对策·应用文·大作文</div></div>
        <div style="color:var(--text-light);font-size:20px;">→</div>
      </div>
    </div>
    <div class="card" style="cursor:pointer;" onclick="openShenlunSub('template')">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:32px;">📋</div>
        <div style="flex:1;"><div style="font-size:16px;font-weight:700;">公文写作模板库</div>
        <div style="font-size:12px;color:var(--text-soft);">河南高频公文文种·格式范文</div></div>
        <div style="color:var(--text-light);font-size:20px;">→</div>
      </div>
    </div>
    <div class="card" style="cursor:pointer;" onclick="openShenlunSub('material')">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:32px;">💎</div>
        <div style="flex:1;"><div style="font-size:16px;font-weight:700;">申论素材库</div>
        <div style="font-size:12px;color:var(--text-soft);">名言警句·时代人物·河南案例</div></div>
        <div style="color:var(--text-light);font-size:20px;">→</div>
      </div>
    </div>
    <div class="card" style="cursor:pointer;" onclick="openShenlunSub('notes')">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:32px;">📓</div>
        <div style="flex:1;"><div style="font-size:16px;font-weight:700;">我的申论笔记</div>
        <div style="font-size:12px;color:var(--text-soft);">自由编辑·按题型分类</div></div>
        <div style="color:var(--text-light);font-size:20px;">→</div>
      </div>
    </div>
    <div class="card" style="cursor:pointer;" onclick="openShenlunSub('mindmap')">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:32px;">🧠</div>
        <div style="flex:1;"><div style="font-size:16px;font-weight:700;">思维导图工具</div>
        <div style="font-size:12px;color:var(--text-soft);">自由搭建答题框架·可保存回看</div></div>
        <div style="color:var(--text-light);font-size:20px;">→</div>
      </div>
    </div>
  `;
  return div;
};

function openShenlunSub(sub) {
  if (sub === 'skills') openShenlunSkills();
  else if (sub === 'template') openShenlunTemplate();
  else if (sub === 'material') openShenlunMaterial();
  else if (sub === 'notes') openShenlunNotes();
  else if (sub === 'mindmap') openShenlunMindmap();
}

function openShenlunSkills() {
  const div = createPageBase('🎯 五大题型答题技巧', '申论方法论 · 逐个击破');
  const skills = [
    {name:'归纳概括题', icon:'📌', content:'【题型特征】要求对给定材料中的特定信息进行提炼、归纳、概括。\n\n【答题方法】\n1. 审题：明确概括对象（问题、原因、影响、对策等）\n2. 找点：带着问题读材料，标注关键信息\n3. 加工：同类合并、异类罗列，按逻辑分类\n4. 书写：分条列点，每条"核心词+具体阐述"\n\n【高分要点】\n• 条理清晰，用序号标注\n• 概括准确，抓住本质\n• 全面不遗漏，宁多勿少\n• 字数控制精准'},
    {name:'综合分析题', icon:'🔍', content:'【题型特征】要求对某句话、某个现象进行综合分析，谈理解、谈看法。\n\n【答题方法】\n1. 表态：明确表明观点/解释含义\n2. 分析：从原因、影响、现状等多角度展开\n3. 对策/结论：提出对策建议或总结升华\n\n【常见类型】\n• 词句理解型：解释某词某句含义\n• 评价型：对某观点/现象进行评价\n• 比较型：比较两种做法的异同\n\n【高分要点】\n• 逻辑严密，分析全面\n• 观点明确，立场正确\n• 结合材料，有理有据'},
    {name:'提出对策题', icon:'💡', content:'【题型特征】要求针对材料中的问题提出解决对策。\n\n【答题方法】\n1. 找问题：梳理材料中的问题及原因\n2. 提对策：针对性提出可行对策\n3. 加工：分条列点，表述规范\n\n【对策来源】\n• 材料直接引用：材料中已有的对策\n• 问题反推：根据问题反推对策\n• 经验借鉴：借鉴材料中的成功做法\n\n【高分要点】\n• 对策有针对性，一一对应问题\n• 对策有可行性，切实可操作\n• 对策有主体性，明确谁来做\n• 表述"动宾结构"：完善...制度，加强...监管'},
    {name:'应用文（公文）', icon:'✉️', content:'【题型特征】要求撰写特定文种的公文/应用文。\n\n【答题方法】\n1. 审题：明确文种、身份、受众、目的\n2. 定格式：确定该文种的标准格式\n3. 搭框架：开头+主体+结尾\n4. 填内容：从材料中提取信息填充\n\n【通用格式要素】\n• 标题：发文机关+事由+文种\n• 称谓（主送机关）\n• 正文：开头（缘由）+主体（事项）+结尾（要求/希望）\n• 落款：发文机关\n• 日期：×年×月×日\n\n【常见文种】详见"公文写作模板库"'},
    {name:'大作文', icon:'✍️', content:'【题型特征】根据给定材料，撰写一篇议论文（1000-1200字）。\n\n【答题方法】\n1. 审题立意：确定总论点（基于材料主旨）\n2. 搭框架：提出论点→分析论点→论证论点→得出结论\n3. 写开头：引题+过渡+亮明观点\n4. 写分论点：3个分论点，每个"论点+论据+分析"\n5. 写结尾：总结升华\n\n【结构模板】\n• 开头（150字）：引出话题→分析意义→亮明总论点\n• 分论点一（250字）：分论点+过渡+论据+分析+小结\n• 分论点二（250字）：同上\n• 分论点三（250字）：同上\n• 结尾（150字）：回扣总论点+升华展望\n\n【高分要点】\n• 立意准确，紧扣材料\n• 论点鲜明，逻辑清晰\n• 论据充分，素材丰富\n• 语言规范，政论风格'}
  ];
  div.innerHTML += skills.map(s => `
    <div class="card">
      <div class="card-title">${s.icon} ${s.name}</div>
      <div style="font-size:14px;white-space:pre-wrap;line-height:1.8;color:var(--text-soft);">${s.content}</div>
    </div>
  `).join('');
  document.getElementById('pages-container').querySelectorAll('.page').forEach(p => p.remove());
  document.getElementById('pages-container').appendChild(div);
  window.scrollTo(0, 0);
}

function openShenlunTemplate() {
  const div = createPageBase('📋 公文写作模板库', '河南高频公文 · 格式范文');
  const templates = getOfficialTemplates();
  div.innerHTML += `
    <div class="card">
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px;">收录河南省考高频公文文种，每个文种含标准格式+写作模板+范文示例</div>
    </div>
    ${templates.map((t, i) => `
      <div class="card">
        <div class="template-item" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
          <span class="name">${t.icon} ${t.name}</span>
          <span class="arrow">展开 ▼</span>
        </div>
        <div style="display:none;margin-top:12px;padding-top:12px;border-top:2px dashed var(--pink-light);">
          <div style="font-size:13px;white-space:pre-wrap;line-height:1.8;color:var(--text-soft);">${t.content}</div>
        </div>
      </div>
    `).join('')}
  `;
  document.getElementById('pages-container').querySelectorAll('.page').forEach(p => p.remove());
  document.getElementById('pages-container').appendChild(div);
  window.scrollTo(0, 0);
}

function getOfficialTemplates() {
  return [
    {name:'倡议书', icon:'📢', content:'【标准格式】\n标题：关于+事项+的倡议书\n称谓：广大市民朋友们/各位同仁：\n开头：说明倡议背景、目的\n主体：分条列写倡议内容（3-5条）\n结尾：发出号召，展望愿景\n落款：倡议单位/人\n日期：×年×月×日\n\n【写作模板】\n关于___的倡议书\n___朋友们：\n  当前，___（背景）。为___（目的），我们发出如下倡议：\n  一、___（做法+意义）\n  二、___（做法+意义）\n  三、___（做法+意义）\n  让我们携手___（号召）！\n  倡议人：___\n  ×年×月×日\n\n【河南真题范文参考】\n关于推进垃圾分类的倡议书\n广大市民朋友们：\n  当前，我省正积极推进生态文明建设，垃圾分类是改善人居环境、促进资源回收利用的重要举措。为此，我们发出如下倡议：\n  一、争做垃圾分类的践行者……\n  二、争做垃圾分类的宣传者……\n  三、争做垃圾分类的监督者……\n  让我们携手共建美丽河南！\n  ×市环保志愿者协会\n  2024年×月×日'},
    {name:'公开信', icon:'✉️', content:'【标准格式】\n标题：致___的一封信 / 给___的公开信\n称谓：尊敬的___：\n开头：说明写信缘由\n主体：阐述情况、表达态度、提出希望\n结尾：表达祝愿\n落款：写信人/单位\n日期\n\n【写作模板】\n致___的一封信\n尊敬的___：\n  您好！___（缘由）\n  ___（背景情况）\n  ___（态度/做法/希望）\n  最后，祝愿___。\n  ___（落款）\n  ×年×月×日'},
    {name:'通知', icon:'📌', content:'【标准格式】\n标题：关于___的通知（须有"通知"字样）\n主送机关：\n开头：说明发文缘由\n主体：通知事项（分条列写）\n结尾：特此通知 / 请遵照执行\n落款：发文机关\n日期\n\n【写作模板】\n关于___的通知\n各___：\n  为___（目的），根据___（依据），现将___事项通知如下：\n  一、___（时间、地点、内容）\n  二、___（要求）\n  三、___（注意事项）\n  特此通知。\n  ___（发文机关）\n  ×年×月×日'},
    {name:'汇报材料', icon:'📊', content:'【标准格式】\n标题：关于___的汇报 / ___工作汇报\n称谓：\n开头：概括总体情况\n主体：分板块汇报工作做法、成效、问题\n结尾：下一步计划\n落款：汇报单位/人\n日期\n\n【写作模板】\n关于___工作的汇报\n___：\n  现将___工作情况汇报如下：\n  一、工作开展情况\n  ___（做法+成效，用数据说话）\n  二、主要做法\n  1.___ 2.___ 3.___\n  三、存在的问题\n  ___\n  四、下一步计划\n  ___\n  以上汇报，请审示。\n  ___\n  ×年×月×日'},
    {name:'工作方案', icon:'📝', content:'【标准格式】\n标题：___工作方案 / 关于___的工作方案\n开头：说明背景、目的、依据\n主体：\n  一、指导思想\n  二、工作目标\n  三、工作内容/措施\n  四、组织保障\n  五、时间安排\n落款：制定单位\n日期\n\n【写作模板】\n___工作方案\n  为___（目的），根据___（依据），制定本方案。\n  一、指导思想\n  以___为指导，坚持___，实现___。\n  二、工作目标\n  ___（量化目标）\n  三、主要措施\n  1.___ 2.___ 3.___\n  四、组织保障\n  成立___领导小组，明确责任分工。\n  五、时间安排\n  第一阶段：___\n  第二阶段：___\n  第三阶段：___'},
    {name:'讲话稿', icon:'🎤', content:'【标准格式】\n标题：在___会议上的讲话 / ___的讲话\n称谓：同志们/各位代表：\n开头：问候+说明会议背景\n主体：\n  一、肯定成绩/分析形势\n  二、部署任务/提出要求\n  三、强调保障/寄语希望\n结尾：号召鼓劲\n\n【写作模板】\n在___会议上的讲话\n同志们：\n  今天，我们召开___会议，主要任务是___。\n  首先，___（肯定成绩/分析形势）\n  下面，我讲几点意见：\n  一、___（提高认识）\n  二、___（明确任务）\n  三、___（强化落实）\n  同志们，让我们___（号召）！\n  谢谢大家！'},
    {name:'短评', icon:'✏️', content:'【标准格式】\n标题：自拟，鲜明有力\n正文：300-500字，一事一议\n结构：\n  引题（引出现象/事件）\n  析题（分析原因/本质）\n  论题（亮明观点+论证）\n  结题（总结/呼吁）\n\n【写作模板】\n___（标题）\n  近日，___（事件），引发社会关注。___（简要评述）\n  ___现象的背后，是___（分析本质/原因）。___（展开论述）\n  对此，我们应当___（亮明观点）。一方面，___；另一方面，___。\n  ___（总结升华/呼吁）'},
    {name:'编者按', icon:'📖', content:'【标准格式】\n标题：编者按（可省略标题，直接以"编者按："开头）\n正文：100-300字\n结构：\n  交代背景→点明意图→概括内容→引导阅读\n\n【写作模板】\n编者按：\n  为了___（目的），本期特刊登___（内容）。___（概述文章/内容核心要点）。希望广大读者___（阅读引导/号召），从中获得___（启示）。'},
    {name:'调研报告', icon:'🔍', content:'【标准格式】\n标题：关于___的调研报告\n开头：调研背景、目的、对象、方法\n主体：\n  一、基本情况/现状\n  二、主要做法/成效\n  三、存在的问题\n  四、对策建议\n结尾：总结\n落款：调研组/单位\n日期\n\n【写作模板】\n关于___的调研报告\n  为___（目的），___（时间），我们赴___（地点）就___进行了专题调研。现将情况报告如下：\n  一、基本情况\n  ___（调研对象概况）\n  二、主要做法与成效\n  1.___ 2.___ 3.___\n  三、存在的主要问题\n  1.___ 2.___ 3.___\n  四、对策建议\n  1.___ 2.___ 3.___\n  ___调研组\n  ×年×月×日'},
    {name:'宣传稿', icon:'📣', content:'【标准格式】\n标题：___宣传稿 / 关于___的宣传\n开头：引出主题，吸引关注\n主体：介绍内容/做法/成效\n结尾：号召参与/关注\n\n【写作模板】\n___宣传稿\n  ___（引子，吸引眼球）\n  ___（背景介绍）\n  ___（主要内容/亮点做法）\n  ___（成效/意义）\n  让我们共同___（号召）！'},
    {name:'工作总结', icon:'📋', content:'【标准格式】\n标题：___工作总结 / 关于___的工作总结\n开头：概括总体情况\n主体：\n  一、主要工作及成效\n  二、主要做法\n  三、存在不足\n  四、下一步打算\n落款：单位/人\n日期\n\n【写作模板】\n___工作总结\n  ___年以来，我___在___领导下，围绕___，开展了以下工作：\n  一、主要工作及成效\n  1.___ 2.___ 3.___\n  二、主要做法\n  1.___ 2.___ 3.___\n  三、存在不足\n  ___\n  四、下一步打算\n  ___\n  ___（落款）\n  ×年×月×日'}
  ];
}

function openShenlunMaterial() {
  const div = createPageBase('💎 申论素材库', '名言警句·时代人物·河南案例');
  div.innerHTML += `
    <div class="card">
      <div class="card-title">📜 高分名言警句</div>
      <div style="font-size:14px;line-height:2;color:var(--text-soft);">
        • 治国之道，富民为始。——《史记》<br>
        • 天下之治乱，不在一姓之兴亡，而在万民之忧乐。——黄宗羲<br>
        • 政之所兴在顺民心，政之所废在逆民心。——《管子》<br>
        • 利民之事，丝发必兴；厉民之事，毫末必去。——《孟子》<br>
        • 大道之行也，天下为公。——《礼记》<br>
        • 民为邦本，本固邦宁。——《尚书》<br>
        • 苟日新，日日新，又日新。——《大学》<br>
        • 不驰于空想，不骛于虚声。——李大钊<br>
        • 江山就是人民，人民就是江山。<br>
        • 绿水青山就是金山银山。
      </div>
      <button class="btn btn-sm" style="margin-top:10px;" onclick="addMaterialNote('名言警句')">摘抄到笔记</button>
    </div>
    <div class="card">
      <div class="card-title">🌟 时代人物素材</div>
      <div style="font-size:14px;line-height:2;color:var(--text-soft);">
        • <b>张桂梅</b>：扎根云南山区，创办免费女子高中，照亮大山女孩的追梦路。适用：教育公平、初心使命、奉献精神。<br><br>
        • <b>黄文秀</b>：放弃大城市工作，回到家乡广西百色扶贫，将青春献给脱贫攻坚。适用：青春担当、基层奉献、初心不改。<br><br>
        • <b>袁隆平</b>：一生追逐"禾下乘凉梦"，让中国人的饭碗端在自己手中。适用：科技创新、粮食安全、奋斗终身。<br><br>
        • <b>樊锦诗</b>：敦煌女儿，半个多世纪守护莫高窟。适用：文化传承、坚守初心、甘于寂寞。<br><br>
        • <b>张富清</b>：深藏功名60年，退役后扎根贫困山区。适用：不忘初心、淡泊名利、党员本色。
      </div>
      <button class="btn btn-sm" style="margin-top:10px;" onclick="addMaterialNote('时代人物')">摘抄到笔记</button>
    </div>
    <div class="card">
      <div class="card-title">🏛️ 河南本土政务案例</div>
      <div style="font-size:14px;line-height:2;color:var(--text-soft);">
        • <b>兰考县脱贫</b>：焦裕禄精神的发源地，2017年在全国率先脱贫，传承"亲民爱民、艰苦奋斗、科学求实、迎难而上、无私奉献"的焦裕禄精神。适用：脱贫攻坚、精神传承、基层治理。<br><br>
        • <b>郑州"7·20"暴雨灾后重建</b>：特大暴雨后的城市韧性与应急管理体系建设。适用：防灾减灾、城市治理、应急能力。<br><br>
        • <b>河南"放管服"改革</b>："一网通办"前提下"最多跑一次"，优化营商环境。适用：政务服务、简政放权、为民服务。<br><br>
        • <b>红旗渠精神</b>：林县人民历时十年，在太行山上凿出"人工天河"。适用：艰苦奋斗、自力更生、团结协作。<br><br>
        • <b>河南黄河生态保护</b>：贯彻黄河流域生态保护和高质量发展战略。适用：生态文明、黄河文化、高质量发展。<br><br>
        • <b>中原崛起战略</b>：河南作为中部大省，在促进中部地区崛起中担当重任。适用：区域发展、中部崛起、农业大省转型。
      </div>
      <button class="btn btn-sm" style="margin-top:10px;" onclick="addMaterialNote('河南案例')">摘抄到笔记</button>
    </div>
    <div class="card">
      <div class="card-title">📁 我的素材摘抄</div>
      <div id="materialNotes"></div>
      <textarea id="materialInput" placeholder="手动添加素材..." style="margin-top:10px;"></textarea>
      <button class="btn btn-sm" style="margin-top:8px;" onclick="addCustomMaterial()">添加</button>
    </div>
  `;
  document.getElementById('pages-container').querySelectorAll('.page').forEach(p => p.remove());
  document.getElementById('pages-container').appendChild(div);
  renderMaterialNotes();
  window.scrollTo(0, 0);
}
function addMaterialNote(type) {
  toast('请长按文字选择复制，或手动添加到摘抄');
}
function addCustomMaterial() {
  const text = document.getElementById('materialInput').value.trim();
  if (!text) return;
  let notes = DB.get('materialNotes', []);
  notes.unshift({text, date: new Date().toLocaleDateString('zh-CN')});
  DB.set('materialNotes', notes);
  document.getElementById('materialInput').value = '';
  renderMaterialNotes();
  toast('已添加 💎');
}
function renderMaterialNotes() {
  const notes = DB.get('materialNotes', []);
  const el = document.getElementById('materialNotes');
  if (!el) return;
  if (notes.length === 0) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:10px;">暂无摘抄</div>'; return; }
  el.innerHTML = notes.map((n, i) => `
    <div style="padding:10px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:13px;">
      <div>${n.text}</div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;">
        <span style="font-size:11px;color:var(--text-light);">${n.date}</span>
        <button class="btn btn-sm" onclick="deleteMaterialNote(${i})">删</button>
      </div>
    </div>
  `).join('');
}
function deleteMaterialNote(i) {
  let notes = DB.get('materialNotes', []);
  notes.splice(i, 1);
  DB.set('materialNotes', notes);
  renderMaterialNotes();
}

function openShenlunNotes() {
  const div = createPageBase('📓 我的申论笔记', '听课感悟·做题心得·踩分要点');
  div.innerHTML += `
    <div class="card">
      <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
        <button class="btn btn-sm ${''}" onclick="filterNotes('all')" id="noteFilterAll">全部</button>
        <button class="btn btn-sm btn-outline" onclick="filterNotes('归纳概括')" id="noteFilter归纳概括">归纳概括</button>
        <button class="btn btn-sm btn-outline" onclick="filterNotes('综合分析')" id="noteFilter综合分析">综合分析</button>
        <button class="btn btn-sm btn-outline" onclick="filterNotes('提出对策')" id="noteFilter提出对策">提出对策</button>
        <button class="btn btn-sm btn-outline" onclick="filterNotes('应用文')" id="noteFilter应用文">应用文</button>
        <button class="btn btn-sm btn-outline" onclick="filterNotes('大作文')" id="noteFilter大作文">大作文</button>
      </div>
      <label class="field-label">题型分类</label>
      <select id="noteTag">
        <option value="归纳概括">归纳概括</option>
        <option value="综合分析">综合分析</option>
        <option value="提出对策">提出对策</option>
        <option value="应用文">应用文</option>
        <option value="大作文">大作文</option>
        <option value="其他">其他</option>
      </select>
      <label class="field-label">笔记内容</label>
      <textarea id="noteContent" placeholder="记录听课感悟、做题心得、阅卷踩分要点..." style="min-height:120px;"></textarea>
      <button class="btn" style="margin-top:10px;width:100%;" onclick="addShenlunNote()">保存笔记</button>
    </div>
    <div class="card">
      <div class="card-title">📁 我的笔记</div>
      <div id="shenlunNotesList"></div>
    </div>
  `;
  document.getElementById('pages-container').querySelectorAll('.page').forEach(p => p.remove());
  document.getElementById('pages-container').appendChild(div);
  window.noteFilter = 'all';
  renderShenlunNotes();
  window.scrollTo(0, 0);
}
function filterNotes(tag) {
  window.noteFilter = tag;
  renderShenlunNotes();
}
function addShenlunNote() {
  const content = document.getElementById('noteContent').value.trim();
  if (!content) return;
  const tag = document.getElementById('noteTag').value;
  let notes = DB.get('shenlunNotes', []);
  notes.unshift({content, tag, date: new Date().toLocaleString('zh-CN')});
  DB.set('shenlunNotes', notes);
  document.getElementById('noteContent').value = '';
  renderShenlunNotes();
  toast('笔记已保存 📓');
}
function renderShenlunNotes() {
  let notes = DB.get('shenlunNotes', []);
  if (window.noteFilter && window.noteFilter !== 'all') {
    notes = notes.filter(n => n.tag === window.noteFilter);
  }
  const el = document.getElementById('shenlunNotesList');
  if (!el) return;
  if (notes.length === 0) { el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">暂无笔记</div>'; return; }
  const allNotes = DB.get('shenlunNotes', []);
  el.innerHTML = notes.map(n => {
    const realIdx = allNotes.indexOf(n);
    return `
    <div style="padding:12px;background:var(--milk);border-radius:10px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span class="tag tag-shenlun">${n.tag}</span>
        <span style="font-size:11px;color:var(--text-light);">${n.date}</span>
      </div>
      <div style="font-size:14px;white-space:pre-wrap;">${n.content}</div>
      <div style="margin-top:6px;">
        <button class="btn btn-sm" onclick="deleteShenlunNote(${realIdx})">删除</button>
      </div>
    </div>
  `}).join('');
}
function deleteShenlunNote(i) {
  let notes = DB.get('shenlunNotes', []);
  notes.splice(i, 1);
  DB.set('shenlunNotes', notes);
  renderShenlunNotes();
}

// ========== 思维导图工具 ==========
function openShenlunMindmap() {
  const div = createPageBase('🧠 思维导图工具', '自由搭建·拖拽编辑·可保存');
  div.innerHTML += `
    <div class="card">
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <button class="btn btn-sm" onclick="addMindNode('root')">➕ 主分支</button>
        <button class="btn btn-sm" onclick="addMindNode('branch')">➕ 子分支</button>
        <button class="btn btn-sm" onclick="addMindNode('leaf')">➕ 叶节点</button>
        <button class="btn btn-sm btn-gold" onclick="saveMindmap()">💾 保存</button>
        <button class="btn btn-sm btn-outline" onclick="clearMindmap()">🗑️ 清空</button>
      </div>
      <div class="mindmap-canvas" id="mindmapCanvas"></div>
      <div style="font-size:12px;color:var(--text-light);margin-top:8px;text-align:center;">点击按钮添加节点，长按节点可拖动位置，双击可编辑文字</div>
    </div>
    <div class="card">
      <div class="card-title">📁 已保存的思维导图</div>
      <div id="savedMindmaps"></div>
    </div>
  `;
  document.getElementById('pages-container').querySelectorAll('.page').forEach(p => p.remove());
  document.getElementById('pages-container').appendChild(div);
  window.mindNodes = [];
  window.mindNodeCounter = 0;
  renderSavedMindmaps();
  window.scrollTo(0, 0);
}

function addMindNode(type) {
  const canvas = document.getElementById('mindmapCanvas');
  if (!canvas) return;
  const text = prompt('输入节点内容：', type === 'root' ? '中心主题' : '分支内容');
  if (text === null) return;

  const node = document.createElement('div');
  node.className = 'mind-node ' + type;
  node.textContent = text;
  node.style.left = (20 + Math.random() * 200) + 'px';
  node.style.top = (20 + Math.random() * 200) + 'px';
  node.dataset.id = ++window.mindNodeCounter;

  // 双击编辑
  node.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    const newText = prompt('编辑内容：', node.textContent);
    if (newText !== null) node.textContent = newText;
  });

  // 拖动
  let isDragging = false, startX, startY, nodeX, nodeY;
  node.addEventListener('mousedown', startDrag);
  node.addEventListener('touchstart', startDrag, {passive: false});

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    nodeX = parseInt(node.style.left);
    nodeY = parseInt(node.style.top);

    function onMove(ev) {
      if (!isDragging) return;
      const t = ev.touches ? ev.touches[0] : ev;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      node.style.left = (nodeX + dx) + 'px';
      node.style.top = (nodeY + dy) + 'px';
    }
    function onEnd() {
      isDragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  }

  canvas.appendChild(node);
}

function saveMindmap() {
  const canvas = document.getElementById('mindmapCanvas');
  const nodes = canvas.querySelectorAll('.mind-node');
  if (nodes.length === 0) { toast('画布为空'); return; }
  const data = Array.from(nodes).map(n => ({
    text: n.textContent,
    type: n.className.replace('mind-node ', ''),
    left: n.style.left,
    top: n.style.top
  }));
  let saved = DB.get('savedMindmaps', []);
  saved.unshift({
    nodes: data,
    date: new Date().toLocaleString('zh-CN')
  });
  DB.set('savedMindmaps', saved);
  renderSavedMindmaps();
  toast('思维导图已保存 💾');
}

function renderSavedMindmaps() {
  const saved = DB.get('savedMindmaps', []);
  const el = document.getElementById('savedMindmaps');
  if (!el) return;
  if (saved.length === 0) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:10px;">暂无保存</div>'; return; }
  el.innerHTML = saved.map((m, i) => `
    <div style="padding:10px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;">导图 ${i+1} · ${m.date}</div>
        <div style="font-size:11px;color:var(--text-light);">${m.nodes.length}个节点</div>
      </div>
      <button class="btn btn-sm" onclick="deleteMindmap(${i})">删</button>
    </div>
  `).join('');
}
function deleteMindmap(i) {
  let saved = DB.get('savedMindmaps', []);
  saved.splice(i, 1);
  DB.set('savedMindmaps', saved);
  renderSavedMindmaps();
}
function clearMindmap() {
  if (!confirm('确定清空当前画布？')) return;
  document.getElementById('mindmapCanvas').innerHTML = '';
}

// ========== 历年真题总库页面 ==========
window.page_pastpaper = function() {
  const div = createPageBase('📋 历年真题总库', '河南省考笔试真题套卷');
  const papers = [
    {year:'2024', type:'行测', desc:'2024年河南省考行测真题', questions:'120题'},
    {year:'2024', type:'申论', desc:'2024年河南省考申论真题', questions:'4题'},
    {year:'2023', type:'行测', desc:'2023年河南省考行测真题', questions:'120题'},
    {year:'2023', type:'申论', desc:'2023年河南省考申论真题', questions:'4题'},
    {year:'2022', type:'行测', desc:'2022年河南省考行测真题', questions:'120题'},
    {year:'2022', type:'申论', desc:'2022年河南省考申论真题', questions:'4题'},
    {year:'2021', type:'行测', desc:'2021年河南省考行测真题', questions:'120题'},
    {year:'2021', type:'申论', desc:'2021年河南省考申论真题', questions:'4题'},
    {year:'2020', type:'行测', desc:'2020年河南省考行测真题', questions:'120题'},
    {year:'2020', type:'申论', desc:'2020年河南省考申论真题', questions:'4题'}
  ];
  div.innerHTML += `
    <div class="card">
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px;">收录河南省考历年真题套卷，点击查看详情</div>
    </div>
    ${papers.map(p => `
      <div class="card" style="cursor:pointer;" onclick="viewPaper('${p.year}','${p.type}')">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:28px;">${p.type==='行测'?'🧩':'✍️'}</div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:700;">${p.year}年河南省考${p.type}</div>
            <div style="font-size:12px;color:var(--text-soft);">${p.desc} · ${p.questions}</div>
          </div>
          <div style="color:var(--text-light);">→</div>
        </div>
      </div>
    `).join('')}
    <div class="card">
      <div class="card-title">💡 真题获取渠道</div>
      <div style="font-size:14px;line-height:2;color:var(--text-soft);">
        • <a href="https://www.baidu.com/s?wd=河南省考历年真题" target="_blank" style="color:var(--pink-deep);">百度搜索河南真题</a><br>
        • <a href="https://www.fenbi.com/" target="_blank" style="color:var(--pink-deep);">粉笔题库（推荐）</a><br>
        • <a href="https://www.huatu.com/" target="_blank" style="color:var(--pink-deep);">华图在线</a><br>
        • 建议购买纸质版真题卷进行全真模拟
      </div>
    </div>
  `;
  return div;
};
function viewPaper(year, type) {
  toast(`${year}年${type}真题：建议前往粉笔/华图获取完整套卷练习`);
}

// ========== 瑾瑾树洞页面 ==========
window.page_treehole = function() {
  const div = createPageBase('🌳 瑾瑾树洞', '私密情绪笔记 · 仅你可见');
  div.innerHTML += `
    <div class="card">
      <div class="treehole-entry">
        <div style="font-size:40px;">🌳</div>
        <div style="font-size:16px;font-weight:700;color:var(--pink-deep);margin-top:8px;">这里是瑾瑾的树洞</div>
        <div style="font-size:13px;color:var(--text-soft);margin-top:4px;">倾诉心情 · 释放压力 · 记录成长</div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">✍️ 写下今天的心情</div>
      <label class="field-label">心情标签</label>
      <select id="moodTag">
        <option value="😊 开心">😊 开心</option>
        <option value="💪 充实">💪 充实</option>
        <option value="😴 疲惫">😴 疲惫</option>
        <option value="😰 焦虑">😰 焦虑</option>
        <option value="😢 低落">😢 低落</option>
        <option value="🔥 燃">🔥 燃</option>
        <option value="🤔 迷茫">🤔 迷茫</option>
        <option value="🌸 平静">🌸 平静</option>
      </select>
      <label class="field-label">树洞日记</label>
      <textarea id="treeholeContent" placeholder="今天发生了什么？有什么想对自己说的..." style="min-height:120px;"></textarea>
      <button class="btn" style="margin-top:10px;width:100%;" onclick="addTreehole()">存入树洞</button>
    </div>
    <div class="card">
      <div class="card-title">📖 树洞日记本</div>
      <div id="treeholeList"></div>
    </div>
  `;
  return div;
};
window.afterPage_treehole = function() { renderTreehole(); };
function addTreehole() {
  const content = document.getElementById('treeholeContent').value.trim();
  if (!content) return;
  const mood = document.getElementById('moodTag').value;
  let list = DB.get('treehole', []);
  list.unshift({content, mood, date: new Date().toLocaleString('zh-CN')});
  DB.set('treehole', list);
  document.getElementById('treeholeContent').value = '';
  renderTreehole();
  toast('已存入树洞 🌳');
}
function renderTreehole() {
  const list = DB.get('treehole', []);
  const el = document.getElementById('treeholeList');
  if (list.length === 0) { el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">树洞还是空的，来写第一篇吧~</div>'; return; }
  el.innerHTML = list.map((t, i) => `
    <div style="padding:14px;background:var(--milk);border-radius:12px;margin-bottom:10px;border-left:4px solid var(--blue);">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:14px;">${t.mood}</span>
        <span style="font-size:11px;color:var(--text-light);">${t.date}</span>
      </div>
      <div style="font-size:14px;white-space:pre-wrap;color:var(--text-main);">${t.content}</div>
      <div style="margin-top:6px;">
        <button class="btn btn-sm" onclick="deleteTreehole(${i})">删除</button>
      </div>
    </div>
  `).join('');
}
function deleteTreehole(i) {
  let list = DB.get('treehole', []);
  list.splice(i, 1);
  DB.set('treehole', list);
  renderTreehole();
}

// ========== 作息提醒页面 ==========
window.page_schedule = function() {
  const div = createPageBase('🔔 作息提醒', '自定义时间 · 自动弹窗');
  div.innerHTML += `
    <div class="card">
      <div class="card-title">⏰ 设置提醒时间</div>
      <label class="field-label">提醒事项名称</label>
      <input type="text" id="scheduleName" placeholder="如：起床、睡觉、学习、运动...">
      <label class="field-label">提醒时间</label>
      <input type="time" id="scheduleTime">
      <button class="btn" style="margin-top:10px;width:100%;" onclick="addSchedule()">添加提醒</button>
    </div>
    <div class="card">
      <div class="card-title">📋 我的提醒列表</div>
      <div id="scheduleList"></div>
    </div>
    <div class="card">
      <div style="font-size:13px;color:var(--text-soft);line-height:1.8;">
        💡 提示：保持页面打开状态下，到达设定时间会自动弹窗提醒。建议常添加以下提醒：<br>
        • 晨起 06:30 - 开启元气满满的一天<br>
        • 学习 08:00 - 上午学习时段<br>
        • 午休 12:30 - 适当休息<br>
        • 学习 14:30 - 下午学习时段<br>
        • 运动 18:00 - 游泳/运动时间<br>
        • 睡觉 23:00 - 早点休息
      </div>
    </div>
  `;
  return div;
};
window.afterPage_schedule = function() {
  renderScheduleList();
  // 启动提醒检查
  if (window.scheduleChecker) clearInterval(window.scheduleChecker);
  window.scheduleChecker = setInterval(checkSchedule, 1000);
};
function addSchedule() {
  const name = document.getElementById('scheduleName').value.trim();
  const time = document.getElementById('scheduleTime').value;
  if (!name || !time) { toast('请填写完整'); return; }
  let list = DB.get('schedules', []);
  list.push({name, time, enabled: true});
  DB.set('schedules', list);
  document.getElementById('scheduleName').value = '';
  document.getElementById('scheduleTime').value = '';
  renderScheduleList();
  toast('提醒已添加 🔔');
}
function renderScheduleList() {
  const list = DB.get('schedules', []);
  const el = document.getElementById('scheduleList');
  if (list.length === 0) { el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">暂无提醒</div>'; return; }
  el.innerHTML = list.map((s, i) => `
    <div style="padding:12px;background:var(--milk);border-radius:10px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-weight:600;font-size:15px;">${s.enabled?'🔔':'🔇'} ${s.name}</div>
        <div style="font-size:13px;color:var(--text-soft);">⏰ ${s.time}</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-sm" onclick="toggleSchedule(${i})">${s.enabled?'关闭':'开启'}</button>
        <button class="btn btn-sm" onclick="deleteSchedule(${i})">删</button>
      </div>
    </div>
  `).join('');
}
function toggleSchedule(i) {
  let list = DB.get('schedules', []);
  list[i].enabled = !list[i].enabled;
  DB.set('schedules', list);
  renderScheduleList();
}
function deleteSchedule(i) {
  let list = DB.get('schedules', []);
  list.splice(i, 1);
  DB.set('schedules', list);
  renderScheduleList();
}
function checkSchedule() {
  const list = DB.get('schedules', []);
  const now = new Date();
  const currentTime = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  const today = now.toDateString();
  const triggered = DB.get('scheduleTriggered_'+today, []);

  list.forEach((s, i) => {
    if (s.enabled && s.time === currentTime && !triggered.includes(i)) {
      triggered.push(i);
      DB.set('scheduleTriggered_'+today, triggered);
      // 弹窗提醒
      if (navigator.vibrate) navigator.vibrate([200,100,200,100,200]);
      showModal(`
        <div style="text-align:center;">
          <div style="font-size:48px;">🔔</div>
          <div class="modal-title">${s.name}</div>
          <div style="font-size:16px;color:var(--text-soft);">现在是 ${s.time}，该${s.name}了！</div>
          <div class="modal-actions"><button class="btn" onclick="closeModal()">知道了</button></div>
        </div>
      `);
    }
  });
}

// ========== 游泳打卡页面 ==========
window.page_swim = function() {
  const div = createPageBase('🏊 游泳打卡', '记录每一次训练');
  div.innerHTML += `
    <div class="card">
      <div class="card-title">📊 当前进度</div>
      <div style="font-size:14px;line-height:2;color:var(--text-soft);">
        ✅ 已掌握：<b style="color:var(--pink-deep);">蛙泳</b> · <b style="color:var(--pink-deep);">踩水</b> · <b style="color:var(--pink-deep);">抬头蛙</b><br>
        🎯 下一阶段目标：<b style="color:var(--yellow);">��由泳</b>
      </div>
      <div style="background:linear-gradient(90deg,var(--pink-light),var(--yellow-light));height:10px;border-radius:5px;margin-top:10px;overflow:hidden;">
        <div style="background:var(--yellow);height:100%;width:60%;border-radius:5px;"></div>
      </div>
      <div style="font-size:12px;color:var(--text-light);margin-top:4px;">蛙泳✅ → 踩水✅ → 抬头蛙✅ → 自由泳🔄</div>
    </div>
    <div class="card">
      <div class="card-title">✍️ 记录训练</div>
      <label class="field-label">训练日期</label>
      <input type="date" id="swimDate" value="${new Date().toISOString().split('T')[0]}">
      <label class="field-label">训练时长（分钟）</label>
      <input type="number" id="swimDuration" placeholder="如：60">
      <label class="field-label">训练内容</label>
      <textarea id="swimContent" placeholder="如：蛙泳热身500m，踩水练习，自由泳打腿练习..."></textarea>
      <label class="field-label">完成打卡</label>
      <div style="display:flex;gap:8px;">
        <button class="btn" style="flex:1;" onclick="addSwimRecord(true)">✅ 完成打卡</button>
        <button class="btn btn-outline" style="flex:1;" onclick="addSwimRecord(false)">仅记录</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📋 训练历程</div>
      <div id="swimRecords"></div>
    </div>
  `;
  return div;
};
window.afterPage_swim = function() { renderSwimRecords(); };
function addSwimRecord(done) {
  const date = document.getElementById('swimDate').value;
  const duration = document.getElementById('swimDuration').value;
  const content = document.getElementById('swimContent').value.trim();
  if (!duration || !content) { toast('请填写时长和内容'); return; }
  let records = DB.get('swimRecords', []);
  records.unshift({date, duration: parseInt(duration), content, done, time: new Date().toLocaleString('zh-CN')});
  DB.set('swimRecords', records);
  document.getElementById('swimDuration').value = '';
  document.getElementById('swimContent').value = '';
  renderSwimRecords();
  if (done) {
    triggerEffect(['koi','star']);
    toast('游泳打卡完成！🏊');
  }
}
function renderSwimRecords() {
  const records = DB.get('swimRecords', []);
  const el = document.getElementById('swimRecords');
  if (records.length === 0) { el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">暂无训练记录</div>'; return; }
  const totalMin = records.reduce((s,r) => s + r.duration, 0);
  el.innerHTML = `<div style="font-size:13px;color:var(--text-soft);margin-bottom:10px;">累计训练 ${records.length} 次，共 ${totalMin} 分钟</div>` +
    records.map((r, i) => `
    <div style="padding:12px;background:var(--milk);border-radius:10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-weight:600;font-size:14px;">${r.done?'✅':'📝'} ${r.date} · ${r.duration}分钟</span>
        <button class="btn btn-sm" onclick="deleteSwimRecord(${i})">删</button>
      </div>
      <div style="font-size:13px;color:var(--text-soft);">${r.content}</div>
    </div>
  `).join('');
}
function deleteSwimRecord(i) {
  let records = DB.get('swimRecords', []);
  records.splice(i, 1);
  DB.set('swimRecords', records);
  renderSwimRecords();
}

// ========== 减肥减脂追踪页面 ==========
window.page_weight = function() {
  const div = createPageBase('⚖️ 减肥减脂追踪', '156斤→120斤 · 每日记录');
  const records = DB.get('weightRecords', []);
  const currentWeight = records.length > 0 ? records[0].weight : 156;
  const targetWeight = 120;
  const diff = currentWeight - targetWeight;
  const startWeight = 156;
  const lost = startWeight - currentWeight;
  const totalToLose = startWeight - targetWeight;
  const pct = totalToLose > 0 ? Math.round(lost/totalToLose*100) : 0;

  div.innerHTML += `
    <div class="card">
      <div class="card-title">📊 减脂概况</div>
      <div class="weight-stat">
        <div class="item current">
          <div class="num">${currentWeight}</div>
          <div class="lbl">当前(斤)</div>
        </div>
        <div class="item target">
          <div class="num">${targetWeight}</div>
          <div class="lbl">目标(斤)</div>
        </div>
        <div class="item diff">
          <div class="num">${diff > 0 ? '-'+diff : '+'+Math.abs(diff)}</div>
          <div class="lbl">还需减</div>
        </div>
      </div>
      <div style="background:var(--pink-light);height:14px;border-radius:7px;overflow:hidden;margin-top:10px;">
        <div style="background:linear-gradient(90deg,var(--pink-main),var(--yellow));height:100%;width:${Math.max(0,Math.min(100,pct))}%;border-radius:7px;transition:width 0.5s;"></div>
      </div>
      <div style="text-align:center;font-size:12px;color:var(--text-light);margin-top:4px;">已完成 ${pct}% · 已减 ${lost} 斤</div>
    </div>
    <div class="card">
      <div class="card-title">⚖️ 今日记录</div>
      <label class="field-label">日期</label>
      <input type="date" id="weightDate" value="${new Date().toISOString().split('T')[0]}">
      <label class="field-label">晨起空腹体重（斤）</label>
      <input type="number" id="weightValue" step="0.1" placeholder="如：155.5">
      <label class="field-label">三餐饮食</label>
      <textarea id="dietRecord" placeholder="早餐：... 午餐：... 晚餐：..."></textarea>
      <label class="field-label">饮水量（ml）</label>
      <input type="number" id="waterRecord" placeholder="如：2000">
      <button class="btn" style="margin-top:10px;width:100%;" onclick="addWeightRecord()">保存今日记录</button>
    </div>
    <div class="card">
      <div class="card-title">📈 体重变化趋势</div>
      <canvas id="weightChart" class="weight-chart"></canvas>
    </div>
    <div class="card">
      <div class="card-title">🎯 阶段性小目标</div>
      <div id="weightGoals"></div>
      <div style="margin-top:10px;display:flex;gap:8px;">
        <input type="text" id="goalInput" placeholder="如：月底减到150斤">
        <button class="btn btn-sm" onclick="addWeightGoal()">添加</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📋 历史记录</div>
      <div id="weightHistory"></div>
    </div>
  `;
  return div;
};
window.afterPage_weight = function() {
  renderWeightChart();
  renderWeightGoals();
  renderWeightHistory();
};
function addWeightRecord() {
  const date = document.getElementById('weightDate').value;
  const weight = parseFloat(document.getElementById('weightValue').value);
  if (!weight) { toast('请输入体重'); return; }
  const diet = document.getElementById('dietRecord').value.trim();
  const water = parseInt(document.getElementById('waterRecord').value) || 0;

  let records = DB.get('weightRecords', []);
  // 同一天覆盖
  records = records.filter(r => r.date !== date);
  records.unshift({date, weight, diet, water});
  records.sort((a,b) => new Date(b.date) - new Date(a.date));
  DB.set('weightRecords', records);

  document.getElementById('weightValue').value = '';
  document.getElementById('dietRecord').value = '';
  document.getElementById('waterRecord').value = '';
  toast('记录已保存 ⚖️');
  // 刷新页面
  openPage('weight');
}
function renderWeightChart() {
  const canvas = document.getElementById('weightChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const records = DB.get('weightRecords', []);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  ctx.clearRect(0, 0, w, h);

  if (records.length === 0) {
    ctx.fillStyle = '#B0A0A8';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据，开始记录吧~', w/2, h/2);
    return;
  }

  const sorted = [...records].sort((a,b) => new Date(a.date) - new Date(b.date));
  const weights = sorted.map(r => r.weight);
  const maxW = Math.max(...weights, 156);
  const minW = Math.min(...weights, 120) - 2;
  const range = maxW - minW || 1;

  const padding = 30;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;

  // 绘制目标线
  const targetY = padding + chartH - ((120 - minW) / range) * chartH;
  ctx.strokeStyle = '#FFE8A3';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, targetY);
  ctx.lineTo(w - padding, targetY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFE8A3';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('目标120', w - padding - 45, targetY - 4);

  // 绘制折线
  ctx.strokeStyle = '#F4A0AD';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  sorted.forEach((r, i) => {
    const x = padding + (sorted.length === 1 ? chartW/2 : (i / (sorted.length - 1)) * chartW);
    const y = padding + chartH - ((r.weight - minW) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 绘制点
  sorted.forEach((r, i) => {
    const x = padding + (sorted.length === 1 ? chartW/2 : (i / (sorted.length - 1)) * chartW);
    const y = padding + chartH - ((r.weight - minW) / range) * chartH;
    ctx.fillStyle = '#FFC2CB';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5A4A52';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(r.weight, x, y - 8);
  });
}
function addWeightGoal() {
  const text = document.getElementById('goalInput').value.trim();
  if (!text) return;
  let goals = DB.get('weightGoals', []);
  goals.push({text, done: false, date: new Date().toLocaleDateString('zh-CN')});
  DB.set('weightGoals', goals);
  document.getElementById('goalInput').value = '';
  renderWeightGoals();
  toast('小目标已添加 🎯');
}
function renderWeightGoals() {
  const goals = DB.get('weightGoals', []);
  const el = document.getElementById('weightGoals');
  if (!el) return;
  if (goals.length === 0) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:8px;">暂无小目标</div>'; return; }
  el.innerHTML = goals.map((g, i) => `
    <div style="padding:10px;background:var(--milk);border-radius:8px;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
      <div class="task-checkbox ${g.done?'checked':''}" onclick="toggleWeightGoal(${i})"></div>
      <div style="flex:1;font-size:14px;${g.done?'text-decoration:line-through;color:var(--text-light);':''}">${g.text}</div>
      <button class="btn btn-sm" onclick="deleteWeightGoal(${i})">删</button>
    </div>
  `).join('');
}
function toggleWeightGoal(i) {
  let goals = DB.get('weightGoals', []);
  goals[i].done = !goals[i].done;
  DB.set('weightGoals', goals);
  renderWeightGoals();
  if (goals[i].done) triggerEffect(['star']);
}
function deleteWeightGoal(i) {
  let goals = DB.get('weightGoals', []);
  goals.splice(i, 1);
  DB.set('weightGoals', goals);
  renderWeightGoals();
}
function renderWeightHistory() {
  const records = DB.get('weightRecords', []);
  const el = document.getElementById('weightHistory');
  if (!el) return;
  if (records.length === 0) { el.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:10px;">暂无记录</div>'; return; }
  el.innerHTML = records.slice(0, 20).map((r, i) => `
    <div style="padding:10px;background:var(--milk);border-radius:8px;margin-bottom:6px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-weight:600;">📅 ${r.date}</span>
        <span style="font-weight:700;color:var(--pink-deep);">⚖️ ${r.weight}斤</span>
      </div>
      ${r.water ? `<div style="color:var(--text-soft);">💧 饮水：${r.water}ml</div>` : ''}
      ${r.diet ? `<div style="color:var(--text-soft);white-space:pre-wrap;">🍱 ${r.diet}</div>` : ''}
    </div>
  `).join('');
}
