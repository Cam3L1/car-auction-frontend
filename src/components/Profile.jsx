import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Table, Badge, Alert, Spinner, Row, Col } from "react-bootstrap";
import api, { authHeaders } from "../api";
import Countdown from "./Countdown";

// status -> badge colour (the status text is always shown next to it)
const statusVariant = { active: "success", ended: "secondary", cancelled: "danger" };

// The profile page (/profile) - protected (normal user).
// It renders BOTH sides of the dashboard from ONE API call:
//
//   mount -> GET /users/profile (JWT header) -> setData
//     -> left card:  sellerCars  (My Listings)
//     -> right card: bidderCars  (My Bids)
const Profile = ({ user }) => {
  const [data, setData] = useState(null); // { user, sellerCars, bidderCars }
  const [error, setError] = useState("");

  // lifecycle: this page mounts when its route is visited and
  // unmounts when the user navigates away (React Router)
  useEffect(() => {
    console.log("🟢 Profile page mounted");
    return () => console.log("🔴 Profile page unmounted");
  }, []);

  // the backend identifies the user from the JWT (authHeaders) -
  // the user id is never sent from here
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile", { headers: authHeaders() });
      setData(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load your profile.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!data) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  const { sellerCars, bidderCars } = data;

  return (
    <Container className="pb-5">
      <h1 className="hero-title fs-2 mb-2">My Profile</h1>
      <p className="text-secondary">
        Logged in as <strong>{user.username}</strong> · {user.email}
      </p>
      <div className="d-flex gap-2 flex-wrap mb-4">
        <span className="stat-chip">
          <strong>{sellerCars.length}</strong> listings
        </span>
        <span className="stat-chip">
          <strong>{bidderCars.length}</strong> auctions bid on
        </span>
      </div>

      <Row className="g-4">
        {/* SELLER VIEW: vehicles listed by the user */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>🚘 My Listings ({sellerCars.length})</Card.Title>
              {sellerCars.length === 0 ? (
                <p className="text-muted mt-3">
                  You have not listed any cars yet.{" "}
                  <Link to="/create-listing">Sell your first car</Link>.
                </p>
              ) : (
                <Table striped hover responsive className="mt-3 mb-0">
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>Highest Bid</th>
                      <th>Time Left</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* one row per listing; active rows get a live
                        countdown that refetches the profile on expiry */}
                    {sellerCars.map((car) => (
                      <tr key={car.id}>
                        <td>
                          <Link to={`/cars/${car.id}`}>{car.title}</Link>
                          <div className="text-muted small">
                            {car.bid_count} bid{car.bid_count === 1 ? "" : "s"}
                          </div>
                        </td>
                        <td>
                          {car.highest_bid
                            ? `${car.highest_bid.toLocaleString()} JOD`
                            : `${car.starting_price.toLocaleString()} JOD (starting)`}
                        </td>
                        <td>
                          {car.status === "active" ? (
                            <Countdown endTime={car.end_time} onExpire={fetchProfile} />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <Badge bg={statusVariant[car.status]}>{car.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* BIDDER VIEW: vehicles the user has bid on */}
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>💰 My Bids ({bidderCars.length})</Card.Title>
              {bidderCars.length === 0 ? (
                <p className="text-muted mt-3">
                  You have not placed any bids yet.{" "}
                  <Link to="/">Browse active auctions</Link>.
                </p>
              ) : (
                <Table striped hover responsive className="mt-3 mb-0">
                  <thead>
                    <tr>
                      <th>Car</th>
                      <th>My Highest Bid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* the backend sends top_bidder_id: compare it with
                        the logged-in user's id to decide the badge:
                          ended + I lead  -> "You won!"
                          active + I lead -> "Highest bidder"
                          active + I lag  -> "Outbid" */}
                    {bidderCars.map((car) => {
                      const iAmLeading = car.top_bidder_id === user.id;
                      const iWon = car.status === "ended" && iAmLeading;
                      return (
                        <tr key={car.id}>
                          <td>
                            <Link to={`/cars/${car.id}`}>{car.title}</Link>
                            <div className="text-muted small">seller: {car.seller}</div>
                          </td>
                          <td>{car.my_highest_bid.toLocaleString()} JOD</td>
                          <td>
                            <Badge bg={statusVariant[car.status]}>{car.status}</Badge>{" "}
                            {iWon && <Badge bg="primary">🏆 You won!</Badge>}
                            {car.status === "active" && iAmLeading && (
                              <Badge bg="success">Highest bidder</Badge>
                            )}
                            {car.status === "active" && !iAmLeading && (
                              <Badge bg="warning" text="dark">
                                Outbid
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
