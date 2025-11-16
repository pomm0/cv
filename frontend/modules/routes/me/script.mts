import { MgruberLazyComponent } from '../../components/common.mjs';

export default class RoutesMe extends MgruberLazyComponent {
  public get componentBasePath() {
    return 'routes/me';
  }

  onLoading() {
    this.render(`<span>loading</span>`);
  }
}
