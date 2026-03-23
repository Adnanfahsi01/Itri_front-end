import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPrograms, getSpeakers, createProgram, updateProgram, deleteProgram } from '../../utils/api';

function AdminPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    day: 'day1',
    start_time: '',
    end_time: '',
    speaker_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [programsRes, speakersRes] = await Promise.all([getPrograms(), getSpeakers()]);
      // Programs come grouped by day from the public endpoint format
      const allPrograms = [
        ...(programsRes.data.day1 || []).map(p => ({ ...p, day: 'day1' })),
        ...(programsRes.data.day2 || []).map(p => ({ ...p, day: 'day2' })),
        ...(programsRes.data.day3 || []).map(p => ({ ...p, day: 'day3' })),
      ];
      setPrograms(allPrograms);
      setSpeakers(speakersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        speaker_id: formData.speaker_id || null,
      };

      console.log('Sending payload:', payload);

      if (editMode) {
        await updateProgram(formData.id, payload);
      } else {
        await createProgram(payload);
      }

      setShowForm(false);
      setFormData({ id: null, title: '', day: 'day1', start_time: '', end_time: '', speaker_id: '' });
      setEditMode(false);
      loadData();
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (program) => {
    let start = '';
    let end = '';
    if (program.time && program.time.includes('-')) {
      const parts = program.time.split('-');
      start = parts[0].trim();
      end = parts[1].trim();
    } else {
      // Fallback if program.time is not in "HH:MM - HH:MM" format, use start_time and end_time directly
      start = program.start_time ? program.start_time.substring(0, 5) : '';
      end = program.end_time ? program.end_time.substring(0, 5) : '';
    }

    setFormData({
      id: program.id,
      title: program.title,
      day: program.day,
      start_time: start,
      end_time: end,
      speaker_id: program.speaker_id || '',
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      await deleteProgram(id);
      loadData();
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  const groupedPrograms = {
    'day1': programs.filter((p) => p.day === 'day1'),
    'day2': programs.filter((p) => p.day === 'day2'),
    'day3': programs.filter((p) => p.day === 'day3'),
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent tracking-tight">
                  Gestion du Programme
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Sessions & Horaires</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditMode(false);
                  setFormData({ id: null, title: '', day: 'day1', start_time: '', end_time: '', speaker_id: '' });
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-sm hover:shadow-md ${showForm
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'
                  }`}
              >
                {showForm ? 'Masquer le Formulaire' : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter Session
                  </>
                )}
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
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form Section */}
          <div className={`lg:col-span-1 transition-all duration-500 transform ${showForm ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none absolute'}`}>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-32">
              <h2 className="text-xl font-black text-gray-800 tracking-tight mb-8 flex items-center gap-3">
                <div className="w-2 h-7 bg-primary rounded-full"></div>
                {editMode ? 'Modifier Session' : 'Nouvelle Session'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Titre de la Session</label>
                  <input
                    type="text"
                    placeholder="Ex: Conférence sur l'IA"
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700 placeholder:text-gray-400"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Jour</label>
                  <select
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1.25rem_center] bg-no-repeat"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  >
                    <option value="day1">Jour 1</option>
                    <option value="day2">Jour 2</option>
                    <option value="day3">Jour 3 (Hackathon)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Heure de début</label>
                    <input
                      type="time"
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Heure de fin</label>
                    <input
                      type="time"
                      className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Intervenant</label>
                  <select
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1.25rem_center] bg-no-repeat"
                    value={formData.speaker_id}
                    onChange={(e) => setFormData({ ...formData, speaker_id: e.target.value })}
                  >
                    <option value="">Aucun intervenant</option>
                    {speakers.map(speaker => (
                      <option key={speaker.id} value={speaker.id}>{speaker.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all active:scale-95"
                  >
                    {editMode ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8 transition-all duration-500`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 border-dashed">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black text-muted uppercase tracking-widest">Chargement du programme...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedPrograms).map(([day, dayPrograms]) => (
                  <div key={day} className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                      <h2 className="text-xl font-black text-gray-800 tracking-tight whitespace-nowrap">
                        {day === 'day1' ? 'Jour 1' : day === 'day2' ? 'Jour 2' : 'Jour 3 (Hackathon)'}
                      </h2>
                      <div className="h-px w-full bg-gradient-to-r from-gray-200 to-transparent"></div>
                    </div>

                    <div className="grid gap-4">
                      {dayPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary to-accent opacity-[0.02] rounded-bl-full" />

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-5">
                              <div className="flex flex-col items-center justify-center min-w-[80px] py-3 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl shadow-inner">
                                <span className="text-[10px] font-black text-primary uppercase mb-1">Horaire</span>
                                <span className="text-xs font-black text-gray-800 leading-none">{program.time}</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-gray-800 tracking-tight group-hover:text-primary transition-colors">{program.title}</h3>
                                {program.speaker && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center overflow-hidden border border-accent/20">
                                      <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">
                                      {program.speaker.name} <span className="opacity-50 font-medium ml-1">/ {program.speaker.job_title}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                              <button
                                onClick={() => handleEdit(program)}
                                className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2.25 2.25 0 113.182 3.182L12 17H9v-3L17.586 4.414z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(program.id)}
                                className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all shadow-sm active:scale-90"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {dayPrograms.length === 0 && (
                        <div className="text-center py-10 bg-white/30 rounded-[2rem] border border-gray-100 border-dashed">
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Aucune session pour ce jour</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPrograms;
