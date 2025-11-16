export default class MgruberGenericError extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <h1>error</h1>
    `;

    shadowRoot.appendChild(wrapper);
  }
}
