import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { usePractice } from '../contexts/PracticeContext';
import VideoRecorder from '../components/shared/VideoRecorder';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Target, 
  Star,
  Save,
  Video,
  FileText,
  Calendar
} from 'lucide-react';

interface PracticeSession {
  kataName: string;
  repetitions: number;
  focusAreas: string[];
  selfRating: number;
  notes: string;
  duration: number;
  videoUrl?: string;
}

const VideoPracticePage: React.FC = () => {
  const { childName, isParentMode } = useUser();
  const { addSession } = usePractice();
  
  const [currentStep, setCurrentStep] = useState<'setup' | 'recording' | 'review' | 'complete'>('setup');
  const [practiceSession, setPracticeSession] = useState<PracticeSession>({
    kataName: '',
    repetitions: 5,
    focusAreas: [],
    selfRating: 0,
    notes: '',
    duration: 0,
    videoUrl: undefined
  });
  const [availableKatas] = useState([
    'Heian Shodan', 'Heian Nidan', 'Heian Sandan', 'Heian Yondan', 'Heian Godan',
    'Tekki Shodan', 'Bassai Dai', 'Kanku Dai', 'Empi', 'Jion'
  ]);
  const [availableFocusAreas] = useState([
    'Stances', 'Timing', 'Power', 'Balance', 'Transitions', 'Breathing', 'Focus', 'Precision'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);

  const handleVideoSaved = (videoData: { blob: Blob; duration: number; timestamp: Date; filename: string }) => {
    // Create a URL for the video (in real implementation, this would be uploaded to server)
    const videoUrl = URL.createObjectURL(videoData.blob);
    setPracticeSession(prev => ({
      ...prev,
      videoUrl,
      duration: videoData.duration
    }));
    setCurrentStep('review');
  };

  const handleVideoUploaded = (videoUrl: string) => {
    setPracticeSession(prev => ({
      ...prev,
      videoUrl
    }));
  };

  const startPracticeSession = () => {
    setRecordingStartTime(new Date());
    setCurrentStep('recording');
  };

  const handleFocusAreaToggle = (area: string) => {
    setPracticeSession(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const submitPracticeSession = async () => {
    setIsSubmitting(true);
    try {
      // Add the session to the practice context
      await addSession({
        id: Date.now().toString(),
        date: recordingStartTime || new Date(),
        duration: practiceSession.duration,
        katas: [practiceSession.kataName],
        punches: 0, // Video sessions don't track punches
        pointsEarned: Math.floor(practiceSession.duration / 10) + (practiceSession.selfRating * 2),
        notes: practiceSession.notes,
        videoUrl: practiceSession.videoUrl,
        repetitions: practiceSession.repetitions,
        focusAreas: practiceSession.focusAreas,
        selfRating: practiceSession.selfRating
      });
      
      setCurrentStep('complete');
    } catch (error) {
      console.error('Failed to save practice session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSession = () => {
    setPracticeSession({
      kataName: '',
      repetitions: 5,
      focusAreas: [],
      selfRating: 0,
      notes: '',
      duration: 0,
      videoUrl: undefined
    });
    setCurrentStep('setup');
    setRecordingStartTime(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Video className="mx-auto text-blue-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Practice Session</h2>
              <p className="text-gray-600">Configure your kata practice before recording</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              {/* Kata Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Kata to Practice
                </label>
                <select
                  value={practiceSession.kataName}
                  onChange={(e) => setPracticeSession(prev => ({ ...prev, kataName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a kata...</option>
                  {availableKatas.map(kata => (
                    <option key={kata} value={kata}>{kata}</option>
                  ))}
                </select>
              </div>

              {/* Repetitions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Repetitions
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={practiceSession.repetitions}
                    onChange={(e) => setPracticeSession(prev => ({ ...prev, repetitions: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {practiceSession.repetitions}
                  </span>
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Areas (Select what you want to work on)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableFocusAreas.map(area => (
                    <motion.button
                      key={area}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFocusAreaToggle(area)}
                      className={`p-2 rounded-lg border transition-colors ${
                        practiceSession.focusAreas.includes(area)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {area}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startPracticeSession}
                disabled={!practiceSession.kataName}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
              >
                <Play className="mr-2" size={20} />
                Start Recording Practice Session
              </motion.button>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recording: {practiceSession.kataName}</h2>
              <p className="text-gray-600">Practice {practiceSession.repetitions} repetitions focusing on: {practiceSession.focusAreas.join(', ')}</p>
            </div>

            <VideoRecorder
              onVideoSaved={handleVideoSaved}
              onVideoUploaded={handleVideoUploaded}
              maxDurationSeconds={900} // 15 minutes max
              className="max-w-6xl mx-auto"
            />

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Practice Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Perform each repetition with focus and intention</li>
                <li>• Take breaks between repetitions if needed</li>
                <li>• Maintain proper form throughout</li>
                <li>• Review your video before finishing to self-assess</li>
              </ul>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Practice Session</h2>
              <p className="text-gray-600">Add your reflection and self-assessment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Practice Video</h3>
                {practiceSession.videoUrl && (
                  <video
                    src={practiceSession.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <Clock className="mr-1" size={16} />
                  Duration: {Math.floor(practiceSession.duration / 60)}:{(practiceSession.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Self-Assessment</h3>
                
                {/* Self Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you perform? (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPracticeSession(prev => ({ ...prev, selfRating: star }))}
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= practiceSession.selfRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Notes & Reflection
                  </label>
                  <textarea
                    value={practiceSession.notes}
                    onChange={(e) => setPracticeSession(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="What went well? What can you improve next time?"
                  />
                </div>

                {/* Session Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Session Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Kata: {practiceSession.kataName}</div>
                    <div>Repetitions: {practiceSession.repetitions}</div>
                    <div>Focus Areas: {practiceSession.focusAreas.join(', ') || 'None selected'}</div>
                    <div>Duration: {Math.floor(practiceSession.duration / 60)}m {practiceSession.duration % 60}s</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitPracticeSession}
                  disabled={isSubmitting || practiceSession.selfRating === 0}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>Saving Session...</>
                  ) : (
                    <>
                      <Save className="mr-2" size={20} />
                      Save Practice Session
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900">Great Practice Session!</h2>
            <p className="text-lg text-gray-600">
              Your {practiceSession.kataName} practice has been saved with your video.
            </p>

            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
              <h3 className="font-bold text-gray-900 mb-4">Session Results</h3>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{Math.floor(practiceSession.duration / 60)}m {practiceSession.duration % 60}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Self Rating:</span>
                  <span className="flex">
                    {Array.from({ length: practiceSession.selfRating }, (_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Points Earned:</span>
                  <span className="text-green-600 font-bold">
                    +{Math.floor(practiceSession.duration / 10) + (practiceSession.selfRating * 2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetSession}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <Target className="mr-2" size={20} />
                Practice Another Kata
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/history'}
                className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center"
              >
                <FileText className="mr-2" size={20} />
                View Practice History
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-3xl font-bold text-blue-900 mb-2"
          style={!isParentMode ? { fontFamily: 'Comic Sans MS, cursive' } : {}}
        >
          {isParentMode ? `${childName}'s Video Practice` : 'Video Practice Session'}
        </h1>
        <p className="text-gray-600">Record and review your kata practice with video feedback</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { key: 'setup', label: 'Setup', icon: Target },
            { key: 'recording', label: 'Recording', icon: Video },
            { key: 'review', label: 'Review', icon: Star },
            { key: 'complete', label: 'Complete', icon: CheckCircle }
          ].map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = ['setup', 'recording', 'review', 'complete'].indexOf(currentStep) > index;
            const IconComponent = step.icon;
            
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'bg-blue-600 border-blue-600 text-white' :
                    isCompleted ? 'bg-green-600 border-green-600 text-white' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <IconComponent size={20} />
                  </div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-blue-600 font-medium' :
                    isCompleted ? 'text-green-600 font-medium' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VideoPracticePage;