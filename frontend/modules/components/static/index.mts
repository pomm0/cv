export async function registerStaticComponents() {
  const staticComponents = ['mgruber-generic-error'];

  return Promise.all(staticComponents.map(loadComponent));
}

async function loadComponent(name: string) {
  const module = await import(`./${name}.mjs`);
  customElements.define(name, module.default);
}
