const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("dbAPI", {
  guardarVenta: (arrayVentas) =>
    ipcRenderer.invoke("guardar-venta", arrayVentas),
  eliminarVenta: (id) => ipcRenderer.send("eliminar-venta", id),
  imprimirVenta: (id) => ipcRenderer.send("imprimir-venta", id),
});

contextBridge.exposeInMainWorld("impApi", {
  receivePrintData: (callback) =>
    ipcRenderer.on("print-data", (event, data) => callback(data)),
});
