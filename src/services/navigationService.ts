class NavigationService {
  private _navigation: any;

  constructor() {
    this._navigation = null;
  }

  set navigation(nav) {
    this._navigation = nav;
  }

  get navigation() {
    return this._navigation;
  }
}

const navigationService = new NavigationService();

export default navigationService;
