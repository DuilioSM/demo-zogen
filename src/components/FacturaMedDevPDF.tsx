import jsPDF from 'jspdf';
import type { VentaMedDev, ProductoMedDev, ClienteMedDev } from '@/types/meddev';

interface GenerateFacturaParams {
  venta: VentaMedDev;
  cliente: ClienteMedDev;
  productos: ProductoMedDev[];
}

export const generateFacturaMedDevPDF = ({ venta, cliente, productos }: GenerateFacturaParams) => {
  const doc = new jsPDF();

  // Colores corporativos
  const primaryColor = [124, 58, 237]; // Purple-600
  const accentColor = [236, 72, 153]; // Pink-500
  const darkGray = [55, 65, 81]; // Gray-700
  const lightGray = [243, 244, 246]; // Gray-100

  // Header con fondo de color
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 45, 'F');

  // Logo (simulado con texto estilizado ya que jsPDF no carga imágenes fácilmente sin base64)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('ZOGEN', 20, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Medical Devices', 20, 27);

  // Título FACTURA
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', 210 - 20, 25, { align: 'right' });

  // Línea decorativa con degradado simulado
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(3);
  doc.line(0, 45, 210, 45);

  // Reset color para el resto del documento
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  // Información de la factura (lado derecho)
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(130, 55, 60, 35, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FOLIO DE VENTA', 135, 62);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(venta.folio, 135, 68);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FACTURA', 135, 75);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(venta.facturaNumero || 'N/A', 135, 81);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FECHA', 135, 88);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(venta.facturaFecha || venta.fecha).toLocaleDateString('es-MX'), 135, 94);

  // Información de la empresa (lado izquierdo)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DE:', 20, 62);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Zogen Medical Devices S.A. de C.V.', 20, 69);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('RFC: ZMD123456XYZ', 20, 75);
  doc.text('Av. Innovación #123, Parque Tecnológico', 20, 80);
  doc.text('Col. Centro, CP 12345, Ciudad de México', 20, 85);
  doc.text('Tel: (55) 1234-5678 | contacto@zogen.mx', 20, 90);

  // Información del cliente
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FACTURADO A:', 20, 105);

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(20, 108, 170, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(cliente.razonSocial, 25, 115);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`RFC: ${cliente.rfc}`, 25, 121);

  if (cliente.direccion) {
    const direccionLineas = doc.splitTextToSize(cliente.direccion, 80);
    doc.text(direccionLineas[0], 25, 127);
  }

  if (cliente.telefono) {
    doc.text(`Tel: ${cliente.telefono}`, 110, 121);
  }
  if (cliente.email) {
    doc.text(`Email: ${cliente.email}`, 110, 127);
  }

  // Tabla de productos
  const tableTop = 145;

  // Header de la tabla
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, tableTop, 170, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPCIÓN', 25, tableTop + 7);
  doc.text('CANT.', 125, tableTop + 7, { align: 'right' });
  doc.text('PRECIO UNIT.', 155, tableTop + 7, { align: 'right' });
  doc.text('IMPORTE', 185, tableTop + 7, { align: 'right' });

  // Body de la tabla
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  let yPosition = tableTop + 15;
  let isAlternate = false;

  venta.productos.forEach((itemVenta, index) => {
    const producto = productos.find((p) => p.id === itemVenta.productoId);
    if (producto) {
      // Fondo alternado para filas
      if (isAlternate) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, yPosition - 5, 170, 8, 'F');
      }

      const total = itemVenta.cantidad * itemVenta.precioUnitario;
      const descripcion = doc.splitTextToSize(producto.nombre, 85);

      doc.text(descripcion[0], 25, yPosition);
      if (producto.descripcion && descripcion.length === 1) {
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(producto.descripcion.substring(0, 60), 25, yPosition + 4);
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        yPosition += 4;
      }

      doc.text(itemVenta.cantidad.toString(), 125, yPosition, { align: 'right' });
      doc.text(`$${itemVenta.precioUnitario.toLocaleString('es-MX')}`, 155, yPosition, { align: 'right' });
      doc.text(`$${total.toLocaleString('es-MX')}`, 185, yPosition, { align: 'right' });

      yPosition += 10;
      isAlternate = !isAlternate;
    }
  });

  // Línea separadora
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);

  // Totales
  const totalsY = yPosition + 10;

  doc.setFontSize(10);
  doc.text('Subtotal:', 140, totalsY);
  doc.text(`$${venta.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 185, totalsY, { align: 'right' });

  doc.text('IVA (16%):', 140, totalsY + 7);
  doc.text(`$${venta.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 185, totalsY + 7, { align: 'right' });

  // Línea antes del total
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(1);
  doc.line(140, totalsY + 10, 190, totalsY + 10);

  // Total
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(140, totalsY + 12, 50, 10, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', 145, totalsY + 19);
  doc.text(`$${venta.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 185, totalsY + 19, { align: 'right' });

  // Notas
  if (venta.notas) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('Notas:', 20, totalsY + 30);
    const notasLineas = doc.splitTextToSize(venta.notas, 170);
    doc.text(notasLineas, 20, totalsY + 36);
  }

  // Footer
  const footerY = 270;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(20, footerY, 190, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Este documento es una representación impresa de un CFDI', 105, footerY + 5, { align: 'center' });
  doc.text(`UUID: ${venta.id}-${Date.now().toString(36)}`.toUpperCase(), 105, footerY + 10, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')} | www.zogen.mx`, 105, footerY + 15, { align: 'center' });

  // Abrir en nueva ventana
  doc.output('dataurlnewwindow');
};
