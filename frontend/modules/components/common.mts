import { VIEW_TRANSITION_ANIMATION_DURATION } from '../constants.mjs';

const COMPONENTS_PREFIX = 'mgruber';

const loadedComponents = new Set<string>();
const loadedComponentTemplates = new Map<string, string>();
const loadedComponentStyles = new Map<string, string>();

export const registerLazyComponent = async (name: string, directoryPath: string) => {
  const webComponentName = `${COMPONENTS_PREFIX}-${name}`;

  if (loadedComponents.has(webComponentName)) {
    return webComponentName;
  }

  const componentBasePath = `${directoryPath}/${name}`;

  // include "dist" here, because we use typescript
  const script = await import(`/dist/modules/${componentBasePath}/script.mjs`);

  // register component
  customElements.define(webComponentName, script.default);
  loadedComponents.add(webComponentName);

  return webComponentName;
};

export abstract class MgruberLazyComponent extends HTMLElement {
  #rawTemplate: string = '';
  #rawLazyStyles: string = '';

  abstract get componentBasePath(): string;

  get msLoadingStateShown() {
    return VIEW_TRANSITION_ANIMATION_DURATION;
  }

  // Styles which are loaded very early, even before the loading template is rendered.
  // Loading styles can be put here.
  get criticalStyles() {
    return '';
  }

  constructor() {
    super();

    this.#initialize();
  }

  public onLoading(): Promise<void> | void {}

  public onLoaded(): Promise<void> | void {}

  public onLoadingError(error: unknown): Promise<void> | void {
    console.error(error);
    this.render('<mgruber-generic-error />');
  }

  render(html: string, styles: string | undefined = undefined) {
    this.innerHTML = html;

    if (styles) {
      this.#injectStyles(styles);
    }
  }

  async #initialize() {
    if (loadedComponentTemplates.has(this.componentBasePath)) {
      this.#loadCriticalStyles();
      this.#rawTemplate = loadedComponentTemplates.get(this.componentBasePath) || '';
      this.#injectTemplate();

      if (loadedComponentStyles.has(this.componentBasePath)) {
        this.#rawLazyStyles = loadedComponentStyles.get(this.componentBasePath) || this.#rawLazyStyles;

        this.#injectStyles();
      } else {
        // it could be, that loading styles failed in a previous try, so lets try again
        try {
          await this.#loadStyles();

          this.#rawLazyStyles = loadedComponentStyles.get(this.componentBasePath) || this.#rawLazyStyles;
          this.#injectStyles();
        } catch (error) {
          this.onLoadingError(error);
        }
      }

      return;
    }

    // we ignore onLoading errors, component is responsible to handle that
    const [loadTemplateError, loadStylesError] = await Promise.allSettled([
      this.#loadTemplate(),
      this.#loadStyles(),
      this.#setupLoadingState(),
    ]);

    if (loadTemplateError.status === 'rejected') {
      this.onLoadingError(loadTemplateError.reason);

      return;
    }

    if (loadStylesError.status === 'rejected') {
      this.onLoadingError(loadStylesError.reason);

      return;
    }

    this.#injectTemplate();
    this.#injectStyles();
  }

  async #loadTemplate() {
    if (this.msLoadingStateShown) {
      await new Promise((resolve) => setTimeout(resolve, this.msLoadingStateShown));
    }

    const response = await fetch(`/modules/${this.componentBasePath}/template.html`);
    if (!response.ok) {
      throw new Error(`Failed to load template (${response.status} ${response.statusText})`);
    }

    const template = await response.text();

    this.#rawTemplate = template;

    loadedComponentTemplates.set(this.componentBasePath, this.#rawTemplate);
  }

  async #injectTemplate() {
    this.render(this.#rawTemplate);
  }

  async #loadStyles() {
    const response = await fetch(`/modules/${this.componentBasePath}/styles.css`);
    // not every component has styles, ignore if nothing found
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to load styles (${response.status} ${response.statusText})`);
    }

    const stylesAsText = response.status === 404 ? '' : await response.text();
    this.#rawLazyStyles = stylesAsText;

    loadedComponentStyles.set(this.componentBasePath, this.#rawLazyStyles);
  }

  async #injectStyles(styles = this.#rawLazyStyles) {
    if (styles === '') {
      return;
    }

    const style = document.createElement('style');
    style.textContent = styles;

    this.appendChild(style);
  }

  #setupLoadingState() {
    this.#loadCriticalStyles();

    return this.onLoading();
  }

  #loadCriticalStyles() {
    const criticalStyles = document.getElementById('route-critical-styles');
    if (criticalStyles) {
      criticalStyles.textContent = this.criticalStyles;
    }
  }
}
