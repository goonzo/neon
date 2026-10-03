// Boot
(function () {
  const G = globalThis.G;
  window.addEventListener('resize', () => G.UI.fit());
  document.addEventListener('pointerdown', () => G.A.unlock(), { once: false });
  G.speedMul = G.meta.settings.speed || 1;
  G.UI.fit();
  G.UI.initTip();
  G.UI.title();
})();
