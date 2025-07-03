import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kataData from '../../data/kataReference.json';

// Types
interface Kata {
  id: string;
  name: string;
  style: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  originalSiteUrl: string;
  description: string;
  movements: number;
  beltLevel: string;
  meaning: string;
  keyTechniques: string[];
  practiceTime: string;
  origin: string;
}

type PracticeStatus = 'learning' | 'practicing' | 'mastered' | null;

interface KataProgress {
  [kataId: string]: PracticeStatus;
}

interface KataFavorites {
  [kataId: string]: boolean;
}

const KataReference: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [favorites, setFavorites] = useState<KataFavorites>({});
  const [practiceStatus, setPracticeStatus] = useState<KataProgress>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const katas: Kata[] = kataData.katas;
  const styles = [...new Set(katas.map(kata => kata.style))];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  // Load saved data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('kata-favorites');
    const savedProgress = localStorage.getItem('kata-progress');
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
    
    if (savedProgress) {
      try {
        setPracticeStatus(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading practice status:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('kata-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save practice status to localStorage
  useEffect(() => {
    localStorage.setItem('kata-progress', JSON.stringify(practiceStatus));
  }, [practiceStatus]);

  // Filter and search katas
  const filteredKatas = useMemo(() => {
    return katas.filter(kata => {
      const matchesSearch = kata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kata.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStyle = selectedStyle === 'all' || kata.style === selectedStyle;
      const matchesDifficulty = selectedDifficulty === 'all' || kata.difficulty === selectedDifficulty;
      const matchesFavorites = !showFavoritesOnly || favorites[kata.id];
      
      return matchesSearch && matchesStyle && matchesDifficulty && matchesFavorites;
    });
  }, [katas, searchTerm, selectedStyle, selectedDifficulty, showFavoritesOnly, favorites]);

  // Group katas by style
  const katasByStyle = useMemo(() => {
    const grouped: { [key: string]: Kata[] } = {};
    filteredKatas.forEach(kata => {
      if (!grouped[kata.style]) {
        grouped[kata.style] = [];
      }
      grouped[kata.style].push(kata);
    });
    return grouped;
  }, [filteredKatas]);

  const toggleFavorite = (kataId: string) => {
    setFavorites(prev => ({
      ...prev,
      [kataId]: !prev[kataId]
    }));
  };

  const updatePracticeStatus = (kataId: string, status: PracticeStatus) => {
    setPracticeStatus(prev => ({
      ...prev,
      [kataId]: prev[kataId] === status ? null : status
    }));
  };

  const openKataUrl = (originalSiteUrl: string) => {
    window.open(originalSiteUrl, '_blank', 'noopener,noreferrer');
  };

  const openVideoUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: PracticeStatus) => {
    switch (status) {
      case 'learning': return 'bg-blue-500';
      case 'practicing': return 'bg-orange-500';
      case 'mastered': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: PracticeStatus) => {
    switch (status) {
      case 'learning': return '📚 Learning';
      case 'practicing': return '🥋 Practicing';
      case 'mastered': return '🏆 Mastered';
      default: return 'Set Status';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Kata Reference</h1>
          <p className="text-blue-100">Explore traditional karate kata from different styles</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Kata
              </label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Style Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Styles</option>
                {styles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorites Toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFavoritesOnly
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ❤️ {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center mb-6">
          <p className="text-blue-100">
            Showing {filteredKatas.length} kata{filteredKatas.length !== 1 ? 's' : ''}
            {showFavoritesOnly && ' from your favorites'}
          </p>
        </div>

        {/* Kata Cards by Style */}
        <div className="space-y-8">
          {Object.entries(katasByStyle).map(([style, styleKatas]) => (
            <motion.div
              key={style}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Style Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{style}</h2>
                <p className="text-blue-100">{styleKatas.length} kata{styleKatas.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Kata Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {styleKatas.map((kata) => (
                      <motion.div
                        key={kata.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gray-50 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-gray-200"
                      >
                        {/* Kata Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                              {kata.name}
                            </h3>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(kata.difficulty)}`}>
                              {kata.difficulty.charAt(0).toUpperCase() + kata.difficulty.slice(1)}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleFavorite(kata.id)}
                            className={`text-2xl transition-transform hover:scale-110 ${
                              favorites[kata.id] ? 'text-red-500' : 'text-gray-300'
                            }`}
                          >
                            ❤️
                          </button>
                        </div>

                        {/* Kata Info */}
                        <div className="text-sm text-gray-600 mb-3 space-y-1">
                          <p><span className="font-medium">Belt Level:</span> {kata.beltLevel}</p>
                          <p><span className="font-medium">Movements:</span> {kata.movements}</p>
                          <p><span className="font-medium">Practice Time:</span> {kata.practiceTime}</p>
                          <p><span className="font-medium">Meaning:</span> {kata.meaning}</p>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {kata.description}
                        </p>

                        {/* Key Techniques */}
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Key Techniques:</p>
                          <div className="flex flex-wrap gap-1">
                            {kata.keyTechniques.slice(0, 3).map((technique, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                              >
                                {technique}
                              </span>
                            ))}
                            {kata.keyTechniques.length > 3 && (
                              <span className="text-xs text-gray-400">+{kata.keyTechniques.length - 3} more</span>
                            )}
                          </div>
                        </div>

                        {/* Practice Status */}
                        <div className="mb-4">
                          <div className="flex gap-1 mb-2">
                            {(['learning', 'practicing', 'mastered'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => updatePracticeStatus(kata.id, status)}
                                className={`flex-1 px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                                  practiceStatus[kata.id] === status
                                    ? `${getStatusColor(status)} text-white`
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {getStatusText(status).split(' ')[0]}
                              </button>
                            ))}
                          </div>
                          {practiceStatus[kata.id] && (
                            <p className="text-xs text-gray-500 text-center">
                              {getStatusText(practiceStatus[kata.id])}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <button
                            onClick={() => openKataUrl(kata.originalSiteUrl)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <span>View on KataStepByStep</span>
                            <span className="text-sm">↗️</span>
                          </button>
                          
                          <button
                            onClick={() => openVideoUrl(kata.url)}
                            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <span>📹 Watch Video</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredKatas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🥋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Kata Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStyle('all');
                  setSelectedDifficulty('all');
                  setShowFavoritesOnly(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Attribution */}
        <div className="mt-12 text-center">
          <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
            <p className="text-blue-100 mb-2">
              Kata reference data and links courtesy of{' '}
              <a
                href="https://katastepbystep.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:underline"
              >
                KataStepByStep.com
              </a>
            </p>
            <p className="text-blue-200 text-sm">
              Visit their site for detailed step-by-step kata instructions and videos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KataReference;