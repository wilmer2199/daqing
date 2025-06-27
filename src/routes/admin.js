const express = require('express');
const router = express.Router();

const handlebars = require ('../lib/handlebars');
const pool = require('../database'); 
const { isLoggedIn, isAdmin } = require('../lib/auth'); // Importar los middlewares
const PDFDocument = require('pdfkit'); //para extraer el pdf 
// Ruta para el panel General del Administrador (opcional)





// --- VISTA 1: LISTADO DE TODOS LOS REGISTROS  ---
router.get('/control', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log("-----> INICIO DE CONSULTA DE Control <-----");
        const control = await pool.query(`
            SELECT
                c.id AS control_id,
                c.numero_registro,
                c.nombre_empresa,
                c.nombre_apellido,
                c.cedula_rif,
                c.telefono,
                c.placa_vehiculo,
                c.hora_entrada,
                c.hora_salida,
                c.firma,
                c.fecha_registro,
                c.observaciones,
                i.nombre_usuario,
                i.nombre_completo AS usuario_creador_nombre
            FROM
                Control c
            LEFT JOIN
                inicio i ON c.inicio_id = i.id
            ORDER BY
                c.fecha_registro DESC
        `);

        console.log("-----> FIN DE CONSULTA DE CONTROLES <-----");
        console.log("Tipo de 'control' recibido:", typeof control); // NOTA: Aquí se llama 'control', no 'registro'
        console.log("¿'control' es un arreglo?", Array.isArray(control));
        console.log("Contenido de 'control':", control);
        console.log("Número de registros:", control.length);

        // Renderiza la vista 'admin/control.hbs' pasándole los datos
        res.render('admin/control', { control }); 
    } catch (err) {
        console.error("-----> ERROR EN RUTA /admin/control <-----:", err);
        req.flash('message', 'Error al cargar la lista de registros.');
        req.session.save(() => {
            res.redirect('/admin'); // Asegúrate de que esta ruta exista
        });
    }
});

// --- RUTA PARA DESCARGAR PDF DE REGISTROS DE CONTROL ---
router.get('/control/download-pdf', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log("-----> INICIO DE GENERACIÓN DE PDF DE CONTROL <-----");

        const registros = await pool.query(` 
            SELECT
                c.id AS control_id,
                c.numero_registro,
                c.nombre_empresa,
                c.nombre_apellido,
                c.cedula_rif,
                c.telefono,
                c.placa_vehiculo,
                c.hora_entrada,
                c.hora_salida,
                c.firma,
                c.fecha_registro,
                c.observaciones,
                i.nombre_usuario,
                i.nombre_completo AS usuario_creador_nombre
            FROM
                Control c
            LEFT JOIN
                inicio i ON c.inicio_id = i.id
            ORDER BY
                c.fecha_registro DESC
        `);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_control.pdf"');

        const doc = new PDFDocument({ margin: 30, size: 'A4' }); // Tamaño A4
        doc.pipe(res);

        doc.fontSize(16).text('Reporte de Control de Acceso Vehicular', { align: 'center' });
        doc.moveDown(1); // Espacio después del título

        const tableStartX = doc.page.margins.left; // El margen izquierdo del documento
        const tableEndX = doc.page.width - doc.page.margins.right; // El margen derecho del documento
        let currentY = doc.y; // Posición Y inicial para la tabla
        const cellPadding = 5; // Padding interno de la celda

        // Columnas y sus anchos. Ajustadas para A4 (535 puntos utilizables de ancho)
        const columns = [
            { id: 'numero_registro', header: 'No. Reg.', width: 40, align: 'left' },
            { id: 'nombre_empresa', header: 'Empresa', width: 70, align: 'left' },
            { id: 'nombre_apellido', header: 'Chofer', width: 70, align: 'left' },
            { id: 'cedula_rif', header: 'Cédula/RIF', width: 50, align: 'left' },
            { id: 'telefono', header: 'Teléfono', width: 50, align: 'left' },
            { id: 'placa_vehiculo', header: 'Placa', width: 45, align: 'left' },
            { id: 'hora_entrada', header: 'Entrada', width: 45, align: 'left' },
            { id: 'hora_salida', header: 'Salida', width: 45, align: 'left' },
            { id: 'nombre_usuario', header: 'Usuario Creador', width: 60, align: 'left' },
            { id: 'fecha_registro', header: 'Fecha', width: 60, align: 'left', format: (date) => date ? new Date(date).toLocaleDateString() : '' }
        ];

        // Función para obtener el texto de una celda
        const getCellText = (data, col, isHeader) => {
            if (isHeader) return col.header;
            return col.format ? col.format(data[col.id]) : (data[col.id] || '');
        };

        // Función para calcular la altura de una fila basada en el contenido más alto
        const calculateRowHeight = (data, isHeader = false) => {
            let maxTextHeight = 0;
            doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);

            columns.forEach(col => {
                const text = getCellText(data, col, isHeader);
                // Calcular la altura del texto, envolviéndolo en el ancho de la columna
                const textHeight = doc.heightOfString(text, { width: col.width - (2 * cellPadding), lineGap: 2 });
                maxTextHeight = Math.max(maxTextHeight, textHeight);
            });
            // Añadir padding vertical a la altura calculada
            return maxTextHeight + (2 * cellPadding);
        };

        // Función para dibujar una fila de la tabla (cabecera o datos)
        const generateTableRow = (y, data, isHeader = false) => {
            const rowHeight = calculateRowHeight(data, isHeader); // Altura dinámica de la fila
            const finalY = y + rowHeight;

            doc.lineWidth(0.5); // Grosor de las líneas de la tabla

            // Dibujar línea superior de la fila
            doc.moveTo(tableStartX, y).lineTo(tableEndX, y).stroke();

            let currentX = tableStartX;
            columns.forEach((col, i) => {
                const text = getCellText(data, col, isHeader);
                
                // Posicionar el texto en el centro vertical de la celda
                const textWidth = col.width - (2 * cellPadding);
                const textHeight = doc.heightOfString(text, { width: textWidth, lineGap: 2 });
                const textY = y + cellPadding + (rowHeight - textHeight - (2 * cellPadding)) / 2;
                
                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
                doc.text(text, currentX + cellPadding, textY, { // Añadir padding horizontal
                    width: textWidth,
                    align: col.align,
                    lineGap: 2
                });
                
                // Dibujar línea vertical derecha de la celda
                doc.moveTo(currentX + col.width, y).lineTo(currentX + col.width, finalY).stroke();
                currentX += col.width;
            });

            // Dibujar línea vertical izquierda de la primera columna (para cerrar la tabla por el lado izquierdo)
            doc.moveTo(tableStartX, y).lineTo(tableStartX, finalY).stroke();

            // Dibujar línea inferior de la fila
            doc.moveTo(tableStartX, finalY).lineTo(tableEndX, finalY).stroke();

            // Retornar la nueva posición Y para la siguiente fila
            return finalY;
        };

        // Función para dibujar las cabeceras de la tabla (llama a generateTableRow)
        const generateHeader = (startY) => {
            doc.fillColor('black'); // Color para el texto de la cabecera
            return generateTableRow(startY, {}, true); // Dibuja la fila de cabecera
        };

        // Dibuja la cabecera inicial
        currentY = generateHeader(currentY);

        // Dibuja las filas de datos
        registros.forEach(registro => {
            // Calcular la altura que necesitará esta fila para verificar si cabe
            const requiredRowHeight = calculateRowHeight(registro, false);

            // Revisa si hay suficiente espacio para la siguiente fila, incluyendo la línea inferior
            if (currentY + requiredRowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage(); // Añade nueva página
                currentY = doc.page.margins.top; // Reinicia Y al margen superior de la nueva página
                currentY = generateHeader(currentY); // Dibuja cabeceras en la nueva página y actualiza Y
            }

            currentY = generateTableRow(currentY, registro); // Dibuja la fila de datos y actualiza Y
        });

        doc.end();
        console.log("-----> PDF DE CONTROL GENERADO Y ENVIADO <-----");

    } catch (err) {
        console.error("-----> ERROR AL GENERAR PDF DE CONTROL <-----:", err);
        req.flash('message', 'Error al generar el reporte PDF.');
        req.session.save(() => {
            res.redirect('/admin/control');
        });
    }
});

// --- RUTA PARA ELIMINAR UN REGISTRO DE ACCESO VEHICULAR ---
router.get('/control/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        // Antes de eliminar el cliente, es crucial eliminar cualquier solicitud
        // o registro que dependa de este cliente (si tienes restricciones ON DELETE CASCADE,
        // esto lo hará la base de datos automáticamente, pero es bueno ser explícito
        // o al menos consciente de las dependencias).
        // Por ejemplo, si tienes solicitudes en la tabla 'Servicios'
        // que referencian a 'Clientes', debes manejar esto.
        // Si tienes una relación ON DELETE CASCADE definida en tu DB,
        // MySQL manejará la eliminación de solicitudes relacionadas automáticamente.
        // Si no la tienes, necesitarías algo como:
        // await pool.query('DELETE FROM Servicios WHERE cliente_id = ?', [id]);
        // Y si el cliente tiene una entrada en la tabla 'inicio' (inicio_id),
        // es más complicado si otros clientes o admins usan la misma entrada de 'inicio'.
        // Por ahora, asumiremos que solo se elimina el registro de la tabla 'Clientes'.
        console.log(`-----> INTENTANDO ELIMINAR CONTROL CON ID: ${id} <-----`);
        const result = await pool.query('DELETE FROM control WHERE id = ?', [id]);
        console.log("-----> RESULTADO DE LA ELIMINACIÓN DEL control <-----:", result);
        
        req.flash('success', 'Registro eliminado exitosamente.');
        req.session.save(() => {
            res.redirect('/admin/control'); // Redirigir de nuevo a la lista de clientes
        });

    } catch (err) {
        console.error("-----> ERROR AL ELIMINAR CONTROL<-----:", err);
        req.flash('message', 'Error al eliminar el registro.');
        req.session.save(() => {
            res.redirect('/admin/control');
        });
    }
});



module.exports = router;