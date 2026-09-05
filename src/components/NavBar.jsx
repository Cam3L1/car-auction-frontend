import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const NavBar = ({ user, onLogout }) => {
  const isAdmin = user?.role === "admin";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🚗 CarBid
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
                  👤 {user.username} ({user.role})
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
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
