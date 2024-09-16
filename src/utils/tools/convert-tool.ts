import { Page } from 'puppeteer';
import { GeneratePdfFromHtmlDto } from '../../generate-pdf/dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from '../../generate-pdf/dto/generate-pdf-url-dto';

export class ConvertTools {
  static async loadPage(page: Page, data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto) {
    if ('url' in data) {
      await page.goto(data.url);
    } else if ('html' in data) {
      await page.setContent(data.html, { waitUntil: 'networkidle0' });
    } else {
      throw new Error('Either url or html must be provided');
    }

    if (data.waitFor) {
      await page.waitForSelector('#' + data.waitFor, { visible: true });
    }
  }
  static async waitForImages(page: Page) {
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        selectors.map((img: HTMLImageElement) => {
          if (img.complete) return Promise.resolve();

          return new Promise<void>((resolve, reject) => {
            img.addEventListener('load', () => resolve());
            img.addEventListener('error', () => reject(new Error('Image failed to load')));
          });
        }),
      );
    });
  }
  static async setPageDimensions(page: Page) {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({ width: bodyWidth, height: bodyHeight });
  }
  static async generatePdf(page: Page, data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto) {
    return await page.pdf({
      format: 'A4',
      printBackground: data.printBackground,
      margin: data.pageNumber ? { top: 30, right: 30, bottom: 60, left: 30 } : {},
      displayHeaderFooter: data.pageNumber,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width: 100%; font-size: 9px; padding: 5px 5px 0; color: black; position: relative;">' +
        '<div style="position: absolute; right: 50%; bottom: 15px;">' +
        '<span class="pageNumber"></span>/<span class="totalPages"></span>' +
        '</div></div>',
    });
  }

  static async generateImage(page: Page) {
    return await page.screenshot();
  }
}
