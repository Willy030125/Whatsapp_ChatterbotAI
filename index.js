const { create, decryptMedia } = require("@open-wa/wa-automate");

const win = {executablePath: "C:\\Users\\Willy\\Downloads\\Chromium\\Chromium_82.0.4062.0\\chrome.exe"}
//const linux = {executablePath: "/usr/bin/google-chrome"}
const linux = {executablePath: "/app/.apt/usr/bin/google-chrome"}
const mac = {executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}

const configObject = {
  sessionId: "willybot-client",
  authTimeout: 0,
  autoRefresh: true,
  cacheEnabled: true,
  chromiumArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--no-zygote',
    '--no-first-run',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-skip-list',
    '--disable-canvas-aa',
    '--disable-2d-canvas-clip-aa',
    '--disable-gl-drawing-for-tests',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--hide-scrollbars',
    '--disable-notifications',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-component-extensions-with-background-pages',
    '--disable-extensions',
    '--disable-features=TranslateUI,BlinkGenPropertyTrees',
    '--disable-ipc-flooding-protection',
    '--disable-renderer-backgrounding',
    '--enable-features=NetworkService,NetworkServiceInProcess',
    '--mute-audio',
    "--proxy-server='direct://'",
    '--proxy-bypass-list=*',
    '--use-gl=desktop'
  ],
  disableSpins: true,
  headless: true,
  qrRefreshS: 20,
  qrTimeout: 0,
};


const ops = process.platform;
if (ops === "win32" || ops === "win64") {const assignObj = Object.assign(configObject, win)}
else if (ops === "linux") {const assignObj = Object.assign(configObject, linux)}
else if (ops === "darwin") {const assignObj = Object.assign(configObject, mac)};

const startBot = async () => {
  try {
    const Handler = require("./handler");
    const Client = await create(configObject);

    await Client.onStateChanged(async (state) => {
      if (state === "TIMEOUT" || state === "CONFLICT" || state === "UNLAUNCHED") await Client.forceRefocus();
      console.log("State Changed >", state);
    });

    await Client.onMessage((message) => {
      Handler.messageHandler(Client, message);
    });

    await Client.onIncomingCall(async (call) => {
      const { peerJid } = call;
      //await Client.contactBlock(peerJid);
      await Client.sendText(peerJid, "_Don't call me!!_");
    });
  } catch (err) {
    console.log(err.stack)
  }
};

startBot();
