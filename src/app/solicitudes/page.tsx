"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Loader2,
  Pencil,
  Search,
  Trash,
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
          <td colSpan={4} className="py-16 text-center">
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
          <td colSpan={4} className="py-16 text-center">
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
          <td colSpan={4} className="py-16 text-center text-sm text-[#666]">
            No encontramos solicitudes con los criterios seleccionados.
          </td>
        </tr>
      );
    }

    return filteredSolicitudes.map((solicitud, index) => {
      const phoneParam = sanitizePhone(solicitud.contactPhone) || solicitud.id;
      const isSelected = selectedIds.has(solicitud.id);

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
              <Link href={`/solicitudes/${phoneParam}`} className="hover:text-[#7B5C45]" title="Ver">
                <Eye className="h-4 w-4" />
              </Link>
              <Link
                href={`/solicitudes/editar/${phoneParam}`}
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
          <td className="px-4 py-4 text-sm text-[#2C2C2C]">
            {solicitud.doctor}
          </td>
          <td className="px-4 py-4 text-sm text-[#2C2C2C]">
            {solicitud.patient}
          </td>
          <td className="px-4 py-4 text-sm text-[#2C2C2C]">
            {solicitud.condition}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <header className="bg-[#3e4460] shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/zogen_fast_app.png"
                alt="Zogen Fast App"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5A999]" />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Buscar en zogen FAST App"
                className="h-11 w-full rounded-full border border-[#E0D6C5] bg-[#F9F6F2] pl-12 pr-4 text-sm focus:border-[#B26E3C] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-white">
            <span>Pruebas médicas</span>
            <span>Solicitudes totales: {solicitudes.length}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="bg-[#F5F0E8]">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-[#3C4858]">Pruebas</h1>
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
                className="flex items-center gap-2 border-[#7B5C45] bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white shadow-none hover:bg-[#6A4D38]"
              >
                Exportar
                <Trash className="h-4 w-4" />
              </Button>
              <Button className="flex items-center gap-2 bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white hover:bg-[#6A4D38]">
                Agregar
                <span className="text-lg">+</span>
              </Button>
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
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Médico</th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Paciente</th>
                  <th className="px-4 py-3 text-sm font-semibold text-[#2C2C2C]">Padecimiento</th>
                </tr>
                <tr className="bg-[#E8E3DB]">
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
                  <th className="px-4 py-3">
                    <select
                      value={conditionFilter}
                      onChange={(event) => setConditionFilter(event.target.value)}
                      className="h-9 w-full rounded-md border border-[#D5D0C8] bg-white px-3 text-sm text-[#666] focus:border-[#7B5C45] focus:outline-none"
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
