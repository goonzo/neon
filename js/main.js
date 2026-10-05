// Boot
(function () {
  const G = globalThis.G;
  const refit = () => G.UI.fit();
  window.addEventListener('resize', refit);
  window.addEventListener('orientationchange', () => setTimeout(refit, 200));
  document.addEventListener('fullscreenchange', refit);
  document.addEventListener('webkitfullscreenchange', refit);
  G.UI.applyPrefs();
  document.addEventListener('pointerdown', () => G.A.unlock(), { once: false });
  G.speedMul = G.meta.settings.speed || 1;
  G.UI.fit();
  G.UI.initTip();
  G.UI.title();
})();
