import { Router } from 'express';
import { createSupplierSchema, supplierListQuerySchema, type SupplierListQuery } from 'shared';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createSupplier, getSupplierById, listSuppliers } from './suppliers.service.js';

export const suppliersRouter = Router();

suppliersRouter.use(requireAuth);

suppliersRouter.get('/', validate(supplierListQuerySchema, 'query'), async (req, res, next) => {
  try {
    const result = await listSuppliers(req.query as unknown as SupplierListQuery);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

suppliersRouter.get('/:id', async (req, res, next) => {
  try {
    const supplier = await getSupplierById(req.params.id!);
    res.json(supplier);
  } catch (err) {
    next(err);
  }
});

suppliersRouter.post(
  '/',
  requireRole('ADMIN'),
  validate(createSupplierSchema),
  async (req, res, next) => {
    try {
      const supplier = await createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (err) {
      next(err);
    }
  },
);
