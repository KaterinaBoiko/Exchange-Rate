import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('details page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo('/USD');
    browser.waitForAngularEnabled(false);
  });

  it('should redirect to details page', async () => {
    browser.getCurrentUrl().then((url) => {
      expect(url).toEqual('http://localhost:4200/USD');
    });
  });

  it('should display title', () => {
    browser.sleep(1000);
    expect(page.getFirstElement('.title').getText()).toContain('United States Dollar');
  });

  it('should display code of currency', () => {
    browser.sleep(1000);
    expect(page.getElement('.code').getText()).toEqual('USD');
  });

  it('should display chart', () => {
    browser.sleep(1000);
    expect(page.getElement('canvas').isPresent()).toBeTruthy();
  });

  it('should navigate to rates', () => {
    page.getFirstElement('app-header a').click().then(() => {
      browser.sleep(2000).then(() => {
        browser.getCurrentUrl().then((url) => {
          expect(url).toContain('rates');
        });
      });
    });
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
