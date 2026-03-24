import { useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { registerHackathon } from '../utils/api';

function HackathonRegistration() {
  const MAX_INVITED_MEMBERS = 2;
  const [nextMemberId, setNextMemberId] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cni: '',
    email: '',
    phone: '',
    registration_type: 'solo',
    team_name: '',
    members: [],
    fonctionnalite: 'etudiant',
    etablissement: '',
    entreprise: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [inviteLinks, setInviteLinks] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear conditional fields when switching role
      ...(name === 'fonctionnalite' && value === 'etudiant' ? { entreprise: '' } : {}),
      ...(name === 'fonctionnalite' && value === 'employer' ? { etablissement: '' } : {}),
      ...(name === 'registration_type' && value === 'solo' ? { team_name: '', members: [] } : {}),
    }));
  };

  const addMember = () => {
    if (formData.members.length >= MAX_INVITED_MEMBERS) {
      setError('Maximum 2 membres invites (leader + 2 membres).');
      return;
    }

    setError('');
    const memberId = nextMemberId;
    setNextMemberId((prev) => prev + 1);

    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { client_id: memberId, full_name: '', email: '' }],
    }));
  };

  const removeMember = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.client_id !== memberId),
    }));
  };

  const handleMemberChange = (memberId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.client_id === memberId ? { ...member, [field]: value } : member
      ),
    }));
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const generatePDFTicket = async (registrationData, submittedData) => {
    // Portrait format badge: 90x140mm
    const doc = new jsPDF('p', 'mm', [90, 140]);

    const ticketCode = registrationData.ticket_code || 'HCK-UNKNOWN';

    const qrData = JSON.stringify({
      ticket_code: ticketCode,
      email: submittedData.email,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });

    // Background: #f9f9f9
    doc.setFillColor(249, 249, 249);
    doc.rect(0, 0, 90, 140, 'F');

    // Header (#21277B)
    doc.setFillColor(33, 39, 123);
    doc.rect(0, 0, 90, 18, 'F');
    
    try {
      const logoImg = await loadImage('/logo.png');
      doc.addImage(logoImg, 'PNG', 4, 3, 12, 12);
    } catch(err) {
      console.warn('Could not load logo into PDF', err);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('HACKATHON AI ITRI', 50, 9.5, { align: 'center', letterSpacing: 0.5 });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 255); // Light blue tint for the date
    doc.text('3 AVRIL 2026 • TANGER', 50, 14.5, { align: 'center', letterSpacing: 0.5 });

    // Body
    // Participant Name
    doc.setTextColor(51, 51, 51); // #333
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const fullName = `${submittedData.prenom} ${submittedData.nom}`;
    doc.text(fullName, 45, 32, { align: 'center' });

    // Participant Role
    doc.setTextColor(33, 39, 123); // #21277B
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const role = submittedData.fonctionnalite === 'etudiant' ? 'Développeur Étudiant' : 'Professionnel';
    doc.text(role, 45, 40, { align: 'center' });

    // Participant Details
    doc.setTextColor(102, 102, 102); // #666
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    const orgaName = submittedData.fonctionnalite === 'etudiant' ? submittedData.etablissement : submittedData.entreprise;
    let currentY = 50;
    const labelOrg = submittedData.fonctionnalite === 'etudiant' ? 'Établissement: ' : 'Entreprise: ';
    doc.text(`${labelOrg} ${orgaName || 'N/A'}`, 45, currentY, { align: 'center' });
    currentY += 6;
    doc.text(`Tél: ${submittedData.phone}`, 45, currentY, { align: 'center' });
    currentY += 6;
    doc.text(`Email: ${submittedData.email}`, 45, currentY, { align: 'center' });

    // QR Code Section
    // Draw QR border
    doc.setDrawColor(33, 39, 123);
    doc.setLineWidth(1);
    doc.roundedRect(26, 72, 38, 38, 3, 3, 'S');
    
    // Draw QR Code Image
    doc.addImage(qrCodeDataUrl, 'PNG', 27.5, 73.5, 35, 35);
    
    // QR text
    doc.setTextColor(136, 136, 136); // #888
    doc.setFontSize(7);
    doc.text("Scannez pour valider l'accès", 45, 116, { align: 'center' });

    // Footer (#333)
    doc.setFillColor(51, 51, 51);
    doc.rect(0, 130, 90, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`ID: ${ticketCode}`, 45, 136.5, { align: 'center', letterSpacing: 0.5 });

    // Draw main border around card
    doc.setDrawColor(224, 224, 224); // #e0e0e0
    doc.setLineWidth(0.5);
    doc.rect(0.25, 0.25, 89.5, 139.5, 'S');

    doc.save(`Hackathon_Badge_${submittedData.nom}_${submittedData.prenom}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setInviteLinks([]);

    const cleanedMembers = formData.members
      .map((member) => ({
        full_name: member.full_name.trim(),
        email: member.email.trim(),
      }))
      .filter((member) => member.full_name && member.email);

    const hasPartialRows = formData.members.some((member) => {
      const fullName = member.full_name.trim();
      const memberEmail = member.email.trim();

      return (fullName || memberEmail) && (!fullName || !memberEmail);
    });

    if (hasPartialRows) {
      setSubmitting(false);
      setError('Chaque membre ajoute doit avoir un nom complet et un email.');
      return;
    }

    const invalidMember = cleanedMembers.find(
      (member) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)
    );

    if (invalidMember) {
      setSubmitting(false);
      setError(`Email membre invalide: ${invalidMember.email}`);
      return;
    }

    if (formData.registration_type === 'team' && cleanedMembers.length === 0) {
      setSubmitting(false);
      setError('Ajoutez au moins un membre avec nom complet et email.');
      return;
    }

    if (formData.registration_type === 'team' && !formData.team_name.trim()) {
      setSubmitting(false);
      setError('Le nom de l\'equipe est obligatoire pour une inscription en equipe.');
      return;
    }

    if (formData.registration_type === 'team' && cleanedMembers.length > MAX_INVITED_MEMBERS) {
      setSubmitting(false);
      setError('Maximum 2 membres invites (leader + 2 membres).');
      return;
    }
    
    try {
      const payload = {
        cni: formData.cni,
        email: formData.email,
        phone: formData.phone,
        nom: formData.nom,
        prenom: formData.prenom,
        registration_type: formData.registration_type,
        fonctionnalite: formData.fonctionnalite,
        etablissement: formData.etablissement,
        entreprise: formData.entreprise,
        ...(formData.registration_type === 'team'
          ? {
              team_name: formData.team_name.trim(),
              members: cleanedMembers,
            }
          : {}),
      };

      const response = await registerHackathon(payload);
      
      if (response.data && response.data.data) {
        await generatePDFTicket(response.data.data, formData);
      }

      setInviteLinks(response.data?.invite_links || []);

      setSuccess(true);
      setFormData({
        nom: '', prenom: '', cni: '', email: '', phone: '',
        registration_type: 'solo', team_name: '', members: [],
        fonctionnalite: 'etudiant', etablissement: '', entreprise: ''
      });
      window.scrollTo(0, 0);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errMessages = Object.values(err.response.data.errors).flat().join('\n');
        setError(errMessages);
      } else {
        const backendError = err.response?.data?.error;
        const backendMessage = err.response?.data?.message;
        setError(backendError || backendMessage || 'Erreur lors de l\'inscription. Veuillez vérifier vos données.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 pt-32">
      <div className="container mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Inscription au Hackathon
        </h1>
        <p className="text-lg text-slate-400 max-w-4xl mx-auto leading-relaxed">
          Le Hackathon AI Tanger est une initiative organisée par ITRIAI dans le but de stimuler l'innovation locale en intelligence artificielle. Face à une ville en pleine transformation - entre le développement du port Tanger Med, l'expansion urbaine et les défis sociaux - cet événement vise à mobiliser la jeunesse estudiantine pour proposer des solutions concrètes et applicables. L'événement s'inscrit dans une vision plus large : faire de Tanger un hub régional de l'innovation technologique, en mettant l'AI au service des problèmes réels de la ville.
        </p>
      </div>

      {success && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-green-900/40 border border-green-500/50 text-green-100 px-6 py-8 rounded-lg text-center backdrop-blur-sm animate-fadeIn">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-800/50 mb-4 text-green-400">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg mb-2">Votre inscription a bien été enregistrée avec succès. Après étude de votre candidature, vous serez contacté par e-mail, WhatsApp ou téléphone afin de confirmer votre participation.</p>
            <p className="text-sm font-bold opacity-80 mt-4">Votre reçu d'inscription a été téléchargé automatiquement en format PDF.</p>
            {inviteLinks.length > 0 && (
              <div className="mt-6 text-left bg-slate-900/30 border border-slate-700 rounded-lg p-4">
                <p className="font-bold mb-3">Liens d'invitation a partager avec vos membres:</p>
                <div className="space-y-3">
                  {inviteLinks.map((invite) => (
                    <div key={invite.email} className="bg-slate-950/30 p-3 rounded-lg border border-slate-700/50">
                      <p className="text-sm font-semibold">{invite.member} ({invite.email})</p>
                      <p className="text-xs break-all text-slate-300 mt-1">{invite.link}</p>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(invite.link)}
                        className="mt-2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-opacity-90 transition-all"
                      >
                        Copier le lien
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-red-900/40 border border-red-500/50 text-red-100 px-6 py-4 rounded-lg text-center backdrop-blur-sm">
             <p className="whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 mb-20">
        <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 p-8 md:p-10 rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">CNI *</label>
                <input
                  type="text"
                  name="cni"
                  value={formData.cni}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Participation *</label>
              <select
                name="registration_type"
                value={formData.registration_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="solo">Solo</option>
                <option value="team">Avec equipe</option>
              </select>
            </div>

            {formData.registration_type === 'team' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Nom de l'equipe *</label>
                  <input
                    type="text"
                    name="team_name"
                    value={formData.team_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="space-y-3 border border-slate-700 rounded-xl p-4 bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-200">Membres de l'equipe</p>
                    <button
                      type="button"
                      onClick={addMember}
                      disabled={formData.members.length >= MAX_INVITED_MEMBERS}
                      className="px-3 py-1.5 bg-slate-700 text-white text-xs font-semibold rounded-md hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter un membre
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">Maximum: 2 membres invites (leader + 2).</p>

                  {formData.members.length === 0 ? (
                    <p className="text-xs text-slate-400">Ajoutez les membres que vous souhaitez inviter.</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.members.map((member) => (
                        <div key={member.client_id} className="grid md:grid-cols-2 gap-3 items-end bg-slate-950/30 p-3 rounded-lg border border-slate-700/50">
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-300">Nom complet *</label>
                            <input
                              type="text"
                              value={member.full_name}
                              onChange={(e) => handleMemberChange(member.client_id, 'full_name', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-300">Email *</label>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => handleMemberChange(member.client_id, 'email', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeMember(member.client_id)}
                              className="px-3 py-1.5 bg-red-900/40 text-red-200 text-xs font-semibold rounded-md hover:bg-red-800/50 transition-all"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-300">Fonctionnalité *</label>
              <select
                name="fonctionnalite"
                value={formData.fonctionnalite}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="etudiant">Étudiant</option>
                <option value="employer">Employé</option>
              </select>
            </div>

            {formData.fonctionnalite === 'etudiant' && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Établissement *</label>
                <input
                  type="text"
                  name="etablissement"
                  value={formData.etablissement}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {formData.fonctionnalite === 'employer' && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">Entreprise *</label>
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
            >
              {submitting ? 'Validation en cours...' : 'Valider l\'inscription'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HackathonRegistration;
