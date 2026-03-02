
export interface Player {
  id: string;
  name: string;
  nick: string;
  role: string;
  status: 'pending' | 'player_signed' | 'fully_signed' | 'rejected';
  nif?: string;
  address?: string;
  signedAt?: number;
  playerSignature?: string;
  adminSignature?: string;
  team?: 'RaideN' | 'KenshiN';
}

export interface BudgetItem {
  id: string;
  condition: string;
  category: string;
  description: string;
  type: string;
  amount: number;
  highlighted?: boolean; // For items with * or **
}

export interface ContractData {
  period: string;
  totalBudget: number;
  coach: string;
  esportsHead: string;
  management: string[];
  purpose: string;
  prizes: string;
}
