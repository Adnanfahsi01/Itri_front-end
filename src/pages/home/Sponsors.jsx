
import LogoLoop from './../../components/LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://tse4.mm.bing.net/th/id/OIP.fby340t8EelyTwVz3P6VbwHaEK?w=1280&h=720&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://th.bing.com/th/id/OIP.7k2mPJJ5xLVI1lfzQMAqDAHaDg?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://tse3.mm.bing.net/th/id/OIP.TszFD7P4lJfie6TTQvsFVwHaEK?w=848&h=477&rs=1&pid=ImgDetMain&o=7&rm=3" },
];
export default function Sponsors() {
  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden'}}>
      <h1 className='section-title'>Our Sponsors</h1>
      <LogoLoop
        logos={techLogos}
        speed={100}
        direction="left"
        logoHeight={60}
        gap={60}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      />
    </div>
  );
}
