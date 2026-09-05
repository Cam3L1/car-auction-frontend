import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Table, Badge, Button, Alert, Spinner, Tabs, Tab } from "react-bootstrap";
import api, { authHeaders } from "../api";

const statusVariant = { active: "success", ended: "secondary", cancelled: "danger" };

const AdminDashboard = () => {
  const [cars, setCars] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // lifecycle: this page mounts when its route is visited and
  // unmounts when the user navigates away (React Router)
  useEffect(() => {
    console.log("🟢 AdminDashboard page mounted");
    return () => console.log("🔴 AdminDashboard page unmounted");
  }, []);

  const fetchData = async () => {
    try {
      // platform monitoring: all auctions + the full bidding log
      const [carsRes, bidsRes] = await Promise.all([
        api.get("/admin/cars", { headers: authHeaders() }),
        api.get("/admin/bids", { headers: authHeaders() }),
      ]);
      setCars(carsRes.data);
      setBids(bidsRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Could not load the admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // moderation: delete a fraudulent bid (price reverts server-side)
  const handleDeleteBid = async (bid) => {
    if (!window.confirm(`Delete bid #${bid.id} (${bid.amount.toLocaleString()} JOD by ${bid.bidder})?`)) return;
    try {
      const res = await api.delete(`/admin/bids/${bid.id}`, { headers: authHeaders() });
      setNotice(res.data.message);
      fetchData();
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not delete the bid.");
    }
  };

  // moderation: cancel a non-compliant listing (bids are voided)
  const handleCancelCar = async (car) => {
    if (!window.confirm(`Cancel the listing "${car.title}"? All its bids will be voided.`)) return;
    try {
      const res = await api.put(`/admin/cars/${car.id}/cancel`, null, { headers: authHeaders() });
      setNotice(res.data.message);
      fetchData();
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not cancel the listing.");
    }
  };

  // moderation: remove a listing entirely
  const handleDeleteCar = async (car) => {
    if (!window.confirm(`Permanently delete the listing "${car.title}"?`)) return;
    try {
      const res = await api.delete(`/admin/cars/${car.id}`, { headers: authHeaders() });
      setNotice(res.data.message);
      fetchData();
    } catch (err) {
      setNotice(err.response?.data?.message || "Could not delete the listing.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  const activeCount = cars.filter((c) => c.status === "active").length;
  const endedCount = cars.filter((c) => c.status === "ended").length;
  const cancelledCount = cars.filter((c) => c.status === "cancelled").length;

  return (
    <Container className="pb-5">
      <h1 className="hero-title fs-2 mb-2">Admin Dashboard</h1>
      <p className="text-secondary">Platform monitoring and moderation</p>
      {notice && <Alert variant="success">{notice}</Alert>}

      <div className="stat-row">
        <div className="stat-tile">
          <div className="stat-label">Active auctions</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{activeCount}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Ended</div>
          <div className="stat-value">{endedCount}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Cancelled</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>{cancelledCount}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-label">Bids logged</div>
          <div className="stat-value" style={{ color: "var(--accent-strong)" }}>{bids.length}</div>
        </div>
      </div>

      <Tabs defaultActiveKey="auctions" className="mb-3">
        {/* ALL AUCTIONS (active + closed) */}
        <Tab eventKey="auctions" title={`All Auctions (${cars.length})`}>
          <Card className="shadow-sm">
            <Card.Body>
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Seller</th>
                    <th>Current Price</th>
                    <th>Bids</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>
                        <Link to={`/cars/${car.id}`}>{car.title}</Link>
                      </td>
                      <td>{car.seller}</td>
                      <td>{car.current_price.toLocaleString()} JOD</td>
                      <td>{car.bid_count}</td>
                      <td>
                        <Badge bg={statusVariant[car.status]}>{car.status}</Badge>
                      </td>
                      <td>
                        {car.status === "active" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="me-2"
                            onClick={() => handleCancelCar(car)}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCar(car)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* PLATFORM-WIDE BIDDING LOG */}
        <Tab eventKey="bids" title={`Bidding Log (${bids.length})`}>
          <Card className="shadow-sm">
            <Card.Body>
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Bid ID</th>
                    <th>Car</th>
                    <th>Bidder</th>
                    <th>Amount</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td>#{bid.id}</td>
                      <td>{bid.car_title}</td>
                      <td>{bid.bidder}</td>
                      <td>{bid.amount.toLocaleString()} JOD</td>
                      <td>{new Date(bid.created_at).toLocaleString()}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteBid(bid)}
                        >
                          Delete Bid
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
