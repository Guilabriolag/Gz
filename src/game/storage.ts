export type AttrKey = 'agilidade' | 'precisao' | 'organizacao' | 'disciplina' | 'atencao' | 'resistencia';
export const ATTR_KEYS: AttrKey[] = ['agilidade', 'precisao', 'organizacao', 'disciplina', 'atencao', 'resistencia'];
export const ATTR_LABEL: Record<AttrKey, string> = {
  agilidade: 'Agilidade',
  precisao: 'Precisão',
  organizacao: 'Organização',
  disciplina: 'Disciplina',
  atencao: 'Atenção',
  resistencia: 'Resistência',
};

export interface JobRecord {
  day: number;
  empregador: string;
  funcao: string;
  salario: number;
  pedidos: number;
  erros: number;
  score: number;
  avaliacao: string;
}

export interface HighScore {
  score: number;
  pedidos: number;
  day: number;
  date: string;
}

export interface Profile {
  name: string;
  money: number;
  day: number;
  energy: number;
  attrs: Record<AttrKey, number>;
  hired: boolean;
  hiredDay: number;
  hasCap: boolean;
  ownsBusiness: boolean;
  history: JobRecord[];
  highScores: HighScore[];
  totalShifts: number;
  bestScore: number;
}

const KEY = 'universo-zero-profile-v1';

export function defaultProfile(): Profile {
  return {
    name: 'Tic-Tac',
    money: 25,
    day: 1,
    energy: 100,
    attrs: { agilidade: 5, precisao: 5, organizacao: 5, disciplina: 5, atencao: 5, resistencia: 5 },
    hired: false,
    hiredDay: 0,
    hasCap: false,
    ownsBusiness: false,
    history: [],
    highScores: [],
    totalShifts: 0,
    bestScore: 0,
  };
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw);
    return { ...defaultProfile(), ...parsed, attrs: { ...defaultProfile().attrs, ...(parsed.attrs || {}) } };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function resetProfile(): Profile {
  const p = defaultProfile();
  saveProfile(p);
  return p;
}

export function addHighScore(p: Profile, hs: HighScore) {
  p.highScores.push(hs);
  p.highScores.sort((a, b) => b.score - a.score);
  p.highScores = p.highScores.slice(0, 8);
  if (hs.score > p.bestScore) p.bestScore = hs.score;
}

export function attrLevel(v: number) {
  return Math.min(10, Math.floor(v / 10));
}
