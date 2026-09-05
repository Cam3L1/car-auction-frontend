import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Countdown from "./Countdown";

const statusVariant = { active: "success", ended: "secondary", cancelled: "danger" };

const CarCard = ({ car, usdRate }) => {
  const navigate = useNavigate();

  return (
    <Card className="car-card h-100">
      <div className="card-img-wrap">
        <Card.Img
          variant="top"
          src={car.image_url}
          alt={car.title}
          onError={(e) => (e.target.src = "/images/placeholder-car.svg")}
        />
        <Badge bg={statusVariant[car.status]} className="status-badge">
          {car.status}
        </Badge>
        {car.status === "active" && (
          <div className="countdown-overlay">
            <Countdown endTime={car.end_time} />
          </div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title>{car.title}</Card.Title>
        <div className="text-secondary mb-2 small">
          {car.make} {car.model} · {car.year} · {car.mileage.toLocaleString()} km
        </div>
        <div className="price-line mb-1">
          <span className="price-amount">{car.current_price.toLocaleString()} JOD</span>
          {usdRate && (
            <span className="price-usd">
              ≈ ${Math.round(car.current_price * usdRate).toLocaleString()}
            </span>
          )}
        </div>
        <div className="text-secondary small mb-3">
          {car.bid_count} bid{car.bid_count === 1 ? "" : "s"} · by {car.seller}
        </div>
        <Button
          variant="primary"
          className="mt-auto w-100"
          onClick={() => navigate(`/cars/${car.id}`)}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CarCard;
