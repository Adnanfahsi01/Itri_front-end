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
          ✨ THE PREMIER TECH EVENT
        </div>

        <h1 className="hero-title" style={{ color: 'white', fontSize: '3rem' }}>
          AI ITRI NTIC EVENT
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
        <p className="hero-event-dates">1, 2 and 3 avril 2026</p>
      </div>
    </section>
  );
}
