import { useEffect, type RefObject } from "react";

const SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previously =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function focusables(): HTMLElement[] {
      if (!root) return [];
      return [...root.querySelectorAll<HTMLElement>(SELECTOR)].filter(
        (node) => !node.hasAttribute("disabled") && node.getAttribute("aria-hidden") !== "true",
      );
    }

    const first = focusables()[0];
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!firstItem || !lastItem) return;
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previously?.focus();
    };
  }, [active, onEscape, ref]);
}
