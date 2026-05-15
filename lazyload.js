(function () {
  'use strict';

  const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  const io = new IntersectionObserver(function (entries, observer) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.isIntersecting) continue;
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      observer.unobserve(img);
    }
  }, { rootMargin: '400px 0px' });

  function attach(img) {
    if (img.dataset.lazy) return;
    img.dataset.lazy = '1';

    // If the image is already in (or close to) the viewport, let it load
    // eagerly — swapping its src to a placeholder would just cause a flash
    // when the real URL gets restored a frame later.
    const rect = img.getBoundingClientRect();
    const m = 400;
    if (rect.top < window.innerHeight + m && rect.bottom > -m) return;

    const current = img.getAttribute('src');
    if (current && current !== PLACEHOLDER) {
      img.dataset.src = current;
      img.setAttribute('src', PLACEHOLDER);
    }
    io.observe(img);
  }

  new MutationObserver(function (records) {
    for (let i = 0; i < records.length; i++) {
      const nodes = records[i].addedNodes;
      for (let j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        if (node.nodeType !== 1) continue;
        if (node.tagName === 'IMG') attach(node);
        else if (node.querySelectorAll) {
          const imgs = node.querySelectorAll('img');
          for (let k = 0; k < imgs.length; k++) attach(imgs[k]);
        }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', function () {
    const imgs = document.getElementsByTagName('img');
    for (let i = 0; i < imgs.length; i++) attach(imgs[i]);
  });
})();
