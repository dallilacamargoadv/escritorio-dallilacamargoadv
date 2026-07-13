export function scrollInputIntoView(element: HTMLElement | null) {
  if (!element) return;

  window.setTimeout(() => {
    element.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 300);
}
