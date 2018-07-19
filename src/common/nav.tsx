import * as React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => (
  <div>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <button 
        className="navbar-toggler" 
        type="button" 
        data-toggle="collapse" 
        data-target="#navbarNav" 
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/counters">Counters</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/users">Users</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/about">About</Link>
            </li>
        </ul>
      </div>
    </nav>
  </div>
);

export default Nav;
