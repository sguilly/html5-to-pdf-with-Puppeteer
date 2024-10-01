import { Page } from 'puppeteer';
import { GeneratePdfFromHtmlDto } from '../../generate-pdf/dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from '../../generate-pdf/dto/generate-pdf-url-dto';

export class ConvertTools {
  /**
   * Loads the page content based on the provided data ( URL or setting HTML content).
   * It waits until the network is idle, and optionally waits for a specific element to be visible.
   *
   * @param page - The Puppeteer Page instance where the content will be loaded.
   * @param data - Contains either a URL or HTML content, along with optional settings like waitFor.
   */
  static async loadPage(page: Page, data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto) {
    if ('url' in data) {
      // Navigate to the provided URL
      await page.goto(data.url);
    } else if ('html' in data) {
      // Set the HTML content and wait until network idle
      await page.setContent(data.html, { waitUntil: 'networkidle0' });
    } else {
      throw new Error('Either url or html must be provided');
    }

    // Optionally wait for a specific element if 'waitFor' is provided
    if (data.waitFor) {
      await page.waitForSelector('#' + data.waitFor, { visible: true });
    }
  }
  /**
   * Waits for all images on the page to finish loading before proceeding.
   * It checks each image's load status and resolves or throws an error if an image fails to load.
   *
   * @param page - The Puppeteer Page instance where images need to be loaded.
   */
  static async waitForImages(page: Page) {
    await page.evaluate(async () => {
      const selectors = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        selectors.map((img: HTMLImageElement) => {
          if (img.complete) return Promise.resolve();
          // Wait for the image to load or reject on error
          return new Promise<void>((resolve, reject) => {
            img.addEventListener('load', () => resolve());
            img.addEventListener('error', () => reject(new Error('Image failed to load')));
          });
        }),
      );
    });
  }
  /**
   * Dynamically sets the page dimensions based on the content's scroll width and height.
   * This ensures that the entire content is visible before generating the PDF or screenshot.
   *
   * @param page - The Puppeteer Page instance whose dimensions need to be adjusted.
   */
  static async setPageDimensions(page: Page) {
    // Get the body scroll width and height
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    // Set the viewport to match the body dimensions
    await page.setViewport({ width: bodyWidth, height: bodyHeight });
  }
  /**
   * Generates a PDF from the current page content, with optional print settings such as margins and page numbers.
   *
   * @param page - The Puppeteer Page instance from which the PDF will be generated.
   * @param data - Contains PDF settings such as printBackground and pageNumber.
   * @returns The generated PDF buffer.
   */
  static async generatePdf(page: Page, data: GeneratePdfFromUrlDto | GeneratePdfFromHtmlDto) {
    return page.pdf({
      format: 'A4',
      printBackground: data.printBackground, // Option to print background colors and images
      margin: data.pageNumber ? { top: 30, right: 30, bottom: 60, left: 30 } : {}, // Set margins if page numbers are enabled
      displayHeaderFooter: data.pageNumber,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width: 100%; font-size: 9px; padding: 5px 5px 0; color: black; position: relative;">' +
        '<div style="position: absolute; right: 50%; bottom: 15px;">' +
        '<span class="pageNumber"></span>/<span class="totalPages"></span>' +
        '</div></div>',
    });
  }
  /**
   * Generates a screenshot of the current page content.
   *
   * @param page - The Puppeteer Page instance from which the screenshot will be generated.
   * @returns The generated image buffer.
   */
  static async generateImage(page: Page) {
    return page.screenshot(); // Take a screenshot of the page
  }
}
