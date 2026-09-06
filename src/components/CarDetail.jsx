import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container, Row, Col, Card, Table, Form, Button,
  Alert, Badge, Spinner,
} from "react-bootstrap";
import axios from "axios";
import api, { authHeaders } from "../api";
import Countdown from "./Countdown";

// minimum amount a new bid must add on top of the current price (JOD) -
// mirrors the MIN_BID_INCREMENT on the backend (the server re-checks
// everything anyway; this only improves the client-side feedback)
const MIN_BID_INCREMENT = 100;

// status badge colours (always paired with the status text itself)
const statusVariant = { active: "success", ended: "secondary", cancelled: "danger" };

// The car detail page ("/cars/:id") - public for viewing.
//
// Data flow trace:
//   mount -> fetchCar() -> GET /api/cars/:id -> setData ->
//        -> renders image, spec grid, bid panel and bid history
//   countdown reaches zero -> Countdown calls onExpire -> fetchCar()
//        again -> the refreshed car now shows status "Ended" + winner
const CarDetail = ({ user }) => {
  const { id } = useParams(); // the :id part of the URL
  const [data, setData] = useState(null); // { car, bids, winner }
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [usdRate, setUsdRate] = useState(null);

  // lifecycle: this page mounts when its route is visited and
  // unmounts when the user navigates away (React Router)
  useEffect(() => {
    console.log("🟢 CarDetail page mounted");
    return () => console.log("🔴 CarDetail page unmounted");
  }, []);

  // third-party API: JOD -> USD exchange rate (open.er-api.com, no key).
  // Fetched once on mount; if it fails, the page just shows JOD only.
  useEffect(() => {
    axios
      .get("https://open.er-api.com/v6/latest/JOD")
      .then((res) => setUsdRate(res.data?.rates?.USD || null))
      .catch(() => setUsdRate(null));
  }, []);

  // fetch the car + its bid history from the API
  const fetchCar = async () => {
    try {
      const res = await api.get(`/cars/${id}`);
      setData(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load this auction.");
    }
  };

  // runs on mount AND whenever the :id in the URL changes
  useEffect(() => {
    fetchCar();
  }, [id]);

  // loading and error states come FIRST - hooks must always run, but
  // the render below needs `data`
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!data) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  const { car, bids, winner } = data;
  const isOwner = user && car.user_id === user.id;
  const minBid = car.current_price + MIN_BID_INCREMENT;

  // placing a bid - steps:
  //   1. inline validation (same rules as the backend, for fast feedback)
  //   2. POST /cars/:id/bids with the JWT header
  //   3. success -> show the success alert and refetch (price updates)
  //      failure -> show the server's message (e.g. "auction ended")
  const handleBid = async (e) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess("");

    const value = Number(amount);
    if (!amount || isNaN(value)) {
      setBidError("Please enter a valid bid amount.");
      return;
    }
    if (value <= car.current_price) {
      setBidError(`Your bid must be higher than the current price (${car.current_price.toLocaleString()} JOD).`);
      return;
    }
    if (value < minBid) {
      setBidError(`Your bid must be at least ${minBid.toLocaleString()} JOD (minimum increment of ${MIN_BID_INCREMENT} JOD).`);
      return;
    }

    try {
      const res = await api.post(`/cars/${id}/bids`, { amount: value }, { headers: authHeaders() });
      setBidSuccess(res.data.message);
      setAmount("");
      fetchCar(); // refresh the price and bid history
    } catch (err) {
      setBidError(err.response?.data?.message || "Could not place the bid.");
    }
  };

  return (
    <Container className="pb-5">
      <Row className="g-4">
        {/* left column: image + description */}
        <Col lg={7}>
          <div className="detail-img-wrap mb-3">
            <img
              src={car.image_url}
              alt={car.title}
              className="detail-img"
              // broken URL -> swap to the local placeholder image
              onError={(e) => (e.target.src = "/images/placeholder-car.svg")}
            />
            <Badge bg={statusVariant[car.status]} className="status-badge fs-6">
              {car.status.toUpperCase()}
            </Badge>
            {car.status === "ended" && winner && (
              <Badge bg="primary" className="position-absolute fs-6" style={{ top: 16, left: 110 }}>
                🏆 Winner: {winner}
              </Badge>
            )}
          </div>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="fs-3 fw-bold">{car.title}</Card.Title>
              <p className="mt-3 mb-0">{car.description}</p>
            </Card.Body>
          </Card>

          {/* vehicle specifications: four label/value pairs */}
          <div className="spec-grid">
            <Row>
              <Col xs={6} md={3} className="spec-item">
                <div className="spec-label">Make</div>
                <div className="spec-value">{car.make}</div>
              </Col>
              <Col xs={6} md={3} className="spec-item">
                <div className="spec-label">Model</div>
                <div className="spec-value">{car.model}</div>
              </Col>
              <Col xs={6} md={3} className="spec-item">
                <div className="spec-label">Year</div>
                <div className="spec-value">{car.year}</div>
              </Col>
              <Col xs={6} md={3} className="spec-item">
                <div className="spec-label">Mileage</div>
                <div className="spec-value">{car.mileage.toLocaleString()} km</div>
              </Col>
            </Row>
          </div>
        </Col>

        {/* right column: auction panel */}
        <Col lg={5}>
          <div className="bid-panel p-4 mb-4">
            <div className="spec-label mb-1">Current price</div>
            <div className="d-flex align-items-baseline gap-2 flex-wrap mb-1">
              <span className="price-amount fs-2">
                {car.current_price.toLocaleString()} JOD
              </span>
              {usdRate && (
                <span className="price-usd">
                  ≈ ${Math.round(car.current_price * usdRate).toLocaleString()} USD
                </span>
              )}
            </div>
            <div className="text-secondary small mb-3">
              Starting price {car.starting_price.toLocaleString()} JOD · listed by {car.seller}
            </div>
            <hr className="my-3" />
            <div className="spec-label mb-2">Time left</div>
            {car.status === "active" ? (
              /* onExpire refetches the car so the UI flips to Ended */
              <Countdown endTime={car.end_time} onExpire={fetchCar} />
            ) : (
              <Badge bg="secondary">Auction {car.status}</Badge>
            )}

            <hr className="my-3" />

            {/* the bid area has 4 possible states (conditional rendering):
                closed auction / own listing / logged out / bid form */}
            {car.status !== "active" ? (
              <Alert variant="warning" className="mb-0">
                This auction has {car.status}. Bidding is closed.
              </Alert>
            ) : isOwner ? (
              <Alert variant="info" className="mb-0">
                You cannot bid on your own listing.
              </Alert>
            ) : !user ? (
              <Alert variant="info" className="mb-0">
                <Link to="/login">Log in</Link> to place a bid.
              </Alert>
            ) : (
              <Form onSubmit={handleBid}>
                <Form.Group className="mb-2">
                  <Form.Label>Your bid (minimum {minBid.toLocaleString()} JOD)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={`e.g. ${minBid.toLocaleString()}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>
                {bidError && <Alert variant="danger">{bidError}</Alert>}
                {bidSuccess && <Alert variant="success">{bidSuccess}</Alert>}
                <Button type="submit" variant="primary" className="w-100">
                  Place Bid
                </Button>
              </Form>
            )}
          </div>
          {usdRate && (
            <p className="text-center text-secondary small">
              Exchange rate provided by open.er-api.com
            </p>
          )}
        </Col>
      </Row>

      {/* immutable chronological bid history (newest first for reading) */}
      <div className="section-title">Bid History ({bids.length})</div>
      <Card className="shadow-sm mb-5">
        <Card.Body>
          {bids.length === 0 ? (
            <p className="text-secondary mb-0">No bids yet — be the first!</p>
          ) : (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bidder</th>
                  <th>Amount (JOD)</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {/* reverse() so the newest bid is row 1; index === 0 is
                    therefore the leading bidder / winner */}
                {[...bids].reverse().map((bid, index) => (
                  <tr key={bid.id}>
                    <td>{bids.length - index}</td>
                    <td>
                      {bid.bidder}
                      {index === 0 && car.status === "active" && (
                        <Badge bg="success" className="ms-2">Leading</Badge>
                      )}
                      {index === 0 && car.status === "ended" && (
                        <Badge bg="primary" className="ms-2">Winner</Badge>
                      )}
                    </td>
                    <td>{bid.amount.toLocaleString()}</td>
                    <td>{new Date(bid.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CarDetail;
