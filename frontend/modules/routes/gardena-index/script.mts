import { MgruberLazyComponent } from '../../components/common.mjs';

export default class RoutesGardenaIndex extends MgruberLazyComponent {
  get componentBasePath() {
    return 'routes/gardena-index';
  }

  get criticalStyles() {
    return `
      mgruber-gardena-index-route {
        display: block;
        min-width: 100vw;
        min-height: 100vh;
        background-color: #E9BA14;

        &.loading {
          place-content: center;
          text-align: center;
        }

        .gardena-logo {
          view-transition-name: gardena-logo;
        }
      }

      ::view-transition-new(.gardena-logo) {
        transition: transform var(--view-transition-routing-duration) cubic-bezier(.2,.9,.2,1), opacity var(--view-transition-routing-duration) ease, filter var(--view-transition-routing-duration) ease;
        transform-origin: center;
        transform: scale(1.08) translateY(-12px);
        opacity: 1;
        filter: blur(0);
      }

      ::view-transition-old(.gardena-logo) {
        transition: transform var(--view-transition-routing-duration) cubic-bezier(.2,.9,.2,1), opacity var(--view-transition-routing-duration) ease, filter var(--view-transition-routing-duration) ease;
        transform-origin: center;
        transform: scale(1) translateY(0);
        opacity: 1;
        filter: blur(0);
      }
    `;
  }

  onLoading() {
    this.render(
      `<mgruber-gardena-index-route class="loading">
        <img class="gardena-logo" src="/modules/routes/me/assets/gardena-smartsystem.svg" />
      </mgruber-gardena-index-route>`
    );
  }
}
