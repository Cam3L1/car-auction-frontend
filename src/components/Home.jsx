import { useState, useEffect } from "react";
import { Container, Row, Col, Form, InputGroup, Button, Alert, Spinner } from "react-bootstrap";
import api from "../api";
import CarCard from "./CarCard";

const Home = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("");

  // fetch the active auctions whenever the make filter changes
  useEffect(() => {
    fetchCars();
  }, [make]);

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
      setError("Could not load auctions. Is the API server running?");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Container>
      <h1 className="mb-3">Active Car Auctions</h1>

      {/* search + make filter */}
      <Form onSubmit={handleSearch} className="mb-4">
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
            <CarCard car={car} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;
