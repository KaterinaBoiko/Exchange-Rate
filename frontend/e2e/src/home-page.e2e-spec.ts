import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('home page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo('/');
    browser.waitForAngularEnabled(false);
  });

  it('should redirect to /rates', async () => {
    browser.getCurrentUrl().then((url) => {
      expect(url).toEqual('http://localhost:4200/rates');
    });
  });

  it('should display datepicker', () => {
    expect(page.getElement('mat-datepicker').isPresent()).toBeTruthy();
  });

  it('should display table', () => {
    expect(page.getElement('table').isPresent()).toBeTruthy();
  });

  it('should display title in header', () => {
    expect(page.getElement('.logo').getText()).toContain('Exchange rates');
  });

  it('should Login in header', () => {
    expect(page.getElement('.login').getText()).toContain('Login');
  });

  it('should display nav bar', () => {
    expect(page.countElements('app-header a')).toBeGreaterThan(0);
  });

  it('should display USD in first cell', () => {
    browser.sleep(1000);
    expect(page.getFirstElement('.mat-cell a').getText()).toEqual('USD');
  });

  it('should open datepicker', () => {
    page.getElement('mat-datepicker-toggle button').click().then(() => {
      browser.sleep(2000).then(() => {
        expect(page.getElement('mat-calendar').isPresent()).toBeTruthy();
      });
    });
  });

  it('should navigate to currency details', () => {
    browser.sleep(1000);
    page.getFirstElement('.mat-cell a').click().then(() => {
      browser.sleep(2000).then(() => {
        browser.getCurrentUrl().then((url) => {
          expect(url).toContain('USD');
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
