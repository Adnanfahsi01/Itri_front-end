import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getReservations, deleteReservation } from '../../utils/api';

function AdminReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    day: '',
    role: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadReservations = async () => {
    try {
      const response = await getReservations(filters);
      setReservations(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      await deleteReservation(id);
      loadReservations();
    } catch (error) {
      alert('Failed to delete reservation');
    }
  };

  const getStatusBadge = (status, isUsed) => {
    if (status === 'canceled') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-tight">Annulé</span>;
    }
    if (status === 'waiting_list') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-tight">Liste d'attente</span>;
    }
    if (status === 'pending') {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-tight">En attente</span>;
    }
    if (status === 'confirmed') {
      if (isUsed) {
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-tight">Présent</span>;
      }
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-tight">Confirmé</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 uppercase tracking-tight">{status}</span>;
  };

  const handleExportToSheets = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Institution', 'Days', 'Seats', 'Ticket Code', 'Status'],
      ...reservations.map((r) => [
        `${r.first_name} ${r.last_name}`,
        r.email,
        r.phone,
        r.role === 'student' ? 'Étudiant' : 'Employé',
        r.institution_name || 'N/A',
        r.days?.map(d => d === 'day1' ? 'Jour 1' : d === 'day2' ? 'Jour 2' : 'Jour 3 (Hackathon)').join(' + ') || 'N/A',
        r.seat_numbers?.map(s => s.seat).join(', ') || 'N/A',
        r.ticket_code || 'N/A',
        r.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent tracking-tight">
                  Gestion des Réservations
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Participants & Sièges</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportToSheets}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter CSV
              </button>
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
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Filters Panel */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Filtrer par Jour</label>
              <select
                value={filters.day}
                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="">Tous les jours</option>
                <option value="day1">Jour 1</option>
                <option value="day2">Jour 2</option>
                <option value="day3">Jour 3 (Hackathon)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Catégorie</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="">Tous les rôles</option>
                <option value="student">Étudiants</option>
                <option value="employee">Employés</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Statut Réservation</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="">Tous les statuts</option>
                <option value="confirmed">Confirmé</option>
                <option value="pending">En attente</option>
                <option value="waiting_list">Liste d'attente</option>
                <option value="canceled">Annulé</option>
              </select>
            </div>

            <div className="md:col-span-1 lg:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Recherche Rapide</label>
              <div className="relative group">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Nom, Email ou Institution..."
                  className="w-full pl-12 pr-6 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none text-gray-700 placeholder:text-gray-400 shadow-inner"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Participant</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Contact</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Type</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Accès Jour</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Sièges</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Statut</th>
                  <th className="text-center py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-20">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-muted uppercase tracking-[0.2em]">Synchronisation des données...</p>
                      </div>
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-24">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-black text-gray-800 tracking-tight">Aucun participant trouvé</h3>
                      <p className="text-xs font-bold text-muted uppercase tracking-widest">Ajustez vos filtres pour voir plus de résultats</p>
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl flex items-center justify-center text-primary font-black text-xs shadow-inner">
                            {reservation.first_name[0]}{reservation.last_name[0]}
                          </div>
                          <div>
                            <div className="font-black text-gray-800 text-sm tracking-tight">{reservation.first_name} {reservation.last_name}</div>
                            <div className="text-[10px] text-muted font-black uppercase tracking-widest">{reservation.institution_name || 'PARTICULIER'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="text-xs font-bold text-gray-700">{reservation.email}</div>
                        <div className="text-[10px] text-muted font-bold tracking-tight">{reservation.phone}</div>
                      </td>
                      <td className="py-5 px-8">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${reservation.role === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                          {reservation.role === 'student' ? 'Étudiant' : 'Employé'}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex gap-1.5">
                          {reservation.days?.map(d => (
                            <div key={d} className="w-7 h-7 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm" title={d}>
                              {d.replace('day', 'J')}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-wrap gap-1.5 max-w-[120px]">
                          {reservation.seat_numbers?.map(s => (
                            <span key={s.seat} className="text-[9px] font-black text-secondary bg-secondary/5 px-2 py-1 rounded-lg border border-secondary/10 shadow-sm">
                              {s.seat}
                            </span>
                          ))}
                          {(!reservation.seat_numbers || reservation.seat_numbers.length === 0) && (
                            <span className="text-[9px] font-black text-gray-300 italic uppercase">NON ASSIGNÉ</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        {getStatusBadge(reservation.status, reservation.is_used)}
                      </td>
                      <td className="py-5 px-8 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDelete(reservation.id)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-100"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-between items-center px-8">
            <div className="text-[10px] font-black text-muted uppercase tracking-widest">
              Total: {reservations.length} Participants
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
              <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
              <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReservations;
