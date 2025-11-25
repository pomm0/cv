export default class MgruberGenericError extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
        <h1>error</h1>
        <p>Something went wrong!</p>
    `;

    const style = document.createElement('style');
    style.textContent = `
      h1 {
        margin: 0;
        color: red;
      }
    `;

    this.appendChild(style);
  }
}
