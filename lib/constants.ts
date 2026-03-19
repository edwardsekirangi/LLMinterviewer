import type { Role } from './types';

export const roleLabels: Record<Role, string> = {
  quant: 'Quantitative Trading / Algorithmic Finance',
  data: 'Data Analyst / Data Science',
  swe: 'Software Engineering',
  fund: 'Fund Manager / Investment Management',
};

export const rolePills: { key: Role; label: string }[] = [
  { key: 'quant', label: 'Quant / Algo Trading' },
  { key: 'data', label: 'Data Analyst / DS' },
  { key: 'swe', label: 'Software Engineer' },
  { key: 'fund', label: 'Fund Manager' },
];
