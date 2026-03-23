import { useState, useEffect } from 'react';
import { getPrograms } from '../utils/api';
import './Program.css';

function Program() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Day 1');

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await getPrograms();
      const payload = response.data;
      const day1 = Array.isArray(payload?.day1) ? payload.day1 : [];
      const day2 = Array.isArray(payload?.day2) ? payload.day2 : [];
      // Response is grouped by day: { day1: [], day2: [], day3: [] }
      const allPrograms = [
        ...day1.map(p => ({ ...p, day: 'Day 1' })),
        ...day2.map(p => ({ ...p, day: 'Day 2' })),
      ];
      setPrograms(allPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProgramsByDay = (day) => {
    return programs.filter((program) => program.day === day);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-2xl text-blue-500 font-semibold animate-pulse">Loading program...</div>
      </div>
    );
  }

  const currentPrograms = filterProgramsByDay(selectedDay);

  return (
    <div className="program-page pt-32 pb-24">
      {/* Header */}
      <div className="container mx-auto px-6 mb-24 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-8 tracking-tight">
          Event Program
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Explore our comprehensive 3-day program featuring workshops, keynotes, and
          networking sessions.
        </p>
      </div>

      {/* Day Selector */}
      <div className="container mx-auto px-6 mb-20">
        <div className="flex justify-center gap-4 flex-wrap">
          {['Day 1', 'Day 2'].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 ${selectedDay === day
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] transform scale-105 border-transparent'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-500'
                }`}
            >
              {day}
            </button>
          ))}
          <button
            onClick={() => window.location.href = '/hackathon'}
            className="px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] transform hover:scale-105 border-transparent flex items-center gap-2"
          >
            Day 3 (Hackathon)
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </button>
        </div>
      </div>

      {/* Program Schedule Timeline */}
      <div className="container mx-auto px-4">
        {currentPrograms.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-slate-500">
              Program for {selectedDay} will be announced soon.
            </p>
          </div>
        ) : (
          <div className="timeline-container">
            {currentPrograms.map((session, index) => {
              // Alternate left and right blocks for desktop view
              const positionClass = index % 2 === 0 ? 'left' : 'right';

              return (
                <div key={session.id} className={`timeline-item ${positionClass}`}>
                  <div className="timeline-content">
                    {/* Time Badge inside card for mobile, floating for desktop */}
                    <div className="mb-4">
                      <span className="inline-block bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-bold tracking-wider">
                        {session.time}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {session.title}
                    </h3>

                    {session.speaker && (
                      <div className="flex items-start text-slate-400 mt-4 pt-4 border-t border-slate-700/50">
                        <svg
                          className="w-5 h-5 mr-3 mt-0.5 text-blue-500 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <div>
                          <p className="font-semibold text-slate-200">{session.speaker.name}</p>
                          <p className="text-sm text-slate-500">{session.speaker.job_title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="timeline-dot"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Program;
