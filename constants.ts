
import { Player, BudgetItem, ContractData } from './types';

export const CONTRACT_DATA: ContractData = {
  period: "1/03/2026 - 1/07/2026",
  totalBudget: 2276.54,
  coach: "Nuno 'Vegetal' Gaspar",
  esportsHead: "Marcos 'faithal' Oliveira",
  management: ["Diogo 'flyme' Pereira", "Luis 'XoulZ' Brandão"],
  purpose: "Contrato 2026 — Duração 4 meses",
  prizes: "LAN: 40% TAC — 60% Players | Online: 30% TAC — 70% Players"
};

export const BUDGET_ITEMS: BudgetItem[] = [
  { id: '1', condition: 'Agency Clan official jersey *', category: 'Equipment', description: '45€/ player', type: 'Piece', amount: 450.00, highlighted: true },
  { id: '2', condition: 'ESEA League pass', category: 'ESEA', description: '20.66€/ player', type: 'Per Player', amount: 206.60 },
  { id: '3', condition: 'PRACC SV', category: 'Server', description: '14.99€/ month', type: 'Per Month', amount: 89.94 },
  { id: '4', condition: 'Warmup vip**', category: 'Analytics tool', description: '6€/ month', type: 'Per Month', amount: 180.00, highlighted: true },
  { id: '5', condition: 'REFRAG Player**', category: 'Analytics tool', description: '7€/ month', type: 'Per Month', amount: 210.00, highlighted: true },
  { id: '6', condition: 'FACEIT Premium**', category: 'Analytics tool', description: '6€/ month', type: 'Per Month', amount: 180.00, highlighted: true },
  { id: '7', condition: 'Leetify Pro**', category: 'Analytics tool', description: '6€/ month', type: 'Per Month', amount: 180.00, highlighted: true },
  { id: '8', condition: 'Master classes', category: 'Learning', description: '20€/ hour', type: 'Per Class', amount: 480.00 },
  { id: '9', condition: 'Media day*', category: 'Media', description: 'Full media day shoot', type: 'Media', amount: 200.00, highlighted: true },
  { id: '10', condition: 'Agency Dojo U2 Tournment', category: 'Tournment', description: '1 day', type: 'Prize pool', amount: 100.00 }
];

export const INITIAL_PLAYERS: Player[] = [
  // Team RaideN
  { id: 'p1', nick: 'PEiNE', name: 'Paulo Sérgio Ferreira Nunes', team: 'RaideN', signed: false },
  { id: 'p2', nick: 'X0ra', name: 'Simão Marcelino', team: 'RaideN', signed: false },
  { id: 'p3', nick: 'FRONT', name: 'Gabriel da Silva Correia', team: 'RaideN', signed: false },
  { id: 'p4', nick: 'Esteban', name: 'Esteban Kauã Henrique Santos Pina', team: 'RaideN', signed: false },
  { id: 'p5', nick: 'Retrix', name: 'Diogo Pérez Rodrigues', team: 'RaideN', signed: false },
  // Team KenshiN
  { id: 'p6', nick: 'wh1ze', name: 'João Jácome Louro', team: 'KenshiN', signed: false },
  { id: 'p7', nick: 'sw3tyzz', name: 'Simão Martins', team: 'KenshiN', signed: false },
  { id: 'p8', nick: 'Mouran', name: 'João Moura', team: 'KenshiN', signed: false },
  { id: 'p9', nick: 'Chipxx', name: 'Vitor Santos', team: 'KenshiN', signed: false },
  { id: 'p10', nick: 'reo', name: 'Leonardo Alegre', team: 'KenshiN', signed: false },
];
