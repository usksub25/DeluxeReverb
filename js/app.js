let appData = { models: [], priceRules: {}, checklist: [] };
let lastEvaluation = null;

function yenShort(value) {
  const n = Number(value || 0);
  if (n >= 10000) return `${Math.round(n / 10000)}万円`;
  return `${n.toLocaleString('ja-JP')}円`;
}
function getFormInput() {
  return {
    modelId: document.getElementById('model').value,
    year: document.getElementById('year').value,
    country: document.getElementById('country').value,
    price: document.getElementById('price').value,
    expectedResale: document.getElementById('expectedResale').value,
    condition: document.getElementById('condition').value,
    modification: document.getElementById('modification').value,
    speaker: document.getElementById('speaker').value,
    transformer: document.getElementById('transformer').value,
    accessories: document.getElementById('accessories').value,
    serviceHistory: document.getElementById('serviceHistory').value,
    usage: document.getElementById('usage').value,
    resalePriority: document.getElementById('resalePriority').value,
    memo: document.getElementById('urlMemo').value.trim()
  };
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.toggle('active', screen.id === id));
  document.querySelectorAll('[data-go]').forEach(button => button.classList.toggle('active', button.dataset.go === id));
  if (id === 'favorites') renderFavorites();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderModelOptions() {
  const select = document.getElementById('model');
  select.innerHTML = appData.models.map(model => `<option value="${model.id}">${model.name}</option>`).join('');
  select.value = 'usa_drri_1993_2001';
}
function renderModelCards() {
  const recommended = appData.models.filter(model => model.category === 'Deluxe Reverb' || model.recommended_for_user).slice(0, 10);
  document.getElementById('modelCards').innerHTML = recommended.map(model => `
    <article class="model-card">
      <header><h3>${model.name}</h3><span class="badge ${model.recommended_for_user ? 'buy' : 'info'}">${model.era}</span></header>
      <p>${model.notes}</p>
      <div class="stat-grid">
        <div><span>自宅</span><b>${model.home_usability}/10</b></div>
        <div><span>リセール</span><b>${model.resale_score}/10</b></div>
        <div><span>狙い値</span><b>${yenShort(model.target_buy_price_jpy_min)}〜${yenShort(model.target_buy_price_jpy_max)}</b></div>
      </div>
    </article>`).join('');
}
function renderPriceRules() {
  const entries = Object.entries(appData.priceRules);
  document.getElementById('priceRules').innerHTML = entries.map(([id, rule]) => `
    <article class="rule-card">
      <h3>${rule.label || id}</h3>
      <div class="rule-grid">
        <div><span>即確認</span><b>${yenShort(rule.instant_check_max)}</b></div>
        <div><span>買い</span><b>${yenShort(rule.buy_max)}</b></div>
        <div><span>条件付き</span><b>${yenShort(rule.conditional_max)}</b></div>
        <div><span>見送り目安</span><b>${yenShort(rule.avoid_above)}</b></div>
      </div>
      <p>${rule.notes || ''}</p>
    </article>`).join('');
}
function renderChecklist() {
  document.getElementById('photoChecklist').innerHTML = appData.checklist.map(item => `
    <article class="check-card"><b>${item.title}</b><p>${item.description}</p></article>`).join('');
}
function renderResult(result) {
  const el = document.getElementById('judgeResult');
  el.innerHTML = `
    <div class="score-line"><strong>${result.score}</strong><span>/100</span><span class="badge ${result.verdict.className}">${result.verdict.label}</span></div>
    <div class="bar"><div style="width:${result.score}%;background:${result.verdict.color}"></div></div>
    <h3>次の行動</h3><p>${result.action}</p>
    <div class="stat-grid">
      <div><span>適正価格</span><b>${result.fairPrice}</b></div>
      <div><span>想定リセール</span><b>${result.expectedResale}</b></div>
      <div><span>損失見込み</span><b>${result.expectedLoss}</b></div>
    </div>
    <h3>危険ポイント</h3><ul class="danger-list">${result.risks.map(item => `<li>${item}</li>`).join('')}</ul>
    <h3>次に確認すべき写真</h3><ul class="danger-list">${result.nextPhotos.map(item => `<li>${item}</li>`).join('')}</ul>`;
}
function runJudge(event) {
  if (event) event.preventDefault();
  const input = getFormInput();
  lastEvaluation = { input, result: evaluateAmp(input, appData.models, appData.priceRules), date: new Date().toLocaleString('ja-JP') };
  renderResult(lastEvaluation.result);
}
function templateText(input) {
  const model = appData.models.find(item => item.id === input.modelId);
  return `以下の中古Fenderアンプを判定してください。\nURL：${input.memo}\n価格：${formatYen(input.price)}\nモデル：${model ? model.name : ''}\n年式：${input.year}\n製造国：${input.country}\n状態：${input.condition}\n改造：${input.modification}\nスピーカー：${input.speaker}\nトランス：${input.transformer}\n付属品：${input.accessories}\n整備履歴：${input.serviceHistory}\n気になる点：${input.memo}\n評価してほしい項目：\n・買い / 条件付き / 見送り\n・100点満点スコア\n・適正価格\n・想定リセール\n・危険ポイント\n・追加で確認すべき写真`;
}
async function copyTemplate() {
  const text = templateText(getFormInput());
  await navigator.clipboard.writeText(text);
  const el = document.getElementById('judgeResult');
  el.insertAdjacentHTML('beforeend', '<div class="template-toast">ChatGPT判定依頼テンプレートをコピーしました。</div>');
}
function saveFavorite() {
  if (!lastEvaluation) runJudge();
  const model = lastEvaluation.result.model;
  AmpStorage.save({
    registeredAt: lastEvaluation.date,
    model: model.name,
    url: lastEvaluation.input.memo,
    price: Number(lastEvaluation.input.price || 0),
    judgement: lastEvaluation.result.verdict.label,
    score: lastEvaluation.result.score,
    expectedResale: lastEvaluation.result.expectedResale,
    expectedLoss: lastEvaluation.result.expectedLoss,
    memo: lastEvaluation.input.memo
  });
  renderFavorites();
  alert('保存しました');
}
function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
function renderFavorites() {
  const list = AmpStorage.list();
  const el = document.getElementById('favoritesList');
  if (!list.length) { el.innerHTML = '<p class="small">まだ保存した個体はありません。</p>'; return; }
  el.innerHTML = list.map((item, index) => `
    <article class="favorite-card">
      <h3>${escapeHtml(item.model)}</h3>
      <span class="badge ${item.judgement.includes('買い') ? 'buy' : item.judgement.includes('見送り') ? 'avoid' : 'maybe'}">${item.judgement} ${item.score}/100</span>
      <p>${escapeHtml(item.registeredAt)} / ${formatYen(item.price)} / 想定損失 ${escapeHtml(item.expectedLoss)}</p>
      ${item.url ? `<p>${escapeHtml(item.url)}</p>` : ''}
      <footer><button type="button" data-delete-favorite="${index}">削除</button></footer>
    </article>`).join('');
}
async function init() {
  appData = await AmpData.load();
  renderModelOptions();
  renderModelCards();
  renderPriceRules();
  renderChecklist();
  runJudge();
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showScreen(button.dataset.go)));
  document.getElementById('judgeForm').addEventListener('submit', runJudge);
  document.getElementById('copyTemplateButton').addEventListener('click', copyTemplate);
  document.getElementById('saveFavoriteButton').addEventListener('click', saveFavorite);
  document.getElementById('clearFavoritesButton').addEventListener('click', () => { if (confirm('保存した個体をすべて削除しますか？')) { AmpStorage.clear(); renderFavorites(); } });
  document.getElementById('favoritesList').addEventListener('click', event => {
    const button = event.target.closest('[data-delete-favorite]');
    if (!button) return;
    AmpStorage.remove(Number(button.dataset.deleteFavorite));
    renderFavorites();
  });
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}
init().catch(error => {
  document.querySelector('main').insertAdjacentHTML('afterbegin', `<section class="panel"><p>${error.message}</p></section>`);
});
