import { useEffect, useRef } from "react";
import "./Canvas.css";

const teamColors = {
  "Red Bull Racing": "#1E41FF",
  Ferrari: "#DC0000",
  Mercedes: "#00D2BE",
  McLaren: "#FF8700",
  "Aston Martin": "#006F62",
  Alpine: "#0090FF",
  Williams: "#005AFF",
  RB: "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#FFFFFF",
};

function Canvas({ cars = [], drivers = [], trackImage, selectedDriver, setSelectedDriver }) {
  const canvasRef = useRef(null);
  const trackImgRef = useRef(null);
  const prevCarsRef = useRef({});
  const boundsRef = useRef(null);

  const normalize = (val, min, max, size) => {
    if (max - min === 0) return size / 2;
    return ((val - min) / (max - min)) * size;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!trackImage) {
      trackImgRef.current = null;
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = trackImage;

    img.onload = () => {
      trackImgRef.current = img;
    };

    img.onerror = () => {
      trackImgRef.current = null;
    };
  }, [trackImage]);

  useEffect(() => {
    const validCars = cars.filter((car) => car.x != null && car.y != null);

    if (validCars.length === 0) {
      boundsRef.current = null;
      return;
    }

    const xs = validCars.map((car) => car.x);
    const ys = validCars.map((car) => car.y);

    boundsRef.current = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [cars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (trackImgRef.current) {
        ctx.drawImage(trackImgRef.current, 0, 0, width, height);
      } else {
        ctx.fillStyle = "#0a0b0d";
        ctx.fillRect(0, 0, width, height);
      }

      if (!cars.length || !boundsRef.current) {
        ctx.fillStyle = "#8b8f98";
        ctx.font = `${Math.max(14, width * 0.02)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("Track data will appear when the session is live", width / 2, height / 2);
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const bounds = boundsRef.current;

      cars.forEach((car) => {
        if (car.x == null || car.y == null) return;

        const driverInfo = drivers.find((d) => d.driver_number === car.driver);
        const teamName = driverInfo?.team_name || "Unknown";
        const color = teamColors[teamName] || "#e10600";
        const prev = prevCarsRef.current[car.driver] || car;

        const smoothX = prev.x + (car.x - prev.x) * 0.1;
        const smoothY = prev.y + (car.y - prev.y) * 0.1;
        const x = normalize(smoothX, bounds.minX, bounds.maxX, width);
        const y = height - normalize(smoothY, bounds.minY, bounds.maxY, height);
        const radius = Math.max(5, width * 0.007);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#e0e0e0";
        ctx.font = `${Math.max(10, width * 0.012)}px Arial`;
        ctx.textAlign = "left";
        const label =
          driverInfo?.name_acronym || driverInfo?.last_name || String(car.driver);
        ctx.fillText(label, x + radius + 4, y);

        if (selectedDriver === car.driver) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 5, 0, 2 * Math.PI);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        prevCarsRef.current[car.driver] = {
          x: smoothX,
          y: smoothY,
          canvasX: x,
          canvasY: y,
        };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [cars, drivers, selectedDriver]);

  const handleClick = (e) => {
    if (!setSelectedDriver) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    Object.entries(prevCarsRef.current).forEach(([driver, pos]) => {
      const dist = Math.sqrt((x - pos.canvasX) ** 2 + (y - pos.canvasY) ** 2);

      if (dist < 14 * scaleX) {
        setSelectedDriver(Number(driver));
      }
    });
  };

  return (
    <canvas
      className="track-canvas"
      ref={canvasRef}
      onClick={handleClick}
      aria-label="Formula 1 live track map"
    />
  );
}

export default Canvas;
