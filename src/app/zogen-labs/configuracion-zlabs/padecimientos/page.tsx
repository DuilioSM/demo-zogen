"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PADECIMIENTOS_CATALOG, type Padecimiento } from "@/types/padecimiento";

const STORAGE_KEY = "zogen-padecimientos";

export default function PadecimientosPage() {
  const [padecimientos, setPadecimientos] = useState<Padecimiento[]>(() => {
    if (typeof window === "undefined") return PADECIMIENTOS_CATALOG;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error loading padecimientos:", error);
        return PADECIMIENTOS_CATALOG;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PADECIMIENTOS_CATALOG));
    return PADECIMIENTOS_CATALOG;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPadecimiento, setEditingPadecimiento] = useState<Padecimiento | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    activo: true,
  });

  const filteredPadecimientos = useMemo(() => {
    return padecimientos.filter((p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [padecimientos, searchTerm]);

  const savePadecimientos = (updatedPadecimientos: Padecimiento[]) => {
    setPadecimientos(updatedPadecimientos);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPadecimientos));
    }
  };

  const handleOpenDialog = (padecimiento?: Padecimiento) => {
    if (padecimiento) {
      setEditingPadecimiento(padecimiento);
      setFormData({
        nombre: padecimiento.nombre,
        activo: padecimiento.activo,
      });
    } else {
      setEditingPadecimiento(null);
      setFormData({
        nombre: "",
        activo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPadecimiento(null);
    setFormData({
      nombre: "",
      activo: true,
    });
  };

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      alert("El nombre del padecimiento es obligatorio");
      return;
    }

    if (editingPadecimiento) {
      // Editar existente
      const updated = padecimientos.map((p) =>
        p.id === editingPadecimiento.id
          ? { ...p, nombre: formData.nombre, activo: formData.activo }
          : p
      );
      savePadecimientos(updated);
    } else {
      // Crear nuevo
      const newPadecimiento: Padecimiento = {
        id: `padecimiento-${Date.now()}`,
        nombre: formData.nombre,
        activo: formData.activo,
        createdAt: new Date().toISOString(),
      };
      savePadecimientos([...padecimientos, newPadecimiento]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este padecimiento?")) {
      const updated = padecimientos.filter((p) => p.id !== id);
      savePadecimientos(updated);
    }
  };

  const handleToggleActivo = (id: string) => {
    const updated = padecimientos.map((p) =>
      p.id === id ? { ...p, activo: !p.activo } : p
    );
    savePadecimientos(updated);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="bg-white py-8 shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#3C4858]">
                Catálogo de Padecimientos
              </h1>
              <p className="mt-2 text-sm text-[#666]">
                Gestiona el catálogo de padecimientos para las solicitudes
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-[#7B5C45] hover:bg-[#6A4D38]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Padecimiento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPadecimiento ? "Editar" : "Nuevo"} Padecimiento
                  </DialogTitle>
                  <DialogDescription>
                    {editingPadecimiento
                      ? "Modifica la información del padecimiento"
                      : "Completa los datos del nuevo padecimiento"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Padecimiento *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      placeholder="Ej. Cáncer de mama"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) =>
                        setFormData({ ...formData, activo: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="activo">Activo</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#7B5C45] hover:bg-[#6A4D38]"
                  >
                    {editingPadecimiento ? "Guardar Cambios" : "Crear Padecimiento"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPadecimientos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron padecimientos
                  </td>
                </tr>
              ) : (
                filteredPadecimientos.map((padecimiento) => (
                  <tr key={padecimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {padecimiento.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleToggleActivo(padecimiento.id)}
                        className="focus:outline-none"
                      >
                        {padecimiento.activo ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Check className="mr-1 h-3 w-3" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                            <X className="mr-1 h-3 w-3" />
                            Inactivo
                          </Badge>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(padecimiento.createdAt).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(padecimiento)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(padecimiento.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Mostrando {filteredPadecimientos.length} de {padecimientos.length} padecimientos
        </div>
      </main>
    </div>
  );
}
