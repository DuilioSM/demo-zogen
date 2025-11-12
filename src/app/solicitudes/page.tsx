"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownWideNarrow,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSolicitudes } from "@/hooks/useSolicitudes";
import type { Solicitud } from "@/types/solicitudes";

const ORDER_FIELDS = [
  { value: "createdAt", label: "Creado en" },
  { value: "doctor", label: "Médico" },
  { value: "patient", label: "Paciente" },
] as const;

const ORDER_DIRECTIONS = [
  { value: "desc", label: "Descendente" },
  { value: "asc", label: "Ascendente" },
] as const;

type OrderField = (typeof ORDER_FIELDS)[number]["value"];
type OrderDirection = (typeof ORDER_DIRECTIONS)[number]["value"];

const sanitizePhone = (value: string) => value.replace(/[^\d]/g, "");

export default function SolicitudesListPage() {
  const { solicitudes, status, errorMessage, fetchSolicitudes } = useSolicitudes();
  const [globalSearch, setGlobalSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [orderField, setOrderField] = useState<OrderField>("createdAt");
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const renderTableBody = () => {
    if (status === "loading") {
      return (
        <tr>
          <td colSpan={6} className="py-16 text-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#9B7CB8]" />
              <p className="text-sm text-muted-foreground">Cargando solicitudes…</p>
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
              <Button onClick={fetchSolicitudes} className="bg-[#9B7CB8] text-white">
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
          <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
            No encontramos solicitudes con los criterios seleccionados.
          </td>
        </tr>
      );
    }

    return filteredSolicitudes.map((solicitud) => {
      const phoneParam =
        sanitizePhone(solicitud.contactPhone || solicitud.vendorPhone) || solicitud.id;
      const isSelected = selectedIds.has(solicitud.id);

      return (
        <tr key={solicitud.id} className="border-b border-[#E3DACD] last:border-0">
          <td className="px-4 py-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#B4A38D] accent-[#8A5A44]"
              checked={isSelected}
              onChange={() => toggleSingleSelection(solicitud.id)}
            />
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-3 text-[#6B4F3A]">
              <Link href={`/solicitudes/${phoneParam}`} className="hover:text-[#B26E3C]" title="Ver">
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/solicitudes/editar/${phoneParam}`}
                className="hover:text-[#B26E3C]"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button type="button" className="hover:text-[#B26E3C]" title="Borrar">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
          <td className="px-4 py-4 text-sm font-semibold text-[#2F2A25]">
            {solicitud.doctor}
          </td>
          <td className="px-4 py-4 text-sm font-semibold text-[#2F2A25]">
            {solicitud.patient}
          </td>
          <td className="px-4 py-4 text-sm text-[#4B433B]">
            {solicitud.condition}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#2F2A25]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5A999]" />
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Buscar en zogen FAST App"
              className="h-11 w-full rounded-full border border-[#E0D6C5] bg-[#F9F6F2] pl-12 pr-4 text-sm focus:border-[#B26E3C] focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#9A8975]">
            <span>Pruebas médicas</span>
            <span>Solicitudes totales: {solicitudes.length}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-[#E5DBCE] bg-white shadow-sm">
          <div className="flex flex-col gap-4 px-6 pb-4 pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#B26E3C]">
                Pruebas
              </p>
              <h1 className="text-3xl font-semibold text-[#2F2A25]">Solicitudes</h1>
            </div>
            <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center">
              <div className="flex items-center gap-2 text-[#6B4F3A]">
                <span>Ordenar</span>
                <ArrowDownWideNarrow className="h-4 w-4" />
              </div>
              <Select value={orderField} onValueChange={(value) => setOrderField(value as OrderField)}>
                <SelectTrigger className="w-40 border-[#E0D6C5]">
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
                <SelectTrigger className="w-40 border-[#E0D6C5]">
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
          </div>

          <div className="flex flex-col gap-3 px-6 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-[#C37C4D] bg-[#C37C4D] text-white shadow-none hover:bg-[#a96539]"
              >
                Seleccionar visibles
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleVisibleSelection}
                  className="ml-3 h-4 w-4 rounded border-white bg-transparent accent-white"
                />
              </Button>
              <Button variant="outline" className="border-[#B26E3C] text-[#B26E3C] shadow-none">
                Exportar
              </Button>
              <Button className="bg-[#8A5A44] text-white hover:bg-[#6f4634]">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
            <p className="text-xs text-[#8A7A66]">
              {filteredSolicitudes.length} de {solicitudes.length} registros visibles
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="bg-[#EDE6D9] text-xs uppercase tracking-wide text-[#6B4F3A]">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#B4A38D] accent-[#8A5A44]"
                      checked={allVisibleSelected}
                      onChange={toggleVisibleSelection}
                    />
                  </th>
                  <th className="px-4 py-3">Acciones</th>
                  <th className="px-4 py-3">Médico</th>
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Padecimiento</th>
                </tr>
                <tr className="bg-[#F7F2EA] text-xs text-[#7B6B57]">
                  <th />
                  <th />
                  <th className="px-4 py-2">
                    <Input
                      value={doctorFilter}
                      onChange={(event) => setDoctorFilter(event.target.value)}
                      placeholder="Buscar médico"
                      className="h-9 border-[#E0D6C5] bg-white"
                    />
                  </th>
                  <th className="px-4 py-2">
                    <Input
                      value={patientFilter}
                      onChange={(event) => setPatientFilter(event.target.value)}
                      placeholder="Buscar paciente"
                      className="h-9 border-[#E0D6C5] bg-white"
                    />
                  </th>
                  <th className="px-4 py-2">
                    <select
                      value={conditionFilter}
                      onChange={(event) => setConditionFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-[#E0D6C5] bg-white px-3 text-sm focus:border-[#B26E3C] focus:outline-none"
                    >
                      <option value="all">== Seleccione una opción ==</option>
                      {conditionOptions.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">{renderTableBody()}</tbody>
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
