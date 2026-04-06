import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  confirmHackathonMemberInvitation,
  getHackathonMemberInvitation,
} from '../utils/api';

function HackathonMemberConfirmation() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    fonctionnalite: '',
    etablissement: '',
  });

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const response = await getHackathonMemberInvitation(token);
        const data = response.data?.data;
        setInvitation(data);
        setFormData({
          full_name: data?.full_name || '',
          email: data?.email || '',
          fonctionnalite: data?.fonctionnalite || '',
          etablissement: data?.etablissement || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'fonctionnalite' && value !== 'etudiant' ? { etablissement: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        fonctionnalite: formData.fonctionnalite || null,
        etablissement: formData.fonctionnalite === 'etudiant' ? (formData.etablissement || null) : null,
      };

      const response = await confirmHackathonMemberInvitation(token, payload);
      setSuccess(response.data?.message || 'Confirmation recorded successfully.');
      setInvitation((prev) => ({ ...prev, status: 'confirmed' }));
    } catch (err) {
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join('\n');
        setError(messages);
      } else {
        setError(err.response?.data?.message || 'Error while confirming your information.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <p className="text-white text-lg">Loading your invitation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 pt-32">
      <div className="container mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Hackathon Member Confirmation</h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto">
          Complete your details to finalize your team participation.
        </p>
      </div>

      {error && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-red-900/40 border border-red-500/50 text-red-100 px-6 py-4 rounded-lg text-center backdrop-blur-sm">
            <p className="whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-green-900/40 border border-green-500/50 text-green-100 px-6 py-6 rounded-lg text-center backdrop-blur-sm">
            <p>{success}</p>
            <p className="text-sm opacity-90 mt-2">The team leader has been notified.</p>
          </div>
        </div>
      )}

      {!error && invitation && (
        <div className="container mx-auto px-6 mb-20">
          <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 p-8 md:p-10 rounded-2xl shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Team</label>
                <input
                  type="text"
                  value={invitation.team_name || ''}
                  disabled
                  className="w-full px-4 py-2 bg-slate-900 text-slate-300 border border-slate-700 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  disabled={invitation.status === 'confirmed'}
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-900 disabled:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={invitation.status === 'confirmed'}
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-900 disabled:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Role (optional)</label>
                <select
                  name="fonctionnalite"
                  value={formData.fonctionnalite}
                  onChange={handleChange}
                  disabled={invitation.status === 'confirmed'}
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-900 disabled:text-slate-300"
                >
                  <option value="">Not specified</option>
                  <option value="etudiant">Student</option>
                  <option value="employer">Employee</option>
                </select>
              </div>

              {formData.fonctionnalite === 'etudiant' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Institution (optional)</label>
                  <input
                    type="text"
                    name="etablissement"
                    value={formData.etablissement}
                    onChange={handleChange}
                    disabled={invitation.status === 'confirmed'}
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-900 disabled:text-slate-300"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || invitation.status === 'confirmed'}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {invitation.status === 'confirmed'
                  ? 'Information already confirmed'
                  : submitting
                    ? 'Validating...'
                    : 'Confirm my information'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HackathonMemberConfirmation;
