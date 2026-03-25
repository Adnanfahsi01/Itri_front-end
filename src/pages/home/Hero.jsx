import { useNavigate } from 'react-router-dom';
import TextType from './TextType';
import './Home.css';
import './HeroAnimation.css';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      {/* Animated background with neural network effect */}
      <div className="hero-bg">
        <div className="animated-gradient"></div>
        <div className="neural-network">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="neural-node" style={{
              animationDelay: `${i * 0.1}s`
            }}></div>
          ))}
        </div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          ✨ THE LEADING TECH EVENT
        </div>

        <h1 className="hero-title" style={{ color: 'white', fontSize: '3rem' }}>
          ITRI AI EVENT
        </h1>

        <div className="hero-subtitle" style={{ color: 'white', fontSize: '1.5rem' }}>
          <TextType
            text={["Don't follow the future", "reinvent it !"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={false}
            deletingSpeed={50}
            cursorBlinkDuration={0.5}
          />
        </div>

        <div className="hero-buttons">
          <button
            className="btn btn-primary-gradient"
            onClick={() => navigate('/reservation')}
            style={{ padding: '14px 32px', borderRadius: '50px', border: 'none', backgroundColor: '#006AD7', color: 'white', cursor: 'pointer' }}
          >
            Reserve Your Seat
          </button>
          <button
            className="btn btn-outline-white"
            onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=P5V3%2BCCW,+Tanger', '_blank')}
            style={{ padding: '14px 32px', borderRadius: '50px', border: '2px solid white', backgroundColor: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location
          </button>
        </div>
        <p className="hero-event-dates">1, 2 and 3 april 2026</p>

        <div className="hero-socials" aria-label="Social media links">
          <a
            href="https://www.instagram.com/itri_ai_event?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noreferrer noopener"
            className="hero-social-link"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/ai-itri-ntic-event-15ba803a7"
            target="_blank"
            rel="noreferrer noopener"
            className="hero-social-link"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.94 8.5A1.56 1.56 0 1 1 6.93 5.4a1.56 1.56 0 0 1 .01 3.1ZM5.56 9.9h2.77V19H5.56V9.9Zm4.6 0h2.66v1.24h.04c.37-.7 1.27-1.44 2.62-1.44 2.8 0 3.32 1.84 3.32 4.24V19h-2.77v-4.5c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.16-1.73 2.37V19h-2.77V9.9Z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
