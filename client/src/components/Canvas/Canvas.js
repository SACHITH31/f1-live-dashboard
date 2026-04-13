import { useEffect, useRef } from "react";
import { driversData } from "../../services/teams";
import "./Canvas.css";

function Canvas({ cars, trackImage, selectedDriver, setSelectedDriver }) {
  const canvasRef = useRef(null);
  const trackImgRef = useRef(null);

  const prevCarsRef = useRef({});
  const boundsRef = useRef(null);

  // 🔥 NORMALIZE FUNCTION
  const normalize = (val, min, max, size) => {
    if (max - min === 0) return size / 2;
    return ((val - min) / (max - min)) * size;
  };

  // 🖼️ LOAD TRACK IMAGE
  useEffect(() => {
    if (!trackImage) return;

    const img = new Image();
    img.src = trackImage;

    img.onload = () => {
      trackImgRef.current = img;
    };
  }, [trackImage]);

  // 📊 CALCULATE BOUNDS (IMPORTANT)
  useEffect(() => {
    if (!cars || cars.length === 0) return;

    const xs = cars.map((c) => c.x);
    const ys = cars.map((c) => c.y);

    boundsRef.current = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [cars]);

  // 🎬 ANIMATION LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;

    const animate = () => {
      // 🧼 CLEAR / DRAW BACKGROUND
      if (trackImgRef.current) {
        ctx.drawImage(trackImgRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#0a0b0d";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (!cars || cars.length === 0 || !boundsRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const b = boundsRef.current;

      cars.forEach((car) => {
        if (car.x == null || car.y == null) return;

        // 🧠 PREVIOUS POSITION (PER DRIVER ✅)
        const prev = prevCarsRef.current[car.driver] || car;

        // 🔥 SMOOTH INTERPOLATION
        const smoothX = prev.x + (car.x - prev.x) * 0.1;
        const smoothY = prev.y + (car.y - prev.y) * 0.1;

        // 🎯 NORMALIZE TO CANVAS
        const x = normalize(smoothX, b.minX, b.maxX, canvas.width);
        const y =
          canvas.height - normalize(smoothY, b.minY, b.maxY, canvas.height);

        const driver = driversData[car.driver];
        const color = driver?.color || "#e10600";

        // 🚗 DRAW CAR
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);

        ctx.shadowBlur = 12;
        ctx.shadowColor = color;

        ctx.fillStyle = color;
        ctx.fill();

        ctx.shadowBlur = 0;

        // 🏷️ DRIVER LABEL
        ctx.fillStyle = "#e0e0e0";
        ctx.font = "10px Arial";
        ctx.fillText(car.driver, x + 8, y);

        // 🔥 SELECTED DRIVER HIGHLIGHT
        if (selectedDriver === car.driver) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // 💾 SAVE SMOOTH POSITION
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
  }, [cars, selectedDriver]);

  // 🖱️ CLICK HANDLER (FIXED ✅)
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    Object.entries(prevCarsRef.current).forEach(([driver, pos]) => {
      const dist = Math.sqrt((x - pos.canvasX) ** 2 + (y - pos.canvasY) ** 2);

      if (dist < 10) {
        setSelectedDriver(Number(driver));
      }
    });
  };

  return (
    <canvas ref={canvasRef} width={800} height={500} onClick={handleClick} />
  );
}

export default Canvas;
