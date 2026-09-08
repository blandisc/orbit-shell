import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1280, height: 800 },
});
const page = await browser.newPage();
const out = "/workspace/orbit-shell/screenshots";
async function go(cfg) {
  await page.goto("http://localhost:1420/", { waitUntil: "networkidle0" });
  await page.evaluate((c) => {
    localStorage.setItem("orbit-shell-tutorial-done", "1");
    localStorage.setItem("orbit-shell-config", JSON.stringify(c));
    location.reload();
  }, cfg);
  await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));
}
const base = {
  version: 1,
  showSd: true,
  emptyLibrary: false,
  offline: false,
  grokUrl: "https://grok.com",
  esdePath: "C:\\\\ES-DE\\\\ES-DE.exe",
  stremioPath: "stremio://",
  sdPath: "D:\\\\ROMs",
};
await go({ ...base, theme: "b2" });
await page.screenshot({ path: out + "/01-home.png" });
await go({ ...base, theme: "a-prime" });
await page.screenshot({ path: out + "/02-theme-a-prime.png" });
await go({ ...base, theme: "c-nordic" });
await page.screenshot({ path: out + "/03-theme-c-nordic.png" });
await go({ ...base, theme: "b2", emptyLibrary: true });
await page.screenshot({ path: out + "/04-empty.png" });
await go({ ...base, theme: "b2", offline: true });
await page.screenshot({ path: out + "/05-offline.png" });
await go({ ...base, theme: "b2" });
await page.click("#btn-settings");
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: out + "/06-settings.png" });
await browser.close();
console.log("done");
