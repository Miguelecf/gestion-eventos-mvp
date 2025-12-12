import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { catalogsApi } from "@/services/api";
import type { Department } from "@/services/api";

export interface DepartmentSelectProps {
  value: number | null;
  onChange: (deptId: number | null) => void;
  disabled?: boolean;
  className?: string;
  ariaInvalid?: boolean;
  placeholder?: string;
}

const DepartmentSelect = React.forwardRef<HTMLSelectElement, DepartmentSelectProps>(
  ({ value, onChange, disabled, className, ariaInvalid, placeholder = "Seleccionar departamento...", ...rest }, ref) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar departamentos al montar
    useEffect(() => {
      catalogsApi.getDepartments()
        .then(setDepartments)
        .catch(err => console.error('Error cargando departamentos:', err))
        .finally(() => setLoading(false));
    }, []);

    return (
      <select
          ref={ref}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled || loading}
          aria-invalid={ariaInvalid ? true : undefined}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none",
            "focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            ariaInvalid ? "border-red-500" : "border-input",
            className
          )}
          {...rest}
        >
          <option value="">{loading ? "Cargando..." : placeholder}</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
    );
  }
);

DepartmentSelect.displayName = "DepartmentSelect";
export default DepartmentSelect;