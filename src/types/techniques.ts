export type TechniqueCategory = 'punch' | 'kick' | 'stance' | 'block';

export interface Technique {
  id: string;
  name: string;
  japaneseName: string;
  category: TechniqueCategory;
  points: number;
  description?: string;
}

export interface TechniqueLog {
  techniqueId: string;
  count: number;
  timestamp: Date;
}

export interface CategoryTab {
  id: TechniqueCategory;
  label: string;
  icon: string;
}

export const TECHNIQUE_CATEGORIES: CategoryTab[] = [
  { id: 'punch', label: 'Punches', icon: '👊' },
  { id: 'kick', label: 'Kicks', icon: '🦶' },
  { id: 'stance', label: 'Stances', icon: '🧍' },
  { id: 'block', label: 'Blocks', icon: '🛡️' }
];

export const TECHNIQUES: Technique[] = [
  // Punches
  { id: 'oi-tsuki', name: 'Stepping Punch', japaneseName: 'Oi-tsuki', category: 'punch', points: 2 },
  { id: 'gyaku-tsuki', name: 'Reverse Punch', japaneseName: 'Gyaku-tsuki', category: 'punch', points: 3 },
  { id: 'kagi-tsuki', name: 'Hook Punch', japaneseName: 'Kagi-tsuki', category: 'punch', points: 4 },
  
  // Kicks
  { id: 'mae-geri', name: 'Front Kick', japaneseName: 'Mae-geri', category: 'kick', points: 3 },
  { id: 'yoko-geri', name: 'Side Kick', japaneseName: 'Yoko-geri', category: 'kick', points: 4 },
  { id: 'mawashi-geri', name: 'Roundhouse Kick', japaneseName: 'Mawashi-geri', category: 'kick', points: 4 },
  
  // Stances
  { id: 'zenkutsu-dachi', name: 'Front Stance', japaneseName: 'Zenkutsu-dachi', category: 'stance', points: 2 },
  { id: 'kokutsu-dachi', name: 'Back Stance', japaneseName: 'Kokutsu-dachi', category: 'stance', points: 3 },
  { id: 'kiba-dachi', name: 'Horse Stance', japaneseName: 'Kiba-dachi', category: 'stance', points: 3 },
  
  // Blocks
  { id: 'age-uke', name: 'Rising Block', japaneseName: 'Age-uke', category: 'block', points: 2 },
  { id: 'soto-uke', name: 'Outside Block', japaneseName: 'Soto-uke', category: 'block', points: 2 },
  { id: 'uchi-uke', name: 'Inside Block', japaneseName: 'Uchi-uke', category: 'block', points: 2 }
];