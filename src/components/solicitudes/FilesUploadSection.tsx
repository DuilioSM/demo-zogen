'use client';

import { useEffect, useState } from 'react';
import { Download, Eye, FileCheck, FileText, Loader2, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Patient } from '@/types/patient';
import type { PaymentMethod } from '@/types/payment-method';
import type { MedicalPrescription } from '@/types/medical-prescription';

type StoredFile = {
  name: string;
  type: string;
  size: number;
  data: string;
  uploadedAt: string;
};

export type FilesUploadSectionProps = {
  solicitudId: string;
  patient?: Patient;
  paymentMethod?: PaymentMethod;
  prescription?: MedicalPrescription;
  disabled?: boolean;
  onFilesChange?: (files: Record<string, string>) => void;
};

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const maxFileSizeBytes = 10 * 1024 * 1024; // 10MB

export function FilesUploadSection({ solicitudId, patient, paymentMethod, prescription, disabled, onFilesChange }: FilesUploadSectionProps) {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(`files-${solicitudId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFiles(parsed);
        onFilesChange?.(parsed);
        return;
      } catch (error) {
        console.error('Error loading files:', error);
      }
    }

    setFiles({});
    onFilesChange?.({});
  }, [solicitudId, onFilesChange]);

  const fileTypes: Array<{ id: string; label: string; icon: LucideIcon; url?: string }> = [
    { id: 'ine', label: 'INE (Identificación Oficial)', icon: FileText, url: patient?.ineUrl },
    { id: 'recetaMedica', label: 'Receta Médica', icon: FileText, url: prescription?.prescriptionUrl },
    { id: 'caratulaPoliza', label: 'Carátula de Póliza', icon: FileText },
    { id: 'informeAseguradora', label: 'Informe Aseguradora', icon: FileText, url: paymentMethod?.documentUrl },
    { id: 'consentimientoInformado', label: 'Consentimiento Informado', icon: FileText },
    { id: 'estudiosLaboratorio', label: 'Estudios de Laboratorio', icon: FileText },
    { id: 'otros', label: 'Otros Documentos', icon: FileText },
  ];

  const handleFileUpload = (fileId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSizeBytes) {
      alert('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    if (!allowedMimeTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan: PDF, JPG, PNG');
      return;
    }

    setUploading(fileId);

    const reader = new FileReader();
    reader.onloadend = () => {
      const fileData: StoredFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };

      const newFiles = { ...files, [fileId]: JSON.stringify(fileData) };
      setFiles(newFiles);
      onFilesChange?.(newFiles);

      if (typeof window !== 'undefined') {
        localStorage.setItem(`files-${solicitudId}`, JSON.stringify(newFiles));
      }

      setUploading(null);
      alert(`Archivo "${file.name}" cargado correctamente`);
    };

    reader.onerror = () => {
      alert('Error al cargar el archivo');
      setUploading(null);
    };

    reader.readAsDataURL(file);
  };

  const handlePreviewFile = (fileId: string) => {
    const fileData = files[fileId];
    if (!fileData || typeof window === 'undefined') return;

    try {
      const parsed = JSON.parse(fileData) as StoredFile;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html><html><head><title>${parsed.name}</title></head><body style="margin:0;height:100vh"><iframe src="${parsed.data}" style="width:100%;height:100%;border:0"></iframe></body></html>`);
      win.document.close();
    } catch (error) {
      console.error('Error previewing file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Instrucciones:</strong> Carga los documentos requeridos para continuar con el proceso.
          Los archivos aceptados son: PDF, JPG, PNG (máx. 10MB).
        </p>
      </div>

      <div className="grid gap-4">
        {fileTypes.map(({ id, label, icon: Icon, url }) => {
          const localFile = files[id];
          let fileInfo: { name: string; uploadedAt: string } | null = null;

          if (localFile) {
            try {
              const parsed = JSON.parse(localFile) as StoredFile;
              fileInfo = {
                name: parsed.name,
                uploadedAt: new Date(parsed.uploadedAt).toLocaleString('es-MX'),
              };
            } catch {
              // Ignorar archivos antiguos no compatibles
            }
          }

          const hasLocalFile = Boolean(localFile);
          const hasExternalUrl = Boolean(url);
          const hasAnyFile = hasLocalFile || hasExternalUrl;

          return (
            <div key={id} className="border border-[#E4D4C8] rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="h-5 w-5 text-[#7B5C45]" />
                  <div className="flex-1">
                    <p className="font-medium text-[#2C2C2C]">{label}</p>
                    {hasLocalFile && fileInfo ? (
                      <div className="mt-1">
                        <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          {fileInfo.name}
                        </p>
                        <p className="text-xs text-[#666]">Subido: {fileInfo.uploadedAt}</p>
                      </div>
                    ) : hasExternalUrl ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#8A6BA7] hover:underline flex items-center gap-1 mt-1"
                      >
                        <Download className="h-3 w-3" />
                        Ver desde Google Sheets
                      </a>
                    ) : (
                      <p className="text-xs text-[#999] mt-1">No disponible</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasLocalFile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewFile(id)}
                      className="border-[#8A6BA7] text-[#8A6BA7]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <label htmlFor={`file-${id}`}>
                    <Button size="sm" disabled={disabled || uploading === id} className="bg-[#7B5C45] hover:bg-[#6A4D38]" asChild>
                      <span>
                        {uploading === id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : hasAnyFile ? (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Reemplazar
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Cargar
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <input
                    id={`file-${id}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => handleFileUpload(id, event)}
                    className="hidden"
                    disabled={disabled || uploading === id}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
