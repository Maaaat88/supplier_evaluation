import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSupplierSchema, SUPPLIER_CATEGORIES, type CreateSupplierInput } from 'shared';
import { createSupplier } from '../../api/suppliers.js';
import { ApiError } from '../../lib/api.js';
import { CATEGORY_LABELS } from '../../lib/labels.js';
import { ErrorMessage } from '../ui/ErrorMessage.js';
import { Modal } from '../ui/Modal.js';

export function CreateSupplierModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSupplierInput>({ resolver: zodResolver(createSupplierSchema) });

  const mutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      onClose();
    },
  });

  const onSubmit = async (values: CreateSupplierInput) => {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(values);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Création impossible.');
    }
  };

  return (
    <Modal title="Nouveau fournisseur" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Nom
          </label>
          <input
            id="name"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
            Catégorie
          </label>
          <select
            id="category"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            defaultValue=""
            {...register('category')}
          >
            <option value="" disabled>
              Sélectionner...
            </option>
            {SUPPLIER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="mb-1 block text-sm font-medium text-slate-700">
            Pays
          </label>
          <input
            id="country"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('country')}
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
        </div>

        <div>
          <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-slate-700">
            Email de contact
          </label>
          <input
            id="contactEmail"
            type="email"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('contactEmail')}
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="mb-1 block text-sm font-medium text-slate-700">
            Téléphone de contact
          </label>
          <input
            id="contactPhone"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('contactPhone')}
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
          )}
        </div>

        {submitError && <ErrorMessage message={submitError} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
