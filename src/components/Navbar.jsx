import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { registrationClosed } from '../config/registration';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar-floating">
      <div className="navbar-floating-content">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-floating-logo" onClick={closeMenu}>
          <img src="/IRTILOGO.png" alt="ITRI AI Logo" width="150" />
        </Link>

        {/* Navigation Links */}
        <div className={`navbar-floating-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-floating-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/speakers" className="navbar-floating-link" onClick={closeMenu}>
            Speakers
          </Link>
          <Link to="/program" className="navbar-floating-link" onClick={closeMenu}>
            Program
          </Link>
          {registrationClosed ? (
            <span className="navbar-floating-reserve navbar-floating-reserve-disabled" aria-disabled="true">
              Reservations Closed
            </span>
          ) : (
            <Link to="/reservation" className="navbar-floating-reserve" onClick={closeMenu}>
              Reserve Your Seat
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="navbar-floating-menu" onClick={toggleMenu} aria-label="Toggle menu">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
