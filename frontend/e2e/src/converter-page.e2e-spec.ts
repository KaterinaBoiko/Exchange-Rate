import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('converter page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo('/converter');
    browser.waitForAngularEnabled(false);
  });

  it('should redirect to /converter', async () => {
    browser.getCurrentUrl().then((url) => {
      expect(url).toEqual('http://localhost:4200/converter');
    });
  });

  it('should display title', () => {
    expect(page.getFirstElement('.title').getText()).toContain('Convert Ukrainian Hryvnia');
  });

  it('should display inputs', () => {
    expect(page.countElements('mat-form-field')).toBe(3);
  });

  it('should display input label', () => {
    expect(page.getFirstElement('.mat-form-field mat-label').getText()).toEqual('Amount');
  });

  it('should convert and show results', () => {
    page.getElement('.inputs button').click().then(() => {
      browser.sleep(7000).then(() => {
        expect(page.getElement('.results').isPresent()).toBeTruthy();
      });
    });
  });

  it('should convert and show additional info', () => {
    page.getElement('.inputs button').click().then(() => {
      browser.sleep(2000).then(() => {
        expect(page.getElement('.additional').isPresent()).toBeTruthy();
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
