const AmpStorage = (() => {
  const key = 'fenderVintageAmpFinder.favorites.v1';
  function list() {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function save(item) {
    const next = [item, ...list()].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  }
  function remove(index) {
    const next = list();
    next.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  }
  function clear() { localStorage.removeItem(key); }
  return { list, save, remove, clear };
})();
