const botonAgregar = document.getElementById("agregar");
const tablaBody = document.getElementById("cuerpoProductos");
const botonElim = document.querySelector("elimFila");
const tablaCarrito = document.getElementById("cuerpoCarrito");
const confirmarCarrito = document.getElementById("confirmarCarrito");
const carrito = document.getElementById("tablaCarrito");
const veriDelivery = document.getElementById("checkDelivery");
const spanTotal = document.getElementById("spanTotal");
const direccionDelivery = document.getElementById("direccionDelivery");
const precioDelivery = document.getElementById("precioDelivery");
const nombreDelivery = document.getElementById("nombreDelivery");
const numeroDelivery = document.getElementById("numeroDelivery");
const divDelivery = document.getElementById("delivery");

let ventasEnCarrito = 0;
let indiceArray = 0;
let arrayVentas = [];
let idAnterior = 0;
let indicesUsados = [];
let arrayInfoVenta = [];

// let indiceRepetido = false;

// let ward = true;

// Mostrar inputs de datos del delivery

veriDelivery.addEventListener("change", () => {
  direccionDelivery.value = "";
  precioDelivery.value = "";
  nombreDelivery.value = "";
  numeroDelivery.value = "";

  // divDelivery.classList.toggle("oculto", veriDelivery.checked);

  if (veriDelivery.checked) {
    divDelivery.style.display = "flex";
  } else {
    divDelivery.style.display = "none";
  }

  // if (veriDelivery.checked) {
  //   direccionDelivery.removeAttribute("disabled");
  //   precioDelivery.removeAttribute("disabled");
  //   nombreDelivery.removeAttribute("disabled");
  //   numeroDelivery.removeAttribute("disabled");
  // } else {
  //   direccionDelivery.setAttribute("disabled", "");
  //   precioDelivery.setAttribute("disabled", "");
  //   nombreDelivery.setAttribute("disabled", "");
  //   numeroDelivery.setAttribute("disabled", "");
  // }
});

// Agregar producto al carrito

botonAgregar.addEventListener("click", (event) => {
  const nombre = document.getElementById("nombreProducto").value.trim();
  const valorCantidad = document.getElementById("cantidad").value;
  const valorPrecio = document.getElementById("precio").value;
  const mensaje = document.getElementById("mensaje");

  const cantidad = parseInt(valorCantidad);
  const precio = parseFloat(valorPrecio);

  if (!nombre || !cantidad || !precio || precio < 0 || cantidad < 0) {
    mensaje.textContent =
      "⚠️ Completá todos los campos antes de agregar una venta.";
    mensaje.style.color = "red";
    return;
  } else {
    mensaje.textContent = "";
  }

  const detallesVenta = {
    producto: nombre,
    cantidad: cantidad,
    precio: precio,
  };

  arrayVentas.push(detallesVenta);

  const precioTotal = arrayVentas.reduce((sum, v) => sum + v.precio, 0);

  spanTotal.innerHTML = `<strong>TOTAL: $${precioTotal}</strong>`;

  console.log("arrayVentas Apenas:", arrayVentas);
  const filaCarrito = document.createElement("tr");

  filaCarrito.innerHTML = `
    <td id="${indiceArray}" class="oculto"></td>
    <td class="columnasCarrito">${detallesVenta.producto}</td>
    <td class="columnasCarrito">${detallesVenta.cantidad}</td>
    <td class="columnasCarrito">${detallesVenta.precio}</td>
    <td class="eliminar" id="elimFilaCarrito"><button id="elimFilaCarrito">X</button></td>
    `;

  // <td class="columnasCarrito">${venta.direccionDeli}</td>
  // <td class="columnasCarrito columnaPago">${venta.metodopago}</td>

  tablaCarrito.appendChild(filaCarrito);

  indiceArray++;
  ventasEnCarrito++;

  console.log("arrayVentas:", arrayVentas);

  document.getElementById("nombreProducto").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("precio").value = "";

  // document.getElementById("metodoPago").value = "";
  // document.getElementById("direccionDelivery").value = "";
  // document.getElementById("precioDelivery").value = "";
});

//CONFIRMAR CARRITO

confirmarCarrito.addEventListener("click", async () => {
  const metodo = document.getElementById("metodoPago").value.trim();
  const direccion = document.getElementById("direccionDelivery").value;
  // const valorEnvio = document.getElementById("precioDelivery").value;

  if (!metodo) {
    mensaje.textContent =
      "⚠️ Completá todos los campos antes de agregar una venta.";
    mensaje.style.color = "red";
    return;
  } else if (arrayVentas.length == 0) {
    mensaje.textContent =
      "⚠️ Agregá al menos un producto al carrito antes de confirmar la venta.";
    mensaje.style.color = "red";
    return;
  } else {
    mensaje.textContent = "";
  }

  if (
    (veriDelivery.checked && !direccion) ||
    (veriDelivery.checked && !nombreDelivery.value) ||
    (veriDelivery.checked && !numeroDelivery.value) ||
    (veriDelivery.checked && !precioDelivery.value) ||
    (veriDelivery.checked && precioDelivery.value < 0)
  ) {
    mensaje.textContent =
      "⚠️ Completá todos los campos antes de agregar una venta.";
    mensaje.style.color = "red";
    return;
  } else {
    mensaje.textContent = "";
  }

  // console.log(direccion, "<== direccion");

  const dataVenta = {
    cabecera: {
      metodoPago: metodo,
      direccion: direccion || "-",
      nombreCliente: nombreDelivery.value || "-",
      numeroCliente: numeroDelivery.value || "-",
      precioDelivery: parseInt(precioDelivery.value, 10) || 0,
    },
    detalles: arrayVentas,
  };

  indiceArray = 0;
  ventasEnCarrito = 0;
  indicesUsados = [];
  spanTotal.innerHTML = `<span><strong>TOTAL: $0</strong></span>`;

  const idVenta = await window.dbAPI.guardarVenta(dataVenta);

  if (arrayVentas.length > 1) {
    const fila = document.createElement("tr");
    const idFila = document.createElement("td");
    const columnaBotones = document.createElement("td");
    const columnaDireccion = document.createElement("td");
    const columnaCliente = document.createElement("td");
    const columnaPrecioEnvio = document.createElement("td");
    const columnaMetodo = document.createElement("td");

    idFila.setAttribute("id", `${idVenta}`);

    idFila.classList.add("columnas", "columnaIdApilada", "oculto");
    idFila.innerHTML = `${idVenta}`;
    fila.appendChild(idFila);

    const tdProductos = document.createElement("td");
    tdProductos.classList.add("filaMultiple");

    const tablaProductosApilada = document.createElement("table");
    tablaProductosApilada.classList.add("tablaApilada");
    tdProductos.appendChild(tablaProductosApilada);

    const bodyProductos = document.createElement("tbody");
    // bodyProductos.classList.add("bodyProductosApilados");
    tablaProductosApilada.appendChild(bodyProductos);

    const tdCantidad = document.createElement("td");
    tdCantidad.classList.add("filaMultiple");

    const tablaCantidadApilada = document.createElement("table");
    tablaCantidadApilada.classList.add("tablaApilada");
    tdCantidad.appendChild(tablaCantidadApilada);

    const bodyCantidad = document.createElement("tbody");
    bodyCantidad.classList.add("bodyProductosApilados");
    tablaCantidadApilada.appendChild(bodyCantidad);

    const tdPrecio = document.createElement("td");
    tdPrecio.classList.add("filaMultiple");

    const tablaPrecioApilada = document.createElement("table");
    tablaPrecioApilada.classList.add("tablaApilada");
    tdPrecio.appendChild(tablaPrecioApilada);

    const bodyPrecio = document.createElement("tbody");
    tablaPrecioApilada.appendChild(bodyPrecio);

    for (let m = 0; m < arrayVentas.length; m++) {
      const filaProducto = document.createElement("tr");
      const filaCantidad = document.createElement("tr");
      const filaPrecio = document.createElement("tr");

      filaProducto.innerHTML = `
      <td class="columnasApiladas">${arrayVentas[m].producto}</td>
      `;
      filaCantidad.innerHTML = `
      <td class="columnasApiladas">${arrayVentas[m].cantidad}</td>
      `;
      filaPrecio.innerHTML = `
      <td class="columnasApiladas">${arrayVentas[m].precio}</td>
      `;

      bodyProductos.appendChild(filaProducto);
      bodyCantidad.appendChild(filaCantidad);
      bodyPrecio.appendChild(filaPrecio);
    }

    fila.appendChild(tdProductos);
    fila.appendChild(tdCantidad);
    fila.appendChild(tdPrecio);

    //COLUMNAS

    //DIRECCION

    columnaDireccion.classList.add("columnas");
    columnaDireccion.innerHTML = `${dataVenta.cabecera.direccion}`;
    fila.appendChild(columnaDireccion);

    // DATA CLIENTE

    columnaCliente.classList.add("columnas");
    columnaCliente.innerHTML = `${dataVenta.cabecera.nombreCliente} - ${dataVenta.cabecera.numeroCliente}`;
    fila.appendChild(columnaCliente);

    //VALOR ENVIO

    columnaPrecioEnvio.classList.add("columnas");
    columnaPrecioEnvio.innerHTML = `${dataVenta.cabecera.precioDelivery}`;
    fila.appendChild(columnaPrecioEnvio);

    //METODO PAGO

    columnaMetodo.classList.add("columnaPago");
    columnaMetodo.innerHTML = `${metodo}`;
    fila.appendChild(columnaMetodo);

    //IMPRIMIR

    columnaBotones.classList.add("eliminar");
    columnaBotones.setAttribute("id", "botonesUltColumna");
    columnaBotones.innerHTML = `
    <button id="imprFila"><img src="assets/logoimprimir.png" id="logoImprimir"></button>`;
    fila.appendChild(columnaBotones);

    tablaBody.insertBefore(fila, tablaBody.firstChild);
  } else {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td class="columnasId oculto" id="${idVenta}">${idVenta}</td>
      <td class="columnas">${arrayVentas[0].producto}</td>
      <td class="columnas">${arrayVentas[0].cantidad}</td>
      <td class="columnas">${arrayVentas[0].precio}</td>
      <td class="columnas">${dataVenta.cabecera.direccion}</td>
      <td class="columnas">${dataVenta.cabecera.nombreCliente} - ${dataVenta.cabecera.numeroCliente}</td>
      <td class="columnas">${dataVenta.cabecera.precioDelivery}</td>
      <td class="columnaPago">${metodo}</td>
      <td id="botonesUltColumna"class="eliminar ultColumna"><button id="imprFila"><img src="assets/logoimprimir.png" id="logoImprimir"></button>
      </td>`;
    tablaBody.insertBefore(fila, tablaBody.firstChild);
  }

  veriDelivery.checked = false;
  direccionDelivery.value = "";
  document.getElementById("metodoPago").value = "";
  nombreDelivery.value = "";
  numeroDelivery.value = "";
  precioDelivery.value = "";
  tablaCarrito.innerHTML = ``;
  divDelivery.style.display = "none";

  arrayVentas = [];
});

//Logica de imprimir y eliminar
tablaBody.addEventListener("click", (event) => {
  if (event.target.id === "elimFila") {
    const fila = event.target.closest("tr");
    const hijo = fila.firstElementChild;
    window.dbAPI.eliminarVenta(hijo.id);
    fila.remove();
  } else if (
    event.target.id === "imprFila" ||
    event.target.id === "logoImprimir"
  ) {
    const fila = event.target.closest("tr");
    const hijo = fila.firstElementChild;
    window.dbAPI.imprimirVenta(hijo.id);
  }
});

//Logica de reenumeración
carrito.addEventListener("click", (event) => {
  if (event.target.id === "elimFilaCarrito") {
    const fila = event.target.closest("tr");
    const id = parseInt(fila.firstElementChild.id);

    arrayVentas.splice(id, 1);
    fila.remove();

    const filas = tablaCarrito.querySelectorAll("tr");

    filas.forEach((f, index) => {
      const primerTd = f.firstElementChild;

      if (primerTd) {
        primerTd.id = index;
      }
    });

    indiceArray = arrayVentas.length;
    ventasEnCarrito = arrayVentas.length;
    if (arrayVentas.length == 0) {
      spanTotal.innerHTML = `<span><strong>TOTAL: $0</strong></span>`;
    }

    console.log("Reenumerado:", arrayVentas);
  }
});
