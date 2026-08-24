export interface ChartTheme {
  isDark: boolean;
  textColor: string;
  gridColor: string;
  warning: string;
  secondary: string;
}

export const CHART_FONT = '"Sora Variable", ui-sans-serif, system-ui, sans-serif';

const probeColor = (className: string, fallback: string): string => {
  const probe = document.createElement("span");
  probe.className = `${className} hidden`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color || fallback;
};

export function getChartTheme(): ChartTheme {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const content = probeColor("text-base-content", "#333");
  return {
    isDark,
    textColor: content,
    gridColor: withAlpha(content, 0.1),
    warning: probeColor("text-warning", "orange"),
    secondary: probeColor("text-secondary", "indigo"),
  };
}

export function withAlpha(color: string, alpha: number): string {
  const m = color.match(/\d+,\s*\d+,\s*\d+/);
  return m ? `rgba(${m[0]},${alpha})` : color;
}

export function onThemeChange(cb: (theme: ChartTheme) => void): void {
  new MutationObserver(() => cb(getChartTheme())).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] },
  );
}
