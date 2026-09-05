import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Countdown from "./Countdown";

const CarCard = ({ car }) => {
  const navigate = useNavigate();

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={car.image_url}
        alt={car.title}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{car.title}</Card.Title>
        <Card.Text className="text-muted mb-1">
          {car.make} {car.model} · {car.year} · {car.mileage.toLocaleString()} km
        </Card.Text>
        <Card.Text className="mb-1">
          <strong>Current bid:</strong> {car.current_price.toLocaleString()} JOD
        </Card.Text>
        <Card.Text className="text-muted small mb-2">
          {car.bid_count} bid{car.bid_count === 1 ? "" : "s"} · listed by {car.seller}
        </Card.Text>
        <Countdown endTime={car.end_time} />
        <Button
          variant="primary"
          className="mt-3"
          onClick={() => navigate(`/cars/${car.id}`)}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CarCard;
