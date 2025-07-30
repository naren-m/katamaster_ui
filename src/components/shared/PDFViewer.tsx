import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from 'lucide-react';

interface PDFViewerProps {
  kataId: string;
  kataName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ kataId, kataName, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  // Construct the PDF URL - use frontend static files for reliable access
  const pdfUrl = `/katas/${getPDFFileName(kataId)}`;
  
  function getPDFFileName(kataId: string): string {
    // All 30 Shotokan katas from extracted PDF database
    const kataPDFMap: { [key: string]: string } = {
      "heian-shodan": "01_Heian_Shodan.pdf",
      "heian-nidan": "02_Heian_Nidan.pdf", 
      "heian-sandan": "03_Heian_Sandan.pdf",
      "heian-yondan": "04_Heian_Yondan.pdf",
      "heian-godan": "05_Heian_Godan.pdf",
      "tekki-shodan": "06_Tekki_Shodan.pdf",
      "tekki-nidan": "07_Tekki_Nidan.pdf",
      "tekki-sandan": "08_Tekki_Sandan.pdf",
      "bassai-dai": "09_Bassai_Dai.pdf",
      "bassai-sho": "10_Bassai_Sho.pdf",
      "kanku-dai": "11_Kanku_Dai.pdf",
      "kanku-sho": "12_Kanku_Sho.pdf",
      "jion": "13_Jion.pdf",
      "jitte": "14_Jitte.pdf",
      "empi": "15_Empi.pdf",
      "gankaku": "16_Gankaku.pdf",
      "hangetsu": "17_Hangetsu.pdf",
      "sochin": "18_Sochin.pdf",
      "nijushiho": "19_Nijushiho.pdf",
      "meikyo": "20_Meikyo.pdf",
      "jiin": "21_Jiin.pdf",
      "chinte": "22_Chinte.pdf",
      "unsu": "23_Unsu.pdf",
      "wankan": "24_Wankan.pdf",
      "gojushiho-dai": "25_Gojushiho_Dai.pdf",
      "gojushiho-sho": "26_Gojushiho_Sho.pdf",
      "gankanku-sho": "27_Gankanku_Sho.pdf",
      "sanchin": "28_Sanchin.pdf",
      "tensho": "29_Tensho.pdf",
      "anan": "30_Anan.pdf"
    };
    return kataPDFMap[kataId.toLowerCase()] || "01_Heian_Shodan.pdf";
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${kataName.replace(/\s+/g, '_')}_Instructions.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const modalClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-gray-900"
    : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75";

  const contentClasses = isFullscreen
    ? "w-full h-full flex flex-col"
    : "bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full flex flex-col";

  return (
    <div className={modalClasses} onClick={onClose}>
      <div className={contentClasses} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{kataName}</h2>
            <p className="text-sm text-gray-600">Kata Instructions & Techniques</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            
            <span 
              onClick={resetZoom}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
              title="Click to reset zoom"
            >
              {zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Download PDF"
            >
              <Download size={20} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <div 
              className="flex justify-center items-start min-h-full p-4"
              style={{ zoom: `${zoom}%` }}
            >
              <iframe
                src={pdfUrl}
                className="w-full h-[800px] border-0 bg-white shadow-lg"
                title={`${kataName} Instructions`}
                style={{ minHeight: '800px' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Use scroll wheel or zoom controls to adjust view</span>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for ESC key handling
export const usePDFViewerKeyboard = (isOpen: boolean, onClose: () => void) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
};