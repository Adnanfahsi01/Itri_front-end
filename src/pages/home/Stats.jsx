import { useEffect, useState } from 'react';
import CountUp from '../../components/CountUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MicIcon from '@mui/icons-material/Mic';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getSpeakers } from '../../utils/api';
import './Home.css';

export default function Stats() {
  const [speakersCount, setSpeakersCount] = useState(0);

  useEffect(() => {
    const loadSpeakersCount = async () => {
      try {
        const response = await getSpeakers();
        const payload = response.data;
        const speakers = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        setSpeakersCount(speakers.length);
      } catch (error) {
        console.error('Error loading speakers count:', error);
        setSpeakersCount(0);
      }
    };

    loadSpeakersCount();
  }, []);

  const stats = [
    { end: 3, label: 'Jours intensifs', Icon: EventNoteIcon },
    { end: speakersCount, label: 'Speakers internationaux', Icon: MicIcon },
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
