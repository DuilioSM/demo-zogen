'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepActionsProps = {
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  className?: string;
};

export function StepActions({
  isEditing,
  onToggleEdit,
  onSave,
  saveDisabled,
  saving,
  className,
}: StepActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onToggleEdit}
        className={cn('border-[#D5D0C8] text-[#7B5C45]', isEditing && 'bg-[#F5F0E8]')}
      >
        <Pencil className="h-4 w-4 mr-2" />
        {isEditing ? 'Cancelar' : 'Editar'}
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={!isEditing || saveDisabled || saving}
        className="bg-[#7B5C45] hover:bg-[#6A4D38]"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </>
        )}
      </Button>
    </div>
  );
}
