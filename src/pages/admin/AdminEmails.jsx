import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
// We'll assume a basic Chart.js setup for now. If it's not installed, we'll just display stats.
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ChartJS.register(ArcElement, Tooltip, Legend);

function AdminEmails() {
  const [emails, setEmails] = useState({ data: [], current_page: 1, last_page: 1 });
  const [stats, setStats] = useState({ total: 0, delivered: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      // Construct query params
      const params = new URLSearchParams();
      params.append('page', page);
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      // Using our configured api instance
      const response = await api.get(`/admin/emails?${params.toString()}`);
      setEmails(response.data.emails);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError('Impossible de charger les emails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      fetchEmails();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRetry = async (id) => {
    if (!window.confirm('Voulez-vous vraiment réessayer d\'envoyer cet email ?')) return;

    try {
      await api.post(`/admin/emails/${id}/retry`);
      // Refresh list
      fetchEmails();
      alert('Email renvoyé avec succès.');
    } catch (err) {
      console.error('Failed to retry email:', err);
      alert(err.response?.data?.message || 'Erreur lors du renvoi de l\'email.');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'En attente',
    delivered: 'Livré',
    failed: 'Échoué',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <EnvelopeIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent tracking-tight">
                  Monitoring des Emails
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Communications</p>
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Emails</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full">
            <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Livrés</p>
            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Échoués</p>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full">
            <XCircleIcon className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">En attente / Retentés</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full">
            <ArrowPathIcon className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Rechercher par email ou objet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${statusFilter === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${statusFilter === 'delivered' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            Livrés
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${statusFilter === 'failed' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
          >
            Échoués
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinataire</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objet</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Chargement des emails...
                  </td>
                </tr>
              ) : emails.data?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 flex flex-col items-center">
                    <EnvelopeIcon className="h-10 w-10 text-gray-300 mb-2" />
                    Aucun email trouvé.
                  </td>
                </tr>
              ) : (
                emails.data?.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(email.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{email.email_to}</div>
                      {email.reservation && (
                        <div className="text-xs text-gray-500">
                          Réservation: #{email.reservation.ticket_code}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-1">{email.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[email.status]}`}>
                        {statusLabels[email.status]}
                      </span>
                      {email.status === 'failed' && (
                        <div className="mt-1 text-xs text-red-500 max-w-xs truncate" title={email.error_message}>
                          {email.error_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {email.status === 'failed' && (
                        <button
                          onClick={() => handleRetry(email.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1"
                        >
                          <ArrowPathIcon className="h-4 w-4" /> Relancer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && emails.last_page > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(p => Math.min(emails.last_page, p + 1))}
                disabled={page === emails.last_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{emails.current_page}</span> sur <span className="font-medium">{emails.last_page}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    <span>Précédent</span>
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(emails.last_page, p + 1))}
                    disabled={page === emails.last_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                  >
                    <span>Suivant</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default AdminEmails;
