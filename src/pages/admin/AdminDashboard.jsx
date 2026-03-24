import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStatistics, getReservations, getSpeakers, getPrograms } from '../../utils/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, reservationsRes, speakersRes, programsRes] = await Promise.all([
        getStatistics(),
        getReservations(),
        getSpeakers(),
        getPrograms(),
      ]);

      setStats(statsRes.data);
      const reservationPayload = reservationsRes.data;
      const reservationItems = Array.isArray(reservationPayload)
        ? reservationPayload
        : Array.isArray(reservationPayload?.data)
          ? reservationPayload.data
          : [];
      setReservations(reservationItems);

      const speakersPayload = speakersRes.data;
      const speakerItems = Array.isArray(speakersPayload)
        ? speakersPayload
        : Array.isArray(speakersPayload?.data)
          ? speakersPayload.data
          : [];
      setSpeakers(speakerItems);

      const programData = programsRes.data;
      const allPrograms = Array.isArray(programData)
        ? programData
        : [
            ...(Array.isArray(programData?.day1) ? programData.day1 : []),
            ...(Array.isArray(programData?.day2) ? programData.day2 : []),
            ...(Array.isArray(programData?.day3) ? programData.day3 : []),
          ];
      setPrograms(allPrograms);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 admin-reduced-motion">
        <div className="text-2xl text-primary font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  const COLORS = ['#006AD7', '#0EA5E9', '#21277B', '#5F83B1'];

  const roleData = [
    { name: 'Étudiants', value: stats?.role_distribution?.students || 0 },
    { name: 'Employés', value: stats?.role_distribution?.employees || 0 },
  ];

  const dayData = [
    { name: 'Jour 1', reservations: stats?.reservations_per_day?.day1 || 0 },
    { name: 'Jour 2', reservations: stats?.reservations_per_day?.day2 || 0 },
    { name: 'Jour 3 (Hackathon)', reservations: stats?.reservations_per_day?.day3 || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                  Tableau de bord
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • ITRI 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-gray-800">Admin</span>
                <span className="text-[10px] font-medium text-muted">Contrôle Total</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: 'Total Réservations',
              value: stats?.total_reservations || 0,
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
              color: 'from-blue-500 to-indigo-600',
              shadow: 'shadow-blue-500/20'
            },
            {
              label: 'Taux (Jour 1)',
              value: `${stats?.seat_occupancy?.day1?.percentage || 0}%`,
              icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
              color: 'from-cyan-400 to-blue-500',
              shadow: 'shadow-cyan-500/20'
            },
            {
              label: 'Intervenants',
              value: speakers.length,
              icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
              color: 'from-violet-500 to-purple-600',
              shadow: 'shadow-purple-500/20'
            },
            {
              label: 'Sessions',
              value: programs.length,
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              color: 'from-emerald-400 to-teal-500',
              shadow: 'shadow-emerald-500/20'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-3">
                <div className="w-2 h-7 bg-primary rounded-full"></div>
                Réservations par Jour
              </h3>
              <div className="text-[10px] font-bold text-muted bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Hebdomadaire</div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dayData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006AD7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#21277B" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC', radius: 12 }}
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#21277B' }}
                />
                <Bar dataKey="reservations" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-3">
                <div className="w-2 h-7 bg-accent rounded-full"></div>
                Répartition des Rôles
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    padding: '12px 16px',
                    background: 'white'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-gray-600 px-2 uppercase tracking-wide">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Management Quick Access */}
        <div className="mb-10">
          <h2 className="text-xs font-black text-muted uppercase tracking-[0.3em] mb-6 pl-2">Accès Rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              { to: '/admin/reservations', label: 'Réservations', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />, color: 'text-blue-600' },
              { to: '/admin/speakers', label: 'Intervenants', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />, color: 'text-indigo-600' },
              { to: '/admin/programs', label: 'Programme', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, color: 'text-violet-600' },
              { to: '/admin/qr-scanner', label: 'Scanner QR', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h2m14 0h2M4 6h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />, color: 'text-emerald-600' },
              { to: '/admin/scan-stats', label: 'Stats Scans', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, color: 'text-cyan-600' },
              { to: '/admin/hackathons', label: 'Hackathon', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />, color: 'text-indigo-600' },
            ].map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-colors flex flex-col items-center gap-4"
              >
                <div className={`p-4 bg-gray-50 rounded-xl ${link.color} group-hover:bg-primary group-hover:text-white transition-colors`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {link.icon}
                  </svg>
                </div>
                <span className="font-black text-xs text-gray-800 uppercase tracking-widest group-hover:text-primary transition-colors">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Reservations Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">Réservations Récentes</h3>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">Mises à jour en direct</p>
            </div>
            <Link
              to="/admin/reservations"
              className="px-5 py-2 bg-white text-primary text-xs font-black uppercase tracking-widest rounded-xl shadow-sm border border-gray-100 hover:bg-primary hover:text-white transition-colors"
            >
              Voir Tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-50">
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Participant</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Contact</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Rôle</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Jour(s)</th>
                  <th className="text-left py-5 px-8 text-[10px] font-black uppercase text-muted tracking-widest">Siège(s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(Array.isArray(reservations) ? reservations : []).slice(0, 5).map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-50 to-blue-50 text-primary font-black text-[10px] rounded-full flex items-center justify-center border border-indigo-100 shadow-inner">
                          {(reservation.first_name?.[0] || '?')}{(reservation.last_name?.[0] || '?')}
                        </div>
                        <div className="font-bold text-gray-800 text-sm tracking-tight group-hover:text-primary transition-colors">
                          {reservation.first_name} {reservation.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="text-xs font-bold text-gray-600">{reservation.email}</div>
                    </td>
                    <td className="py-5 px-8">
                      <span
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${reservation.role === 'student'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}
                      >
                        {reservation.role === 'student' ? 'Étudiant' : 'Employé'}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex gap-1">
                        {reservation.days?.map(d => (
                          <span key={d} className="w-5 h-5 bg-secondary text-white text-[8px] flex items-center justify-center rounded-sm font-black shadow-sm">
                            {d === 'day1' ? 'J1' : d === 'day2' ? 'J2' : 'J3(H)'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 px-8 capitalize">
                      <div className="flex flex-wrap gap-1">
                        {reservation.seat_numbers?.map(s => (
                          <span key={s.seat} className="px-2 py-0.5 bg-indigo-50 text-primary text-[10px] font-black rounded border border-indigo-100">
                            {s.seat}
                          </span>
                        )) || <span className="text-muted italic text-[10px]">N/A</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
