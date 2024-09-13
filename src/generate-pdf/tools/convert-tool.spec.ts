import { ConvertTools } from '../tools/convert-tool';

describe('ConvertTools', () => {
  let convertTools: ConvertTools;
  let pageMock: any;

  beforeEach(() => {
    convertTools = new ConvertTools();
    pageMock = {
      goto: jest.fn(),
      setContent: jest.fn(),
      waitForSelector: jest.fn(),
      evaluate: jest.fn(),
      setViewport: jest.fn(),
      pdf: jest.fn(),
      screenshot: jest.fn(),
    };
  });

  it('should load a URL if provided', async () => {
    const data = { url: 'http://example.com' };
    await convertTools.loadPage(pageMock, data);
    expect(pageMock.goto).toHaveBeenCalledWith('http://example.com');
  });

  it('should load HTML content if provided', async () => {
    const data = { html: '<html></html>' };
    await convertTools.loadPage(pageMock, data);
    expect(pageMock.setContent).toHaveBeenCalledWith('<html></html>', { waitUntil: 'networkidle0' });
  });

  it('should throw an error if neither url nor html is provided', async () => {
    const data = {};
    await expect(convertTools.loadPage(pageMock, data)).rejects.toThrow('Either url or html must be provided');
  });

  it('should wait for an image to load', async () => {
    pageMock.evaluate.mockResolvedValueOnce(true);
    await convertTools.waitForImages(pageMock);
    expect(pageMock.evaluate).toHaveBeenCalled();
  });

  it('should set the page dimensions', async () => {
    pageMock.evaluate.mockResolvedValueOnce(800).mockResolvedValueOnce(600);
    await convertTools.setPageDimensions(pageMock);
    expect(pageMock.setViewport).toHaveBeenCalledWith({ width: 800, height: 600 });
  });

  it('should generate a PDF', async () => {
    const data = { printBackground: true, pageNumber: true };
    await convertTools.generatePdf(pageMock, data);
    expect(pageMock.pdf).toHaveBeenCalledWith({
      format: 'A4',
      printBackground: true,
      margin: { top: 30, right: 30, bottom: 60, left: 30 },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        // eslint-disable-next-line max-len
        '<div style="width: 100%; font-size: 9px; padding: 5px 5px 0; color: black; position: relative;"><div style="position: absolute; right: 50%; bottom: 15px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div></div>',
    });
  });

  it('should generate an image', async () => {
    await convertTools.generateImage(pageMock);
    expect(pageMock.screenshot).toHaveBeenCalled();
  });
});
