export default class MgruberGenericError extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <h1>error</h1>
        <p>Something went wrong!</p>
    `;
    shadowRoot.appendChild(wrapper);

    const styles = new CSSStyleSheet();
    styles.replaceSync(`
      h1 {
        margin: 0;
        color: red;
      }
    `);
    shadowRoot.adoptedStyleSheets = [styles];
  }
}
