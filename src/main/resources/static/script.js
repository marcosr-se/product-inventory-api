let inventarioGlobal = [];


// Función principal para leer datos del Backend (GET)
async function cargarInventario() {
    try {
        const respuesta = await fetch('/api/productos');
        inventarioGlobal = await respuesta.json();

        // Referencias al HTML
        const cuerpoTabla = document.getElementById('cuerpo-tabla');
        const selectorProducto = document.getElementById('selectorProducto'); // <-- NUEVO: Capturamos el selector

        // Limpiar la tabla y el selector antes de pintar
        cuerpoTabla.innerHTML = ''; 
        selectorProducto.innerHTML = '<option value="">-- Elige un producto --</option>'; // <-- NUEVO: Opción por defecto vacía

        let totalUnidades = 0;
        let valorTotal = 0.0;

        // Recorrer la lista de productos
        inventarioGlobal.forEach(producto => {
            // 1. Cálculos para los KPIs
            totalUnidades += producto.stock;
            valorTotal += (producto.precio * producto.stock);

            // 2. Pintar la fila en la tabla
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.stock}</td>
                <td>${producto.precio.toFixed(2)} €</td>
                <td><button onclick="borrarProducto(${producto.id})" style="padding: 0.2rem 0.5rem; background-color: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Borrar</button></td>
            `;
            cuerpoTabla.appendChild(fila);

            // 3. NUEVO: Pintar la opción en el selector desplegable
            const opcion = document.createElement('option');
            opcion.value = producto.id; // El valor oculto que usaremos luego para Java
            opcion.textContent = `${producto.id} - ${producto.nombre} (${producto.stock} uds)`; // Lo que ve el usuario
            selectorProducto.appendChild(opcion);
        });

        // Inyectar los totales en las tarjetas superiores

        document.getElementById('kpi-total').innerText = inventarioGlobal.length; // <-- AQUÍ ESTABA EL FALLO
        document.getElementById('kpi-unidades').innerText = totalUnidades;
        document.getElementById('kpi-valor').innerText = valorTotal.toFixed(2) + ' €';

    } catch (error) {
        console.error("Error crítico al conectar con Spring Boot:", error);
    }
}

// 5. Encender el motor automáticamente cuando la página termine de cargar
document.addEventListener('DOMContentLoaded', cargarInventario);

// Función para enviar un producto nuevo al Backend (POST)
async function guardarProductoNuevo() {
    // 1. Capturar lo que el usuario ha escrito en los inputs
    const nombre = document.getElementById('nombreProducto').value;
    const stock = document.getElementById('cantidadInicial').value;
    const precio = document.getElementById('precioProducto').value;

    // 2. Validación básica para no enviar datos vacíos a Java
    if (!nombre || stock === '' || precio === '') {
        alert("Por favor, rellena todos los campos del producto.");
        return;
    }

    // 3. Construir el objeto JSON que espera tu clase Producto en Java
    const productoJSON = {
        nombre: nombre,
        stock: parseInt(stock),
        precio: parseFloat(precio)
    };

    try {
        // 4. Hacer la llamada POST al servidor
        const respuesta = await fetch('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoJSON)
        });

        if (respuesta.ok) {
            // Si el servidor responde un OK (200), vaciamos el formulario
            document.getElementById('formulario-crear').reset();
            // Y volveamos a pedir el catálogo para que la tabla se actualice sola
            cargarInventario();
        } else {
            console.error("El servidor rechazó el producto.");
        }

    } catch (error) {
        console.error("Error al enviar el producto:", error);
    }
}

// 5. Enganchar la función al botón del formulario
// Buscamos el botón dentro del formulario-crear y le añadimos un "escuchador" de clics
document.querySelector('#formulario-crear button').addEventListener('click', guardarProductoNuevo);

async function actualizarStockProducto() {
    // 1. Extraer los datos del formulario HTML
    const selector = document.getElementById('selectorProducto');
    const idSeleccionado = selector.value;
    const cantidad = parseInt(document.getElementById('cantidadUnidades').value);
    const tipoMovimiento = document.querySelector('input[name="tipoMovimiento"]:checked').value;

    // 2. Validación básica de formato
    if (!idSeleccionado || isNaN(cantidad) || cantidad <= 0) {
        alert("Selecciona un producto y una cantidad válida mayor que 0.");
        return;
    }

    // 3. Validación Inteligente de Negocio (Tu idea implementada)
    if (tipoMovimiento === 'salida') {
        // Buscamos el producto en nuestra variable global
        const producto = inventarioGlobal.find(p => p.id == idSeleccionado);
        
        if (producto && cantidad > producto.stock) {
            alert(`Operación denegada: Solo hay ${producto.stock} unidades. No puedes retirar ${cantidad}.`);
            return; // Abortamos la ejecución, el servidor ni se entera
        }
    }

    try {
        // 4. Llamada de red al nuevo endpoint PUT de Java
        const respuesta = await fetch(`/api/productos/${idSeleccionado}/stock?cantidad=${cantidad}&operacion=${tipoMovimiento}`, {
            method: 'PUT'
        });

        if (respuesta.ok) {
            document.getElementById('formulario-modificar').reset();
            cargarInventario(); // Refrescar la tabla al instante
        } else {
            console.error("El servidor rechazó la operación de stock.");
        }
    } catch (error) {
        console.error("Error crítico de red:", error);
    }
}

// 5. Conectar la función al botón de Modificar Stock
document.querySelector('#formulario-modificar button').addEventListener('click', actualizarStockProducto);

// Función para borrar un producto definitivamente (DELETE)
// Función para borrar un producto definitivamente (DELETE)
async function borrarProducto(id) {
    // Barrera de seguridad para evitar clics accidentales
    if (!confirm("¿Alerta de sistema: Seguro que quieres eliminar este producto del catálogo?")) {
        return;
    }

    try {
        // ATENCIÓN AQUÍ: La ruta usa acentos graves (`), no comillas
        const respuesta = await fetch(`/api/productos/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            cargarInventario(); // Si Java confirma el borrado, refrescamos la tabla
        } else {
            console.error("El servidor ha rechazado la eliminación.");
        }
    } catch (error) {
        console.error("Fallo de red al intentar borrar:", error);
    }
}