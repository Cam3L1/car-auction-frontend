import { useState, useEffect } from "react";
import { Container, Row, Col, Form, InputGroup, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import api from "../api";
import CarCard from "./CarCard";

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("");
  const [usdRate, setUsdRate] = useState(null); // JOD -> USD (third-party API)

  // third-party API: open exchange rates (open.er-api.com, no key needed).
  // Fetched once so every card can show the USD equivalent of the price.
  useEffect(() => {
    axios
      .get("https://open.er-api.com/v6/latest/JOD")
      .then((res) => setUsdRate(res.data?.rates?.USD || null))
      .catch(() => setUsdRate(null)); // graceful fallback: show JOD only
  }, []);

  const fetchCars = async (q = search, m = make) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (q) params.q = q;
      if (m) params.make = m;
      const res = await api.get("/cars", { params });
      setCars(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load auctions. Is the API server running?");
    } finally {
      setLoading(false);
    }
  };

  // fetch the active auctions whenever the make filter changes
  useEffect(() => {
    fetchCars();
  }, [make]);

  // the make dropdown is built from the currently loaded cars
  const makes = [...new Set(cars.map((car) => car.make))].sort();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleClear = () => {
    setSearch("");
    setMake("");
    fetchCars("", ""); // pass empty values so the stale state is not used
  };

  const totalBids = cars.reduce((sum, car) => sum + car.bid_count, 0);

  return (
    <>
      {/* hero */}
      <div className="hero">
        <Container>
          <h1 className="hero-title">
            Active <em>Car Auctions</em>
          </h1>
          <p className="hero-sub mb-3">
            Bid on your next car in live online auctions — place your bid before the
            countdown hits zero and drive away the winner.
          </p>
          <div className="d-flex gap-2 flex-wrap mb-4">
            <span className="stat-chip">
              <strong>{cars.length}</strong> live auctions
            </span>
            <span className="stat-chip">
              <strong>{totalBids}</strong> bids placed
            </span>
            {usdRate && (
              <span className="stat-chip">
                1 JOD ≈ <strong>${usdRate.toFixed(2)}</strong>
              </span>
            )}
          </div>

          {/* search + make filter */}
          <Form onSubmit={handleSearch}>
            <Row className="g-2">
              <Col xs={12} md={6}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by title, make or model..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </InputGroup>
              </Col>
              <Col xs={12} md={3}>
                <Form.Select value={make} onChange={(e) => setMake(e.target.value)}>
                  <option value="">All makes</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={3}>
                <Button variant="outline-secondary" onClick={handleClear}>
                  Clear filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container className="pb-5">
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && cars.length === 0 && (
          <Alert variant="info">No active auctions found.</Alert>
        )}

        {/* render the listing cards by mapping over the cars array */}
        <Row xs={1} sm={2} lg={3} className="g-4">
          {cars.map((car) => (
            <Col key={car.id}>
              <CarCard car={car} usdRate={usdRate} />
            </Col>
          ))}
        </Row>

        <p className="text-center text-secondary small mt-5">
          Exchange rates provided by open.er-api.com · prices displayed in Jordanian Dinar (JOD)
        </p>
      </Container>
    </>
  );
};

export default Home;
