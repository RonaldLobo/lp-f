import { BarberoPage } from './app.po';

describe('barbero App', () => {
  let page: BarberoPage;

  beforeEach(() => {
    page = new BarberoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
