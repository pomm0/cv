const COMPONENTS_PREFIX = 'mgruber';

const loadedComponents = new Set<string>();
const loadedComponentTemplates = new Map<string, string>();
const loadedComponentStyles = new Map<string, CSSStyleSheet>();

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
  abstract get componentBasePath(): string;

  wrapper = document.createElement('div');

  #rawTemplate: string = '';
  #styles: CSSStyleSheet = new CSSStyleSheet();

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.#initialize();
  }

  public onLoading(): Promise<void> | void {}

  public onLoaded(): Promise<void> | void {}

  public onLoadingError(error: unknown): Promise<void> | void {
    console.error(error);
    this.render('');
  }

  async #initialize() {
    if (loadedComponentTemplates.has(this.componentBasePath)) {
      this.#rawTemplate = loadedComponentTemplates.get(this.componentBasePath) || '';
      this.#injectTemplate();

      if (loadedComponentStyles.has(this.componentBasePath)) {
        this.#styles = loadedComponentStyles.get(this.componentBasePath) || this.#styles;

        this.#injectStyles();
      } else {
        // it could be, that loading styles failed in a previous try, so lets try again
        try {
          await this.#loadStyles();

          this.#styles = loadedComponentStyles.get(this.componentBasePath) || this.#styles;
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
      this.onLoading(),
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
    const response = await fetch(`/modules/${this.componentBasePath}/template.html`);
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

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(stylesAsText);
    this.#styles = sheet;

    loadedComponentStyles.set(this.componentBasePath, this.#styles);
  }

  async #injectStyles() {
    if (!this.shadowRoot) {
      throw new Error('no shadow root present yet');
    }

    this.shadowRoot.adoptedStyleSheets = [this.#styles];
  }

  render(html: string) {
    if (!this.shadowRoot) {
      throw new Error('no shadow root present yet');
    }

    this.wrapper.innerHTML = html;
    this.shadowRoot.appendChild(this.wrapper);
  }
}
