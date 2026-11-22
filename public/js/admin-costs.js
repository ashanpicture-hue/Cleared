(function () {
  const A = ClearedAPI, set = (id, v) => { document.getElementById(id).textContent = v; };
  A.admin('costs').then((c) => {
    set('total', c.shipments ? A.rs(c.totalPkr) : '—'); set('count', `Average over ${c.shipments} completed shipments in the last 30 days.`);
    set('model', A.rs(c.modelPkr)); set('review', A.rs(c.reviewPkr)); set('mins', c.reviewMinutes + ' min');
  }).catch((e) => set('count', e.message));
})();
