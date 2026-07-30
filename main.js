const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("path");
const dataBase = require("better-sqlite3");
const { webContents } = require("electron");
const fs = require("fs");

const dbPath = path.join(app.getPath("userData"), "ventas.db");
const db = new dataBase(dbPath);

const especificaciones = {
  hour12: false,
};

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  window.loadFile("src/index.html");
};

//base de datos Detalles de las ventas

db.exec(
  `
  CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT,
    total REAl,
    direccion TEXT,
    metodopago TEXT,
    nombrecliente TEXT,
    numtelefono TEXT,
    precioenvio REAL
  );
  `
);

//base de datos de los productos de un mismo carrito que se relacionan
// con la id de la venta
// es decir 1 carrito tiene 1 id ej 1, y en la siguiente tabla se registran todos los productos
// con distintas ids pero con la id foraneas de venta 1.
db.exec(
  `
  CREATE TABLE IF NOT EXISTS detalle_ventas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER,
    producto TEXT,
    cantidad TEXT,
    precio REAL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id)
    );
    `
);

app.whenReady().then(() => {
  //LOGICA GUARDADO.

  ipcMain.handle("guardar-venta", (event, dataVenta) => {
    const { cabecera, detalles } = dataVenta;

    const nuevaFecha = new Date();
    nuevaFecha.setHours(nuevaFecha.getHours() - 3);
    const fechaISO = nuevaFecha.toISOString();
    const fechaHora = fechaISO.split("T");
    const fechaHoy = fechaHora[0] + " " + fechaHora[1].slice(0, -5);

    const insertVenta = db.prepare(
      `
        INSERT INTO ventas (fecha, total, direccion, metodopago, nombrecliente, numtelefono, precioenvio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    );

    const total = detalles.reduce((sum, v) => sum + v.precio, 0);

    const infoVenta = insertVenta.run(
      fechaHoy,
      total,
      cabecera.direccion,
      cabecera.metodoPago,
      cabecera.nombreCliente,
      cabecera.numeroCliente,
      cabecera.precioDelivery
    );

    const idVenta = infoVenta.lastInsertRowid;

    const insertDetalle = db.prepare(
      `
      INSERT INTO detalle_ventas (venta_id, producto, cantidad, precio)
      VALUES (?,?,?,?)
      `
    );

    for (const v of detalles) {
      insertDetalle.run(idVenta, v.producto, v.cantidad, v.precio);
    }

    console.log(`venta completada guardada con id ${idVenta}`);
    return idVenta;
  });

  //LOGICA ELIMINAR.

  ipcMain.on("eliminar-venta", (event, id) => {
    const borrarVentas = db.prepare(
      `
    DELETE FROM ventas WHERE id = ?
    `
    );

    const borrarDetalles = db.prepare(
      `
      DELETE FROM detalle_ventas WHERE venta_id = ?
      `
    );

    const idBorrar = id;

    borrarDetalles.run(idBorrar);
    borrarVentas.run(idBorrar);

    console.log(`venta ${id} borrada`);

    const mostrarVentas = db.prepare(`SELECT * FROM ventas`).all();

    console.log(mostrarVentas);
  });

  //LOGICA IMPRESION.

  ipcMain.on("imprimir-venta", (event, id) => {
    console.log("📦 ID recibido para imprimir:", id);

    const obtenerVenta = db.prepare(`
      SELECT * FROM ventas WHERE id = ?`);

    const idVenta = id;

    const ventaData = obtenerVenta.get(idVenta);

    const obtenerDetalles = db.prepare(`
      SELECT * FROM detalle_ventas WHERE venta_id = ?
    `);

    const detallesData = obtenerDetalles.all(idVenta);

    if (!ventaData) {
      console.log("Venta no encontrada");
      return;
    }

    console.log("Enviando venta al ticket:", ventaData);
    console.log("Enviando detalles:", detallesData);

    const datosCompletosVenta = {
      ...ventaData,
      detalles: detallesData,
    };

    const createPrintWindow = () => {
      let printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
        },
      });

      printWindow.loadFile(path.join(__dirname, "src", "Ticket.html"));

      printWindow.webContents.on("did-finish-load", () => {
        printWindow.webContents.send("print-data", datosCompletosVenta);

        setTimeout(() => {
          printWindow.webContents.print(
            {
              silent: false,
              printBackground: true,
              copies: 1,
              landscape: false,
              pageSize: {
                width: 72100,
                height: 200000,
              },
              margins: {
                marginType: "none",
              },

              dpi: {
                horizontal: 203,
                vertical: 203,
              },
            },
            (success, errorType) => {
              if (!success) console.error("error al imprimir", errorType);
              printWindow.close();
            }
          );
        }, 500);
      });
    };

    createPrintWindow();
  });

  createWindow();

  const { app } = require("electron");

  //Logica para crear html al cerrar

  app.on("before-quit", () => {
    try {
      const desktopPath = app.getPath("desktop");
      const folderPath = path.join(desktopPath, "Churreria_Backups");

      const nuevaFecha = new Date();
      nuevaFecha.setHours(nuevaFecha.getHours() - 3);
      const fechaISO = nuevaFecha.toISOString();
      const fechaHora = fechaISO.split("T");
      // const fechaHoy = fechaHora[0] + " " + fechaHora[1].slice(0, -5);
      const fechaSolo = fechaHora[0];
      const fechaGuardado = fechaSolo.split("-");

      const dia = fechaGuardado[2];
      const mes = fechaGuardado[1];
      const year = fechaGuardado[0];

      if (!fs.existsSync(folderPath))
        fs.mkdirSync(folderPath, { recursive: true });

      const ventas = db
        .prepare("SELECT * FROM ventas WHERE DATE (fecha) = ?")
        .all(fechaSolo);

      const filePath = path.join(
        folderPath,
        `Ventas-${dia}-${mes}-${year}.html`
      );

      const cantidadHoy = db
        .prepare(
          `
          SELECT cantidad FROM detalle_ventas WHERE venta_id IN (SELECT id FROM ventas WHERE DATE(fecha) = ?)
        `
        )
        .all(fechaSolo);

      const totalDocenas = cantidadHoy.reduce(
        (sum, v) => sum + v.cantidad / 12,
        0
      );

      const ventasEfectivo = db
        .prepare(
          `SELECT * FROM ventas WHERE DATE(fecha) = ?
        AND metodopago = ?`
        )
        .all(fechaSolo, "efectivo");

      const totalEfectivo = ventasEfectivo.reduce((sum, v) => sum + v.total, 0);

      const ventasTransferencia = db
        .prepare(
          `SELECT * FROM ventas WHERE DATE(fecha) = ?
        AND metodopago = ?`
        )
        .all(fechaSolo, "transferencia");

      const totalTransferencia = ventasTransferencia.reduce(
        (sum, v) => sum + v.total,
        0
      );

      const ventasEnvios = db
        .prepare(
          `
          SELECT * FROM ventas WHERE DATE(fecha) = ? AND direccion NOT NULL AND direccion != '-'
        `
        )
        .all(fechaSolo);

      const totalDeliverys = ventasEnvios.reduce((sum, v) => sum + v.total, 0);

      const totalEnvios = ventasEnvios.reduce(
        (sum, v) => sum + v.precioenvio,
        0
      );

      const totalTotal = ventas.reduce((sum, v) => sum + v.total, 0);

      let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Ventas de Churreria77</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; border-bottom: 1px solid #ccc; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
    </head>
    <body>
        <h2>Ventas registradas</h2>
        <table>
          <tr>
          <th>ID</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Total</th>
          <th>Metodo</th>
          <th>Dirección</th>
          <th>Datos Cliente</th>
          <th>Valor Envío</th>
          <th>Fecha - Hora</th>
          </tr>
    `;

      ventas.forEach((v) => {
        const detallesVentas = db
          .prepare(`SELECT * FROM detalle_ventas WHERE venta_id = ?`)
          .all(v.id);

        detallesVentas.forEach((dV) => {
          html += `
          <tr>
          <td>${v.id}</td>
          <td>${dV.producto}</td>
          <td>${Number(dV.cantidad).toFixed(0)}</td>
          <td>$${dV.precio}</td>
          <td>${v.total}</td>
          <td>${v.metodopago}</td>
          <td>${v.direccion}</td>
          <td>${v.nombrecliente} - ${v.numtelefono}</td>
          <td>${v.precioenvio}</td>
          <td>${v.fecha}</td>
          </tr>
          `;
        });
      });

      html += `
        </table>
        <table>
          <tr>
          <th>Total docenas Vendidas</th><th>Total Efectivo</th><th>Total Transferencia</th><th>Total Deliverys</th><th>Total Envios</th><th>Total de Todo</th>
          </tr>
          <tr>
          <td>${totalDocenas}</td>
          <td>${totalEfectivo}</td>
          <td>${totalTransferencia}</td>
          <td>${totalDeliverys}</td>
          <td>${totalEnvios}</td>
          <td>${totalTotal}</td>
          </tr>
        </table>
    </body>
    </html>`;

      fs.writeFileSync(filePath, html);
      console.log(`Backup creado en: ${filePath}`);
    } catch (err) {
      console.error("Error al crear backup:", err);
    }
  });
});
