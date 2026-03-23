import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PeopleIcon from '@mui/icons-material/People';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import './Home.css';

export default function Objectives() {
  const objectives = [
    {
      icon: LightbulbIcon,
      title: 'Innovate',
      description: 'Explore cutting-edge AI solutions and technologies'
    },
    {
      icon: PeopleIcon,
      title: 'Connect',
      description: 'Build meaningful relationships with industry leaders'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Transform',
      description: 'Drive digital transformation across industries'
    }
  ];

  return (
    <section className="objectives-section">
      <div className="container mx-auto px-6">
        <h2 className="section-title">
          Our Objectives
        </h2>

        <div className="objectives-grid">
          {objectives.map((obj, idx) => {
            const IconComponent = obj.icon;
            if (!IconComponent) {
              console.warn('Missing icon for objective:', obj.title);
              return null;
            }
            return (
              <div key={idx} className="objective-card">
                <div className="objective-icon">
                  <IconComponent sx={{ fontSize: 56 }} />
                </div>
                <h3>{obj.title}</h3>
                <p>{obj.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
