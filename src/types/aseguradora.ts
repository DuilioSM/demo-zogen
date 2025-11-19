export type Aseguradora = {
  id: string;
  nombre: string;
  rfc: string;
  regimenFiscal: string;
  activa: boolean;
  createdAt: string;
};

// Catálogo de aseguradoras
export const ASEGURADORAS_CATALOG: Aseguradora[] = [
  {
    id: 'gnp',
    nombre: 'GNP Seguros',
    rfc: 'GSM950623K33',
    regimenFiscal: '601',
    activa: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'axa',
    nombre: 'AXA Seguros',
    rfc: 'ASM970814QW9',
    regimenFiscal: '601',
    activa: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'metlife',
    nombre: 'MetLife',
    rfc: 'MSM880527ER4',
    regimenFiscal: '601',
    activa: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'zurich',
    nombre: 'Zurich Seguros',
    rfc: 'ZSM910312TY6',
    regimenFiscal: '601',
    activa: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mapfre',
    nombre: 'MAPFRE',
    rfc: 'MSM850904UI2',
    regimenFiscal: '601',
    activa: true,
    createdAt: new Date().toISOString(),
  },
];
