import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Temp from "./components/weather/Temp";
import FavCities from "./components/weather/FavCities";
import About from "./About";
import "./App.css";
import "./components/weather/styles.css";

function App() {
  useEffect(() => {
    document.title = "My Weather App";
  }, []);

  const [showMenu, setShowMenu] = useState(true); // Set showMenu to true initially

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Function to handle window resize
  const handleResize = () => {
    if (window.innerWidth > 768) {
      // Assuming 768px is the mobile breakpoint
      setShowMenu(true); // Show menu when the window width is larger than the mobile breakpoint
    }
  };

  // Add an event listener for window resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light text-left d-flex text-2xl">
        <button
          className="navbar-toggler mx-left"
          type="button"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${showMenu ? "show" : ""}`}>
          <ul className="navbar-nav w-100 justify-content-between">
            <li className="nav-item">
              <Link
                to="/Home"
                style={{ color: "white" }}
                className={`nav-link ${showMenu ? "visible" : ""}`}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/FavCities"
                style={{ color: "white" }}
                className={`nav-link ${showMenu ? "visible" : ""}`}
              >
                Favourite Cities
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link
                to="/Tab3"
                style={{ color: "white" }}
                className={`nav-link ${showMenu ? "visible" : ""}`}
              >
                Tab3
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/Tab4"
                style={{ color: "white" }}
                className={`nav-link ${showMenu ? "visible" : ""}`}
              >
                Tab4
              </Link>
            </li> */}
            <li className="nav-item">
              <Link
                to="/About"
                style={{ color: "white" }}
                className={`nav-link ${showMenu ? "visible" : ""}`}
              >
                About
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/FavCities" element={<FavCities />} />
        <Route path="/Home" element={<Temp />} />
        <Route path="/About" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
