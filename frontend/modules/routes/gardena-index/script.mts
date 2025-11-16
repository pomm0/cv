import { MgruberLazyComponent } from '../../components/common.mjs';

export default class RoutesGardenaIndex extends MgruberLazyComponent {
  constructor() {
    super();

    const criticalStyles = `
      gardena-index {
        background-color: red;

        .gardena-logo {
          view-transition-name: gardena-logo;
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalStyles;

    this.appendChild(style);
  }

  public get componentBasePath() {
    return 'routes/gardena-index';
  }

  onLoading() {
    this.render(
      `<img class="gardena-logo" src="/modules/routes/me/assets/gardena-smartsystem.svg" view-transition-name="gardena-logo" />`
    );
  }
}
