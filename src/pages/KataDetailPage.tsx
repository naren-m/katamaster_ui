import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { PDFViewer, usePDFViewerKeyboard } from '../components/shared/PDFViewer';

type KataStep = {
  order: number;
  name: string;
  description: string;
  japanese_name: string;
  image_url: string;
  focus_points: string;
};

type KataDetail = {
  id: string;
  name: string;
  style: string;
  belt_level: string;
  description: string;
  movements: number;
  video_url: string;
  history: string;
  meaning: string;
  key_focus_points: string[];
  steps: KataStep[];
  created_at: string;
  updated_at: string;
};

export const KataDetailPage: React.FC = () => {
  const { kataId } = useParams<{ kataId: string }>();
  const navigate = useNavigate();
  const [kata, setKata] = useState<KataDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [pdfViewer, setPdfViewer] = useState<{ isOpen: boolean; kataId: string; kataName: string }>({
    isOpen: false,
    kataId: '',
    kataName: ''
  });

  useEffect(() => {
    const loadKataDetail = async () => {
      if (!kataId) {
        setError('No kata ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading kata detail for ID:', kataId);
        const kataData = await apiService.getKataDetail(kataId);
        console.log('Kata detail loaded:', kataData);
        setKata(kataData);
      } catch (error) {
        console.error('Failed to load kata detail:', error);
        setError('Failed to load kata details');
      } finally {
        setLoading(false);
      }
    };

    loadKataDetail();
  }, [kataId]);

  const openPDFViewer = (kataId: string, kataName: string) => {
    setPdfViewer({
      isOpen: true,
      kataId: kataId,
      kataName: kataName
    });
  };

  const closePDFViewer = () => {
    setPdfViewer({
      isOpen: false,
      kataId: '',
      kataName: ''
    });
  };

  // Use the PDF viewer keyboard hook
  usePDFViewerKeyboard(pdfViewer.isOpen, closePDFViewer);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading kata details...</div>
      </div>
    );
  }

  if (error || !kata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error || 'Kata not found'}</div>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-blue-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white text-center flex-1">
            {kata.name}
          </h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kata Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Kata Information</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-600">Style:</span>
                  <span className="ml-2 text-gray-800">{kata.style}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">Belt Level:</span>
                  <span className="ml-2 text-gray-800">{kata.belt_level}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">Movements:</span>
                  <span className="ml-2 text-gray-800">{kata.movements}</span>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">Description:</span>
                  <p className="mt-1 text-gray-800">{kata.description}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">Meaning:</span>
                  <p className="mt-1 text-gray-800">{kata.meaning}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">History:</span>
                  <p className="mt-1 text-gray-800">{kata.history}</p>
                </div>
              </div>

              {/* Key Focus Points */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-600 mb-2">Key Focus Points:</h3>
                <div className="flex flex-wrap gap-2">
                  {kata.key_focus_points.map((point, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {/* PDF Button */}
                <button
                  onClick={() => openPDFViewer(kata.id, kata.name)}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-purple-700 transition-colors text-center"
                >
                  📄 View Instructions PDF
                </button>

                {/* Video Link */}
                {kata.video_url && (
                  <a
                    href={kata.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-600 transition-colors text-center block"
                  >
                    📹 Watch Video Tutorial
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Kata Steps ({kata.steps.length} steps)
              </h2>

              {kata.steps.length > 0 ? (
                <div className="space-y-4">
                  {/* Step Navigation */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {kata.steps.map((step, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedStep(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedStep === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Step {index + 1}
                      </button>
                    ))}
                  </div>

                  {/* Selected Step Details */}
                  <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-blue-800">
                        Step {selectedStep + 1}
                        {kata.steps[selectedStep].name && ` - ${kata.steps[selectedStep].name}`}
                      </h3>
                      {kata.steps[selectedStep].japanese_name && (
                        <span className="text-sm text-blue-600 italic">
                          {kata.steps[selectedStep].japanese_name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Step Image */}
                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        {kata.steps[selectedStep].image_url ? (
                          <img
                            src={kata.steps[selectedStep].image_url}
                            alt={`Step ${selectedStep + 1}`}
                            className="max-w-full max-h-64 mx-auto rounded-lg"
                          />
                        ) : (
                          <div className="h-64 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <div className="text-6xl mb-2">🥋</div>
                              <div>Image coming soon</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step Description */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Description:</h4>
                        <p className="text-gray-800 mb-4">
                          {kata.steps[selectedStep].description || 'No description available'}
                        </p>

                        {kata.steps[selectedStep].focus_points && (
                          <>
                            <h4 className="font-semibold text-gray-700 mb-2">Focus Points:</h4>
                            <p className="text-gray-800">
                              {kata.steps[selectedStep].focus_points}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setSelectedStep(Math.max(0, selectedStep - 1))}
                        disabled={selectedStep === 0}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous Step
                      </button>
                      
                      <span className="px-4 py-2 text-gray-600">
                        {selectedStep + 1} of {kata.steps.length}
                      </span>
                      
                      <button
                        onClick={() => setSelectedStep(Math.min(kata.steps.length - 1, selectedStep + 1))}
                        disabled={selectedStep === kata.steps.length - 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next Step →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-6xl mb-4">🥋</div>
                  <p>Step-by-step instructions coming soon!</p>
                  <p className="text-sm mt-2">This kata is available for practice, but detailed steps are being prepared.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewer
        kataId={pdfViewer.kataId}
        kataName={pdfViewer.kataName}
        isOpen={pdfViewer.isOpen}
        onClose={closePDFViewer}
      />
    </div>
  );
};