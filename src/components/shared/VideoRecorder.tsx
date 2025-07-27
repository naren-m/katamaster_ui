import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Upload,
  AlertCircle,
  CheckCircle,
  Video
} from 'lucide-react';

interface VideoRecorderProps {
  onVideoSaved?: (videoData: {
    blob: Blob;
    duration: number;
    timestamp: Date;
    filename: string;
  }) => void;
  onVideoUploaded?: (videoUrl: string) => void;
  maxDurationSeconds?: number;
  className?: string;
}

interface RecordedVideo {
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
  filename: string;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoSaved,
  onVideoUploaded,
  maxDurationSeconds = 300, // 5 minutes default
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
      console.error('Camera initialization error:', err);
    }
  }, []);

  // Cleanup camera
  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCamera(false);
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date();
        const filename = `kata-practice-${timestamp.toISOString().split('T')[0]}-${Date.now()}.webm`;
        
        const videoData = {
          blob,
          url,
          duration: recordingTime,
          timestamp,
          filename
        };
        
        setRecordedVideo(videoData);
        
        if (onVideoSaved) {
          onVideoSaved(videoData);
        }
        
        setRecordingTime(0);
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSeconds) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
      }, 1000);
      
    } catch (err) {
      setError('Unable to start recording. Please try again.');
      console.error('Recording start error:', err);
    }
  }, [maxDurationSeconds, onVideoSaved, recordingTime]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Pause/Resume recording
  const togglePauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDurationSeconds) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
      }, 1000);
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPaused(true);
    }
  }, [isPaused, maxDurationSeconds, stopRecording]);

  // Play recorded video
  const playRecordedVideo = useCallback(() => {
    if (playbackRef.current && recordedVideo) {
      if (isPlaying) {
        playbackRef.current.pause();
        setIsPlaying(false);
      } else {
        playbackRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, recordedVideo]);

  // Download recorded video
  const downloadVideo = useCallback(() => {
    if (!recordedVideo) return;
    
    const link = document.createElement('a');
    link.href = recordedVideo.url;
    link.download = recordedVideo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [recordedVideo]);

  // Delete recorded video
  const deleteVideo = useCallback(() => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo.url);
      setRecordedVideo(null);
      setIsPlaying(false);
    }
  }, [recordedVideo]);

  // Mock upload function (in real implementation, this would upload to a server)
  const uploadVideo = useCallback(async () => {
    if (!recordedVideo || !onVideoUploaded) return;
    
    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would upload the blob to your server
      // const formData = new FormData();
      // formData.append('video', recordedVideo.blob, recordedVideo.filename);
      // const response = await fetch('/api/videos/upload', { method: 'POST', body: formData });
      
      // For now, we'll just use the blob URL
      onVideoUploaded(recordedVideo.url);
      setIsUploading(false);
    } catch (err) {
      setError('Failed to upload video. Please try again.');
      setIsUploading(false);
      console.error('Upload error:', err);
    }
  }, [recordedVideo, onVideoUploaded]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanupCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initializeCamera, cleanupCamera]);

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Video className="text-blue-600 mr-2" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Practice Video Recorder</h3>
        </div>
        
        {recordedVideo && (
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="text-green-500 mr-1" size={16} />
            Video ready ({formatTime(recordedVideo.duration)})
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center"
        >
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Preview / Recording */}
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {hasCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Recording indicator */}
                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 bg-white rounded-full mr-2"
                      />
                      REC {formatTime(recordingTime)}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recording controls overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
                  {!isRecording ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
                    >
                      <Camera size={24} />
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePauseRecording}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg"
                      >
                        {isPaused ? <Play size={24} /> : <Pause size={24} />}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopRecording}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg"
                      >
                        <Square size={24} />
                      </motion.button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <Camera size={48} className="mx-auto mb-2" />
                  <p>No camera access</p>
                  <button
                    onClick={initializeCamera}
                    className="mt-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recording status */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Max duration: {formatTime(maxDurationSeconds)}</span>
            {isRecording && (
              <span className={`font-medium ${isPaused ? 'text-yellow-600' : 'text-red-600'}`}>
                {isPaused ? 'Paused' : 'Recording...'}
              </span>
            )}
          </div>
        </div>

        {/* Video Playback & Actions */}
        <div className="space-y-4">
          {recordedVideo ? (
            <>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={playbackRef}
                  src={recordedVideo.url}
                  controls
                  className="w-full h-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Duration: {formatTime(recordedVideo.duration)}</p>
                  <p>Recorded: {recordedVideo.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadVideo}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </motion.button>

                {onVideoUploaded && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={uploadVideo}
                    disabled={isUploading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <Upload size={16} className="mr-2" />
                    {isUploading ? 'Uploading...' : 'Share'}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={deleteVideo}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg aspect-video">
              <div className="text-center text-gray-400">
                <Video size={48} className="mx-auto mb-2" />
                <p>No video recorded yet</p>
                <p className="text-sm">Start recording to see playback here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRecorder;