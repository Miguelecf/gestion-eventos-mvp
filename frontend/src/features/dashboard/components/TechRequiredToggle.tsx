/**
 * ===================================================================
 * COMPONENT: TechRequiredToggle
 * ===================================================================
 * Toggle para filtrar solo eventos que requieren soporte técnico.
 * ===================================================================
 */

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wrench } from 'lucide-react';

interface TechRequiredToggleProps {
  /** Estado actual del toggle */
  checked: boolean;
  
  /** Callback cuando cambia el estado */
  onChange: (checked: boolean) => void;
}

/**
 * Toggle para filtrar eventos con técnica
 * 
 * @example
 * ```tsx
 * <TechRequiredToggle
 *   checked={filters.techRequired}
 *   onChange={(checked) => updateFilter('techRequired', checked)}
 * />
 * ```
 */
export function TechRequiredToggle({ checked, onChange }: TechRequiredToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch 
        id="tech-required" 
        checked={checked} 
        onCheckedChange={onChange}
      />
      <Label 
        htmlFor="tech-required" 
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 cursor-pointer"
      >
        <Wrench className="h-4 w-4" />
        <span>Solo con técnica</span>
      </Label>
    </div>
  );
}
