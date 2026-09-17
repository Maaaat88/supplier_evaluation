import { PrismaClient, type SupplierCategory, type SupplierStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { computeGlobalScore } from '../src/modules/evaluations/scoring.js';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Demo1234!';
const PERIODS = ['2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4'] as const;

const PERIOD_RANGES: Record<(typeof PERIODS)[number], [Date, Date]> = {
  '2025-Q1': [new Date('2025-01-05'), new Date('2025-03-25')],
  '2025-Q2': [new Date('2025-04-05'), new Date('2025-06-25')],
  '2025-Q3': [new Date('2025-07-05'), new Date('2025-09-25')],
  '2025-Q4': [new Date('2025-10-05'), new Date('2025-12-20')],
};

// La période la plus récente est encore "en cours de traitement" :
// davantage de brouillons et de soumissions en attente que sur les
// périodes antérieures, déjà closes.
const STATUS_WEIGHTS_BY_PERIOD_INDEX: Record<
  number,
  { VALIDATED: number; SUBMITTED: number; DRAFT: number }
> = {
  0: { VALIDATED: 0.9, SUBMITTED: 0.1, DRAFT: 0 },
  1: { VALIDATED: 0.85, SUBMITTED: 0.15, DRAFT: 0 },
  2: { VALIDATED: 0.8, SUBMITTED: 0.15, DRAFT: 0.05 },
  3: { VALIDATED: 0.4, SUBMITTED: 0.35, DRAFT: 0.25 },
};

const COMMENTS = [
  'Bon niveau de service dans l’ensemble, quelques retards ponctuels sur les livraisons.',
  'Partenaire fiable, communication fluide avec les équipes achats.',
  'Des progrès notables par rapport à la période précédente.',
  'Qualité constante mais tarifs qui restent élevés par rapport au marché.',
  'Documentation parfois incomplète, à surveiller sur la prochaine période.',
  'Très bonne réactivité en cas d’incident sur les commandes.',
  'Niveau de service en baisse, plusieurs non-conformités signalées.',
  null,
  null,
];

const REJECTION_REASONS = [
  'Merci de détailler le motif de la note sur la conformité documentaire.',
  'Le commentaire ne reflète pas les incidents mentionnés en réunion achats.',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

function pickWeightedStatus(weights: { VALIDATED: number; SUBMITTED: number; DRAFT: number }) {
  const roll = Math.random();
  if (roll < weights.VALIDATED) return 'VALIDATED' as const;
  if (roll < weights.VALIDATED + weights.SUBMITTED) return 'SUBMITTED' as const;
  return 'DRAFT' as const;
}

function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

const CRITERIA = [
  {
    label: 'Qualité produit',
    description: 'Conformité du produit livré aux spécifications attendues.',
    weight: 5,
  },
  {
    label: 'Respect des délais',
    description: 'Ponctualité des livraisons par rapport aux dates convenues.',
    weight: 4,
  },
  {
    label: 'Compétitivité tarifaire',
    description: 'Positionnement des prix par rapport au marché.',
    weight: 3,
  },
  {
    label: 'Réactivité commerciale',
    description: 'Rapidité et qualité de la réponse aux demandes du service achats.',
    weight: 2,
  },
  {
    label: 'Conformité documentaire',
    description: 'Exactitude et complétude des documents fournis (factures, certificats...).',
    weight: 1,
  },
] as const;

interface SupplierSeed {
  name: string;
  category: SupplierCategory;
  country: string;
  contactEmail: string;
  contactPhone: string;
  status: SupplierStatus;
}

const SUPPLIERS: SupplierSeed[] = [
  // RAW_MATERIALS
  {
    name: 'Nordic Alloys',
    category: 'RAW_MATERIALS',
    country: 'Suède',
    contactEmail: 'contact@nordicalloys.example',
    contactPhone: '+46 8 555 01 01',
    status: 'ACTIVE',
  },
  {
    name: 'Terra Ferrum',
    category: 'RAW_MATERIALS',
    country: 'Pologne',
    contactEmail: 'contact@terraferrum.example',
    contactPhone: '+48 22 555 02 02',
    status: 'ACTIVE',
  },
  {
    name: 'Andes Minerals',
    category: 'RAW_MATERIALS',
    country: 'Chili',
    contactEmail: 'contact@andesminerals.example',
    contactPhone: '+56 2 555 03 03',
    status: 'ACTIVE',
  },
  {
    name: 'PlastiChem Solutions',
    category: 'RAW_MATERIALS',
    country: 'Allemagne',
    contactEmail: 'contact@plastichem.example',
    contactPhone: '+49 30 555 04 04',
    status: 'PENDING',
  },
  {
    name: 'Fibrotex Matières',
    category: 'RAW_MATERIALS',
    country: 'Maroc',
    contactEmail: 'contact@fibrotex.example',
    contactPhone: '+212 5 5550 05 05',
    status: 'SUSPENDED',
  },
  // PACKAGING
  {
    name: 'BoxCraft Emballages',
    category: 'PACKAGING',
    country: 'France',
    contactEmail: 'contact@boxcraft.example',
    contactPhone: '+33 1 55 00 06 06',
    status: 'ACTIVE',
  },
  {
    name: 'EcoPack Solutions',
    category: 'PACKAGING',
    country: 'Pays-Bas',
    contactEmail: 'contact@ecopack.example',
    contactPhone: '+31 20 555 07 07',
    status: 'ACTIVE',
  },
  {
    name: 'Cartonnerie du Rhône',
    category: 'PACKAGING',
    country: 'France',
    contactEmail: 'contact@cartonnerierhone.example',
    contactPhone: '+33 4 72 00 08 08',
    status: 'ACTIVE',
  },
  {
    name: 'WrapTech Industries',
    category: 'PACKAGING',
    country: 'Italie',
    contactEmail: 'contact@wraptech.example',
    contactPhone: '+39 02 5550 09 09',
    status: 'ACTIVE',
  },
  {
    name: 'Emballatlantique',
    category: 'PACKAGING',
    country: 'Portugal',
    contactEmail: 'contact@emballatlantique.example',
    contactPhone: '+351 21 555 10 10',
    status: 'PENDING',
  },
  // LOGISTICS
  {
    name: 'TransEuro Logistique',
    category: 'LOGISTICS',
    country: 'Belgique',
    contactEmail: 'contact@transeuro.example',
    contactPhone: '+32 2 555 11 11',
    status: 'ACTIVE',
  },
  {
    name: 'FastRoute Cargo',
    category: 'LOGISTICS',
    country: 'Espagne',
    contactEmail: 'contact@fastroute.example',
    contactPhone: '+34 91 555 12 12',
    status: 'ACTIVE',
  },
  {
    name: 'Portway Shipping',
    category: 'LOGISTICS',
    country: 'Pays-Bas',
    contactEmail: 'contact@portway.example',
    contactPhone: '+31 10 555 13 13',
    status: 'ACTIVE',
  },
  {
    name: 'NordFreight',
    category: 'LOGISTICS',
    country: 'Danemark',
    contactEmail: 'contact@nordfreight.example',
    contactPhone: '+45 33 55 14 14',
    status: 'SUSPENDED',
  },
  {
    name: 'Cargolink Express',
    category: 'LOGISTICS',
    country: 'France',
    contactEmail: 'contact@cargolink.example',
    contactPhone: '+33 3 20 00 15 15',
    status: 'ACTIVE',
  },
  // SERVICES
  {
    name: 'Conseil & Process',
    category: 'SERVICES',
    country: 'France',
    contactEmail: 'contact@conseilprocess.example',
    contactPhone: '+33 1 42 00 16 16',
    status: 'ACTIVE',
  },
  {
    name: 'Facilitis Services',
    category: 'SERVICES',
    country: 'Belgique',
    contactEmail: 'contact@facilitis.example',
    contactPhone: '+32 2 555 17 17',
    status: 'ACTIVE',
  },
  {
    name: 'CleanPro Facility',
    category: 'SERVICES',
    country: 'France',
    contactEmail: 'contact@cleanpro.example',
    contactPhone: '+33 4 78 00 18 18',
    status: 'ACTIVE',
  },
  {
    name: 'SupportLine Conseil',
    category: 'SERVICES',
    country: 'France',
    contactEmail: 'contact@supportline.example',
    contactPhone: '+33 1 45 00 19 19',
    status: 'PENDING',
  },
  {
    name: 'Optima Services',
    category: 'SERVICES',
    country: 'Suisse',
    contactEmail: 'contact@optima-services.example',
    contactPhone: '+41 22 555 20 20',
    status: 'ACTIVE',
  },
  // EQUIPMENT
  {
    name: 'MecaTech Industries',
    category: 'EQUIPMENT',
    country: 'Allemagne',
    contactEmail: 'contact@mecatech.example',
    contactPhone: '+49 89 555 21 21',
    status: 'ACTIVE',
  },
  {
    name: 'PrecisionTools Corp',
    category: 'EQUIPMENT',
    country: 'États-Unis',
    contactEmail: 'contact@precisiontools.example',
    contactPhone: '+1 312 555 2222',
    status: 'ACTIVE',
  },
  {
    name: 'RoboLine Systems',
    category: 'EQUIPMENT',
    country: 'Japon',
    contactEmail: 'contact@roboline.example',
    contactPhone: '+81 3 5550 23 23',
    status: 'ACTIVE',
  },
  {
    name: 'Ferro Machines',
    category: 'EQUIPMENT',
    country: 'Italie',
    contactEmail: 'contact@ferromachines.example',
    contactPhone: '+39 011 555 24 24',
    status: 'ACTIVE',
  },
  {
    name: 'IndusEquip Solutions',
    category: 'EQUIPMENT',
    country: 'Chine',
    contactEmail: 'contact@indusequip.example',
    contactPhone: '+86 21 5550 25 25',
    status: 'SUSPENDED',
  },
];

async function resetDatabase() {
  await prisma.evaluationScore.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.criterion.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      firstName: 'Alice',
      lastName: 'Moreau',
      role: 'ADMIN',
    },
  });

  const evaluator = await prisma.user.create({
    data: {
      email: 'evaluateur@example.com',
      passwordHash,
      firstName: 'Julien',
      lastName: 'Petit',
      role: 'EVALUATOR',
    },
  });

  return { admin, evaluator };
}

async function seedCriteria() {
  return Promise.all(CRITERIA.map((criterion) => prisma.criterion.create({ data: criterion })));
}

async function seedSuppliers() {
  return Promise.all(SUPPLIERS.map((supplier) => prisma.supplier.create({ data: supplier })));
}

interface SupplierProfile {
  supplierId: string;
  // Score "moyen" (sur 5) du fournisseur pour la période courante ; évolue
  // légèrement à chaque trimestre pour donner une vraie courbe d'évolution.
  currentLevel: number;
}

async function seedEvaluations(
  suppliers: { id: string }[],
  evaluatorId: string,
  criteria: { id: string; weight: number }[],
) {
  const profiles: SupplierProfile[] = suppliers.map((s) => ({
    supplierId: s.id,
    currentLevel: 1.5 + Math.random() * 3, // entre 1.5 et 4.5
  }));

  const combos = shuffle(
    suppliers.flatMap((supplier) => PERIODS.map((period) => ({ supplierId: supplier.id, period }))),
  ).slice(0, randomInt(60, 80));

  const combosBySupplier = new Map<string, Set<string>>();
  for (const combo of combos) {
    if (!combosBySupplier.has(combo.supplierId)) combosBySupplier.set(combo.supplierId, new Set());
    combosBySupplier.get(combo.supplierId)!.add(combo.period);
  }

  for (const period of PERIODS) {
    const periodIndex = PERIODS.indexOf(period);
    const [rangeStart, rangeEnd] = PERIOD_RANGES[period];
    const statusWeights = STATUS_WEIGHTS_BY_PERIOD_INDEX[periodIndex]!;

    for (const profile of profiles) {
      if (!combosBySupplier.get(profile.supplierId)?.has(period)) continue;

      // Petite marche aléatoire du niveau du fournisseur d'un trimestre à l'autre.
      profile.currentLevel = Math.min(
        5,
        Math.max(1, profile.currentLevel + (Math.random() - 0.5) * 0.6),
      );

      const status = pickWeightedStatus(statusWeights);
      const isDraftIncomplete = status === 'DRAFT' && Math.random() < 0.5;
      const scoredCriteria = isDraftIncomplete
        ? shuffle(criteria).slice(0, randomInt(2, criteria.length - 1))
        : criteria;

      const scoresData = scoredCriteria.map((criterion) => ({
        criterionId: criterion.id,
        score: Math.round(
          Math.min(5, Math.max(1, profile.currentLevel + (Math.random() - 0.5) * 1.4)),
        ),
      }));

      const globalScore = computeGlobalScore(
        scoresData.map((s) => ({
          score: s.score,
          weight: criteria.find((c) => c.id === s.criterionId)!.weight,
        })),
      );

      const createdAt = randomDateBetween(rangeStart, rangeEnd);
      const submittedAt =
        status === 'SUBMITTED' || status === 'VALIDATED'
          ? randomDateBetween(createdAt, rangeEnd)
          : null;
      const validatedAt =
        status === 'VALIDATED' && submittedAt ? randomDateBetween(submittedAt, rangeEnd) : null;

      const wasRejected = status === 'DRAFT' && !isDraftIncomplete && Math.random() < 0.3;

      await prisma.evaluation.create({
        data: {
          supplierId: profile.supplierId,
          evaluatorId,
          period,
          status,
          comment: pickOne(COMMENTS),
          rejectionReason: wasRejected ? pickOne(REJECTION_REASONS) : null,
          globalScore,
          createdAt,
          submittedAt,
          validatedAt,
          scores: { create: scoresData },
        },
      });
    }
  }
}

async function main() {
  console.log('Réinitialisation de la base...');
  await resetDatabase();

  console.log('Création des utilisateurs...');
  const { evaluator } = await seedUsers();

  console.log('Création des critères...');
  const criteria = await seedCriteria();

  console.log('Création des fournisseurs...');
  const suppliers = await seedSuppliers();

  console.log('Création des évaluations...');
  await seedEvaluations(suppliers, evaluator.id, criteria);

  const evaluationCount = await prisma.evaluation.count();
  console.log(
    `Terminé : ${suppliers.length} fournisseurs, ${criteria.length} critères, ${evaluationCount} évaluations.`,
  );
  console.log(`Identifiants de démo (mot de passe commun) : ${DEMO_PASSWORD}`);
  console.log('  admin@example.com (ADMIN)');
  console.log('  evaluateur@example.com (EVALUATOR)');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
