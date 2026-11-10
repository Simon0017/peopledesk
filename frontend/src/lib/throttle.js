// src/lib/throttle.js

/**
 * Runs `fn` at most once every `wait` ms, plus one trailing call so the
 * final state is never missed. `.cancel()` clears a pending trailing call.
 */
export function throttle(fn, wait) {
  let lastRun = 0;
  let trailingTimer = null;

  function throttled(...args) {
    const remaining = wait - (Date.now() - lastRun);
    if (remaining <= 0) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
      lastRun = Date.now();
      fn(...args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        lastRun = Date.now();
        trailingTimer = null;
        fn(...args);
      }, remaining);
    }
  }

  throttled.cancel = () => clearTimeout(trailingTimer);
  return throttled;
}
