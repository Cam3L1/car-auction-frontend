import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container, Row, Col, Card, ListGroup, Table, Form, Button,
  Alert, Badge, Spinner,
} from "react-bootstrap";
import api, { authHeaders } from "../api";
import Countdown from "./Countdown";

const MIN_BID_INCREMENT = 100;

// status badge colours
const statusVariant = { active: "success", ended: "secondary", cancelled: "danger" };

const CarDetail = ({ user }) => {
  const { id } = useParams();
  const [data, setData] = useState(null); // { car, bids, winner }
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");

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

  useEffect(() => {
    fetchCar();
  }, [id]);

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
    <Container>
      <Row className="g-4">
        {/* left column: image + description */}
        <Col lg={7}>
          <Card className="shadow-sm">
            <Card.Img
              variant="top"
              src={car.image_url}
              alt={car.title}
              style={{ height: "340px", objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title className="fs-3">{car.title}</Card.Title>
              <Badge bg={statusVariant[car.status]} className="mb-2">
                {car.status.toUpperCase()}
              </Badge>
              {car.status === "ended" && winner && (
                <Badge bg="primary" className="ms-2 mb-2">
                  🏆 Winner: {winner}
                </Badge>
              )}
              <p className="mt-3">{car.description}</p>
            </Card.Body>
          </Card>
        </Col>

        {/* right column: auction panel */}
        <Col lg={5}>
          <Card className="shadow-sm mb-4">
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Current price:</strong>{" "}
                <span className="fs-4">{car.current_price.toLocaleString()} JOD</span>
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Starting price:</strong> {car.starting_price.toLocaleString()} JOD
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Seller:</strong> {car.seller}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Time left:</strong>{" "}
                {car.status === "active" ? (
                  <Countdown endTime={car.end_time} onExpire={fetchCar} />
                ) : (
                  <Badge bg="secondary">Auction {car.status}</Badge>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* bid form */}
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Place a Bid</Card.Title>
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
                  <Button type="submit" variant="success" className="w-100">
                    Place Bid
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* vehicle specifications */}
      <Card className="shadow-sm mt-4 mb-4">
        <Card.Body>
          <Card.Title>Vehicle Specifications</Card.Title>
          <Row className="mt-2">
            <Col xs={6} md={3}><strong>Make:</strong> {car.make}</Col>
            <Col xs={6} md={3}><strong>Model:</strong> {car.model}</Col>
            <Col xs={6} md={3}><strong>Year:</strong> {car.year}</Col>
            <Col xs={6} md={3}><strong>Mileage:</strong> {car.mileage.toLocaleString()} km</Col>
          </Row>
        </Card.Body>
      </Card>

      {/* immutable chronological bid history */}
      <Card className="shadow-sm mb-5">
        <Card.Body>
          <Card.Title>Bid History ({bids.length})</Card.Title>
          {bids.length === 0 ? (
            <p className="text-muted mb-0">No bids yet — be the first!</p>
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
