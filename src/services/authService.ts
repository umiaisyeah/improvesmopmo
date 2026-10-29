import { PrimaUser, UserPartyRole } from '../types';

export const PRESET_USERS: Record<UserPartyRole, PrimaUser> = {
  PMO: {
    id: 'usr-pmo-01',
    name: 'Pihak PMO',
    email: 'pmo@abj.co.id',
    role: 'PMO',
    roleLabel: 'Project Management Office (PMO)',
    department: 'Departemen PMO Cyclical & Eksekusi Lapangan',
    institution: 'PT Air Bersih Jakarta',
    avatarInitials: 'PMO',
  },
  PLANNING: {
    id: 'usr-plan-01',
    name: 'Pihak Planning',
    email: 'planning@abj.co.id',
    role: 'PLANNING',
    roleLabel: 'Planning & Engineering',
    department: 'Divisi Perencanaan Strategis & Baseline DED',
    institution: 'PT Air Bersih Jakarta',
    avatarInitials: 'PLN',
  },
  PGO: {
    id: 'usr-pgo-01',
    name: 'Pihak PGO',
    email: 'pgo@abj.co.id',
    role: 'PGO',
    roleLabel: 'Project Governance Office (PGO)',
    department: 'Kantor Tata Kelola Kepatuhan & Manajemen Risiko (SPI)',
    institution: 'PT Air Bersih Jakarta',
    avatarInitials: 'PGO',
  },
};

const AUTH_STORAGE_KEY = 'prima_auth_user_session';

export function getStoredUser(): PrimaUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.role && PRESET_USERS[parsed.role as UserPartyRole]) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored user:', err);
  }
  return null;
}

export function persistUser(user: PrimaUser | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to persist user:', err);
  }
}

export function loginWithRole(role: UserPartyRole): PrimaUser {
  const user = PRESET_USERS[role];
  persistUser(user);
  return user;
}

export function loginWithCredentials(
  email: string,
  _password: string,
  role: UserPartyRole,
  customName?: string
): PrimaUser {
  const base = PRESET_USERS[role];
  const user: PrimaUser = {
    ...base,
    name: customName?.trim() || base.name,
    email: email.trim() || base.email,
    avatarInitials: (customName || base.name)
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  };
  persistUser(user);
  return user;
}

export function logoutUser(): void {
  persistUser(null);
}
