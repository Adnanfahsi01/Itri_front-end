import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHackathonRegistrations, updateHackathonStatus, deleteHackathonRegistration } from '../../utils/api';

function AdminHackathon() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState({});
  const [filters, setFilters] = useState({
    role: '',
    participation: '',
    search: '',
  });

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await getHackathonRegistrations();
      setRegistrations(response.data?.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (filters.role && r.fonctionnalite !== filters.role) return false;
    if (filters.participation && (r.registration_type || 'solo') !== filters.participation) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const leaderMatch =
        r.nom.toLowerCase().includes(s) ||
        r.prenom.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.cni.toLowerCase().includes(s) ||
        (r.team_name || '').toLowerCase().includes(s);

      const memberMatch = Array.isArray(r.members)
        ? r.members.some((member) =>
            (member.full_name || '').toLowerCase().includes(s) ||
            (member.email || '').toLowerCase().includes(s)
          )
        : false;

      if (!leaderMatch && !memberMatch) {
        return false;
      }
    }
    return true;
  });

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Voulez-vous vraiment changer le statut en ${status} ?`)) return;
    try {
      await updateHackathonStatus(id, status);
      loadRegistrations();
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette inscription ?")) return;
    try {
      await deleteHackathonRegistration(id);
      loadRegistrations();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    }
  };

  const toggleTeamMembers = (registrationId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [registrationId]: !prev[registrationId],
    }));
  };

  const handleExportToCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }

    const headers = ['Leader', 'Email Leader', 'Type', 'Equipe', 'Membres', 'Statut', 'Date'];
    const csvData = filteredRegistrations.map(r => [
      `${r.prenom} ${r.nom}`,
      r.email,
      (r.registration_type || 'solo') === 'team' ? 'Equipe' : 'Solo',
      r.team_name || '-',
      Array.isArray(r.members) ? r.members.length : 0,
      r.status === 'confirmed' ? 'Confirme' : r.status === 'canceled' ? 'Annule' : 'En attente',
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csvContent = "\uFEFF" + headers.join(",") + "\n" + csvData.map(row => row.map(str => `"${String(str).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = 'hackathon_registrations.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tight">
                  Hackathon Inscriptions
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Hackathon</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportToCSV}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter CSV
              </button>
              <Link
                to="/admin/dashboard"
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:text-indigo-600 hover:border-indigo-600/20 transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95"
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
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Catégorie</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="">Tous les rôles</option>
                <option value="etudiant">Étudiants</option>
                <option value="employer">Employés</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Type</label>
              <select
                value={filters.participation}
                onChange={(e) => setFilters({ ...filters, participation: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-gray-700"
              >
                <option value="">Tous</option>
                <option value="solo">Solo</option>
                <option value="team">Equipe</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Recherche Rapide</label>
              <div className="relative group">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Nom, Email ou CNI..."
                  className="w-full pl-12 pr-6 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-gray-700 placeholder:text-gray-400 shadow-inner"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Leader</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Contact</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">CNI</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Type</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Fonctionnalité</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Organisation</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Date Insc.</th>
                  <th className="text-left py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Validation</th>
                  <th className="text-right py-6 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-20">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black text-muted uppercase tracking-[0.2em]">Chargement des données...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-24">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-black text-gray-800 tracking-tight">Aucun inscrit trouvé</h3>
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reservation) => (
                    <Fragment key={reservation.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-5 px-8">
                          <div className="font-black text-gray-800 text-sm tracking-tight">{reservation.prenom} {reservation.nom}</div>
                          {reservation.team_name && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-[10px] text-indigo-600 font-bold">Equipe: {reservation.team_name}</span>
                              {Array.isArray(reservation.members) && reservation.members.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleTeamMembers(reservation.id)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  title={expandedTeams[reservation.id] ? 'Masquer les membres' : 'Afficher les membres'}
                                >
                                  <svg
                                    className={`w-3.5 h-3.5 transition-transform ${expandedTeams[reservation.id] ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                  </svg>
                                  {expandedTeams[reservation.id] ? 'Masquer' : 'Voir'}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-5 px-8">
                          <div className="text-xs font-bold text-gray-700">{reservation.email}</div>
                          <div className="text-[10px] text-muted font-bold tracking-tight">{reservation.phone}</div>
                        </td>
                        <td className="py-5 px-8">
                          <div className="text-xs font-bold text-gray-700">{reservation.cni}</div>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            (reservation.registration_type || 'solo') === 'team'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {(reservation.registration_type || 'solo') === 'team' ? 'Equipe' : 'Solo'}
                          </span>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${reservation.fonctionnalite === 'etudiant' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                            {reservation.fonctionnalite === 'etudiant' ? 'Etudiant' : 'Employe'}
                          </span>
                        </td>
                        <td className="py-5 px-8">
                          <div className="text-xs font-bold text-gray-700 uppercase">
                            {reservation.fonctionnalite === 'etudiant' ? reservation.etablissement : reservation.entreprise}
                          </div>
                        </td>
                        <td className="py-5 px-8">
                          <div className="text-xs font-bold text-gray-700">{new Date(reservation.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            reservation.status === 'canceled' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            {reservation.status === 'confirmed' ? 'Valide' : reservation.status === 'canceled' ? 'Annule' : 'En attente'}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reservation.status !== 'confirmed' && (
                              <button
                                onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95"
                                title="Valider"
                              >
                                Valider
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(reservation.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                              title="Supprimer"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>

                      {(reservation.registration_type || 'solo') === 'team' && Array.isArray(reservation.members) && reservation.members.length > 0 && expandedTeams[reservation.id] && (
                        <tr>
                          <td colSpan="9" className="px-8 pb-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-3">Membres de l'equipe</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-200">
                                      <th className="text-left py-2 text-[10px] uppercase tracking-widest text-muted">Nom</th>
                                      <th className="text-left py-2 text-[10px] uppercase tracking-widest text-muted">Email</th>
                                      <th className="text-left py-2 text-[10px] uppercase tracking-widest text-muted">Statut</th>
                                      <th className="text-left py-2 text-[10px] uppercase tracking-widest text-muted">Fonctionnalite</th>
                                      <th className="text-left py-2 text-[10px] uppercase tracking-widest text-muted">Etablissement</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {reservation.members.map((member) => (
                                      <tr key={member.id} className="border-b last:border-b-0 border-slate-100">
                                        <td className="py-2 font-semibold text-gray-800">{member.full_name}</td>
                                        <td className="py-2 text-gray-700">{member.email}</td>
                                        <td className="py-2">
                                          <span className={`inline-flex items-center whitespace-nowrap px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                            member.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                          }`}>
                                            {member.status === 'confirmed' ? 'Confirme' : 'En attente'}
                                          </span>
                                        </td>
                                        <td className="py-2 text-gray-700">{member.fonctionnalite || '-'}</td>
                                        <td className="py-2 text-gray-700">{member.etablissement || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-between items-center px-8">
            <div className="text-[10px] font-black text-muted uppercase tracking-widest">
              Total: {filteredRegistrations.length} Inscriptions Hackathon
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-indigo-600/30 rounded-full"></div>
              <div className="w-1 h-1 bg-indigo-600/30 rounded-full"></div>
              <div className="w-1 h-1 bg-indigo-600/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHackathon;
