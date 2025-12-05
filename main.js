const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { findProcessByPort, findAllActivePorts, killProcess } = require("./utils/port");
const portHelper = require("./port-helper");

ipcMain.handle("find-port", (_, port) => portHelper.findPort(port));
ipcMain.handle("find-all-ports", () => portHelper.findAllPorts());
ipcMain.handle("kill-port", (_, pid) => portHelper.killPort(pid));


function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#2c2c2c',
    title: 'PortX - Port Manager'
  });

  win.loadFile("app/index.html");
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("find-port", async (event, port) => {
    const result = await findProcessByPort(port);
    return result;
  });

  ipcMain.handle("find-all-ports", async () => {
    const result = await findAllActivePorts();
    return result;
  });

  ipcMain.handle("kill-port", async (event, pid) => {
    const result = await killProcess(pid);
    return result;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
