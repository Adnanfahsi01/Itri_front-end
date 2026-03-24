import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from '../../utils/api';
import { buildStorageUrl } from '../../utils/env';

function AdminSpeakers() {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    job_title: '',
    bio: '',
    photo: null,
  });

  useEffect(() => {
    loadSpeakers();
  }, []);

  const loadSpeakers = async () => {
    try {
      const response = await getSpeakers();
      const payload = response.data;
      const speakerItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setSpeakers(speakerItems);
    } catch (error) {
      console.error('Error loading speakers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        await updateSpeaker(formData.id, formData);
      } else {
        await createSpeaker(formData);
      }

      setShowForm(false);
      setFormData({ id: null, name: '', job_title: '', bio: '', photo: null });
      setEditMode(false);
      loadSpeakers();
    } catch (error) {
      console.error('Error saving speaker:', error);
      alert('Failed to save speaker');
    }
  };

  const handleEdit = (speaker) => {
    setFormData({
      id: speaker.id,
      name: speaker.name,
      job_title: speaker.job_title,
      bio: speaker.bio,
      photo: null,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this speaker?')) return;

    try {
      await deleteSpeaker(id);
      loadSpeakers();
    } catch (error) {
      console.error('Error deleting speaker:', error);
      alert('Failed to delete speaker');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] admin-reduced-motion">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent tracking-tight">
                  Gestion des Intervenants
                </h1>
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] -mt-1">Administration • Profils & Experts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditMode(false);
                  setFormData({ id: null, name: '', job_title: '', bio: '', photo: null });
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
                    Ajouter Intervenant
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
        {/* Form Section */}
        {showForm && (
          <div className="bg-white/90 backdrop-blur-sm p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 mb-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-top-6 duration-500">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-8 flex items-center gap-4">
              <div className="w-2.5 h-8 bg-primary rounded-full"></div>
              {editMode ? 'Modifier les Informations' : 'Nouvel Intervenant'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dr. Ahmed Alami"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700 placeholder:text-gray-400"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Titre / Profession</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Expert en Intelligence Artificielle"
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700 placeholder:text-gray-400"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Biographie</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Décrivez brièvement le parcours et l'expertise de l'intervenant..."
                  className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all outline-none font-bold text-gray-700 placeholder:text-gray-400 resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Photo de Profil</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
                    className="block w-full text-xs text-gray-500
                      file:mr-6 file:py-3 file:px-8
                      file:rounded-2xl file:border-0
                      file:text-[10px] file:font-black file:uppercase file:tracking-widest
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90 transition-all cursor-pointer bg-gray-50/50 border border-gray-100 rounded-2xl p-2"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 transform hover:-translate-y-1 transition-all active:scale-95"
                >
                  {editMode ? 'Mettre à jour le profil' : 'Créer le profil'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Speakers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-[3rem] border border-gray-100 border-dashed">
              <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-black text-muted uppercase tracking-[0.3em]">Signature des experts en cours...</p>
            </div>
          ) : speakers.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-gray-100 border-dashed">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Aucun intervenant</h3>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-6">La scène est prête, ajoutez votre premier expert !</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                Commencer
              </button>
            </div>
          ) : (
            speakers.map((speaker) => (
              <div key={speaker.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                <div className="h-64 relative overflow-hidden">
                  {speaker.photo ? (
                    <img
                      src={buildStorageUrl(speaker.photo)}
                      alt={speaker.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                      <span className="text-white text-6xl font-black opacity-40 select-none">
                        {speaker.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest line-clamp-3 leading-relaxed">
                      {speaker.bio}
                    </p>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-black text-gray-800 mb-1 tracking-tight group-hover:text-primary transition-colors">{speaker.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-secondary rounded-full"></div>
                      <p className="text-secondary font-bold text-xs uppercase tracking-wider">{speaker.job_title}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button
                      onClick={() => handleEdit(speaker)}
                      className="flex-1 bg-gray-50 text-gray-600 px-4 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(speaker.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSpeakers;
