import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const NavBar = ({ user, onLogout }) => {
  const isAdmin = user?.role === "admin";

  return (
    <Navbar expand="lg" className="navbar-car sticky-top mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🚗 <span className="brand-accent">CarBid</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Auctions
            </Nav.Link>
            {user && !isAdmin && (
              <>
                <Nav.Link as={Link} to="/create-listing">
                  Sell a Car
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  My Profile
                </Nav.Link>
              </>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin/dashboard">
                Admin Dashboard
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  👤 {user.username} <span className="text-secondary">({user.role})</span>
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="ms-2"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
