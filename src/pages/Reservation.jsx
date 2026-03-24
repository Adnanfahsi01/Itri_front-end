import { useState } from 'react';
import { createReservation, submitWaitlist } from '../utils/api';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

function Reservation() {
  const [selectedDays, setSelectedDays] = useState(['day1']);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'student',
    institution: '',
  });



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear institution if role is employee
    if (name === 'role' && value === 'employee') {
      setFormData((prev) => ({
        ...prev,
        institution: '',
      }));
    }
  };

  const handleDayToggle = (day) => {
    if (day === 'all') {
      // Toggle all days
      if (selectedDays.length === 2) {
        setSelectedDays(['day1']);
      } else {
        setSelectedDays(['day1', 'day2']);
      }
    } else {
      if (selectedDays.includes(day)) {
        // Don't allow deselecting if it's the only day
        if (selectedDays.length > 1) {
          setSelectedDays(selectedDays.filter(d => d !== day));
        }
      } else {
        setSelectedDays([...selectedDays, day]);
      }
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour');
      return;
    }

    setSubmitting(true);

    try {

      const reservationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        institution_name: formData.institution || null,
        days: selectedDays,
      };

      console.log('Sending reservation data:', reservationData);
      const response = await createReservation(reservationData);
      console.log('Response from server:', response.data);

      // Check if reservation was created successfully
      if (!response.data || (!response.data.ticket_code && !response.data.reservation?.ticket_code)) {
        console.error('Missing ticket code in response:', response.data);
        throw new Error('Invalid response from server (missing ticket_code)');
      }

      // Generate PDF ticket with QR code
      await generatePDFTicket(response.data);

      setShowSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'student',
        institution: '',
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 30000);
    } catch (error) {
      console.error('Error creating reservation:', error);
      console.error('Error response:', error.response?.data);
      alert(
        error.response?.data?.message || error.message || 'Échec de la réservation. Veuillez réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();

    if (selectedDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour');
      return;
    }

    setSubmitting(true);

    try {
      const waitlistData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        institution_name: formData.institution || null,
        days: selectedDays,
      };

      await submitWaitlist(waitlistData);
      setWaitlistSuccess(true);
      setShowWaitlistForm(false);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error joining waitlist:', error);
      alert(error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription sur la liste d\'attente.');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDFTicket = async (reservationData) => {
    // Landscape format, 210x90mm ticket size
    const doc = new jsPDF('l', 'mm', [210, 90]);

    // QR Code data - use the ticket_code from server response
    const ticketCode = reservationData.ticket_code || reservationData.reservation?.ticket_code || 'ITRI-UNKNOWN';

    const qrData = JSON.stringify({
      ticket_code: ticketCode,
      email: formData.email,
    });

    console.log('Generating PDF with QR data:', qrData);

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Background: Deep Dark Slate (#0f172a)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 90, 'F');

    // Left Border Accent: ITRI primary blue (#006AD7)
    doc.setFillColor(0, 106, 215);
    doc.rect(0, 0, 4, 90, 'F');

    // --- LEFT SECTION (Main Ticket Details) 0 to 150mm ---

    // Main Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('AI ITRI NTIC EVENT', 15, 22);

    // Event Date & Location
    doc.setFontSize(10);
    doc.setTextColor(234, 179, 8); // Yellow 500
    doc.text('1 - 3 AVRIL 2026 | TANGER, MAROC', 15, 30);

    // "ISTA NTIC" Badge
    doc.setFillColor(220, 38, 38); // Red 600
    doc.roundedRect(15, 34, 30, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('ISTA NTIC', 30, 38.2, { align: 'center' });

    // Green dot
    doc.setFillColor(22, 163, 74); // Green 600
    doc.circle(18, 37, 1, 'F');

    // Attendee Info Box (Slate 800)
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(51, 65, 85);
    doc.roundedRect(15, 45, 125, 35, 2, 2, 'FD');

    // Labels
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('PARTICIPANT', 20, 52);
    doc.text('RÔLE', 95, 52);
    doc.text('ACCÈS', 20, 67);
    doc.text('SIÈGES', 95, 67);

    // Values
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const fullName = `${formData.first_name} ${formData.last_name}`;
    doc.text(fullName.length > 30 ? fullName.substring(0, 27) + '...' : fullName, 20, 58);
    doc.text(formData.role === 'student' ? 'Étudiant' : 'Employé', 95, 58);

    const dayLabels = selectedDays.map(d => d === 'day1' ? 'Jour 1' : 'Jour 2').join(', ');
    doc.text(dayLabels, 20, 73);

    doc.setTextColor(234, 179, 8); // Yellow 500 for seats
    doc.text("Accès Libre", 95, 73);

    // Watermark Logo
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.setFontSize(40);
    doc.text('ITRI TECH', 75, 40, { align: 'center', angle: -20 });
    doc.setGState(new doc.GState({ opacity: 1.0 }));

    // --- PERFORATION LINE ---
    doc.setDrawColor(71, 85, 105); // Slate 600
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(150, 0, 150, 90);
    doc.setLineDashPattern([], 0); // Reset

    // --- RIGHT SECTION (Stub) 150 to 210mm ---

    // Stub Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ADMISSION', 180, 16, { align: 'center' });

    // QR Code Background (white box)
    const qrSize = 40;
    const qrX = 160;
    const qrY = 22;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'F');
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Ticket ID
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.setFont('helvetica', 'normal');
    doc.text('TICKET NO.', 180, 72, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(ticketCode, 180, 78, { align: 'center' });

    // Scanning Instruction
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.setFont('helvetica', 'normal');
    doc.text('Scannez à l\'entrée. Billet non transférable.', 180, 85, { align: 'center' });

    // Save PDF
    const fileName = `Ticket_ITRI_2026_${formData.last_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };



  return (
    <div className="min-h-screen py-16 pt-32">
      {/* Header */}
      <div className="container mx-auto px-6 mb-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-7">
          Réservez Votre Place
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Sélectionnez les jours auxquels vous souhaitez participer, puis remplissez le formulaire pour compléter votre réservation.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-blue-900/40 border border-blue-500/50 text-blue-100 px-6 py-8 rounded-lg text-center animate-fadeIn backdrop-blur-sm">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-800/50 mb-4 text-blue-400">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-bold text-2xl mb-2">Réservation Confirmée !</p>
            <p className="text-lg mb-4">Votre demande de réservation a été enregistrée avec succès.</p>
            <p className="text-sm text-blue-300/80">Votre billet vient d'être téléchargé sur votre appareil.</p>
          </div>
        </div>
      )}

      {/* Waitlist Success */}
      {waitlistSuccess && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-green-900/40 border border-green-500/50 text-green-100 px-6 py-8 rounded-lg text-center animate-fadeIn backdrop-blur-sm">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-800/50 mb-4 text-green-400">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-2xl mb-2">Inscription Réussie !</p>
            <p className="text-lg">Vous êtes bien inscrit(e) sur la liste d'attente pour l'événement. Nous vous contacterons par e-mail dès qu'une place se libérera.</p>
          </div>
        </div>
      )}

      {/* Waitlist Success */}
      {waitlistSuccess && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg text-center animate-fadeIn">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-200 mb-4 text-green-600">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-2xl mb-2">Inscription Réussie !</p>
            <p className="text-lg">Vous êtes bien inscrit(e) sur la liste d'attente pour l'événement. Nous vous contacterons par e-mail dès qu'une place se libérera.</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 mt-12 mb-20">
        <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 p-8 md:p-10 rounded-2xl shadow-xl">
          {/* Day Selector */}
          <div className="mb-8 border-b border-slate-700 pb-8">
            <h2 className="text-2xl font-bold text-blue-300 mb-8 text-center">1. Sélectionnez le(s) jour(s)</h2>

              {/* Day Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-muted">Sélectionnez le(s) jour(s):</label>
                <div className="flex gap-3 flex-wrap justify-center">
                  {[
                    { value: 'day1', label: 'Jour 1' },
                    { value: 'day2', label: 'Jour 2' },
                  ].map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDays.includes(day.value)
                        ? 'bg-primary text-white border border-primary'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        }`}
                    >
                      {day.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDayToggle('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedDays.length === 2
                      ? 'bg-slate-900 text-white border border-slate-700'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                      }`}
                  >
                    Les 2 Jours
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/hackathon'}
                    className="px-4 py-2 rounded-lg font-semibold transition-all bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700 text-center flex items-center gap-2"
                  >
                    Jour 3 (Hackathon)
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </button>
                </div>
              </div>
          </div>

          {/* Reservation Form */}
          <div>
            <h2 className="text-2xl font-bold text-blue-300 mb-8 text-center">
                {showWaitlistForm ? "2. Informations pour Liste d'Attente" : "2. Vos Informations"}
              </h2>

              <form onSubmit={showWaitlistForm ? handleWaitlistSubmit : handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">Nom *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
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

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Rôle *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="student">Étudiant</option>
                    <option value="employee">Employé</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Nom de l'institution *
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm text-muted mb-4">
                    <span className="font-semibold text-slate-300">Jour(s) sélectionné(s):</span>{' '}
                    <span className="text-secondary font-bold">
                      {selectedDays.length === 2
                        ? 'Les 2 Jours'
                        : selectedDays.map(d => d === 'day1' ? 'Jour 1' : 'Jour 2').join(', ')}
                    </span>
                  </p>
                </div>

                {showWaitlistForm ? (
                  <button
                    type="submit"
                    disabled={submitting || selectedDays.length === 0}
                    className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                  >
                    {submitting ? 'Inscription...' : 'Rejoindre la liste d\'attente'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all"
                  >
                    {submitting ? 'Traitement...' : 'Compléter la Réservation'}
                  </button>
                )}
              </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
