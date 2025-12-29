import { useState, useCallback, ChangeEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<string | null>;
  validate?: (values: T) => string | null;
}

interface UseFormReturn<T> {
  values: T;
  error: string | null;
  success: string | null;
  loading: boolean;
  handleChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  resetField: (field: keyof T, value: T[keyof T]) => void;
}

export function useForm<T extends { [K in keyof T]: string }>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (field: keyof T) => (e: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const resetField = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (validate) {
        const validationError = validate(values);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      setLoading(true);
      const submitError = await onSubmit(values);
      setLoading(false);

      if (submitError) {
        setError(submitError);
      }
    },
    [values, onSubmit, validate]
  );

  return {
    values,
    error,
    success,
    loading,
    handleChange,
    handleSubmit,
    setError,
    setSuccess,
    resetField,
  };
}
