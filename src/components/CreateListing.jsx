import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Row, Col, Button, Alert } from "react-bootstrap";
import api, { authHeaders } from "../api";

// The "Sell a Car" page (/create-listing) - protected: only reachable
// when a normal user is logged in (see the guard in App.jsx).
//
// One state object holds the WHOLE form (formData) - a controlled form:
// every input's value comes from state and every keystroke updates it.
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

  // lifecycle: this page mounts when its route is visited and
  // unmounts when the user navigates away (React Router)
  useEffect(() => {
    console.log("🟢 CreateListing page mounted");
    return () => console.log("🔴 CreateListing page unmounted");
  }, []);

  // generic controlled-input handler: each input has a name attribute
  // and this ONE function updates that key inside formData
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // submit flow:
  //   1. inline validation (fast feedback, same rules as the backend)
  //   2. calculate end_time from the chosen duration in hours
  //   3. POST /cars with the JWT header
  //   4. success -> navigate to the new car's detail page
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { title, make, model, year, mileage, description, image_url, starting_price, duration_hours } = formData;

    // validation 1: all fields required
    if (!title || !make || !model || !year || !mileage || !description || !image_url || !starting_price) {
      setError("All fields are required.");
      return;
    }
    // validation 2: year must be realistic
    if (Number(year) < 1950 || Number(year) > new Date().getFullYear() + 1) {
      setError(`Year must be between 1950 and ${new Date().getFullYear() + 1}.`);
      return;
    }
    // validation 3: mileage cannot be negative
    if (Number(mileage) < 0) {
      setError("Mileage cannot be negative.");
      return;
    }
    // validation 4: price must be positive
    if (Number(starting_price) <= 0) {
      setError("Starting price must be greater than 0.");
      return;
    }
    // validation 5: duration between 1 hour and 30 days
    if (Number(duration_hours) < 1 || Number(duration_hours) > 720) {
      setError("Auction duration must be between 1 hour and 30 days.");
      return;
    }

    // the countdown end timestamp = now + the chosen duration.
    // The BACKEND stores it and is the source of truth for the timer.
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
      navigate(`/cars/${res.data.car.id}`); // straight to the new listing
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
                    placeholder="e.g. Camry"
                    value={formData.model}
                    onChange={handleChange}
                    required
                  />
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
