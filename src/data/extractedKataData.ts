// Comprehensive Shotokan Kata Database from Extracted PDFs
// This file contains all 30 authentic Shotokan katas with complete information

export interface ExtractedKata {
  id: number;
  name: string;
  japanese_name: string;
  english_translation: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  number_of_movements: number;
  text_available: boolean;
  file: string;
}

export interface KataDatabase {
  title: string;
  style: string;
  total_kata: number;
  extraction_date: string;
  summary: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  kata_list: ExtractedKata[];
}

// Master database from extracted PDFs - All 30 Shotokan Katas
export const EXTRACTED_KATA_DATABASE: KataDatabase = {
  "title": "Shotokan Karate Kata Database",
  "style": "Shotokan",
  "total_kata": 30,
  "extraction_date": "2025-07-23T15:17:05.739607",
  "summary": {
    "beginner": 5,
    "intermediate": 4,
    "advanced": 16,
    "expert": 5
  },
  "kata_list": [
    {
      "id": 1,
      "name": "Heian Shodan",
      "japanese_name": "Heian Shodan",
      "english_translation": "Peaceful Mind, First Level",
      "difficulty_level": "Beginner",
      "number_of_movements": 21,
      "text_available": false,
      "file": "Heian_Shodan.json"
    },
    {
      "id": 2,
      "name": "Heian Nidan",
      "japanese_name": "Heian Nidan",
      "english_translation": "Peaceful Mind, Second Level",
      "difficulty_level": "Beginner",
      "number_of_movements": 26,
      "text_available": false,
      "file": "Heian_Nidan.json"
    },
    {
      "id": 3,
      "name": "Heian Sandan",
      "japanese_name": "Heian Sandan",
      "english_translation": "Peaceful Mind, Third Level",
      "difficulty_level": "Beginner",
      "number_of_movements": 20,
      "text_available": false,
      "file": "Heian_Sandan.json"
    },
    {
      "id": 4,
      "name": "Heian Yondan",
      "japanese_name": "Heian Yondan",
      "english_translation": "Peaceful Mind, Fourth Level",
      "difficulty_level": "Beginner",
      "number_of_movements": 27,
      "text_available": false,
      "file": "Heian_Yondan.json"
    },
    {
      "id": 5,
      "name": "Heian Godan",
      "japanese_name": "Heian Godan",
      "english_translation": "Peaceful Mind, Fifth Level",
      "difficulty_level": "Beginner",
      "number_of_movements": 23,
      "text_available": false,
      "file": "Heian_Godan.json"
    },
    {
      "id": 6,
      "name": "Tekki Shodan",
      "japanese_name": "Tekki Shodan",
      "english_translation": "Iron Horse, First Level",
      "difficulty_level": "Intermediate",
      "number_of_movements": 29,
      "text_available": false,
      "file": "Tekki_Shodan.json"
    },
    {
      "id": 7,
      "name": "Tekki Nidan",
      "japanese_name": "Tekki Nidan",
      "english_translation": "Iron Horse, Second Level",
      "difficulty_level": "Intermediate",
      "number_of_movements": 24,
      "text_available": false,
      "file": "Tekki_Nidan.json"
    },
    {
      "id": 8,
      "name": "Tekki Sandan",
      "japanese_name": "Tekki Sandan",
      "english_translation": "Iron Horse, Third Level",
      "difficulty_level": "Intermediate",
      "number_of_movements": 36,
      "text_available": false,
      "file": "Tekki_Sandan.json"
    },
    {
      "id": 9,
      "name": "Bassai Dai",
      "japanese_name": "Bassai Dai",
      "english_translation": "Penetrate the Fortress, Major",
      "difficulty_level": "Advanced",
      "number_of_movements": 42,
      "text_available": false,
      "file": "Bassai_Dai.json"
    },
    {
      "id": 10,
      "name": "Bassai Sho",
      "japanese_name": "Bassai Sho",
      "english_translation": "Penetrate the Fortress, Minor",
      "difficulty_level": "Advanced",
      "number_of_movements": 27,
      "text_available": false,
      "file": "Bassai_Sho.json"
    },
    {
      "id": 11,
      "name": "Kanku Dai",
      "japanese_name": "Kanku Dai",
      "english_translation": "View the Sky, Major",
      "difficulty_level": "Advanced",
      "number_of_movements": 65,
      "text_available": false,
      "file": "Kanku_Dai.json"
    },
    {
      "id": 12,
      "name": "Kanku Sho",
      "japanese_name": "Kanku Sho",
      "english_translation": "View the Sky, Minor",
      "difficulty_level": "Advanced",
      "number_of_movements": 48,
      "text_available": false,
      "file": "Kanku_Sho.json"
    },
    {
      "id": 13,
      "name": "Jion",
      "japanese_name": "Jion",
      "english_translation": "Temple Sound",
      "difficulty_level": "Advanced",
      "number_of_movements": 47,
      "text_available": false,
      "file": "Jion.json"
    },
    {
      "id": 14,
      "name": "Jitte",
      "japanese_name": "Jitte",
      "english_translation": "Ten Hands",
      "difficulty_level": "Advanced",
      "number_of_movements": 24,
      "text_available": false,
      "file": "Jitte.json"
    },
    {
      "id": 15,
      "name": "Empi",
      "japanese_name": "Empi",
      "english_translation": "Flying Swallow",
      "difficulty_level": "Advanced",
      "number_of_movements": 37,
      "text_available": false,
      "file": "Empi.json"
    },
    {
      "id": 16,
      "name": "Gankaku",
      "japanese_name": "Gankaku",
      "english_translation": "Crane on a Rock",
      "difficulty_level": "Advanced",
      "number_of_movements": 42,
      "text_available": false,
      "file": "Gankaku.json"
    },
    {
      "id": 17,
      "name": "Hangetsu",
      "japanese_name": "Hangetsu",
      "english_translation": "Half Moon",
      "difficulty_level": "Advanced",
      "number_of_movements": 41,
      "text_available": false,
      "file": "Hangetsu.json"
    },
    {
      "id": 18,
      "name": "Sochin",
      "japanese_name": "Sochin",
      "english_translation": "Preserve Peace",
      "difficulty_level": "Advanced",
      "number_of_movements": 41,
      "text_available": false,
      "file": "Sochin.json"
    },
    {
      "id": 19,
      "name": "Nijushiho",
      "japanese_name": "Nijushiho",
      "english_translation": "Twenty-Four Steps",
      "difficulty_level": "Advanced",
      "number_of_movements": 24,
      "text_available": false,
      "file": "Nijushiho.json"
    },
    {
      "id": 20,
      "name": "Meikyo",
      "japanese_name": "Meikyo",
      "english_translation": "Bright Mirror",
      "difficulty_level": "Advanced",
      "number_of_movements": 33,
      "text_available": false,
      "file": "Meikyo.json"
    },
    {
      "id": 21,
      "name": "Jiin",
      "japanese_name": "Jiin",
      "english_translation": "Compassion",
      "difficulty_level": "Intermediate",
      "number_of_movements": 38,
      "text_available": false,
      "file": "Jiin.json"
    },
    {
      "id": 22,
      "name": "Chinte",
      "japanese_name": "Chinte",
      "english_translation": "Rare Hand",
      "difficulty_level": "Advanced",
      "number_of_movements": 32,
      "text_available": false,
      "file": "Chinte.json"
    },
    {
      "id": 23,
      "name": "Unsu",
      "japanese_name": "Unsu",
      "english_translation": "Cloud Hands",
      "difficulty_level": "Expert",
      "number_of_movements": 48,
      "text_available": false,
      "file": "Unsu.json"
    },
    {
      "id": 24,
      "name": "Wankan",
      "japanese_name": "Wankan",
      "english_translation": "Crown of a King",
      "difficulty_level": "Expert",
      "number_of_movements": 24,
      "text_available": false,
      "file": "Wankan.json"
    },
    {
      "id": 25,
      "name": "Gojushiho Dai",
      "japanese_name": "Gojushiho Dai",
      "english_translation": "Fifty-Four Steps, Major",
      "difficulty_level": "Expert",
      "number_of_movements": 67,
      "text_available": false,
      "file": "Gojushiho_Dai.json"
    },
    {
      "id": 26,
      "name": "Gojushiho Sho",
      "japanese_name": "Gojushiho Sho",
      "english_translation": "Fifty-Four Steps, Minor",
      "difficulty_level": "Expert",
      "number_of_movements": 65,
      "text_available": false,
      "file": "Gojushiho_Sho.json"
    },
    {
      "id": 27,
      "name": "Gankanku Sho",
      "japanese_name": "Gankanku Sho",
      "english_translation": "View the Sky, Minor (alternate)",
      "difficulty_level": "Expert",
      "number_of_movements": 48,
      "text_available": false,
      "file": "Gankanku_Sho.json"
    },
    {
      "id": 28,
      "name": "Sanchin",
      "japanese_name": "Sanchin",
      "english_translation": "Three Battles",
      "difficulty_level": "Advanced",
      "number_of_movements": 23,
      "text_available": false,
      "file": "Sanchin.json"
    },
    {
      "id": 29,
      "name": "Tensho",
      "japanese_name": "Tensho",
      "english_translation": "Revolving Hands",
      "difficulty_level": "Advanced",
      "number_of_movements": 18,
      "text_available": false,
      "file": "Tensho.json"
    },
    {
      "id": 30,
      "name": "Anan",
      "japanese_name": "Anan",
      "english_translation": "Peace from the South",
      "difficulty_level": "Advanced",
      "number_of_movements": 33,
      "text_available": false,
      "file": "Anan.json"
    }
  ]
};

// Utility functions for working with the extracted kata data
export const getKataByName = (name: string): ExtractedKata | undefined => {
  return EXTRACTED_KATA_DATABASE.kata_list.find(
    kata => kata.name.toLowerCase() === name.toLowerCase()
  );
};

export const getKataById = (id: number): ExtractedKata | undefined => {
  return EXTRACTED_KATA_DATABASE.kata_list.find(kata => kata.id === id);
};

export const getKatasByDifficulty = (difficulty: string): ExtractedKata[] => {
  return EXTRACTED_KATA_DATABASE.kata_list.filter(
    kata => kata.difficulty_level.toLowerCase() === difficulty.toLowerCase()
  );
};

export const getAllKataNames = (): string[] => {
  return EXTRACTED_KATA_DATABASE.kata_list.map(kata => kata.name);
};

export const getAllKataObjects = (): ExtractedKata[] => {
  return EXTRACTED_KATA_DATABASE.kata_list;
};

export const getKataSummaryByDifficulty = () => {
  return EXTRACTED_KATA_DATABASE.summary;
};

// Helper function to convert difficulty to legacy format for compatibility
export const convertDifficultyToLegacy = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return 'beginner';
    case 'intermediate': return 'intermediate';
    case 'advanced': return 'advanced';
    case 'expert': return 'advanced'; // Map expert to advanced for compatibility
    default: return 'beginner';
  }
};

// Helper function to generate comprehensive kata reference data
export const generateKataReferenceData = () => {
  return EXTRACTED_KATA_DATABASE.kata_list.map(kata => ({
    id: kata.id.toString(),
    name: kata.name,
    style: 'Shotokan',
    difficulty: convertDifficultyToLegacy(kata.difficulty_level),
    movements: kata.number_of_movements,
    description: `${kata.english_translation} - Traditional Shotokan karate kata with ${kata.number_of_movements} movements.`,
    keyTechniques: generateKeyTechniquesForKata(kata.name),
    beltLevel: getBeltLevelForKata(kata.difficulty_level),
    meaning: kata.english_translation,
    origin: 'Okinawan Karate, adapted for Shotokan'
  }));
};

// Generate appropriate key techniques based on kata name and difficulty
const generateKeyTechniquesForKata = (kataName: string): string[] => {
  const basicTechniques = ['Gedan Barai (Downward Block)', 'Oi-Zuki (Lunge Punch)', 'Mae-Geri (Front Kick)'];
  const intermediateTechniques = ['Gyaku-Zuki (Reverse Punch)', 'Yoko-Geri (Side Kick)', 'Uchi-Uke (Inside Block)'];
  const advancedTechniques = ['Shuto-Uchi (Knife Hand Strike)', 'Uraken-Uchi (Back Fist Strike)', 'Mawashi-Geri (Roundhouse Kick)'];
  const expertTechniques = ['Empi-Uchi (Elbow Strike)', 'Ushiro-Geri (Back Kick)', 'Kumade-Uchi (Bear Hand Strike)'];

  // Kata-specific techniques
  if (kataName.includes('Heian')) {
    return [...basicTechniques, 'Age-Uke (Rising Block)', 'Shuto-Uke (Knife Hand Block)'];
  } else if (kataName.includes('Tekki')) {
    return [...intermediateTechniques, 'Kiba-Dachi (Horse Stance)', 'Nami-Ashi (Returning Wave Kick)'];
  } else if (kataName.includes('Bassai')) {
    return [...advancedTechniques, 'Morote-Uke (Augmented Block)', 'Haishu-Uchi (Back Hand Strike)'];
  } else if (kataName.includes('Kanku') || kataName.includes('Gankanku')) {
    return [...advancedTechniques, 'Mikazuki-Geri (Crescent Kick)', 'Tettsui-Uchi (Hammer Fist)'];
  } else if (kataName.includes('Gojushiho')) {
    return [...expertTechniques, 'Sokuto-Geri (Sword Foot Kick)', 'Teisho-Uchi (Palm Heel Strike)'];
  } else {
    return [...advancedTechniques];
  }
};

// Get appropriate belt level based on difficulty
const getBeltLevelForKata = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'beginner': return '9th-6th Kyu';
    case 'intermediate': return '5th-3rd Kyu';
    case 'advanced': return '2nd Kyu - 2nd Dan';
    case 'expert': return '3rd Dan and above';
    default: return '9th Kyu';
  }
};