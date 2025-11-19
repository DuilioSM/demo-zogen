import jsPDF from 'jspdf';
import { AdminSolicitud } from '@/types/admin-solicitud';

export const generateInvoicePDF = (solicitud: AdminSolicitud) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('Factura Demo', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Factura #${solicitud.numeroFactura || 'N/A'}`, 105, 30, { align: 'center' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 105, 35, { align: 'center' });

  // Add client and company info
  doc.setFontSize(10);
  doc.text('Facturado a:', 20, 50);
  doc.text(solicitud.aseguradora, 20, 55);
  doc.text(solicitud.rfcAseguradora || 'RFC no especificado', 20, 60);

  doc.text('De:', 150, 50);
  doc.text('Zogen', 150, 55);
  doc.text('ZOG123456XYZ', 150, 60);

  // Add table header
  doc.setDrawColor(0);
  doc.setFillColor(230, 230, 230);
  doc.rect(20, 80, 170, 10, 'F');
  doc.text('Descripción', 25, 87);
  doc.text('Cantidad', 120, 87);
  doc.text('Precio Unitario', 140, 87);
  doc.text('Importe', 170, 87);

  // Add table body
  const item = {
    description: solicitud.servicio,
    quantity: solicitud.servicioCantidad || 1,
    price: solicitud.monto,
    total: (solicitud.servicioCantidad || 1) * solicitud.monto,
  };

  doc.text(item.description, 25, 97);
  doc.text(item.quantity.toString(), 125, 97, { align: 'right' });
  doc.text(`$${item.price.toLocaleString('es-MX')}`, 160, 97, { align: 'right' });
  doc.text(`$${item.total.toLocaleString('es-MX')}`, 190, 97, { align: 'right' });

  // Add totals
  const subtotal = item.total;
  const iva = subtotal * 0.16; // Assuming 16% IVA
  const total = subtotal + iva;

  doc.text('Subtotal:', 140, 120);
  doc.text(`$${subtotal.toLocaleString('es-MX')}`, 190, 120, { align: 'right' });
  doc.text('IVA (16%):', 140, 125);
  doc.text(`$${iva.toLocaleString('es-MX')}`, 190, 125, { align: 'right' });
  doc.setLineWidth(0.5);
  doc.line(140, 127, 190, 127);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, 132);
  doc.text(`$${total.toLocaleString('es-MX')}`, 190, 132, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // Add footer
  doc.setFontSize(8);
  doc.text('Este es un documento de demostración y no tiene validez fiscal.', 105, 280, { align: 'center' });
  doc.text('UUID Demo: 123e4567-e89b-12d3-a456-426614174000', 105, 285, { align: 'center' });

  // Open the PDF in a new window
  doc.output('dataurlnewwindow');
};
