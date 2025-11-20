export type Cuenta = {
  id: string;
  zona: string;
  nombre: string;
  telefonoCuenta: string;
  especialistaId: string;
  telefonoEspecialista: string;
};

// Backwards compatibility
export type Doctor = Cuenta;

// Helper function to get random specialist
const getRandomEspecialista = () => {
  const especialistas = [
    { id: 'sonia-cruz', telefono: '+52 55 6891234' },
    { id: 'fernando-ruiz', telefono: '+52 83 7551234' },
    { id: 'jesus-torres', telefono: '+52 83 2621234' },
    { id: 'miroslava-marques', telefono: '+52 55 4511234' },
    { id: 'karen-paez', telefono: '+52 55 7931234' },
    { id: 'elizabeth-arteaga', telefono: '+52 442 1812345' },
    { id: 'nereida-yanez', telefono: '+52 53 2811234' },
    { id: 'mariana-hernandez', telefono: '+52 99 9999999' },
    { id: 'martin-solis', telefono: '+52 55 3031234' },
    { id: 'saira-barrientos', telefono: '+52 81 2861234' },
  ];
  return especialistas[Math.floor(Math.random() * especialistas.length)];
};

// Catálogo de cuentas
export const CUENTAS_CATALOG: Cuenta[] = [
  { id: 'dana-guzman', zona: 'Zona Centro y Occidente', nombre: 'Dana Guzman', telefono: '5569319837' },
  { id: 'roman-mac-gregor', zona: 'Zona Centro y Golfo de México 2', nombre: 'ROMAN ALBERTO MAC-GREGOR HERNANDEZ', telefono: '9811251042' },
  { id: 'joaquin-guasti', zona: 'Zona Norte', nombre: 'JOAQUIN AMADOR GUASTI', telefono: '8183093736' },
  { id: 'fundacion-santos', zona: 'Zona Norte', nombre: 'FUNDACION SANTOS Y DE LA GARZA EVIA IBP', telefono: '401043311' },
  { id: 'getein-1600', zona: 'Zona Centro y Occidente', nombre: 'GETEIN 1600', telefono: '33 2255 1502' },
  { id: 'hospital-palmas', zona: 'Zona Centro y Golfo de México 1', nombre: 'HOSPITAL PALMAS', telefono: '7773140974' },
  { id: 'omar-zayas', zona: 'Zona Norte', nombre: 'OMAR ALEJANDRO ZAYAS VILLANUEVA', telefono: '8110665640' },
  { id: 'eder-arango', zona: 'Zona Centro y Golfo de México 2', nombre: 'EDER ALEXANDER ARANGO BRAVO', telefono: '55 5471 7676' },
  { id: 'mayra-galeana', zona: 'Zona Centro y Golfo de México 2', nombre: 'MAYRA CRISTINA GALEANA HERNANDEZ', telefono: '55 4639 7438' },
  { id: 'consultores-gdl', zona: 'Zona Centro y Occidente', nombre: 'Consultores en Oncologia Guadalajara', telefono: '3335964344' },
  { id: 'unidad-onco', zona: 'Zona Centro y Golfo de México 1', nombre: 'UNIDAD MEDICO ONCO HEMATOLOGICA', telefono: '222 237 9880' },
  { id: 'christus-muguerza', zona: 'Zona Centro y Occidente', nombre: 'CHRISTUS MUGUERZA', telefono: '5530131458' },
  { id: 'torre-medica-sur', zona: 'Zona Centro y Golfo de México 2', nombre: 'Torre Medica del Sur Queretaro', telefono: '4422482124' },
  { id: 'gineco-fertilidad', zona: 'Zona Centro y Golfo de México 2', nombre: 'Ginecologia, Obstetricia y Fertilidad', telefono: '4422290154' },
  { id: 'central-medic', zona: 'Zona Sur', nombre: 'Central Medic', telefono: '5564784048' },
  { id: 'consultores-tijuana', zona: 'Zona Norte', nombre: 'Consultores en Oncología Tijuana', telefono: '6645528024' },
  { id: 'clinica-goca', zona: 'Zona Centro y Golfo de México 2', nombre: 'Clinica Medica GOCA', telefono: '442 483 4559' },
  { id: 'clinica-galindas', zona: 'Zona Centro y Golfo de México 2', nombre: 'Clínica Galindas Querétaro', telefono: '442 195 9255' },
  { id: 'hospital-moscati', zona: 'Zona Centro y Golfo de México 2', nombre: 'Hospital Moscati Queretaro', telefono: '4421893663' },
  { id: 'consultores-qro', zona: 'Zona Centro y Occidente', nombre: 'Consultores En Oncología Querétaro', telefono: '442 629 9841' },
  { id: 'viridiana-mendez', zona: 'Zona Centro y Occidente', nombre: 'Viridiana Mendez Calderillo', telefono: '4616176874' },
  { id: 'labopat-puebla', zona: 'Zona Centro y Golfo de México 1', nombre: 'LABOPAT PUEBLA', telefono: '55 1969 4584' },
  { id: 'hospital-la-raza', zona: 'Zona Centro y Golfo de México 2', nombre: 'Hospital La Raza', telefono: '800 623 2323' },
  { id: 'ceo-queretaro', zona: 'Zona Centro y Golfo de México 2', nombre: 'CEO Queretaro', telefono: '4426299842' },
  { id: 'nereida-yanez-leon', zona: 'Zona Norte', nombre: 'Nereida Martina Yanez Leon', telefono: '181 2861 6977' },
  { id: 'hip-infantil-privado', zona: 'Zona Centro y Golfo de México 2', nombre: 'HIP.INFALTIL PRIVADO', telefono: '5553401000' },
  { id: 'sergio-arreola', zona: 'Zona Centro y Occidente', nombre: 'Sergio Alejandro Arreola Valdez', telefono: '3515961339' },
  { id: 'puerta-hierro-norte', zona: 'Zona Centro y Occidente', nombre: 'PUERTA DE HIERRO NORTE', telefono: '33 3848 2100' },
  { id: 'trabajo-administrativo', zona: 'Zona Centro y Golfo de México 2', nombre: 'TRABAJO ADMINISTRATIVO', telefono: '5522485535' },
  { id: 'alicia-gutierrez', zona: 'Zona Centro y Occidente', nombre: 'Alicia Gutierrez Mata', telefono: '3314675523' },
  { id: 'beneficencia-espanola', zona: 'Zona Norte', nombre: 'BENEFICENCIA ESPAÑOLA', telefono: '8332412359' },
  { id: 'univital', zona: 'Zona Centro y Occidente', nombre: 'UNIVITAL', telefono: '3331099130' },
  { id: 'centro-medico-occidente', zona: 'Zona Centro y Occidente', nombre: 'Centro Medico de Occidente', telefono: '3345678909' },
  { id: 'luis-barajas', zona: 'Zona Centro y Occidente', nombre: 'Luis Hector Barajas Flores', telefono: '3317064627' },
  { id: 'cuan', zona: 'Zona Norte', nombre: 'CUAN', telefono: '8183631717' },
  { id: 'instituto-cancerologia', zona: 'Zona Centro y Occidente', nombre: 'Instituto de Cancerologia', telefono: '3315678930' },
  { id: 'complices-sonrisas', zona: 'Zona Centro y Occidente', nombre: 'COMPLICES DE SONRISAS', telefono: '3317282770' },
  { id: 'unimca', zona: 'Zona Centro y Golfo de México 1', nombre: 'UNIMCA', telefono: '777-317-3211' },
  { id: 'instituto-nutricion', zona: 'Zona Centro y Golfo de México 2', nombre: 'INSTITUTO NACIONAL DE NUTRICION', telefono: '5566746387' },
  { id: 'labopat', zona: 'Zona Norte', nombre: 'LABOPAT', telefono: '0236587412' },
  { id: 'angeles-universidad', zona: 'Zona Centro y Golfo de México 2', nombre: 'ANGELES UNIVERSIDAD', telefono: '7809809808' },
  { id: 'angeles-santa-monica', zona: 'Zona Centro y Golfo de México 2', nombre: 'HOSPITAL ANGELES SANTA MONICA', telefono: '687686786' },
  { id: 'atrys', zona: 'Zona Centro y Golfo de México 2', nombre: 'ATRYS', telefono: '5513565721' },
  { id: 'juan-cazares', zona: 'Zona Centro y Occidente', nombre: 'Dr. Juan Carlos Cazares Price', telefono: '5531362307' },
  { id: 'san-angel-inn', zona: 'Zona Centro y Golfo de México 2', nombre: 'San Angel Inn Universidad', telefono: '55 5623 6363' },
  { id: 'joaquin-reinoso', zona: 'Zona Norte', nombre: 'Joaquin Gabriel Reinoso Toledo', telefono: '8118214562' },
  { id: 'vivo-47', zona: 'Zona Centro y Occidente', nombre: 'Vivo 47', telefono: '33 36102200' },
  { id: 'hospital-mac-celaya', zona: 'Zona Centro y Occidente', nombre: 'Hospital MAC Celaya', telefono: '4611920900' },
];
