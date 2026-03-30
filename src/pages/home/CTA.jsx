import { useNavigate } from 'react-router-dom';
import './Home.css';
import { registrationClosed, registrationClosedMessage } from '../../config/registration';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">Ready to Join Us?</h2>
        <p className="cta-subtitle">
          Be part of the future of AI. Don't miss this exclusive event.
        </p>

        <div className="cta-buttons">
          <button
            className="btn btn-primary-gradient"
            onClick={() => !registrationClosed && navigate('/reservation')}
            disabled={registrationClosed}
          >
            {registrationClosed ? 'Sold Out' : 'Reserve Your Seat'}
          </button>
          <button
            className="btn btn-outline-white"
            onClick={() => navigate('/program')}
          >
            View Program
          </button>
        </div>
        {registrationClosed && (
          <p className="cta-closed-note" role="status" aria-live="polite">
            {registrationClosedMessage}
          </p>
        )}
      </div>
    </section>
  );
}
