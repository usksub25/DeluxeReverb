function formatYen(value) {
  return `${Math.round(Number(value || 0)).toLocaleString('ja-JP')}円`;
}
function classify(score) {
  if (score >= 78) return { label: '🟢 買い', className: 'buy', color: 'var(--green)', action: '写真と整備履歴を確認して、問題なければ購入候補。' };
  if (score >= 55) return { label: '🟡 条件付き', className: 'maybe', color: 'var(--yellow)', action: '追加写真、整備履歴、付属品を確認。値下げ交渉できるなら候補。' };
  return { label: '🔴 見送り', className: 'avoid', color: 'var(--red)', action: 'リセール重視なら無理に買わず、次の個体を待つ。' };
}
function evaluateAmp(input, models, priceRules) {
  const model = models.find(item => item.id === input.modelId) || models[0];
  const rule = priceRules[model.price_rule_id] || priceRules[model.id] || {};
  const price = Number(input.price || 0);
  const resale = Number(input.expectedResale || 0);
  let score = 38;
  const risks = [];
  const reasons = [];
  const photos = ['前面全体', '背面全体', 'スピーカーのラベル', 'トランスとEIAコード', 'シャーシシリアル', '改造跡が分かる内部写真'];

  score += model.home_usability * 1.1 + model.resale_score * 1.5 + model.asset_value_score * 1.25 + model.repairability_score;
  if (model.recommended_for_user) { score += 10; reasons.push('最終目標または損失を抑えやすいつなぎ候補。'); }
  if (input.resalePriority === 'high') score += Math.max(0, model.resale_score - 7) * 2;
  if (input.usage === 'home_daily') score += model.home_usability >= 8 ? 6 : -6;
  if (input.usage === 'collect') score += model.asset_value_score >= 9 ? 7 : -3;

  if (rule.instant_check_max && price <= rule.instant_check_max) { score += 18; reasons.push('価格は即確認したい水準。'); }
  else if (rule.buy_max && price <= rule.buy_max) { score += 12; reasons.push('価格は買い候補の範囲。'); }
  else if (rule.conditional_max && price <= rule.conditional_max) { score += 1; risks.push('価格は条件付き。整備済み・純正度・付属品で補いたい。'); }
  else if (rule.avoid_above && price >= rule.avoid_above) { score -= 22; risks.push('買値が高く、売却時の損失が出やすい。'); }

  const loss = price - resale;
  if (price && resale) {
    if (loss <= 0) { score += 10; reasons.push('想定売却価格が買値以上で、資金移動しやすい。'); }
    else if (loss <= 20000) { score += 5; reasons.push('想定損失は2万円以内で許容しやすい。'); }
    else if (loss <= 50000) { score -= 6; risks.push('想定損失がやや大きい。値下げ交渉したい。'); }
    else { score -= 18; risks.push('想定損失が大きく、つなぎアンプとして不利。'); }
  }

  const conditionScore = { excellent: 12, good: 5, unknown: -13, bad: -34 }[input.condition] || 0;
  score += conditionScore;
  if (input.condition === 'unknown') risks.push('状態未確認が多く、追加整備費のリスクがある。');
  if (input.condition === 'bad') risks.push('不具合ありはリセール重視では避けたい。');

  const modScore = { none: 12, maintenance: 9, speaker_good: -2, speaker_unknown: -12, major: -42 }[input.modification] || 0;
  score += modScore;
  if (input.modification === 'major') risks.push('穴あけ、Master Volume追加、トランス交換は資産価値を大きく下げる。');
  if (input.modification === 'speaker_unknown') risks.push('無名スピーカー交換は売却時に説明しづらい。');

  const speakerScore = { original: 8, period_correct: 5, known_replacement: 1, unknown: -9 }[input.speaker] || 0;
  score += speakerScore;
  if (input.speaker !== 'original') photos.push('元スピーカーの有無が分かる説明・付属品写真');

  const transformerScore = { original: 14, unknown: -10, changed: -38 }[input.transformer] || 0;
  score += transformerScore;
  if (input.transformer === 'unknown') risks.push('トランス純正確認ができるまで判断保留。');
  if (input.transformer === 'changed') risks.push('トランス交換はヴィンテージFenderの資産価値に大きく響く。');

  const accessoryScore = { full: 6, switch: 3, none: -2 }[input.accessories] || 0;
  score += accessoryScore;
  const serviceScore = { documented: 8, shop_done: 7, unknown: -6, none: -8 }[input.serviceHistory] || 0;
  score += serviceScore;
  if (input.serviceHistory === 'unknown' || input.serviceHistory === 'none') risks.push('整備履歴が弱く、購入後メンテ費を見込みたい。');

  if (model.id.includes('pull_boost')) { score -= 10; risks.push('Pull Boost期は人気面で1969〜72年より弱い。'); }
  if (model.id.includes('current_drri') && input.resalePriority === 'high') { score -= 7; risks.push('現行中古は悪くないが、リセール最優先なら初期DRRIか本命を優先。'); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const verdict = classify(score);
  const fairMin = rule.buy_max || model.target_buy_price_jpy_min;
  const fairMax = rule.conditional_max || model.target_buy_price_jpy_max;

  return {
    model,
    score,
    verdict,
    fairPrice: `${formatYen(fairMin)}〜${formatYen(fairMax)}`,
    expectedResale: formatYen(resale || model.target_buy_price_jpy_min),
    expectedLoss: formatYen(Math.max(0, loss)),
    risks: risks.length ? risks : ['大きな危険ポイントは少ないが、写真で純正度と整備履歴を確認。'],
    reasons,
    nextPhotos: [...new Set(photos)],
    action: verdict.action
  };
}
