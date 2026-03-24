
import LogoLoop from './../../components/LogoLoop';

const imageLogos = [
  { src: '/cadimage.png', alt: 'CAD Sponsor' },
  { src: '/tangerimg.png', alt: 'Tanger Sponsor' },
];

export default function Sponsors() {
  return (
    <div className="sponsors-loop-wrapper">
      <h1 className="section-title sponsors-title-compact">Our Sponsors</h1>
      <LogoLoop
        logos={imageLogos}
        speed={70}
        direction="left"
        logoHeight={150}
        gap={58}
        pauseOnHover
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="transparent"
        className="sponsors-logo-loop"
        ariaLabel="Event sponsors"
      />
    </div>
  );
}
