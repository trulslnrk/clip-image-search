import { Link, useLocation } from "@tanstack/react-router";
import "./Header.scss";

export function Header() {
  const location = useLocation();
  const currentRoute = location.pathname;

  console.log(currentRoute);
  return (
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item" data-active={currentRoute === "/"}>
            <Link to="/" className="nav-link">
              Search and navigate
            </Link>
          </li>
          <li className="nav-item" data-active={currentRoute === "/explore"}>
            <Link to="/explore" className="nav-link">
              Explore Dimensions
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
