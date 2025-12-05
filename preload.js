const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("portAPI", {
  findPort: (port) => ipcRenderer.invoke("find-port", port),
  findAllPorts: () => ipcRenderer.invoke("find-all-ports"),
  killPort: (pid) => ipcRenderer.invoke("kill-port", pid),
});
