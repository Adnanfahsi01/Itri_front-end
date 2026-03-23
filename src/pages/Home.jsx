import Hero from './home/Hero';
import About from './home/About';
import Stats from './home/Stats';
import Sponsors from './home/Sponsors';
import Objectives from './home/Objectives';
import CTA from './home/CTA';
import './home/Home.css';

function Home() {
  console.log('Home component rendered');
  return (
    <main style={{ minHeight: '100vh' }}>
      <Hero />
      <About />
      <Stats />
      <Sponsors />
      <Objectives />
      <CTA />
    </main>
  );
}

export default Home;
