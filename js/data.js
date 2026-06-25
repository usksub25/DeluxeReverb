const AmpData = (() => {
  const paths = {
    models: './data/amp_models.json',
    priceRules: './data/price_rules.json',
    checklist: './data/buying_checklist.json'
  };
  async function readJson(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${path} を読み込めませんでした`);
    return response.json();
  }
  async function load() {
    const [models, priceRules, checklist] = await Promise.all([
      readJson(paths.models), readJson(paths.priceRules), readJson(paths.checklist)
    ]);
    return { models, priceRules, checklist };
  }
  return { load };
})();
