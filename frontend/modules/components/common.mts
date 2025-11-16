const COMPONENTS_PREFIX = 'mgruber';

const loadedComponents = new Set<string>();
const loadedComponentTemplates = new Map<string, string>();

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

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.#initialize();
  }

  public onTemplateLoading(): Promise<void> | void {}

  public onTemplateLoaded(hasTemplate: boolean): Promise<void> | void {}

  public onLoadingError(error: unknown): Promise<void> | void {
    this.render('');
  }

  async #initialize() {
    if (loadedComponentTemplates.has(this.componentBasePath)) {
      this.#rawTemplate = loadedComponentTemplates.get(this.componentBasePath) || '';
      this.#injectTemplate();
      return;
    }

    // we ignore onTemplateLoading errors, component is responsible to handle that
    const [loadTemplateError] = await Promise.allSettled([this.#loadTemplate(), this.onTemplateLoading()]);

    if (loadTemplateError.status === 'rejected') {
      this.onLoadingError(loadTemplateError.reason);
    } else {
      loadedComponentTemplates.set(this.componentBasePath, this.#rawTemplate);
      this.#injectTemplate();
    }
  }

  async #loadTemplate() {
    // templates are not processed by tsc, so no need to have "dist" here
    const response = await fetch(`/modules/${this.componentBasePath}/template.html`);
    const template = await response.text();

    this.#rawTemplate = template;
  }

  async #injectTemplate() {
    this.render(this.#rawTemplate);
  }

  render(html: string) {
    if (!this.shadowRoot) {
      throw new Error('no shadow root present yet');
    }

    this.wrapper.innerHTML = html;
    this.shadowRoot.appendChild(this.wrapper);
  }
}
