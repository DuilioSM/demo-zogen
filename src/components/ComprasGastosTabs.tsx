'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

type StatusPago = 'PagoRegistrado' | 'PagoFacturado' | 'PagoRealizado';

const STATUS_LABELS: Record<StatusPago, string> = {
  PagoRegistrado: 'Pago Registrado',
  PagoFacturado: 'Pago Facturado',
  PagoRealizado: 'Pago Realizado',
};

interface BaseItem {
  id: string;
  [key: string]: any;
}

interface ComprasGastosTabsProps<T extends BaseItem> {
  items: T[];
  getStatus: (item: T) => StatusPago;
  onUpdate: (id: string, updates: Partial<T>) => void;
  renderItemHeader: (item: T) => React.ReactNode;
  renderItemDetails?: (item: T) => React.ReactNode;
  renderFacturacionForm?: (item: T, onUpdate: (updates: Partial<T>) => void, onCancel: () => void) => React.ReactNode;
  renderPagoForm?: (item: T, onUpdate: (updates: Partial<T>) => void, onCancel: () => void) => React.ReactNode;
  className?: string;
}

export function ComprasGastosTabs<T extends BaseItem>({
  items,
  getStatus,
  onUpdate,
  renderItemHeader,
  renderItemDetails,
  renderFacturacionForm,
  renderPagoForm,
  className = '',
}: ComprasGastosTabsProps<T>) {
  const [activeTab, setActiveTab] = useState<StatusPago>('PagoRegistrado');

  const filteredItems = useMemo(() => {
    return items.filter(item => getStatus(item) === activeTab);
  }, [items, activeTab, getStatus]);

  const counts = useMemo(() => ({
    PagoRegistrado: items.filter(item => getStatus(item) === 'PagoRegistrado').length,
    PagoFacturado: items.filter(item => getStatus(item) === 'PagoFacturado').length,
    PagoRealizado: items.filter(item => getStatus(item) === 'PagoRealizado').length,
  }), [items, getStatus]);

  return (
    <div className={className}>
      <Tabs defaultValue="PagoRegistrado" onValueChange={(value) => setActiveTab(value as StatusPago)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="PagoRegistrado">
            Pago Registrado ({counts.PagoRegistrado})
          </TabsTrigger>
          <TabsTrigger value="PagoFacturado">
            Pago Facturado ({counts.PagoFacturado})
          </TabsTrigger>
          <TabsTrigger value="PagoRealizado">
            Pago Realizado ({counts.PagoRealizado})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onUpdate={(updates) => onUpdate(item.id, updates)}
                  renderHeader={renderItemHeader}
                  renderDetails={renderItemDetails}
                  renderFacturacionForm={renderFacturacionForm}
                  renderPagoForm={renderPagoForm}
                />
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    No hay items en estado &quot;{STATUS_LABELS[activeTab]}&quot;
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ItemCardProps<T extends BaseItem> {
  item: T;
  activeTab: StatusPago;
  onUpdate: (updates: Partial<T>) => void;
  renderHeader: (item: T) => React.ReactNode;
  renderDetails?: (item: T) => React.ReactNode;
  renderFacturacionForm?: (item: T, onUpdate: (updates: Partial<T>) => void, onCancel: () => void) => React.ReactNode;
  renderPagoForm?: (item: T, onUpdate: (updates: Partial<T>) => void, onCancel: () => void) => React.ReactNode;
}

function ItemCard<T extends BaseItem>({
  item,
  activeTab,
  onUpdate,
  renderHeader,
  renderDetails,
  renderFacturacionForm,
  renderPagoForm,
}: ItemCardProps<T>) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        {renderHeader(item)}

        {renderDetails && (
          <div className="mt-2">
            {renderDetails(item)}
          </div>
        )}

        {activeTab !== 'PagoRealizado' && (
          <div className="mt-4 pt-4 border-t">
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="sm">
                Actualizar Pago
              </Button>
            )}
            {showForm && (
              <>
                {activeTab === 'PagoRegistrado' && renderFacturacionForm?.(item, onUpdate, () => setShowForm(false))}
                {activeTab === 'PagoFacturado' && renderPagoForm?.(item, onUpdate, () => setShowForm(false))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componentes auxiliares reutilizables
export function FormContainer({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">{title}</h4>
      {children}
    </div>
  );
}

export function FormField({
  label,
  id,
  children
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function FormActions({
  onCancel,
  submitLabel = 'Guardar',
  isLoading = false,
  loadingLabel = 'Procesando...'
}: {
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <div className="flex gap-2">
      <Button type="submit" size="sm" disabled={isLoading}>
        {isLoading ? loadingLabel : submitLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </Button>
    </div>
  );
}

export function StatusMessage({
  type,
  message
}: {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  };

  return (
    <div className={`rounded-md border p-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
