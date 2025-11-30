"use client";

import { ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  error?: string;
  touched?: boolean;
  isValid?: boolean;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

export default function FormField({
  label,
  error,
  touched,
  isValid,
  required,
  children,
  hint,
}: FormFieldProps) {
  const showError = touched && error;
  const showSuccess = touched && !error && isValid;

  return (
    <div>
      <label className="block text-sm mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {children}
        {showSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle2 size={18} className="text-green-500" aria-hidden="true" />
          </div>
        )}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <XCircle size={18} className="text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {showError && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
      {!showError && hint && (
        <p className="text-foreground-muted text-xs mt-1">{hint}</p>
      )}
    </div>
  );
}

