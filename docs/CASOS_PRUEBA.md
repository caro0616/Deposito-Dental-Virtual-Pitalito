# Casos de Prueba por Historia de Usuario

## HU1: Como cliente, quiero modificar cantidades rápidamente en el carrito para ajustar mi pedido

| Caso | Descripción | Precondición | Acción | Resultado esperado |
|------|-------------|--------------|--------|-------------------|
| 1 | Aumentar la cantidad de un producto en el carrito | El usuario tiene al menos un producto en el carrito | El usuario hace clic en el botón "+" junto a un producto | La cantidad del producto aumenta en 1 y el total del carrito se actualiza correctamente |
| 2 | Disminuir la cantidad de un producto en el carrito | El usuario tiene al menos dos unidades de un producto en el carrito | El usuario hace clic en el botón "-" junto a ese producto | La cantidad del producto disminuye en 1 y el total del carrito se actualiza correctamente |
| 3 | Intentar poner una cantidad negativa | El usuario tiene un producto en el carrito | El usuario intenta disminuir la cantidad por debajo de 1 | El sistema no permite cantidades negativas ni cero; muestra un mensaje de error o bloquea la acción |
| 4 | El total se recalcula automáticamente al modificar cantidades | El usuario tiene varios productos en el carrito | El usuario modifica la cantidad de uno o más productos | El total del carrito se actualiza automáticamente reflejando los cambios |

---

## HU2: Como cliente, quiero finalizar la compra de forma simple y rápida

| Caso | Descripción | Precondición | Acción | Resultado esperado |
|------|-------------|--------------|--------|-------------------|
| 1 | Proceso de checkout en pocos pasos | El usuario tiene productos en el carrito | El usuario inicia el proceso de checkout | El proceso de compra se realiza en máximo 3 pasos (resumen, datos, confirmación) |
| 2 | Mostrar resumen del pedido antes de confirmar | El usuario está en el paso final del checkout | El sistema muestra un resumen con productos, cantidades, precios y total | El usuario puede revisar y confirmar su pedido |
| 3 | Validación de datos antes de confirmar compra | El usuario llena el formulario de datos de envío/pago | El usuario intenta confirmar la compra con datos incompletos o inválidos | El sistema muestra mensajes de error y no permite avanzar hasta corregir los datos |
| 4 | Confirmación exitosa de la compra | El usuario completa todos los pasos y datos correctamente | El usuario confirma la compra | El sistema muestra un mensaje de éxito y el pedido queda registrado |

---

## HU3: Como administrador, quiero gestionar órdenes para controlar el flujo de pedidos

| Caso | Descripción | Precondición | Acción | Resultado esperado |
|------|-------------|--------------|--------|-------------------|
| 1 | Visualizar todas las órdenes | El administrador accede al panel de órdenes | El sistema muestra una lista de todas las órdenes registradas | El administrador puede ver el listado completo con detalles básicos |
| 2 | Cambiar el estado de una orden | El administrador visualiza una orden específica | El administrador cambia el estado (ej: de “pendiente” a “enviado”) | El nuevo estado se guarda y refleja en la lista de órdenes |
| 3 | Mantener historial de cambios de estado | Una orden ha cambiado de estado al menos una vez | El administrador consulta el historial de la orden | El sistema muestra los cambios de estado con fecha y usuario responsable |
| 4 | Filtrar órdenes por estado | Hay órdenes en diferentes estados | El administrador usa un filtro para ver solo órdenes en un estado específico (ej: “pendiente”) | Solo se muestran las órdenes que cumplen el criterio de filtro |
