import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";
import api, { authHeaders } from "../api";

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    description: "",
    image_url: "",
    starting_price: "",
    duration_hours: "48",
  });
  const [error, setError] = useState("");
  const [models, setModels] = useState([]);     // model suggestions from NHTSA
  const [modelsHint, setModelsHint] = useState("");

  // generic controlled-input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // third-party API: NHTSA vPIC (open, no key). While the seller types
  // the make, we debounce a request that returns every model produced
  // under that make and offer it through a datalist on the model field.
  useEffect(() => {
    const make = formData.make.trim();

    if (make.length < 2) {
      setModels([]);
      setModelsHint("");
      return;
    }

    // debounce: only query after the user pauses typing
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`
        );
        const unique = [...new Set((res.data?.Results || []).map((r) => r.Model_Name).filter(Boolean))].sort();
        setModels(unique);
        setModelsHint(
          unique.length > 0
            ? `Fetched ${unique.length} models for "${make}" from the NHTSA vPIC open API`
            : `No models found for "${make}" — type the model manually`
        );
      } catch (err) {
        console.error(err);
        setModels([]);
        setModelsHint("");
      }
    }, 600);

    // cleanup: cancel the pending request when the make changes again
    return () => clearTimeout(timer);
  }, [formData.make]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { title, make, model, year, mileage, description, image_url, starting_price, duration_hours } = formData;

    // inline validation
    if (!title || !make || !model || !year || !mileage || !description || !image_url || !starting_price) {
      setError("All fields are required.");
      return;
    }
    if (Number(year) < 1950 || Number(year) > new Date().getFullYear() + 1) {
      setError(`Year must be between 1950 and ${new Date().getFullYear() + 1}.`);
      return;
    }
    if (Number(mileage) < 0) {
      setError("Mileage cannot be negative.");
      return;
    }
    if (Number(starting_price) <= 0) {
      setError("Starting price must be greater than 0.");
      return;
    }
    if (Number(duration_hours) < 1 || Number(duration_hours) > 720) {
      setError("Auction duration must be between 1 hour and 30 days.");
      return;
    }

    // the countdown end timestamp is calculated from the chosen duration
    const end_time = new Date(Date.now() + Number(duration_hours) * 60 * 60 * 1000).toISOString();

    try {
      const res = await api.post(
        "/cars",
        {
          title, make, model,
          year: Number(year),
          mileage: Number(mileage),
          description, image_url,
          starting_price: Number(starting_price),
          end_time,
        },
        { headers: authHeaders() }
      );
      navigate(`/cars/${res.data.car.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the listing.");
    }
  };

  return (
    <Container style={{ maxWidth: 720 }} className="pb-5">
      <h1 className="hero-title fs-2 mb-2">Sell Your Car</h1>
      <p className="hero-sub mb-4">
        Fill in the details and choose how long the auction runs — the countdown
        starts the moment you submit.
      </p>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                placeholder="e.g. Toyota Camry 2020 - Full Option"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Make</Form.Label>
                  <Form.Control name="make" placeholder="e.g. Toyota" value={formData.make} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    name="model"
                    placeholder="Start typing the make to get suggestions"
                    value={formData.model}
                    onChange={handleChange}
                    list="model-suggestions"
                    required
                  />
                  {/* model suggestions fetched from the NHTSA vPIC open API */}
                  <datalist id="model-suggestions">
                    {models.map((model) => (
                      <option key={model} value={model} />
                    ))}
                  </datalist>
                  {modelsHint && (
                    <Form.Text className="text-secondary">{modelsHint}</Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control name="year" type="number" placeholder="2020" value={formData.year} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mileage (km)</Form.Label>
                  <Form.Control name="mileage" type="number" placeholder="60000" value={formData.mileage} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Starting Price (JOD)</Form.Label>
                  <Form.Control name="starting_price" type="number" step="100" placeholder="10000" value={formData.starting_price} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Describe the condition, service history, extras..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                name="image_url"
                placeholder="https://example.com/car.jpg"
                value={formData.image_url}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Auction Duration (hours)</Form.Label>
              <Form.Control
                name="duration_hours"
                type="number"
                min="1"
                max="720"
                value={formData.duration_hours}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-secondary">
                The countdown timer starts immediately after you submit.
              </Form.Text>
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100 btn-gradient">
              Create Listing
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateListing;
