import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/env';

/**
 * AdminScanStats Component
 * Displays scanning statistics and analytics for the admin
 */
function AdminScanStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchScanStats();
  }, [navigate]);

  const fetchScanStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/scan-statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching scan stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center admin-reduced-motion">
        <div className="text-center animate-in fade-in duration-700">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-secondary/20 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-secondary rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-800 font-black uppercase tracking-[0.2em] text-xs">Calcul des Métriques...</p>
          <p className="text-muted text-[10px] font-bold mt-2">Intelligence Analytique ITRI</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
        <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-black text-red-600 uppercase tracking-tighter">Analyse Interrompue</h1>
              <Link
                to="/admin/dashboard"
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:text-primary transition-all shadow-sm active:scale-95"
              >
                Retour
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-6 py-12">
          <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2rem] text-center max-w-2xl mx-auto shadow-2xl shadow-red-100/50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Erreur Datastream</h2>
            <p className="text-red-700 font-bold mb-8 uppercase tracking-widest text-[10px]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
            >
              Réessayer la Connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recentScansPerDay = (Array.isArray(stats?.scans_per_day) ? stats.scans_per_day : []).slice(-4);
  const maxRecentDayCount = recentScansPerDay.reduce((max, day) => Math.max(max, day?.count || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent tracking-tighter">
                  Analytique Event
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Console de Monitoring Live</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                to="/admin/qr-scanner"
                className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-xl shadow-emerald-200/50 active:scale-95 group"
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                </svg>
                Scanner Live
              </Link>
              <Link
                to="/admin/dashboard"
                className="bg-white text-gray-700 border border-gray-100 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-primary transition-all shadow-sm active:scale-95"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Card 1 */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Pool d'Inscrits</p>
              <div className="text-4xl font-black text-gray-800 tracking-tighter mb-4">{stats.summary.total_reservations}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">Capacité Audience 100%</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Validation Uniques</p>
              <div className="text-4xl font-black text-emerald-600 tracking-tighter mb-4">{stats.summary.total_scanned}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.summary.scan_rate}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-emerald-600">{stats.summary.scan_rate}%</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">Flux d'Entrées Total</p>
              <div className="text-4xl font-black text-secondary tracking-tighter mb-4">{stats.summary.total_scans}</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contrôles Portique ITRI</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-accent mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">KPI Engagement</p>
              <div className="text-4xl font-black text-accent tracking-tighter mb-4">{(stats.summary.total_scans / (stats.summary.total_scanned || 1)).toFixed(1)}x</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Moyenne passages / pers</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Timeline Analysis Chart */}
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/30">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-10 flex items-center gap-4">
              <div className="w-2.5 h-8 bg-secondary rounded-full"></div>
              Distribution Chronologique
            </h2>
            <div className="flex flex-col gap-10 items-end">
              {recentScansPerDay.map((day, index) => (
                <div key={index} className="w-full group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary group-hover:scale-150 transition-transform"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formatDate(day.date)}</span>
                    </div>
                    <span className="text-sm font-black text-gray-800">{day.count} Scans</span>
                  </div>
                  <div className="w-full bg-gray-50 h-6 rounded-xl border border-gray-100 p-1 group-hover:bg-white transition-colors overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary via-primary to-accent rounded-lg shadow-[0_0_15px_0_rgba(33,39,123,0.15)] relative overflow-hidden transition-all duration-1000 ease-out delay-[100ms]"
                      style={{
                        width: `${Math.max(((day.count || 0) / Math.max(maxRecentDayCount, 1)) * 100, 3)}%`
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Circular Chart */}
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/30 flex flex-col items-center justify-between text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-4 w-full text-left flex items-center gap-4">
              <div className="w-2.5 h-8 bg-emerald-500 rounded-full"></div>
              Ratio de Conversion
            </h2>

            <div className="relative w-64 h-64 mb-8 group-hover:scale-105 transition-transform duration-700">
              <div className="absolute inset-0 bg-secondary/5 rounded-full animate-pulse"></div>
              <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18" cy="18" r="15.9155"
                  fill="none"
                  stroke="url(#svgGradient)"
                  strokeWidth="3.5"
                  strokeDasharray={`${stats.summary.scan_rate}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1500 ease-in-out"
                />
                <defs>
                  <linearGradient id="svgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#006AD7" />
                    <stop offset="100%" stopColor="#21277B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-gray-800 tracking-tighter leading-none">{stats.summary.scan_rate}%</span>
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-4">Taux de Remplissage</span>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 w-full group-hover:bg-white transition-colors duration-500">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted mb-4">
                <span>Delta Présence</span>
                <span className="text-emerald-600">Performance Optimale</span>
              </div>
              <p className="text-gray-700 font-bold text-sm leading-relaxed">
                <span className="text-secondary font-black">{stats.summary.total_scanned}</span> validations uniques identifiées contre <span className="text-gray-400">{stats.summary.total_reservations - stats.summary.total_scanned}</span> absences sur la base de données.
              </p>
            </div>
          </div>
        </div>

        {/* Scanned Reservations Table */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/30 overflow-hidden group">
          <div className="p-10 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">Trace Analytique des Flux</h2>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Signalétique Live en temps réel</p>
            </div>
            <div className="px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-primary font-black text-[9px] uppercase tracking-widest animate-pulse">
              Databridge Actif
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left p-8 text-[10px] font-black uppercase text-muted tracking-widest border-b border-gray-100">UID Signature</th>
                  <th className="text-left p-8 text-[10px] font-black uppercase text-muted tracking-widest border-b border-gray-100">Profil Participant</th>
                  <th className="text-left p-8 text-[10px] font-black uppercase text-muted tracking-widest border-b border-gray-100 text-center">Télémétrie d'usage</th>
                  <th className="text-left p-8 text-[10px] font-black uppercase text-muted tracking-widest border-b border-gray-100 text-right">Horodatage</th>
                  <th className="text-left p-8 text-[10px] font-black uppercase text-muted tracking-widest border-b border-gray-100 text-center">Accréditations</th>
                  <th className="text-left p-8 text-[10px] font-black uppercase text-muted tracking-widest border-b border-gray-100 text-right">Vecteur État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {stats.scanned_reservations.length > 0 ? (
                  stats.scanned_reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-blue-50/40 transition-all duration-300 group/row">
                      <td className="p-8">
                        <span className="font-mono text-[10px] font-black text-secondary bg-blue-100/30 px-3 py-1.5 rounded-lg border border-blue-100 shadow-inner block w-fit group-hover/row:scale-105 transition-transform">
                          {reservation.ticket_code}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl flex items-center justify-center text-primary font-black text-xs shadow-sm">
                            {reservation.full_name[0]}
                          </div>
                          <div>
                            <div className="font-black text-gray-800 text-sm tracking-tight">{reservation.full_name}</div>
                            <div className="text-[10px] text-muted font-bold tracking-tight opacity-70">{reservation.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-[9px] font-black text-secondary uppercase tracking-tighter">{reservation.scan_count} / {reservation.days.length} passes</div>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                            <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" style={{ width: `${(reservation.scan_count / (reservation.days.length)) * 100}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-right font-bold text-gray-500 text-xs tabular-nums">
                        {formatDateTime(reservation.scanned_at)}
                      </td>
                      <td className="p-8">
                        <div className="flex justify-center gap-2">
                          {reservation.days.map((day) => (
                            <span key={day} className="w-6 h-6 bg-white text-muted text-[8px] flex items-center justify-center rounded-lg font-black shadow-sm border border-gray-100 group-hover/row:border-secondary group-hover/row:text-secondary transition-all">
                              {day.replace('day', 'J')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md inline-block ${reservation.is_used
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                          {reservation.is_used ? 'OFFLINE' : 'OPERATIONAL'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-24 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-gray-900 font-black uppercase text-[10px] tracking-[0.3em]">Signature Datastream Absente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminScanStats;