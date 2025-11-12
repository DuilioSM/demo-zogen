export type RawPatient = {
  row_number?: number;
  "nombre(s)"?: string;
  apellidos?: string;
  telefono?: string | number;
  "genero biologico"?: string;
  curp?: string;
  "fecha de nacimiento"?: string;
  domicilio?: string;
  pais?: string;
  estado?: string;
  colonia?: string;
  "delegación / municipio / otro"?: string;
  "código postal"?: string | number;
  ine_url?: string;
  [key: string]: unknown;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  gender: string;
  curp: string;
  birthDate: string;
  address: string;
  country: string;
  state: string;
  neighborhood: string;
  municipality: string;
  postalCode: string;
  ineUrl?: string;
};
