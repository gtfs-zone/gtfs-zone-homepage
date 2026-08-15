/* @vendored-from coloring-book:src/modules/theme-controller.ts
   @status adapted

   Adapted for this site's two themes: `light` (blueprint paper) and `night`.
   The upstream version pairs `light` with `dark`; the storage key and the
   `.theme-controller` checkbox contract are unchanged, so the moon toggle
   behaves the same as it does in the editor and the visualizer. */

export type ThemeName = 'light' | 'night';

const STORAGE_KEY = 'theme';

function isTheme(value: string | null): value is ThemeName {
  return value === 'light' || value === 'night';
}

export class ThemeController {
  private listeners: ((theme: ThemeName) => void)[] = [];

  initialize(): void {
    this.loadThemePreference();

    document.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target?.classList.contains('theme-controller')) {
        this.handleThemeChange(target);
      }
    });
  }

  /** Called on every theme change, including the initial one. */
  onChange(fn: (theme: ThemeName) => void): void {
    this.listeners.push(fn);
  }

  getCurrentTheme(): ThemeName {
    const attr = document.documentElement.getAttribute('data-theme');
    return isTheme(attr) ? attr : 'night';
  }

  setTheme(theme: ThemeName): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.updateThemeControllers(theme);
    for (const fn of this.listeners) fn(theme);
  }

  private loadThemePreference(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isTheme(saved)) {
      this.setTheme(saved);
      return;
    }
    // Upstream stores 'dark'; treat it as this site's dark theme rather than
    // discarding a preference the user already expressed on another subdomain.
    if (saved === 'dark') {
      this.setTheme('night');
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'night' : 'light');
  }

  private handleThemeChange(controller: HTMLInputElement): void {
    if (controller.type !== 'checkbox') return;
    // The checkbox carries the light theme as its value, matching the swap
    // markup: checked means light, unchecked means night.
    this.setTheme(controller.checked ? 'light' : 'night');
  }

  private updateThemeControllers(theme: ThemeName): void {
    const controllers =
      document.querySelectorAll<HTMLInputElement>('.theme-controller');
    controllers.forEach((controller) => {
      controller.checked = controller.value === theme;
    });
  }
}
