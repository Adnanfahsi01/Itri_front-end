import { Link } from 'react-router-dom';
import { registrationClosed, registrationClosedBadge } from '../config/registration';

function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-white py-12 mt-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Event Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">ITRI AI EVENT</h3>
            <p className="text-slate-400 leading-relaxed">
              Join us for three days of innovation, learning, and networking at Tanger, Morocco.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/speakers" className="text-slate-400 hover:text-primary transition-colors">
                  Speakers
                </Link>
              </li>
              <li>
                <Link to="/program" className="text-slate-400 hover:text-primary transition-colors">
                  Program
                </Link>
              </li>
              <li>
                {registrationClosed ? (
                  <span className="text-slate-500 cursor-not-allowed">Reserve Seat ({registrationClosedBadge})</span>
                ) : (
                  <Link to="/reservation" className="text-slate-400 hover:text-primary transition-colors">
                    Reserve Seat
                  </Link>
                )}
              </li>
              <li>
                {registrationClosed ? (
                  <span className="text-slate-500 cursor-not-allowed">Hackathon Registration ({registrationClosedBadge})</span>
                ) : (
                  <Link to="/hackathon" className="text-slate-400 hover:text-primary transition-colors">
                    Hackathon Registration
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Contact Us</h3>
            <div className="space-y-4">
              <p className="text-slate-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2" onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=P5V3%2BCCW,+Tanger', '_blank')}>
                <span>📍</span> P5V3+CCW, Av. Forces Armées Royales, Tanger
              </p>
              <p className="text-slate-400">Email: itriainticevent@gmail.com</p>
              <p className="text-slate-400">Phone: +212 639-355922</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ITRI AI EVENT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
