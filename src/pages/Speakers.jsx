import { useState, useEffect } from 'react';
import { getSpeakers } from '../utils/api';
import { buildStorageUrl } from '../utils/env';

import GlareHover from '../components/GlareHover/GlareHover';

function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary font-semibold">Loading speakers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 pt-32">
      {/* Header */}
      <div className="container mx-auto px-6 mb-32 text-center">
        <h1 className="text-5xl font-bold text-center text-white mb-10">
          Our Speakers
        </h1>
        <p className="text-lg text-center text-slate-400 max-w-4xl mx-auto leading-relaxed">
          Meet the industry experts and thought leaders who will share their knowledge
          and insights at AI ITRI NTIC EVENT.
        </p>
      </div>

      {/* Speakers Grid */}
      <div className="container mx-auto px-6 mt-28">
        {speakers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted">
              Speakers will be announced soon. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speakers.map((speaker) => (
              <GlareHover
                key={speaker.id}
                glareColor="#ffffff"
                glareOpacity={0.2}
                glareAngle={-30}
                glareSize={200}
                transitionDuration={800}
                borderRadius="1rem"
                className="bg-slate-800/40 border border-slate-700 shadow-xl overflow-hidden hover:shadow-2xl hover:border-primary transform hover:-translate-y-2 transition-all block backdrop-blur-sm"
              >
                {/* Speaker Photo */}
                <div className="w-full h-64 bg-gradient-to-br from-slate-800 to-primary flex items-center justify-center pointer-events-none">
                  {speaker.photo ? (
                    <img
                      src={speaker.photo_url || buildStorageUrl(speaker.photo)}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-6xl font-bold">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Speaker Info */}
                <div className="p-6 w-full pointer-events-none">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {speaker.name}
                  </h3>
                  <p className="text-secondary font-semibold mb-4">
                    {speaker.job_title}
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    {speaker.bio}
                  </p>
                </div>
              </GlareHover>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Speakers;
