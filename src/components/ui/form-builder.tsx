import React, { useMemo } from 'react';
import { useForm, UseFormReturn, FieldValues, Path, DefaultValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { Label } from './label';
import { RichTextEditor } from './rich-text-editor';
import { cn } from '@/shared/utils';
import { useApp } from '@/context/AppContext';

export type FieldType = 
  | 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | 'tel' 
  | 'textarea' | 'select' | 'checkbox' | 'rich-text';

export interface FormFieldConfig<TData extends FieldValues> {
  name: Path<TData>;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  description?: string;
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12; // Grid spans
  disabled?: boolean;
  readonly?: boolean;
  showIf?: (values: TData) => boolean;
  requiredPermission?: string; // RBAC integration
}

export interface FormBuilderProps<TData extends FieldValues> {
  schema: z.ZodType<any, any, any>;
  fields: FormFieldConfig<TData>[];
  defaultValues?: DefaultValues<TData>;
  onSubmit: SubmitHandler<TData>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function FormBuilder<TData extends FieldValues>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
  isLoading = false,
  className
}: FormBuilderProps<TData>) {
  const { currentUser } = useApp();

  const form = useForm<TData>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues,
  });

  const { handleSubmit, register, watch, formState: { errors }, setValue } = form;
  const currentValues = watch();

  const renderField = (field: FormFieldConfig<TData>) => {
    // 1. RBAC Check
    if (field.requiredPermission && !currentUser?.permissions?.includes(field.requiredPermission)) {
      // Force disabled or completely hidden based on strictness. Here we disable it.
      field.disabled = true;
    }

    // 2. Conditional Logic
    if (field.showIf && !field.showIf(currentValues as TData)) {
      return null;
    }

    const error = errors[field.name];
    const isInvalid = !!error;
    const colClass = field.colSpan ? `col-span-12 md:col-span-${field.colSpan}` : 'col-span-12';

    return (
      <div key={field.name} className={cn("flex flex-col gap-1.5", colClass)}>
        <Label htmlFor={field.name} className={cn(isInvalid && "text-destructive")}>
          {field.label}
        </Label>
        
        {field.type === 'textarea' ? (
          <textarea
            id={field.name}
            placeholder={field.placeholder}
            disabled={field.disabled || isLoading}
            readOnly={field.readonly}
            className={cn(
              "flex min-h-[80px] w-full rounded-(--radius) border border-input bg-card px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
              isInvalid && "border-destructive ring-destructive/20 focus-visible:ring-destructive/30"
            )}
            {...register(field.name)}
          />
        ) : field.type === 'select' ? (
          <Select 
            disabled={field.disabled || isLoading} 
            onValueChange={(val) => setValue(field.name, val as any, { shouldValidate: true })}
            defaultValue={defaultValues?.[field.name as keyof typeof defaultValues] as string}
          >
            <SelectTrigger id={field.name} className={cn(isInvalid && "border-destructive")}>
              <SelectValue placeholder={field.placeholder || "Pilih..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center gap-2 mt-1">
            <Checkbox 
              id={field.name} 
              disabled={field.disabled || isLoading}
              onCheckedChange={(checked) => setValue(field.name, checked as any, { shouldValidate: true })}
              defaultChecked={defaultValues?.[field.name as keyof typeof defaultValues] as boolean}
            />
            <span className="text-sm text-muted-foreground">{field.description}</span>
          </div>
        ) : field.type === 'rich-text' ? (
          <div className={cn((field.disabled || isLoading) && "opacity-50 pointer-events-none")}>
            <RichTextEditor 
              content={(currentValues as any)[field.name] || ''}
              onChange={(html) => setValue(field.name, html as any, { shouldValidate: true })}
            />
          </div>
        ) : (
          <Input
            id={field.name}
            type={field.type}
            placeholder={field.placeholder}
            disabled={field.disabled || isLoading}
            readOnly={field.readonly}
            aria-invalid={isInvalid}
            {...register(field.name, {
              valueAsNumber: field.type === 'number'
            })}
          />
        )}

        {/* Description / Error Hint */}
        {error ? (
          <p className="text-[11px] font-medium text-destructive mt-1 animate-in slide-in-from-top-1">
            {error.message as string}
          </p>
        ) : field.description && field.type !== 'checkbox' ? (
          <p className="text-[11px] text-muted-foreground mt-1">
            {field.description}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className={cn("space-y-6 w-full", className)}>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {fields.map(renderField)}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? 'Menyimpan...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
