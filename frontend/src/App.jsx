import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Upload,
  History,
  BrainCircuit,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
  Camera,
  Video
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'history'
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  // Camera Refs & State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraIntervalRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    return () => {
      cleanupCamera();
    };
  }, []);

  // Initialize camera when active state changes
  useEffect(() => {
    if (isCameraActive) {
      initCamera();
    } else {
      cleanupCamera();
    }
  }, [isCameraActive]);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Start capturing loop
      cameraIntervalRef.current = setInterval(captureFrame, 1000);
      
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert(`Could not access webcam. Error: ${err.name} - ${err.message}. \n\nNote: Webcam access requires using 'localhost' or HTTPS.`);
      setIsCameraActive(false);
    }
  };

  const cleanupCamera = () => {
    if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = () => {
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const captureFrame = async () => {
     if (!videoRef.current || !canvasRef.current) return;
     
     const video = videoRef.current;
     const canvas = canvasRef.current;
     
     // Check for valid dimensions
     if (video.readyState !== 4 || video.videoWidth === 0) return;

     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;
     const ctx = canvas.getContext('2d');
     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
     
     canvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, "webcam-frame.jpg");
        
        try {
           const res = await axios.post(`${API_URL}/detect/?store=false`, formData);
           setResult(res.data);
           // Update imgSize for overlay alignment
           setImgSize({ width: video.videoWidth, height: video.videoHeight });
        } catch (err) {
           console.error("Frame inference error (silenced for stream)");
        }
     }, 'image/jpeg');
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history/`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setImgSize({ width: 0, height: 0 });
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/detect/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      fetchHistory(); // Refresh history
      setActiveTab('result'); // Switch to view result
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error processing image. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setImgSize({ width: 0, height: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusColor = (className) => {
    switch(className) {
      case 'with_mask': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'mask_weared_incorrect': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-rose-400 bg-rose-400/10 border-rose-400/20'; // without_mask
    }
  };
  
  const getBoxStyle = (className) => {
    switch(className) {
      case 'with_mask': return 'border-emerald-500 bg-emerald-500/20';
      case 'mask_weared_incorrect': return 'border-amber-500 bg-amber-500/20';
      default: return 'border-rose-500 bg-rose-500/20';
    }
  };

  const getStatusIcon = (className) => {
    switch(className) {
      case 'with_mask': return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      case 'mask_weared_incorrect': return <AlertTriangle className="w-4 h-4 mr-1.5" />;
      default: return <XCircle className="w-4 h-4 mr-1.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200">

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                FaceGuard AI
              </span>
            </div>

            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'scan' || activeTab === 'result'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                Detector
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* SCAN / UPLOAD SECTION */}
        {(activeTab === 'scan' || activeTab === 'result') && (
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Upload Area */}
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-1 h-full">
                 <div className="flex flex-col h-full bg-black/40 rounded-xl relative overflow-hidden">
                    
                    {/* Toggle Mode Buttons */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex bg-slate-900/80 backdrop-blur rounded-full p-1 border border-slate-700 z-30">
                       <button
                         onClick={() => {
                           if (isCameraActive) stopCamera();
                           setMode('upload');
                           setResult(null);
                           setPreview(null);
                           setFile(null);
                         }}
                         className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'upload' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                       >
                         Upload
                       </button>
                       <button
                         onClick={() => {
                           setMode('camera');
                           setResult(null);
                           setPreview(null);
                         }}
                         className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${mode === 'camera' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                       >
                         Camera
                       </button>
                    </div>

                    {mode === 'upload' ? (
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center min-h-[450px] text-center h-full
                            ${dragActive
                              ? 'border-cyan-500 bg-cyan-500/5'
                              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
                            }
                            ${preview ? 'border-none p-0 overflow-hidden bg-black' : ''}
                          `}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                        >

                          {preview ? (
                            <>
                              <div className="relative inline-block max-w-full">
                                <img
                                  src={preview}
                                  alt="Preview"
                                  className="max-h-[500px] max-w-full w-auto h-auto block object-contain"
                                  onLoad={(e) => {
                                     setImgSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
                                  }}
                                />
                                
                                {/* Bounding Boxes */}
                                {result && result.detections_data && imgSize.width > 0 && result.detections_data.map((det, idx) => {
                                   const [x1, y1, x2, y2] = det.box;
                                   const style = {
                                     left: `${(x1 / imgSize.width) * 100}%`,
                                     top: `${(y1 / imgSize.height) * 100}%`,
                                     width: `${((x2 - x1) / imgSize.width) * 100}%`,
                                     height: `${((y2 - y1) / imgSize.height) * 100}%`,
                                   };
                                   const colorClass = getBoxStyle(det.class);
                                   
                                   return (
                                     <div 
                                        key={idx} 
                                        className={`absolute border-2 ${colorClass} transition-all duration-500 animate-in fade-in zoom-in`} 
                                        style={style}
                                     >
                                       <div className={`absolute -top-7 left-0 px-2 py-0.5 text-xs font-bold text-white rounded bg-slate-900/80 backdrop-blur whitespace-nowrap border border-slate-700`}>
                                         {det.class.replace(/_/g, " ")} ({Math.round(det.confidence * 100)}%)
                                       </div>
                                     </div>
                                   );
                                })}
                              </div>

                              {/* Scanning Animation Overlay */}
                              {loading && (
                                <div className="absolute inset-0 bg-cyan-500/10 z-10 overflow-hidden">
                                   <div className="w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-scan"></div>
                                </div>
                              )}

                              {/* Action Bar */}
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                                {!loading && !result && (
                                  <button
                                    onClick={handleUpload}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-full shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all"
                                  >
                                    <BrainCircuit className="w-5 h-5" />
                                    Analyze Image
                                  </button>
                                )}
                                <button
                                  onClick={clearSelection}
                                  className="p-2.5 bg-slate-900/80 hover:bg-rose-500/80 backdrop-blur text-white rounded-full transition-all border border-slate-700 hover:border-rose-500/50"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-700">
                                <Upload className="w-10 h-10 text-cyan-500" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">Upload Image</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">
                                  Drag and drop your image here, or click to browse
                                </p>
                              </div>
                              <button
                                onClick={() => fileInputRef.current.click()}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-all text-sm font-medium"
                              >
                                Browse Files
                              </button>
                            </div>
                          )}

                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                          />
                        </div>
                    ) : (
                        // CAMERA MODE
                        <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[450px] bg-black">
                            {!isCameraActive ? (
                                <div className="text-center space-y-4">
                                     <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-700">
                                        <Camera className="w-10 h-10 text-cyan-500" />
                                     </div>
                                     <h3 className="text-xl font-semibold text-white">Webcam Detector</h3>
                                     <button
                                        onClick={startCamera}
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all"
                                     >
                                        Start Camera
                                     </button>
                                </div>
                            ) : (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain max-h-[500px]"
                                        onLoadedMetadata={() => {
                                            if (videoRef.current) {
                                                setImgSize({
                                                    width: videoRef.current.videoWidth,
                                                    height: videoRef.current.videoHeight
                                                });
                                            }
                                        }}
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                    
                                    {/* Camera Overlay */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {/* Center Render Area that matches video aspect ratio approx */}
                                             <div className="relative w-full h-full max-h-[500px] mx-auto">
                                                {result && result.detections_data && result.detections_data.map((det, idx) => {
                                                    
                                                    const [x1, y1, x2, y2] = det.box;
                                                    // We need to use imgSize (video dimensions)
                                                    if (imgSize.width === 0) return null;

                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`absolute border-2 ${getBoxStyle(det.class)} transition-all duration-100`} 
                                                            style={{
                                                                left: `${(x1 / imgSize.width) * 100}%`,
                                                                top: `${(y1 / imgSize.height) * 100}%`,
                                                                width: `${((x2 - x1) / imgSize.width) * 100}%`,
                                                                height: `${((y2 - y1) / imgSize.height) * 100}%`,
                                                            }}
                                                        >
                                                             <div className={`absolute -top-7 left-0 px-2 py-0.5 text-xs font-bold text-white rounded bg-slate-900/80 backdrop-blur whitespace-nowrap border border-slate-700`}>
                                                                {det.class.replace(/_/g, " ")}
                                                             </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    
                                    <div className="absolute bottom-4 z-40">
                                         <button
                                            onClick={stopCamera}
                                            className="px-4 py-2 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full flex items-center gap-2 backdrop-blur border border-rose-400/50 shadow-lg"
                                         >
                                            <Video className="w-4 h-4" /> Stop Camera
                                         </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                 </div>
              </div>
            </div>

            {/* Results / Instructions Area */}
            <div className="space-y-6">
              {loading ? (
                 <div className="h-full flex flex-col items-center justify-center glass-panel rounded-2xl p-12 text-center space-y-4 opacity-80">
                   <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                   <div className="space-y-1">
                     <h3 className="text-lg font-medium text-white">Processing Image...</h3>
                     <p className="text-slate-400">Running YOLOv8 inference model</p>
                   </div>
                 </div>
              ) : result ? (
                <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in p-1">
                  <div className="bg-slate-900/50 p-6 border-b border-slate-800 pb-4">
                     <div className="flex items-center justify-between">
                       <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                         <CheckCircle2 className="text-cyan-400" /> Analysis Complete
                       </h2>
                       <span className="text-xs font-mono text-slate-500">ID: #{result.id}</span>
                     </div>
                  </div>

                  <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                    {(result.detections_data || []).length === 0 ? (
                       <div className="text-center py-10 text-slate-500">
                         No faces detected in this image.
                       </div>
                    ) : (
                      (result.detections_data || []).map((det, idx) => {
                        const style = getStatusColor(det.class);
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:translate-x-1 ${style}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                                {getStatusIcon(det.class)}
                              </span>
                              <div>
                                <p className="font-semibold capitalize tracking-wide">
                                  {det.class.replace(/_/g, " ")}
                                </p>
                                <p className="text-xs opacity-70 font-mono mt-0.5">
                                  Box: [{det.box.map(n => Math.round(n)).join(', ')}]
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                               <div className="text-xs uppercase tracking-wider opacity-60 font-bold mb-1">Confidence</div>
                               <div className="text-xl font-bold font-mono">{(det.confidence * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center glass-panel rounded-2xl p-12 text-center space-y-6">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center rotate-3 border border-slate-700">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="max-w-xs space-y-2">
                    <h3 className="text-xl font-medium text-white">Ready to Analyze</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Our advanced AI model can detect if a person is wearing a mask, not wearing one, or wearing it incorrectly.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                    {['With Mask', 'No Mask', 'Incorrect'].map((label, i) => (
                      <div key={i} className="px-2 py-2 bg-slate-800 rounded border border-slate-700 text-xs text-slate-400 font-mono">
                         {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY SECTION */}
        {activeTab === 'history' && (
          <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <History className="text-cyan-400" /> Recent Scans
                </h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                     <th className="p-4 border-b border-slate-800">ID</th>
                     <th className="p-4 border-b border-slate-800">Date & Time</th>
                     <th className="p-4 border-b border-slate-800">Results Summary</th>
                     <th className="p-4 border-b border-slate-800">File Name</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800">
                   {history.map((item) => (
                     <tr key={item.id} className="group hover:bg-slate-800/30 transition-colors">
                       <td className="p-4 font-mono text-cyan-400/80">#{item.id}</td>
                       <td className="p-4 text-slate-300">
                         {new Date(item.created_at).toLocaleDateString()}
                         <span className="ml-2 text-slate-500 text-xs">
                            {new Date(item.created_at).toLocaleTimeString()}
                         </span>
                       </td>
                       <td className="p-4">
                         <div className="flex gap-2 flex-wrap">
                           {(item.detections_data || []).slice(0, 3).map((d, i) => (
                             <span key={i} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(d.class)}`}>
                               {getStatusIcon(d.class)}
                               {d.class.replace(/_/g, " ")}
                             </span>
                           ))}
                           {(item.detections_data || []).length > 3 && (
                              <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700">
                                +{(item.detections_data || []).length - 3} more
                              </span>
                           )}
                           {(item.detections_data || []).length === 0 && (
                             <span className="text-slate-500 text-sm italic">No detections</span>
                           )}
                         </div>
                       </td>
                       <td className="p-4 text-slate-500 text-sm flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 opacity-50" />
                          {item.filename || 'Unknown'}
                       </td>
                     </tr>
                   ))}
                   {history.length === 0 && (
                     <tr>
                       <td colSpan="4" className="p-12 text-center text-slate-500">
                         No scan history available yet.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
