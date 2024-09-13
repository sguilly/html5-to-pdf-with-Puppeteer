export class ConvertTools {
  async loadPage(page, data: any) {
    if (data.url) {
      await page.goto(data.url);
    } else if (data.html) {
      await page.setContent(data.html, { waitUntil: 'networkidle0' });
    } else {
      throw new Error('Either url or html must be provided');
    }

    if (data.waitFor) {
      await page.waitForSelector('#' + data.waitFor, { visible: true });
    }
  }
  async waitForImages(page) {
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
  async setPageDimensions(page) {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({ width: bodyWidth, height: bodyHeight });
  }
  async generatePdf(page, data: any) {
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

  async generateImage(page) {
    return await page.screenshot();
  }
}
