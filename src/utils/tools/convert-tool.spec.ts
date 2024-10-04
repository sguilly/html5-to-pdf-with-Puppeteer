import { Page } from 'puppeteer';
import { GeneratePdfFromHtmlDto } from '../../generate-pdf/dto/generate-pdf-html-dto';
import { GeneratePdfFromUrlDto } from '../../generate-pdf/dto/generate-pdf-url-dto';
import { ConvertTools } from './convert-tool';

interface MockedPage extends Partial<Page> {
  goto: jest.Mock;
  setContent: jest.Mock;
  waitForSelector: jest.Mock;
  evaluate: jest.Mock;
  setViewport: jest.Mock;
  pdf: jest.Mock;
  screenshot: jest.Mock;
}

describe('ConvertTools', () => {
  let pageMock: MockedPage;

  beforeEach(() => {
    pageMock = {
      goto: jest.fn().mockResolvedValue(undefined),
      setContent: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue(undefined),
      setViewport: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('')),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('')),
    };
  });

  it('should load a URL if provided', async () => {
    const data: GeneratePdfFromUrlDto = { url: 'http://example.com', format: 'pdf' };
    await ConvertTools.loadPage(pageMock as unknown as Page, data);
    expect(pageMock.goto).toHaveBeenCalledWith('http://example.com');
  });

  it('should load HTML content if provided', async () => {
    const data: GeneratePdfFromHtmlDto = { html: '<html></html>', format: 'pdf' };
    await ConvertTools.loadPage(pageMock as unknown as Page, data);
    expect(pageMock.setContent).toHaveBeenCalledWith('<html></html>', { waitUntil: 'networkidle0' });
  });

  it('should throw an error if neither url nor html is provided', async () => {
    const data = { format: 'pdf' } as GeneratePdfFromUrlDto;
    await expect(ConvertTools.loadPage(pageMock as unknown as Page, data)).rejects.toThrow(
      'Either url or html must be provided',
    );
  });

  it('should wait for an image to load', async () => {
    pageMock.evaluate.mockResolvedValue(true);
    const result = await ConvertTools.waitForImages(pageMock as unknown as Page);
    expect(pageMock.evaluate).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should set the page dimensions', async () => {
    pageMock.evaluate = jest.fn().mockResolvedValueOnce(800).mockResolvedValueOnce(600);
    await ConvertTools.setPageDimensions(pageMock as unknown as Page);
    expect(pageMock.setViewport).toHaveBeenCalledWith({ width: 800, height: 600 });
  });

  it('should generate a PDF', async () => {
    const data: GeneratePdfFromUrlDto = {
      url: 'http://example.com',
      format: 'pdf',
      printBackground: true,
      pageNumber: true,
    };
    await ConvertTools.generatePdf(pageMock as unknown as Page, data);
    expect(pageMock.pdf).toHaveBeenCalledWith({
      format: 'A4',
      printBackground: true,
      margin: { top: 30, right: 30, bottom: 60, left: 30 },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width: 100%; font-size: 9px; padding: 5px 5px 0; color: black; position: relative;">' +
        '<div style="position: absolute; right: 50%; bottom: 15px;">' +
        '<span class="pageNumber"></span>/<span class="totalPages"></span>' +
        '</div></div>',
    });
  });

  it('should generate an image', async () => {
    await ConvertTools.generateImage(pageMock as unknown as Page);
    expect(pageMock.screenshot).toHaveBeenCalled();
  });
});
