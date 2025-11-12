export type RawPaymentMethod = {
  row_number?: number;
  telefono?: string | number;
  "metodo _de_pago"?: string;
  nombre_de_la_aseguradora?: string;
  documento?: string;
  url_forma_pago?: string;
  [key: string]: unknown;
};

export type PaymentMethod = {
  id: string;
  phone: string;
  method: string;
  insurerName: string;
  document: string;
  documentUrl?: string;
};
