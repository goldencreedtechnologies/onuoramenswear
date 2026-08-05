"use client";

import { useEffect } from "react";

export function ModalScrollGuard() {
  useEffect(() => {
    let locked = false;
    let scrollY = 0;
    let previousBodyCssText = "";
    let previousHtmlOverflow = "";

    function lock() {
      if (locked) return;
      locked = true;
      scrollY = window.scrollY;
      previousBodyCssText = document.body.style.cssText;
      previousHtmlOverflow = document.documentElement.style.overflow;
      const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = "hidden";
    }

    function unlock() {
      if (!locked) return;
      locked = false;
      document.body.style.cssText = previousBodyCssText;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.scrollTo(0, scrollY);
    }

    function sync() {
      const hasOpenModal = Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
      if (hasOpenModal) lock();
      else unlock();
    }

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    sync();

    return () => {
      observer.disconnect();
      unlock();
    };
  }, []);

  return null;
}
