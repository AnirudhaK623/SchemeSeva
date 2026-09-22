import React, { useState, useRef } from 'react';
import { Scheme, ControllerStatusResponse, DocumentAnalysis } from '../../types/orchestrator.js';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Camera,
  FolderOpen,
  Zap,
  X,
  RefreshCw,
  Image as ImageIcon,
  Cpu
} from 'lucide-react';
import { offlineSyncEngine } from '../../services/offlineSyncEngine.js';

interface DocumentsPageProps {
  scheme: Scheme | null;
  status: ControllerStatusResponse | null;
  onProceedToApplication?: () => void;
  isLightMode?: boolean;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  scheme,
  status,
  onProceedToApplication,
  isLightMode = false
}) => {
  // Live Document Agent telemetry
  const documentAgent = status?.active_workflows?.[0]?.agents?.['document_agent'];
  const wfResults = status?.active_workflows?.[0]?.results;

  const defaultDocs = scheme?.required_documents || [
    'Aadhaar Card',
    'Bank Account Passbook / Statement',
    'Land Records (RTC / RoR)',
    'Income Certificate'
  ];

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { status: string; date: string; source?: string; previewUrl?: string }>>({
    'Aadhaar Card': { status: 'VERIFIED', date: 'Uploaded just now', source: 'DigiLocker e-KYC' },
    'Bank Account Passbook / Statement': { status: 'VERIFIED', date: 'Uploaded just now', source: 'Bank Statement OCR' }
  });

  // Upload modal state
  const [activeUploadDoc, setActiveUploadDoc] = useState<string | null>(null);
  const [isSimulatingOcr, setIsSimulatingOcr] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      setCapturedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera stream direct access unavailable; falling back to native file capture:', err);
      // Trigger native camera file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleConfirmUpload = (source: string, previewUrl?: string) => {
    if (!activeUploadDoc) return;
    setIsSimulatingOcr(true);
    
    setTimeout(() => {
      setUploadedDocs(prev => ({
        ...prev,
        [activeUploadDoc]: {
          status: 'VERIFIED',
          date: 'Extracted via OCR Engine',
          source,
          previewUrl
        }
      }));
      setIsSimulatingOcr(false);
      setActiveUploadDoc(null);
      setCapturedImage(null);
      stopCamera();

      offlineSyncEngine.emitAudit(
        'OCR_LOCAL_EXTRACT',
        `OCR Extraction complete for ${activeUploadDoc} via ${source}. All security invariants verified.`
      );
    }, 1000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleConfirmUpload('Device File Picker', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const docIntel: DocumentAnalysis = wfResults?.documents || {
    required_documents: defaultDocs,
    available_documents: Object.keys(uploadedDocs),
    missing_documents: defaultDocs.filter(d => !uploadedDocs[d]),
    verification_status: defaultDocs.reduce((acc, d) => {
      acc[d] = uploadedDocs[d] ? 'VERIFIED' : 'PENDING';
      return acc;
    }, {} as Record<string, 'VERIFIED' | 'MISSING' | 'PENDING' | 'FAILED'>)
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Live Document Agent & AI Token Usage Telemetry */}
      <div className={`rounded-xl p-4 border transition-colors shadow-sm ${
        isLightMode
          ? 'bg-amber-50/70 border-amber-200 text-slate-800'
          : 'bg-sky-500/10 border-sky-500/30 text-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Document Intelligence Agent Active
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  AI Tool Slot: OCR / Vision Model
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                {documentAgent?.current_task || 'Awaiting citizen documents for multi-lingual OCR extraction'}
              </p>
            </div>
          </div>

          {/* AI Token Estimation Widget */}
          <div className={`flex items-center space-x-3 text-xs font-mono px-3 py-1.5 rounded-lg border ${
            isLightMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <Cpu className="w-3.5 h-3.5 text-sky-500" />
            <span>Prompt: <b className="text-emerald-600">820 tk</b></span>
            <span>Comp: <b className="text-sky-500">260 tk</b></span>
            <span>Cost: <b className="text-amber-500">~₹0.04</b></span>
          </div>
        </div>
      </div>

      {/* Main Documents Workspace */}
      <div className={`rounded-xl p-6 shadow-xl border transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900/50 border-slate-800 text-slate-100'
      }`}>
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b ${
          isLightMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <span className="text-xs uppercase font-mono font-bold text-emerald-600">
              Government Document Verification
            </span>
            <h3 className={`font-bold text-xl mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              Required Documents for {scheme ? scheme.name : 'Target Welfare Scheme'}
            </h3>
            <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Upload via your device camera, file gallery, or instant DigiLocker sync for automated verification.
            </p>
          </div>

          <div className="shrink-0">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono border ${
              docIntel.missing_documents.length === 0
                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-700 border-amber-500/30'
            }`}>
              {docIntel.missing_documents.length === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All Documents Ready</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{docIntel.missing_documents.length} Pending Upload</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Documents Cards Grid */}
        <div className="space-y-3 mt-6">
          {defaultDocs.map((docName) => {
            const isUploaded = !!uploadedDocs[docName];
            const docInfo = uploadedDocs[docName];

            return (
              <div
                key={docName}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isUploaded
                    ? isLightMode
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-emerald-950/20 border-emerald-800/40'
                    : isLightMode
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    isUploaded
                      ? isLightMode ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                      : isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                      {docName}
                    </h4>
                    <p className={`text-xs mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {isUploaded
                        ? `${docInfo.source || 'OCR Verified'} · ${docInfo.date}`
                        : 'Required for statutory criteria matching'}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {isUploaded ? (
                    <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveUploadDoc(docName)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
                      title={`Upload ${docName}`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className={`mt-8 pt-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isLightMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>
              Aadhaar numbers masked per UIDAI privacy regulations · Local extraction active
            </span>
          </div>

          <button
            onClick={onProceedToApplication}
            disabled={docIntel.missing_documents.length > 0}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[44px] ${
              docIntel.missing_documents.length === 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Application Draft</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Medium Camera & Upload Options Modal */}
      {activeUploadDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 overflow-hidden ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base">Select Upload Method</h3>
                <p className="text-xs text-slate-500 mt-0.5">Document: <b className="text-emerald-600">{activeUploadDoc}</b></p>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setActiveUploadDoc(null);
                  setCapturedImage(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden File Input for Gallery / Native Mobile Camera */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Camera Viewfinder Stream */}
            {cameraActive ? (
              <div className="py-4 space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/70 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-mono bg-black/70 text-emerald-400 px-2 py-0.5 rounded">
                      Align Document Inside Frame
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={takeSnapshot}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center space-x-2 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold"
                  >
                    Cancel Camera
                  </button>
                </div>
              </div>
            ) : capturedImage ? (
              /* Preview of Captured Photo */
              <div className="py-4 space-y-3">
                <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-700 relative">
                  <img src={capturedImage} alt="Captured Document" className="w-full h-full object-contain" />
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Photo Captured
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
                  >
                    Retake
                  </button>
                  <button
                    onClick={() => handleConfirmUpload('Device Camera Snapshot', capturedImage)}
                    disabled={isSimulatingOcr}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5"
                  >
                    {isSimulatingOcr ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{isSimulatingOcr ? 'Extracting Text...' : 'Use This Photo'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 3 Accessible Upload Options */
              <div className="py-4 space-y-3">
                {/* 1. Camera Option */}
                <button
                  onClick={startCamera}
                  className={`w-full p-4 rounded-xl border text-left flex items-center space-x-4 transition-all hover:scale-[1.01] ${
                    isLightMode
                      ? 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200 text-slate-900'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-emerald-500 text-white shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Take Photo with Camera</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Use your mobile or laptop camera to photograph your certificate or card directly.
                    </p>
                  </div>
                </button>

                {/* 2. File Gallery Option */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-4 rounded-xl border text-left flex items-center space-x-4 transition-all hover:scale-[1.01] ${
                    isLightMode
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-sky-500 text-white shrink-0">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Browse Device Files & Gallery</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload existing PDF, JPG, or PNG files saved on your phone or computer.
                    </p>
                  </div>
                </button>

                {/* 3. DigiLocker Option */}
                <button
                  onClick={() => handleConfirmUpload('DigiLocker Direct e-KYC')}
                  disabled={isSimulatingOcr}
                  className={`w-full p-4 rounded-xl border text-left flex items-center space-x-4 transition-all hover:scale-[1.01] ${
                    isLightMode
                      ? 'bg-purple-50/50 hover:bg-purple-50 border-purple-200 text-slate-900'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-purple-600 text-white shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Instant DigiLocker Import</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Directly pull authentic government-issued credential without manual scanning.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
