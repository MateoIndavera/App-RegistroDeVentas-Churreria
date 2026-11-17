# Sistema POS de Gestión de Ventas para Churrería

Aplicación de escritorio desarrollada para un comercio gastronómico, orientada a agilizar el registro de ventas, organizar los ingresos y facilitar la emisión de tickets.

El sistema fue desarrollado como proyecto freelance y entregado para su utilización en un entorno comercial real.

## Características principales

- **Registro de ventas:** permite cargar y registrar las operaciones del comercio.
- **Gestión de medios de pago:** contabilización de ingresos diferenciados por efectivo, transferencia y delivery.
- **Impresión de tickets:** generación de tickets mediante impresora térmica de 80 mm, con formatos diferenciados para consumo en el local y delivery.
- **Persistencia de datos:** almacenamiento local de la información utilizando SQLite.
- **Copias de seguridad:** generación de backups diarios de la base de datos.
- **Aplicación de escritorio:** interfaz desarrollada para facilitar las operaciones cotidianas del comercio.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| JavaScript | Lógica y funcionalidades de la aplicación |
| Electron | Desarrollo de la aplicación de escritorio |
| HTML5 | Estructura de la interfaz |
| CSS3 | Diseño y estilos |
| Node.js | Entorno de ejecución y funcionalidades del sistema |
| SQLite | Persistencia local de datos |
| better-sqlite3 | Comunicación con la base de datos |

## Arquitectura y almacenamiento

La aplicación utiliza Electron para integrar la interfaz web con funcionalidades de escritorio.

Los datos se almacenan localmente mediante SQLite, utilizando `better-sqlite3` para ejecutar operaciones sobre la base de datos.

El archivo de base de datos se aloja dentro del directorio de datos de usuario de la aplicación (`userData`), evitando depender de una ubicación fija dentro del proyecto.

Además, se implementó un mecanismo de copias de seguridad diarias para contar con respaldos de la información comercial.

## Impresión de tickets

El sistema integra una impresora térmica POS-80C de 80 mm para la emisión de comprobantes.

Se contemplan dos modalidades de impresión:
- Tickets para pedidos consumidos en el local.
- Tickets para pedidos de delivery.

## Contexto del proyecto

Este desarrollo surgió de una necesidad real de un comercio gastronómico.

El objetivo fue construir una herramienta que permitiera centralizar el registro de ventas, organizar los ingresos según el medio de pago y simplificar tareas operativas del negocio.

El proyecto me permitió trabajar sobre un caso de uso real, integrando desarrollo de interfaces, lógica de negocio, persistencia de datos e interacción con periféricos.

---

**Estado:** Finalizado y entregado para uso comercial.  
**Tipo:** Proyecto freelance.
