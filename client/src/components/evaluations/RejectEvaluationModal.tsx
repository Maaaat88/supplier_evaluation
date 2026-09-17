import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { rejectEvaluationSchema, type RejectEvaluationInput } from 'shared';
import { rejectEvaluation } from '../../api/evaluations.js';
import { ApiError } from '../../lib/api.js';
import { ErrorMessage } from '../ui/ErrorMessage.js';
import { Modal } from '../ui/Modal.js';

interface RejectEvaluationModalProps {
  evaluationId: string;
  supplierName: string;
  period: string;
  onClose: () => void;
}

export function RejectEvaluationModal({
  evaluationId,
  supplierName,
  period,
  onClose,
}: RejectEvaluationModalProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectEvaluationInput>({ resolver: zodResolver(rejectEvaluationSchema) });

  const mutation = useMutation({
    mutationFn: (input: RejectEvaluationInput) =>
      rejectEvaluation(evaluationId, input.rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      onClose();
    },
  });

  const onSubmit = async (values: RejectEvaluationInput) => {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(values);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Renvoi impossible.');
    }
  };

  return (
    <Modal title="Renvoyer en brouillon" onClose={onClose}>
      <p className="mb-4 text-sm text-slate-600">
        {supplierName} — {period}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="rejectionReason"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Motif du renvoi
          </label>
          <textarea
            id="rejectionReason"
            rows={4}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            {...register('rejectionReason')}
          />
          {errors.rejectionReason && (
            <p className="mt-1 text-sm text-red-600">{errors.rejectionReason.message}</p>
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
            className="rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Envoi...' : 'Renvoyer en brouillon'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
