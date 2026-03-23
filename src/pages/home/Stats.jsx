import CountUp from '../../components/CountUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MicIcon from '@mui/icons-material/Mic';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import './Home.css';

export default function Stats() {
  const stats = [
    { end: 3, label: 'Jours intensifs', Icon: EventNoteIcon },
    { end: 20, label: 'Speakers internationaux', Icon: MicIcon, suffix: '+' },
    { end: 80, label: 'Places exclusives', Icon: EmojiEventsIcon }
  ];

  return (
    <section className="stats-section">
      <div className="container mx-auto px-6">
        <h1 className="section-title">Event Stats</h1>
        <div className="stats-grid">
          {stats.map((stat, idx) => {
            const IconComponent = stat.Icon;
            if (!IconComponent) {
              console.warn('Missing icon for stat:', stat.label);
              return null;
            }
            return (
              <div key={idx} className="stat-card">
                <div className="stat-icon">
                  <IconComponent sx={{ fontSize: 48 }} />
                </div>
                <div className="stat-number">
                  <CountUp 
                    from={0} 
                    to={stat.end} 
                    separator=","
                    direction="up"
                    duration={1}
                    className="count-up-text"
                    startCounting
                  />
                </div>
                <p className="stat-label">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
