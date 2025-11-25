import { handleLinkClicks } from '../../main.mjs';

export default class MgruberRoute extends HTMLElement {
  constructor() {
    super();

    const css = `
      * {
        box-sizing: border-box;
      }

      .d-flex {
        display: flex;
      }

      .w-100 {
        width: 100%;
      }
      
      .flex-space-evenly {
        justify-content: space-evenly;
      }

      .text-left {
        text-align: left;
      }

      ul {
        margin: 0;
        padding: 0; 
      }

      li {
        list-style: none;
      }

      a {
        color: inherit;
      }

      mgruber-route {
        display: block;
        padding: 16px;
        width: 100vw;
        min-height: 100vh;
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;

    this.appendChild(style);

    // since shadow dom is encapsuled, we won't receive the precise a-tag as event-target for host-click listeners
    // this.addEventListener('click', handleLinkClicks);

    // this.#insertScrollDownArrow();
  }

  // #insertScrollDownArrow() {
  //   window.addEventListener('load', () => console.log('adsfasf'));
  //   const isScrollable = document.body.scrollHeight > window.innerHeight;

  //   console.log(document.body.scrollHeight);
  //   if (isScrollable) {
  //     const html = `
  //       <div class="scroll-down-arrow">
  //       </div>
  //     `;
  //     const container = document.createElement('div');
  //     container.classList.add('scroll-down-arrow');
  //     container.innerHTML = html;

  //     this.appendChild(container);
  //   }
  // }
}
