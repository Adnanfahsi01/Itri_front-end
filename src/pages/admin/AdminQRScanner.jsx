import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { API_BASE_URL } from '../../utils/env';

/**
 * AdminQRScanner Component
 * Allows admin to scan QR codes from tickets and validate them
 */
function AdminQRScanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [lastScanSource, setLastScanSource] = useState(null);
  const [machineQuickResult, setMachineQuickResult] = useState(null);
  const [machinePulse, setMachinePulse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scannerBuffer, setScannerBuffer] = useState('');
  const manualInputRef = useRef(null);
  const hardwareBufferRef = useRef('');
  const hardwareFlushTimeoutRef = useRef(null);
  const manualFlushTimeoutRef = useRef(null);
  const machinePulseTimeoutRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  const normalizeScanPayload = (value) => {
    return String(value ?? '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizeTicketCode = (value, { uppercase = true } = {}) => {
    const normalized = normalizeScanPayload(value).replace(/\s+/g, '');
    return uppercase ? normalized.toUpperCase() : normalized;
  };

  const flushHardwareBuffer = (force = false) => {
    const rawValue = normalizeScanPayload(hardwareBufferRef.current);
    hardwareBufferRef.current = '';
    setScannerBuffer('');

    if (!rawValue) {
      return;
    }

    if (!force && rawValue.length < 6) {
      return;
    }

    handleHardwareScan(rawValue);
  };

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (manualInputRef.current) {
      manualInputRef.current.focus();
    }

    return () => {
      // Clear timeout on unmount
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (hardwareFlushTimeoutRef.current) {
        clearTimeout(hardwareFlushTimeoutRef.current);
      }
      if (manualFlushTimeoutRef.current) {
        clearTimeout(manualFlushTimeoutRef.current);
      }
      if (machinePulseTimeoutRef.current) {
        clearTimeout(machinePulseTimeoutRef.current);
      }
    };
  }, [navigate]);

  // Hardware Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isProcessing || loading) {
        return;
      }

      const target = e.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (isEditableTarget) {
        return;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        if (hardwareBufferRef.current.length >= 6) {
          e.preventDefault();
          flushHardwareBuffer(true);
        }
        return;
      }

      if (e.key === 'Escape') {
        hardwareBufferRef.current = '';
        setScannerBuffer('');
        return;
      }

      if (e.key.length === 1) {
        hardwareBufferRef.current += e.key;
        setScannerBuffer(hardwareBufferRef.current.slice(-64));

        if (hardwareFlushTimeoutRef.current) {
          clearTimeout(hardwareFlushTimeoutRef.current);
        }

        // Auto-submit scanners that do not append Enter.
        hardwareFlushTimeoutRef.current = setTimeout(() => {
          flushHardwareBuffer(false);
        }, 70);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (hardwareFlushTimeoutRef.current) {
        clearTimeout(hardwareFlushTimeoutRef.current);
      }
    };
  }, [isProcessing, loading]);

  const extractTicketCode = (rawText) => {
    const cleanedPayload = normalizeScanPayload(rawText);
    if (!cleanedPayload) return '';

    try {
      const parsed = JSON.parse(cleanedPayload);
      if (parsed && typeof parsed === 'object' && parsed.ticket_code) {
        return parsed.ticket_code;
      }
    } catch { }

    // Fuzzy regex extraction for AZERTY/Caps Lock corrupted hardware scans 
    // Example: "TICKET?CODE">"2UEBAMF2"
    // Find "TICKET", then any non-alphanumeric chars, then "CODE", then any non-alphanumeric, then 8 alphanumeric chars.
    let match = cleanedPayload.match(/TICKET[^a-zA-Z0-9]*CODE[^a-zA-Z0-9]*([A-Z0-9]{8})/i);
    if (match) return match[1];

    // Fallback: finding the first 8-character alphanumeric string (like 2UEBAMF2)
    const matches = cleanedPayload.match(/([A-Z0-9]{8})/g);
    if (matches && matches.length > 0) {
        return matches[0];
    }

    return cleanedPayload;
  };

  const getValidationStatusKey = (result) => {
    const message = String(result?.message || '').toLowerCase();

    if (message.includes('error: http') || message.includes('server') || message.includes('network')) {
      return 'server_error';
    }

    if (result?.is_used || message.includes('already') || message.includes('deja') || message.includes('déjà')) {
      return 'already_used';
    }

    if (message.includes('not found') || message.includes('introuvable') || message.includes('non trouve')) {
      return 'not_found';
    }

    if (result?.valid) {
      return 'valid';
    }

    if (message.includes('invalid') || message.includes('invalide')) {
      return 'invalid';
    }

    return 'invalid';
  };

  const getStatusDisplay = (statusKey) => {
    const map = {
      valid: { label: 'VALID', tone: 'text-emerald-300', badge: 'bg-emerald-400/15 border-emerald-400/30 text-emerald-200' },
      already_used: { label: 'ALREADY USED', tone: 'text-amber-300', badge: 'bg-amber-400/15 border-amber-400/30 text-amber-200' },
      invalid: { label: 'INVALID', tone: 'text-red-300', badge: 'bg-red-400/15 border-red-400/30 text-red-200' },
      not_found: { label: 'NOT FOUND', tone: 'text-orange-300', badge: 'bg-orange-400/15 border-orange-400/30 text-orange-200' },
      server_error: { label: 'SERVER ERROR', tone: 'text-violet-300', badge: 'bg-violet-400/15 border-violet-400/30 text-violet-200' },
    };
    return map[statusKey] || map.invalid;
  };

  const triggerMachineFeedback = () => {
    setMachinePulse(true);
    if (machinePulseTimeoutRef.current) {
      clearTimeout(machinePulseTimeoutRef.current);
    }
    machinePulseTimeoutRef.current = setTimeout(() => {
      setMachinePulse(false);
    }, 380);
  };

  const processMachineScan = (scannedText) => {
    const rawScannedValue = String(scannedText ?? '');
    const cleanedScannedValue = normalizeScanPayload(rawScannedValue);
    if (!cleanedScannedValue || isProcessing || loading) return;

    const extractedTicketCode = extractTicketCode(cleanedScannedValue);
    const normalizedTicketCode = normalizeTicketCode(extractedTicketCode);
    if (!normalizedTicketCode) return;

    // TEMP DEBUG: remove once scanner payload format is verified in production.
    console.log('[Scanner Debug] raw scanned value:', JSON.stringify(rawScannedValue));
    console.log('[Scanner Debug] cleaned scanned value:', cleanedScannedValue);
    console.log('[Scanner Debug] final ticket code sent to API:', normalizedTicketCode);

    setLastScanSource('machine');
    setIsProcessing(true);
    setManualCode('');
    triggerMachineFeedback();

    validateQRCode(normalizedTicketCode, {
      source: 'machine',
      ticketCode: normalizedTicketCode,
      scannedPayload: cleanedScannedValue,
    });

    if (manualInputRef.current) {
      manualInputRef.current.focus();
    }
  };

  const queueManualScan = (nextValue) => {
    if (manualFlushTimeoutRef.current) {
      clearTimeout(manualFlushTimeoutRef.current);
    }

    const value = normalizeScanPayload(nextValue);
    if (value.length < 6) {
      return;
    }

    manualFlushTimeoutRef.current = setTimeout(() => {
      processMachineScan(value);
    }, 90);
  };

  const handleHardwareScan = (scannedText) => {
    processMachineScan(scannedText);
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

    const ticketCode = normalizeTicketCode(extractTicketCode(decodedText));
    setLastScanSource('camera');
    validateQRCode(ticketCode, {
      source: 'camera',
      ticketCode,
      scannedPayload: decodedText,
    });

    // Reset processing after 3 seconds to allow for new scans
    scanTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      setLastScannedCode(null);
    }, 3000);
  };

  const onScanError = (scanError) => {
    // Keep noisy transient detection errors out of UI; only report real camera failures.
    if (scanError?.name === 'NotAllowedError' || scanError?.name === 'NotFoundError') {
      setError('Camera access error. Please allow camera permission.');
    }
  };

  const validateQRCode = async (ticketCodeInput, options = {}) => {
    const { source = 'camera', ticketCode = null, scannedPayload = '' } = options;
    const normalizedTicketCode = normalizeTicketCode(ticketCodeInput);

    if (!normalizedTicketCode) {
      return;
    }

    // Prevent multiple simultaneous validations
    if (loading) {
      return;
    }

    setLoading(true);
    if (source === 'camera') {
      setValidationResult(null);
    }

    try {
      const token = localStorage.getItem('adminToken');
      const qrData = JSON.stringify({ ticket_code: normalizedTicketCode });
      const isHackathon = normalizedTicketCode.startsWith('HCK-') || normalizedTicketCode.startsWith('HACK-');
      const endpoint = isHackathon 
        ? `${API_BASE_URL}/admin/hackathons/validate-qr`
        : `${API_BASE_URL}/reservations/validate-qr`;

      // TEMP DEBUG: remove after scanner/manual parity verification.
      console.log('[Scanner Debug] validation payload:', {
        source,
        qr_data: qrData,
        mark_as_used: false,
      });

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
      if (source === 'camera') {
        setValidationResult(data);
      } else {
        const statusKey = getValidationStatusKey(data);
        setMachineQuickResult({
          ticketCode: ticketCode || normalizedTicketCode || '',
          scannedPayload,
          scannedAt: new Date().toISOString(),
          statusKey,
          data,
        });
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      const fallbackResult = {
        valid: false,
        message: `Error: ${error.message}`,
      };

      if (source === 'camera') {
        setValidationResult(fallbackResult);
      } else {
        setMachineQuickResult({
          ticketCode: ticketCode || normalizedTicketCode || '',
          scannedPayload,
          scannedAt: new Date().toISOString(),
          statusKey: 'server_error',
          data: fallbackResult,
        });
      }
    } finally {
      setLoading(false);
      if (source === 'machine') {
        setIsProcessing(false);
        setManualCode('');
        if (manualInputRef.current) {
          manualInputRef.current.focus();
        }
      }
    }
  };

  const markTicketAsUsed = async (ticketCode, source = 'camera') => {
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const qrData = JSON.stringify({ ticket_code: ticketCode });
      const isHackathon = ticketCode.startsWith('HCK-') || ticketCode.startsWith('HACK-');
      const endpoint = isHackathon 
        ? `${API_BASE_URL}/admin/hackathons/validate-qr`
        : `${API_BASE_URL}/reservations/validate-qr`;

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
      if (source === 'camera') {
        setValidationResult(data);
      } else {
        const statusKey = getValidationStatusKey(data);
        setMachineQuickResult((prev) => ({
          ticketCode,
          scannedPayload: prev?.scannedPayload || ticketCode,
          scannedAt: new Date().toISOString(),
          statusKey,
          data,
        }));
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      const fallbackResult = {
        valid: false,
        message: `Error: ${error.message}`,
      };

      if (source === 'camera') {
        setValidationResult(fallbackResult);
      } else {
        setMachineQuickResult((prev) => ({
          ticketCode,
          scannedPayload: prev?.scannedPayload || ticketCode,
          scannedAt: new Date().toISOString(),
          statusKey: 'server_error',
          data: fallbackResult,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualValidation = (e) => {
    e.preventDefault();
    const value = normalizeScanPayload(manualCode);
    if (value) {
      processMachineScan(value);
    }
  };

  const handleManualInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const value = normalizeScanPayload(manualCode);
      if (value) {
        processMachineScan(value);
      }
    }
  };

  const handleRestartScan = async () => {
    // Clear timeout if exists
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    setScanResult(null);
    setValidationResult(null);
    setLastScanSource(null);
    setError(null);
    setIsProcessing(false);
    setLastScannedCode(null);
    setMachineQuickResult(null);
    setMachinePulse(false);
    hardwareBufferRef.current = '';
    setScannerBuffer('');
    setScanning(true);

    if (manualInputRef.current) {
      manualInputRef.current.focus();
    }
  };

  const handleCameraChange = (cameraId) => {
    setSelectedCamera(cameraId);
    setError(null);
  };

  const machineStatusDisplay = getStatusDisplay(machineQuickResult?.statusKey || 'invalid');

  return (
    <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1l7 7m2 2l-2 2m-2 2l-7 7m-1-7l-7 7m-2-2l2-2m2-2l7-7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent tracking-tight">
                  Scanner de Billets
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Contrôle d'Accès</p>
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
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">

          {/* QR Scanner Section */}
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden group w-full">
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
                <div className="rounded-[2.5rem] overflow-hidden border-8 border-gray-50 bg-gray-900 relative aspect-square w-full max-w-[560px] mx-auto flex items-center justify-center shadow-2xl">
                  <div id="qr-reader" className="w-full h-full object-cover"></div>
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
                        <div className="w-[78vw] h-[78vw] max-w-[300px] max-h-[300px] sm:w-[20rem] sm:h-[20rem] border-2 border-primary/40 rounded-[2rem] relative overflow-hidden">
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
                <div className="rounded-[2.5rem] border-8 border-emerald-50 bg-emerald-500/10 aspect-square w-full max-w-[560px] mx-auto flex flex-col items-center justify-center text-center p-12 animate-in zoom-in-95 duration-500 shadow-inner">
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
                    ref={manualInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => {
                      const nextValue = normalizeScanPayload(e.target.value).toUpperCase();
                      setManualCode(nextValue);
                      queueManualScan(nextValue);
                    }}
                    onKeyDown={handleManualInputKeyDown}
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

          <aside className="bg-[#09111f]/95 border border-cyan-900/40 rounded-[2.25rem] shadow-2xl shadow-cyan-950/30 overflow-hidden relative lg:sticky lg:top-28">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
            <div className="p-6 border-b border-cyan-800/40">
              <p className="text-[10px] font-black tracking-[0.24em] uppercase text-cyan-200/70">Machine Scanner Feed</p>
              <h3 className="text-lg font-black text-cyan-50 tracking-tight mt-1">Quick Result Panel</h3>
              <p className="text-[11px] text-slate-300 mt-1">Instant validation for USB/physical barcode scanner input.</p>
            </div>

            <div className={`p-6 transition-all duration-300 ${machinePulse ? 'bg-cyan-500/8' : ''}`}>
              {!machineQuickResult ? (
                <div className="rounded-2xl border border-cyan-900/40 bg-[#070d1a] p-5 text-slate-300">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Awaiting Scan</p>
                  <p className="text-sm leading-relaxed">Use the focused scanner input. Each scan is auto-validated and displayed here without popup interruption.</p>
                  {scannerBuffer && (
                    <p className="mt-4 text-[11px] font-bold text-cyan-300/80 uppercase tracking-[0.16em] break-all">Buffer: {scannerBuffer}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-cyan-800/50 bg-[#060b16] p-5 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ticket Code</p>
                      <p className="text-xl font-black text-cyan-100 tracking-[0.08em] break-all">{machineQuickResult.ticketCode || 'N/A'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-full border ${machineStatusDisplay.badge}`}>
                      {machineStatusDisplay.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-1">Validation Result</p>
                      <p className={`text-sm font-bold ${machineStatusDisplay.tone}`}>{machineQuickResult.data?.message || 'No message'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2.5">
                        <p className="uppercase tracking-[0.14em] text-slate-500 mb-1">Status</p>
                        <p className={`font-black ${machineStatusDisplay.tone}`}>{machineStatusDisplay.label}</p>
                      </div>
                      <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2.5">
                        <p className="uppercase tracking-[0.14em] text-slate-500 mb-1">Scan Time</p>
                        <p className="font-black text-cyan-100">{new Date(machineQuickResult.scannedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {machineQuickResult.data?.reservation && (
                      <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70 mb-2">Attendee</p>
                        <p className="text-sm font-black text-cyan-50">
                          {machineQuickResult.data.reservation.first_name} {machineQuickResult.data.reservation.last_name}
                        </p>
                        <p className="text-xs text-cyan-100/75 break-all mt-1">{machineQuickResult.data.reservation.email}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    {machineQuickResult.data?.valid && !machineQuickResult.data?.is_used && machineQuickResult.data?.reservation && (
                      <button
                        onClick={() => markTicketAsUsed(machineQuickResult.data.reservation.ticket_code, 'machine')}
                        className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.14em] hover:bg-emerald-500 transition-colors"
                      >
                        Authorize Entry
                      </button>
                    )}
                    <button
                      onClick={() => setMachineQuickResult(null)}
                      className="h-11 px-4 rounded-xl bg-slate-800 text-slate-100 text-[11px] font-black uppercase tracking-[0.14em] border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>

        {/* Mobile-first Validation Popup */}
        {validationResult && !loading && lastScanSource === 'camera' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-end sm:items-center justify-center">
            <div className={`w-full max-w-xl rounded-[1.75rem] border p-6 sm:p-8 shadow-2xl ${validationResult.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">Scan Result</p>
                  <h3 className={`text-3xl font-black tracking-tight ${validationResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                    {validationResult.valid ? 'VALID' : 'REFUSED'}
                  </h3>
                </div>
                <button
                  onClick={handleRestartScan}
                  className="h-10 px-4 rounded-xl bg-white/80 border border-white text-gray-700 font-black text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              <p className={`text-sm font-bold mb-4 ${validationResult.valid ? 'text-emerald-700' : 'text-red-700'}`}>
                {validationResult.message}
              </p>

              {validationResult.reservation && (
                <div className="rounded-2xl bg-white/80 border border-white p-4 mb-5 space-y-2">
                  <p className="text-base font-black text-gray-800">
                    {validationResult.reservation.first_name} {validationResult.reservation.last_name}
                  </p>
                  <p className="text-xs text-gray-600 break-all">{validationResult.reservation.email}</p>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Ticket: {validationResult.reservation.ticket_code}</p>
                </div>
              )}

              <div className="flex gap-3">
                {validationResult.valid && !validationResult.is_used && validationResult.reservation && (
                  <button
                    onClick={() => markTicketAsUsed(validationResult.reservation.ticket_code)}
                    className="flex-1 h-12 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.14em]"
                  >
                    Authorize Entry
                  </button>
                )}
                <button
                  onClick={handleRestartScan}
                  className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-black text-xs uppercase tracking-[0.14em]"
                >
                  Scan Next
                </button>
              </div>
            </div>
          </div>
        )}

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

export default AdminQRScanner;
