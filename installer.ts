import { puppeteer } from "./deps.ts";
import { PUPPETEER_REVISIONS } from "https://deno.land/x/puppeteer@9.0.2/vendor/puppeteer-core/puppeteer/revisions.js";
import ProgressBar from "https://deno.land/x/progress@v1.1.4/mod.ts";

export async function install() {
    let product = Deno.env.get("PUPPETEER_PRODUCT");
    if (product != "chrome" && product != "firefox") {
    if (product != undefined) {
        console.warn(`Unknown product '${product}', falling back to 'chrome'.`);
    }
    product = "chrome";
    }
    const fetcher = puppeteer.createBrowserFetcher({ product });
    let revision;
    if (product == "chrome") {
    revision = Deno.env.get("PUPPETEER_CHROMIUM_REVISION") ||
        PUPPETEER_REVISIONS.chromium;
    } else if (product == "firefox") {
    puppeteer._preferredRevision = PUPPETEER_REVISIONS.firefox;
    const req = await fetch(
        "https://product-details.mozilla.org/1.0/firefox_versions.json",
    );
    const versions = await req.json();
    revision = versions.FIREFOX_NIGHTLY;
    if (!versions.FIREFOX_NIGHTLY) {
        throw new Error("Firefox version not found");
    }
    }

    const revisionInfo = fetcher.revisionInfo(revision);
    if (revisionInfo.local) {
    // already downloaded
    } else {
    let progressBar: ProgressBar;
    const newRevisionInfo = await fetcher.download(
        revisionInfo.revision,
        (current, total) => {
        if (!progressBar) {
            progressBar = new ProgressBar({
            total,
            });
        }
        if (!(progressBar as any).isCompleted) {
            progressBar.render(current);
        } else {
            console.log("Done downloading. Installing now.");
        }
        },
    );
    console.log(
        `Downloaded ${newRevisionInfo.product} ${newRevisionInfo.revision} to ${newRevisionInfo.executablePath} from ${newRevisionInfo.url}`,
    );  
    }
}