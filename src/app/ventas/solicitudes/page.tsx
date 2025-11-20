"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Loader2,
  Pencil,
  Trash,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSolicitudes } from "@/hooks/useSolicitudes";
import type { Solicitud } from "@/types/solicitudes";
import { CUENTAS_CATALOG } from "@/types/cuenta";
import { ESPECIALISTAS_CATALOG } from "@/types/especialista";
import type { AdminSolicitud } from "@/types/admin-solicitud";
import { PRODUCTOS_CATALOG } from "@/types/servicio";

const ORDER_FIELDS = [
  { value: "createdAt", label: "Fecha de solicitud" },
  { value: "doctor", label: "Médico" },
  { value: "patient", label: "Paciente" },
] as const;

const ORDER_DIRECTIONS = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
] as const;

type OrderField = (typeof ORDER_FIELDS)[number]["value"];
type OrderDirection = (typeof ORDER_DIRECTIONS)[number]["value"];

const sanitizePhone = (value?: string) => (value ? value.replace(/[^\d]/g, "") : "");

export default function SolicitudesListPage() {
  const { solicitudes, status, errorMessage, fetchSolicitudes } = useSolicitudes();
  const [globalSearch, setGlobalSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [orderField, setOrderField] = useState<OrderField>("createdAt");
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminData, setAdminData] = useState<Map<string, AdminSolicitud>>(new Map());

  // Form state - Datos completos del paciente
  const [formData, setFormData] = useState({
    // Datos básicos de solicitud
    doctor: "",
    patient: "",
    condition: "",
    testType: "",
    contactPhone: "",
    vendorPhone: "",

    // Datos adicionales del paciente
    firstName: "",
    lastName: "",
    gender: "",
    curp: "",
    birthDate: "",
    country: "México",
    state: "",
    municipality: "",
    neighborhood: "",
    postalCode: "",
    address: "",
  });

  // Cargar datos de administración para cada solicitud
  useEffect(() => {
    const loadAdminData = () => {
      const newAdminData = new Map<string, AdminSolicitud>();
      solicitudes.forEach((solicitud) => {
        const data = localStorage.getItem(`admin-solicitud-${solicitud.id}`);
        if (data) {
          try {
            newAdminData.set(solicitud.id, JSON.parse(data));
          } catch (e) {
            console.error(`Error parsing admin data for ${solicitud.id}`, e);
          }
        }
      });
      setAdminData(newAdminData);
    };
    loadAdminData();
  }, [solicitudes]);

  // Función para obtener el estatus de la prueba
  const getEstatusPrueba = (solicitudId: string): { label: string; color: string } => {
    const admin = adminData.get(solicitudId);
    if (!admin) {
      return { label: 'Sin datos', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }

    // Verificar si la prueba está completada
    if (admin.statusResultados === 'completado') {
      return { label: 'Prueba realizada', color: 'bg-green-100 text-green-700 border-green-200' };
    }

    // Verificar si fue recibido en laboratorio
    if (admin.statusLogistica === 'entregado-lab') {
      return { label: 'Recibido en lab', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }

    // Verificar si está en proceso
    if (admin.statusResultados === 'en-proceso') {
      return { label: 'En proceso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }

    // Verificar si fue enviado al laboratorio
    if (admin.statusCompra === 'enviado-lab') {
      return { label: 'Enviado a lab', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }

    // Verificar estatus de logística
    if (admin.statusLogistica === 'recolectado') {
      return { label: 'Recolectado', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    }

    if (admin.statusLogistica === 'en-ruta') {
      return { label: 'En ruta', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' };
    }

    if (admin.statusLogistica === 'programado') {
      return { label: 'Recolección programada', color: 'bg-teal-100 text-teal-700 border-teal-200' };
    }

    // Estado inicial
    return { label: 'Pendiente', color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  // Función para obtener el estatus de facturación
  const getEstatusFactura = (solicitudId: string): { label: string; color: string } => {
    const admin = adminData.get(solicitudId);
    if (!admin) {
      return { label: 'Sin datos', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }

    // Verificar si está pagado
    if (admin.statusCobranza === 'pagado') {
      return { label: 'Pagado', color: 'bg-green-100 text-green-700 border-green-200' };
    }

    // Verificar si está facturado o timbrado
    if (admin.statusFacturacion === 'facturado' || admin.statusFacturacion === 'timbrado') {
      return { label: 'Facturado', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }

    // Estado pendiente de factura
    return { label: 'Pendiente Factura', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  };

  const conditionOptions = useMemo(() => {
    const unique = new Set<string>();
    solicitudes.forEach((s) => {
      if (s.condition && s.condition !== "Sin padecimiento") {
        unique.add(s.condition);
      }
    });
    return Array.from(unique).sort();
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    const query = globalSearch.toLowerCase();

    return solicitudes
      .filter((solicitud) => {
        if (query) {
          const haystack = `${solicitud.patient} ${solicitud.doctor} ${solicitud.condition}`.toLowerCase();
          if (!haystack.includes(query)) {
            return false;
          }
        }

        if (doctorFilter && !solicitud.doctor.toLowerCase().includes(doctorFilter.toLowerCase())) {
          return false;
        }

        if (patientFilter && !solicitud.patient.toLowerCase().includes(patientFilter.toLowerCase())) {
          return false;
        }

        if (conditionFilter !== "all" && solicitud.condition !== conditionFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => sortSolicitudes(a, b, orderField, orderDirection));
  }, [
    solicitudes,
    globalSearch,
    doctorFilter,
    patientFilter,
    conditionFilter,
    orderField,
    orderDirection,
  ]);

  const visibleIds = filteredSolicitudes.map((s) => s.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleVisibleSelection = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSingleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar ${selectedIds.size} solicitud(es)? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    // Eliminar solicitudes del localStorage
    const stored = localStorage.getItem('zogen-solicitudes');
    if (stored) {
      const allSolicitudes = JSON.parse(stored);
      const filtered = allSolicitudes.filter((s: Solicitud) => !selectedIds.has(s.id));
      localStorage.setItem('zogen-solicitudes', JSON.stringify(filtered));
    }

    // Eliminar datos relacionados del localStorage
    selectedIds.forEach((id) => {
      localStorage.removeItem(`patient-data-${id}`);
      localStorage.removeItem(`cotizacion-${id}`);
      localStorage.removeItem(`files-${id}`);
      localStorage.removeItem(`vt-request-${id}`);
    });

    // Limpiar selección y recargar
    setSelectedIds(new Set());
    fetchSolicitudes();

    alert(`${selectedIds.size} solicitud(es) eliminada(s) correctamente`);
  };

  const handleCreateSolicitud = () => {
    // Generar ID único para la solicitud
    const solicitudId = `SOL-${Date.now()}`;

    // Construir nombre completo del paciente
    const nombreCompleto = formData.firstName && formData.lastName
      ? `${formData.firstName} ${formData.lastName}`.trim()
      : formData.patient;

    // Crear una nueva solicitud en localStorage
    const newSolicitud: Solicitud = {
      id: solicitudId,
      doctor: formData.doctor,
      patient: nombreCompleto,
      condition: formData.condition,
      testType: formData.testType,
      contactPhone: formData.contactPhone,
      vendorPhone: formData.vendorPhone,
      createdAt: new Date().toISOString(),
    };

    // Guardar solicitud en localStorage
    const stored = localStorage.getItem('zogen-solicitudes');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('zogen-solicitudes', JSON.stringify([...existing, newSolicitud]));

    // Guardar datos del paciente asociados a esta solicitud
    const patientData = {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      phone: formData.contactPhone || "",
      gender: formData.gender || "",
      curp: formData.curp || "",
      birthDate: formData.birthDate || "",
      country: formData.country || "México",
      state: formData.state || "",
      municipality: formData.municipality || "",
      neighborhood: formData.neighborhood || "",
      postalCode: formData.postalCode || "",
      address: formData.address || "",
      ineUrl: "",
    };

    // Guardar datos del paciente vinculados al solicitudId
    localStorage.setItem(`patient-data-${solicitudId}`, JSON.stringify(patientData));

    // Resetear form y cerrar diálogo
    setFormData({
      doctor: "",
      patient: "",
      condition: "",
      testType: "",
      contactPhone: "",
      vendorPhone: "",
      firstName: "",
      lastName: "",
      gender: "",
      curp: "",
      birthDate: "",
      country: "México",
      state: "",
      municipality: "",
      neighborhood: "",
      postalCode: "",
      address: "",
    });
    setIsDialogOpen(false);

    // Recargar solicitudes
    fetchSolicitudes();

    alert(`✅ Solicitud creada correctamente: ${solicitudId}`);
  };

  const renderTableBody = () => {
    if (status === "loading") {
      return (
        <tr>
          <td colSpan={6} className="py-16 text-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
              <p className="text-sm text-[#666]">Cargando solicitudes…</p>
            </div>
          </td>
        </tr>
      );
    }

    if (status === "error") {
      return (
        <tr>
          <td colSpan={6} className="py-16 text-center">
            <div className="space-y-4">
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
              <Button onClick={fetchSolicitudes} className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
                Reintentar
              </Button>
            </div>
          </td>
        </tr>
      );
    }

    if (filteredSolicitudes.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-16 text-center text-sm text-[#666]">
            No encontramos solicitudes con los criterios seleccionados.
          </td>
        </tr>
      );
    }

    return filteredSolicitudes.map((solicitud, index) => {
      const phoneParam = sanitizePhone(solicitud.contactPhone) || solicitud.id;
      const editPath = `/ventas/solicitudes/editar/${solicitud.id}`;
      const viewPath = `/ventas/solicitudes/${solicitud.id}`;
      const isSelected = selectedIds.has(solicitud.id);

      const estatusPrueba = getEstatusPrueba(solicitud.id);
      const estatusFactura = getEstatusFactura(solicitud.id);

      return (
        <tr
          key={solicitud.id}
          className={`border-b border-[#E0DDD8] ${index % 2 === 0 ? 'bg-[#F5F0E8]' : 'bg-white'} hover:bg-[#EDE6D9]`}
        >
          <td className="px-4 py-4">
            <div className="flex items-center gap-3 text-[#2C2C2C]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#A8A39A] accent-[#7B5C45]"
                checked={isSelected}
                onChange={() => toggleSingleSelection(solicitud.id)}
              />
              <Link
                href={viewPath}
                className="hover:text-[#7B5C45]"
                title="Ver"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={editPath}
                className="hover:text-[#7B5C45]"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button type="button" className="hover:text-[#7B5C45]" title="Borrar">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
          <td className="px-4 py-4 text-sm text-[#2C2C2C] font-mono">
            {solicitud.id}
          </td>
          <td className="px-4 py-4 text-sm text-[#2C2C2C]">
            {solicitud.doctor}
          </td>
          <td className="px-4 py-4 text-sm text-[#2C2C2C]">
            {solicitud.patient}
          </td>
          <td className="px-4 py-4">
            <Badge className={estatusPrueba.color}>
              {estatusPrueba.label}
            </Badge>
          </td>
          <td className="px-4 py-4">
            <Badge className={estatusFactura.color}>
              {estatusFactura.label}
            </Badge>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="bg-[#F5F0E8]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#3C4858]">Solicitudes de Pruebas</h1>
              <p className="text-sm text-[#666] mt-2">Total de solicitudes: {solicitudes.length}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center">
              <span className="font-semibold text-[#2C2C2C]">Ordenar</span>
              <Select value={orderField} onValueChange={(value) => setOrderField(value as OrderField)}>
                <SelectTrigger className="w-48 border-[#D5D0C8] bg-[#F5F0E8] text-[#2C2C2C]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_FIELDS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={orderDirection}
                onValueChange={(value) => setOrderDirection(value as OrderDirection)}
              >
                <SelectTrigger className="w-48 border-[#D5D0C8] bg-[#F5F0E8] text-[#2C2C2C]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_DIRECTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={toggleVisibleSelection}
                className="flex items-center gap-2 border-[#7B5C45] bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white shadow-none hover:bg-[#6A4D38]"
              >
                Seleccionar visibles
                <div className="flex h-4 w-4 items-center justify-center rounded border border-white bg-transparent">
                  {allVisibleSelected && <span className="text-xs">✓</span>}
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 border-[#8B4513] bg-[#8B4513] px-4 py-2 text-sm font-medium text-white shadow-none hover:bg-[#6F3609] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Eliminar ({selectedIds.size})
                <Trash className="h-4 w-4" />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white hover:bg-[#6A4D38]">
                    Agregar
                    <span className="text-lg">+</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nueva Solicitud de Estudio</DialogTitle>
                    <DialogDescription>
                      Completa la información del paciente y la solicitud de estudio genético oncológico
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    {/* Sección 1: Datos de la Solicitud */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#2C2C2C] border-b pb-2">Información de la Solicitud</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="doctor">Médico Solicitante *</Label>
                          <Select
                            value={formData.doctor}
                            onValueChange={(value) => setFormData({ ...formData, doctor: value })}
                          >
                            <SelectTrigger className="border-[#D5D0C8]">
                              <SelectValue placeholder="Selecciona un médico" />
                            </SelectTrigger>
                            <SelectContent>
                              {CUENTAS_CATALOG.map((cuenta) => (
                                <SelectItem key={cuenta.id} value={cuenta.nombre}>
                                  {cuenta.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="testType">Tipo de Estudio *</Label>
                          <Select
                            value={formData.testType}
                            onValueChange={(value) => setFormData({ ...formData, testType: value })}
                          >
                            <SelectTrigger className="border-[#D5D0C8]">
                              <SelectValue placeholder="Selecciona un estudio" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCTOS_CATALOG.map((producto) => (
                                <SelectItem key={producto.id} value={producto.nombre}>
                                  {producto.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="condition">Padecimiento *</Label>
                          <Input
                            id="condition"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            placeholder="Cáncer de mama"
                            className="border-[#D5D0C8]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vendorPhone">Especialista *</Label>
                          <Select
                            value={formData.vendorPhone}
                            onValueChange={(value) => setFormData({ ...formData, vendorPhone: value })}
                          >
                            <SelectTrigger className="border-[#D5D0C8]">
                              <SelectValue placeholder="Selecciona un especialista" />
                            </SelectTrigger>
                            <SelectContent>
                              {ESPECIALISTAS_CATALOG.map((especialista) => (
                                <SelectItem key={especialista.id} value={especialista.telefono}>
                                  {especialista.nombreCompleto}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Sección 2: Datos del Paciente */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#2C2C2C] border-b pb-2">Datos del Paciente</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nombre(s) *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value, patient: `${e.target.value} ${formData.lastName}`.trim() })}
                            placeholder="María"
                            className="border-[#D5D0C8]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellidos *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value, patient: `${formData.firstName} ${e.target.value}`.trim() })}
                            placeholder="González López"
                            className="border-[#D5D0C8]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Teléfono *</Label>
                          <Input
                            id="contactPhone"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            placeholder="+52 55 1234 5678"
                            className="border-[#D5D0C8]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Género</Label>
                          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger className="border-[#D5D0C8]">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-[#D5D0C8]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateSolicitud}
                      className="bg-[#7B5C45] hover:bg-[#6A4D38]"
                      disabled={!formData.doctor || !formData.firstName || !formData.lastName || !formData.condition || !formData.testType || !formData.contactPhone || !formData.vendorPhone}
                    >
                      Crear Solicitud
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#D5D0C8]">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#E8E3DB]">
                  <th className="w-16 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#A8A39A] accent-[#7B5C45]"
                      checked={allVisibleSelected}
                      onChange={toggleVisibleSelection}
                    />
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">ID</th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Médico</th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Paciente</th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Estatus Prueba</th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Estatus Factura</th>
                </tr>
                <tr className="bg-[#E8E3DB]">
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">
                    <Input
                      value={doctorFilter}
                      onChange={(event) => setDoctorFilter(event.target.value)}
                      placeholder=""
                      className="h-9 border-[#D5D0C8] bg-white text-sm text-[#2C2C2C]"
                    />
                  </th>
                  <th className="px-4 py-3">
                    <Input
                      value={patientFilter}
                      onChange={(event) => setPatientFilter(event.target.value)}
                      placeholder=""
                      className="h-9 border-[#D5D0C8] bg-white text-sm text-[#2C2C2C]"
                    />
                  </th>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function sortSolicitudes(
  a: Solicitud,
  b: Solicitud,
  field: OrderField,
  direction: OrderDirection
) {
  const multiplier = direction === "asc" ? 1 : -1;

  if (field === "createdAt") {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return (dateA - dateB) * multiplier;
  }

  const valueA = a[field].toLowerCase();
  const valueB = b[field].toLowerCase();
  if (valueA < valueB) return -1 * multiplier;
  if (valueA > valueB) return 1 * multiplier;
  return 0;
}
