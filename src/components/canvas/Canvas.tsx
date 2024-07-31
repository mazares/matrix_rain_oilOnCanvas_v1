import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

const Canvas = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [dropsSpeed, setDropsSpeed] = useState(0.5);

  const fontSize: number = 16;
  const drops = useMemo(() => {
    if (!ctx) return [];
    const { width } = ctx.canvas;
    const columns = Math.floor(width / fontSize);
    return Array.from({ length: columns }, () => 1);
  }, [ctx]);

  const illuminateOnHover = useCallback(() => {
    if (!ctx) return;
    ctx.canvas.style.filter = "brightness(1.5)";
  }, [ctx]);

  const illuminateOnLeave = useCallback(() => {
    if (!ctx) return;
    ctx.canvas.style.filter = "brightness(0.5)";
  }, [ctx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mouseenter", illuminateOnHover);
    canvas.addEventListener("mouseleave", illuminateOnLeave);

    return () => {
      canvas.removeEventListener("mouseenter", illuminateOnHover);
      canvas.removeEventListener("mouseleave", illuminateOnLeave);
    };
  }, [illuminateOnHover, illuminateOnLeave]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      setDropsSpeed((prev) => prev + 1);
    } else if (e.key === "ArrowDown") {
      setDropsSpeed((prev) => Math.max(0, prev - 10));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const draw = useCallback(() => {
    if (!ctx) return;
    const { width, height } = ctx.canvas;
    const dropsSizeRatio = 1 + dropsSpeed / 100;

    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#0F0";
    ctx.font = `${fontSize}px serif`;

    drops.forEach((drop, i) => {
      const text = String.fromCharCode(0x30a0 + Math.random() * 96);
      ctx.fillText(text, i * fontSize, drop * fontSize);

      if (drop * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i] += dropsSizeRatio;
    });

    requestAnimationFrame(draw);
  }, [ctx, drops, dropsSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) {
      setCtx(context as CanvasRenderingContext2D);
    }

    requestAnimationFrame(draw);

    return () => {
      setCtx(null);
    };
  }, [draw]);

  const resizeCanvas = useCallback(() => {
    if (!ctx) return;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
  }, [ctx]);

  useEffect(() => {
    if (!ctx) return;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [ctx, resizeCanvas]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      id="canvas"
    />
  );
});

export default Canvas;
