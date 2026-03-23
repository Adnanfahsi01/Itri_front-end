import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { API_BASE_URL } from '../../utils/env';

/**
 * AdminHackathonScanner Component
 * Allows admin to scan QR codes exclusively for Hackathon tickets
 */
function AdminHackathonScanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scannerBuffer, setScannerBuffer] = useState('');
  const lastKeyTime = useRef(Date.now());
  const scanTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    return () => {
      // Clear timeout on unmount
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [navigate]);

  // Hardware Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;
      lastKeyTime.current = currentTime;

      // Physical scanners input characters very fast (< 50ms per keypress)
      // If time interval > 100ms, it is probably human typing; reset the buffer.
      if (timeDiff > 100) {
        if (e.key.length === 1) {
          setScannerBuffer(e.key);
        } else {
          setScannerBuffer('');
        }
      } else {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (scannerBuffer.length > 5) {
            handleHardwareScan(scannerBuffer);
          }
          setScannerBuffer('');
        } else if (e.key.length === 1) {
          setScannerBuffer(prev => prev + e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scannerBuffer, isProcessing]);

  const extractTicketCode = (rawText) => {
    if (!rawText) return "";
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === 'object' && parsed.ticket_code) return parsed.ticket_code;
    } catch { }

    // Fuzzy regex extraction for AZERTY/Caps Lock corrupted hardware scans 
    // Example: "TICKET?CODE">"2UEBAMF2"
    // Find "TICKET", then any non-alphanumeric chars, then "CODE", then any non-alphanumeric, then 8 alphanumeric chars.
    let match = rawText.match(/TICKET[^a-zA-Z0-9]*CODE[^a-zA-Z0-9]*([A-Z0-9]{8})/i);
    if (match) return match[1];

    // Fallback: finding the first 8-character alphanumeric string (like 2UEBAMF2)
    const matches = rawText.match(/([A-Z0-9]{8})/g);
    if (matches && matches.length > 0) {
        return matches[0];
    }
    
    return rawText.trim();
  };

  const handleHardwareScan = (scannedText) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScanning(false);
    setScanResult(scannedText);

    const ticketCode = extractTicketCode(scannedText);
    validateQRCode(JSON.stringify({ ticket_code: ticketCode }));

    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => setIsProcessing(false), 3000);
  };

  const getDecodedValue = (scanPayload) => {
    if (!scanPayload) return '';
    if (typeof scanPayload === 'string') return scanPayload;
    if (Array.isArray(scanPayload) && scanPayload[0]?.rawValue) return scanPayload[0].rawValue;
    if (scanPayload.rawValue) return scanPayload.rawValue;
    return '';
  };

  const onScanSuccess = (decodedText) => {
    if (!decodedText) {
      return;
    }

    // Prevent multiple scans - check if we're already processing or if this is the same code
    if (isProcessing || decodedText === lastScannedCode) {
      return;
    }

    // Immediately stop scanning and set processing state
    setIsProcessing(true);
    setLastScannedCode(decodedText);

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Stop scanner immediately by unmounting component
    setScanning(false);

    setScanResult(decodedText);

    const ticketCode = extractTicketCode(decodedText);
    validateQRCode(JSON.stringify({ ticket_code: ticketCode }));

    // Reset processing after 3 seconds to allow for new scans
    scanTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      setLastScannedCode(null);
    }, 3000);
  };

  const onScanError = (scanError) => {
    if (scanError?.name === 'NotAllowedError' || scanError?.name === 'NotFoundError') {
      setError('Camera access error. Please allow camera permission.');
    }
  };

  const validateQRCode = async (qrData) => {
    // Prevent multiple simultaneous validations
    if (loading) {
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      const isHackathon = qrData.includes('HCK-') || qrData.includes('HACK-');
      
      if (!isHackathon && !qrData.includes('ticket_code')) {
           // Skip basic heuristic check errors. Wait for backend to parse.
      } else if (!isHackathon) {
          setValidationResult({
               valid: false,
               message: "Ceci n'est pas un badge Hackathon",
          });
          setLoading(false);
          return;
      }

      const endpoint = `${API_BASE_URL}/admin/hackathons/validate-qr`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_data: qrData, mark_as_used: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error('Error validating QR code:', error);
      setValidationResult({
        valid: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsUsed = async (ticketCode) => {
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const qrData = JSON.stringify({ ticket_code: ticketCode });
      const isHackathon = ticketCode.startsWith('HCK-') || ticketCode.startsWith('HACK-');
      
      if (!isHackathon) {
          setValidationResult({
               valid: false,
               message: "Ceci n'est pas un badge Hackathon.",
          });
          setLoading(false);
          return;
      }

      const endpoint = `${API_BASE_URL}/admin/hackathons/validate-qr`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_data: qrData, mark_as_used: true }), // Actually mark as used
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setValidationResult({
        valid: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidation = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      const cleanCode = extractTicketCode(manualCode.trim().toUpperCase());
      
      // First, find the reservation by ticket code to get the email
      fetch(`${API_BASE_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
        .then(response => response.json())
        .then(reservations => {
          const reservation = reservations.find(r => r.ticket_code === cleanCode);
          if (reservation) {
            // Create QR data with both ticket_code and email (like real QR codes)
            const qrData = JSON.stringify({
              ticket_code: cleanCode,
              email: reservation.email
            });
            setScanResult(qrData);
            validateQRCode(qrData);
          } else {
            // If ticket not found, still validate with just ticket code
            const qrData = JSON.stringify({ ticket_code: cleanCode });
            setScanResult(qrData);
            validateQRCode(qrData);
          }
        })
        .catch(() => {
          // If API call fails, validate with just ticket code
          const qrData = JSON.stringify({ ticket_code: cleanCode });
          setScanResult(qrData);
          validateQRCode(qrData);
        });
        
        setManualCode(''); // Clear input after scan
    }
  };

  const handleRestartScan = async () => {
    // Clear timeout if exists
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    setScanResult(null);
    setValidationResult(null);
    setError(null);
    setIsProcessing(false);
    setLastScannedCode(null);

    setScanning(true);
  };

  const handleCameraChange = (cameraId) => {
    setSelectedCamera(cameraId);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20 rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1l7 7m2 2l-2 2m-2 2l-7 7m-1-7l-7 7m-2-2l2-2m2-2l7-7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent tracking-tight">
                  Scanner Hackathon
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Hackathon Seulement</p>
              </div>
            </div>
            <Link
              to="/admin/dashboard"
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:text-primary hover:border-primary/20 transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* QR Scanner Section */}
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-8 flex items-center gap-4 relative z-10">
              <div className="w-2.5 h-8 bg-secondary rounded-full"></div>
              Numérisation du Badge
            </h2>
            <p className="text-xs font-bold text-gray-500 mb-6 italic">Supporte la Webcam et les Douchettes/Scanners USB (scan automatique)</p>

            {/* Camera Selection */}
            <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-500 relative z-10">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 mb-2 block">
                Camera Mode
              </label>
              <div className="relative group">
                <select
                  value={selectedCamera}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="w-full pl-6 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all outline-none appearance-none text-gray-700 shadow-inner group-hover:bg-white"
                >
                  <option value="environment">Back Camera</option>
                  <option value="user">Front Camera</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-5 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] text-xs font-black uppercase tracking-widest animate-shake relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {error}
                </div>
              </div>
            )}

            {/* QR Viewer Area */}
            <div className="relative group/scanner z-10">
              {!scanResult ? (
                <div className="rounded-[2.5rem] overflow-hidden border-8 border-gray-50 bg-gray-900 relative min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center shadow-2xl">
                  {scanning && (
                    <div className="absolute inset-0 z-10">
                      <Scanner
                        onScan={(result) => onScanSuccess(getDecodedValue(result))}
                        onError={onScanError}
                        constraints={{ facingMode: selectedCamera }}
                        scanDelay={700}
                        styles={{
                          container: { width: '100%', height: '100%' },
                          video: { width: '100%', height: '100%', objectFit: 'cover' },
                        }}
                      />
                    </div>
                  )}

                  {scanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Scanning Lasers */}
                      <div className="absolute inset-0 border-[30px] border-black/20 z-0"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[78vw] h-[78vw] max-w-[320px] max-h-[320px] sm:w-[22rem] sm:h-[22rem] border-2 border-primary/40 rounded-[2rem] relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary/5"></div>
                          {/* Scanning Line Animation */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_2px_rgba(59,130,246,0.8)] animate-[scan_2.5s_ease-in-out_infinite]"></div>

                          {/* Corner Accents */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                        <div className="px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_0_rgba(220,38,38,0.8)]"></span>
                          Live Scanning
                        </div>
                      </div>
                    </div>
                  )}

                  {!scanning && !error && (
                    <div className="text-center p-12 bg-gray-900 w-full h-full flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-gray-800 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl rotate-12 group-hover/scanner:rotate-0 transition-transform duration-500">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <button
                        onClick={handleRestartScan}
                        className="group relative px-10 py-5 bg-gradient-to-r from-secondary to-primary rounded-2xl overflow-hidden active:scale-95 transition-all shadow-2xl"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10 text-white font-black uppercase tracking-[0.2em] text-xs">Initialiser Capteur</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border-8 border-emerald-50 bg-emerald-500/10 aspect-square md:aspect-video flex flex-col items-center justify-center text-center p-12 animate-in zoom-in-95 duration-500 shadow-inner">
                  <div className="w-28 h-28 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 mb-8 animate-bounce relative">
                    <div className="absolute inset-0 rounded-[2rem] bg-emerald-500 animate-ping opacity-20"></div>
                    <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-emerald-700 tracking-tighter mb-2">TARGET LOCKED</h3>
                  <p className="text-emerald-600 font-bold mb-10 text-xs uppercase tracking-widest leading-relaxed">Cryptographie et Validité en cours d'analyse...</p>
                  <button
                    onClick={handleRestartScan}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    Réinitialiser Système
                  </button>
                </div>
              )}
            </div>

            {/* Manual Entry */}
            <div className="pt-10 mt-10 border-t border-gray-100 relative z-10">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1 mb-4 block">Saisie Alternative Signalétique</label>
              <form onSubmit={handleManualValidation} className="flex gap-4">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="ex: ABC-123-X"
                    className="w-full px-8 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] font-black tracking-widest text-gray-800 placeholder:font-bold placeholder:text-gray-300 placeholder:tracking-normal focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none shadow-inner group-hover:bg-white"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted font-black text-[9px] uppercase opacity-40 group-focus-within:opacity-100 transition-opacity">Ticket-ID Vector</div>
                </div>
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-8 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-[0.95] flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 h-full min-h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-8 flex items-center gap-4 relative z-10">
              <div className="w-2.5 h-8 bg-purple-500 rounded-full"></div>
              Console de Validation
            </h2>

            <div className="flex-1 flex flex-col relative z-10">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-pulse text-center">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-secondary/20 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-24 h-24 border-t-4 border-secondary rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-2">Interrogation DB...</h3>
                    <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Recherche de signature dans le Cloud ITRI</p>
                  </div>
                </div>
              ) : !validationResult ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 group">
                  <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-10 border border-gray-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm mb-4">Système en Veille</h3>
                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest max-w-[200px] leading-loose">Approchez un code de la cellule photoélectrique pour initier le processus</p>
                </div>
              ) : (
                <div className={`p-8 rounded-[2rem] flex flex-col flex-1 ${validationResult.valid
                  ? 'bg-emerald-50/50 border border-emerald-100'
                  : 'bg-red-50/50 border border-red-100'
                  } animate-in fade-in zoom-in-95 duration-500`}>

                  {/* Status Banner */}
                  <div className="flex items-center gap-8 mb-10">
                    <div className={`w-24 h-24 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative ${validationResult.valid ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'
                      }`}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[1.5rem]"></div>
                      <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {validationResult.valid
                          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                        }
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-4xl font-black uppercase tracking-tighter leading-none mb-2 ${validationResult.valid ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                        {validationResult.valid ? 'VALIDE' : 'REFUSÉ'}
                      </h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${validationResult.valid
                          ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                          : 'bg-red-100 text-red-600 border-red-200'
                        }`}>
                        {validationResult.message}
                      </div>
                    </div>
                  </div>

                  {/* Reservation Details Card */}
                  {validationResult.reservation && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-xl flex flex-col gap-8 flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl flex items-center justify-center text-primary font-black text-xl shadow-inner">
                            {validationResult.reservation.first_name[0]}{validationResult.reservation.last_name[0]}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Identité Confirmée</p>
                            <h4 className="text-2xl font-black text-gray-800 tracking-tight leading-none mb-1">
                              {validationResult.reservation.first_name} {validationResult.reservation.last_name}
                            </h4>
                            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{validationResult.reservation.institution_name || 'HORS CORPS'}</p>
                          </div>
                        </div>
                        <div className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                          {validationResult.reservation.role === 'student' ? 'Student Elite' : 'Professional Staff'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5">Communications</p>
                          <p className="text-xs font-bold text-gray-700 break-all">{validationResult.reservation.email}</p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{validationResult.reservation.phone}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1.5">Accréditations</p>
                          <div className="flex gap-1.5">
                            {validationResult.reservation.days?.map(d => (
                              <span key={d} className="w-6 h-6 bg-secondary text-white text-[9px] flex items-center justify-center rounded-md font-black shadow-lg shadow-secondary/10 border border-white/20">
                                {d.replace('day', 'J')}
                              </span>
                            ))}
                          </div>
                          <p className="text-[9px] font-black text-primary uppercase mt-2 group-hover:underline cursor-none">Ticket: {validationResult.reservation.ticket_code}</p>
                        </div>
                      </div>

                      {/* Usage Telemetry */}
                      {validationResult.max_scans && (
                        <div className="mt-auto space-y-4">
                          <div className={`p-6 rounded-2xl relative overflow-hidden group/alert ${validationResult.scan_count >= validationResult.max_scans
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-[0_0_20px_0_rgba(16,185,129,0.05)]'
                            }`}>

                            <div className="flex justify-between items-center relative z-10 mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl animate-pulse">{validationResult.scan_count >= validationResult.max_scans ? '🔒' : '📶'}</span>
                                <h5 className="text-[10px] font-black uppercase tracking-widest">Télémétrie d'accès</h5>
                              </div>
                              <span className="text-lg font-black">{validationResult.scan_count} / {validationResult.max_scans}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2.5 bg-black/5 rounded-full overflow-hidden relative z-10">
                              <div
                                className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_0_rgba(0,0,0,0.1)] ${validationResult.scan_count >= validationResult.max_scans ? 'bg-red-500' : 'bg-emerald-500'
                                  }`}
                                style={{ width: `${(validationResult.scan_count / validationResult.max_scans) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Action Center */}
                          {validationResult.valid && !validationResult.is_used && (
                            <button
                              onClick={() => markTicketAsUsed(validationResult.reservation.ticket_code)}
                              className="w-full relative group/btn h-20 bg-gray-900 rounded-[1.5rem] overflow-hidden shadow-2xl transition-all active:scale-[0.98] hover:shadow-primary/20"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-accent translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700 opacity-90"></div>
                              <div className="relative z-10 flex items-center justify-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-white font-black uppercase tracking-[0.3em] text-xs">Autoriser Entrée</span>
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Operations Center */}
        <div className="mt-12 bg-white/60 backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

          <h2 className="text-sm font-black text-gray-800 mb-10 flex items-center gap-3 relative z-10 tracking-[0.2em] uppercase">
            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Commandes & Protocoles Opérationnels
          </h2>

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            <div className="space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-50 flex items-center justify-center text-secondary font-black text-xl shadow-lg ring-4 ring-gray-50 group-hover:ring-secondary/10 transition-all">01</div>
              <div>
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-2 group-hover:text-secondary transition-colors">Phase d'Acquisition</h4>
                <p className="text-muted text-[11px] font-bold leading-loose uppercase tracking-tighter opacity-70">
                  Maintenez le badge à une distance de 15-20cm. Le système auto-focalise la signature cryptographique.
                </p>
              </div>
            </div>

            <div className="space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-50 flex items-center justify-center text-secondary font-black text-xl shadow-lg ring-4 ring-gray-50 group-hover:ring-secondary/10 transition-all">02</div>
              <div>
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-2 group-hover:text-secondary transition-colors">Analyse Détaillée</h4>
                <p className="text-muted text-[11px] font-bold leading-loose uppercase tracking-tighter opacity-70">
                  Vérifiez la concordance visuelle entre le badge physique et les données affichées par la console ITRI Tech.
                </p>
              </div>
            </div>

            <div className="space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-50 flex items-center justify-center text-secondary font-black text-xl shadow-lg ring-4 ring-gray-50 group-hover:ring-secondary/10 transition-all">03</div>
              <div>
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-2 group-hover:text-secondary transition-colors">Validation Finale</h4>
                <p className="text-muted text-[11px] font-bold leading-loose uppercase tracking-tighter opacity-70">
                  L'activation du bouton "AUTORISER" enregistre définitivement le passage et décrémente le solde d'entrées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}} />
    </div>
  );
}

export default AdminHackathonScanner;
