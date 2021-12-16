import { puppeteer, Page, std } from "./deps.ts";
import { install } from "./installer.ts";

type SiluetaOpts = {
  width?: number;
  height?: number;
}

type SiluetaImageOpts = {
  title: string;
  foreground?: string;
  background?: string;
}

class Silueta {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }
  
  static async init(opts?: SiluetaOpts) {
    await install();

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: opts?.width ?? 2048, height: opts?.height ?? 1170 });

    return new Silueta(page);
  }

  async create(path: string, opts: SiluetaImageOpts): Promise<boolean> {
      // Foreground color
      const foreground = opts.foreground || "black";

      // Background color
      let background = "white";

      if (opts.background?.startsWith("#")) {
          background = opts.background;
      } else {
          background = `url(${opts.background}) no-repeat;`;
      }

      await this.#page.setContent(`
          <style>
          * { padding: 0; margin: 0; }  
          body { font-size: 5rem; background: ${background}; color: ${foreground}; padding: 2rem; }
          </style>
          <h1>${opts.title}</h1>
      `);
      await std.ensureFile(path);
      await this.#page.screenshot({ path })

      return true;
    }
}

const silueta = await Silueta.init();

const imgs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

for (const img of imgs) {
  await silueta.create(`test/img${img}.png`, {
      title: "Testing " + img,
      background: "#eee"
  })
  console.log("Created " + img);
}