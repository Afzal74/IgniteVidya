"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Eraser, Send, Loader2, Brain, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SmartCalculator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const colors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#EF4444" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Purple", value: "#A855F7" },
    { name: "Orange", value: "#F97316" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size only once on mount
    if (canvas.width === 0) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    // Set drawing style
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [selectedColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Update stroke color
    ctx.strokeStyle = selectedColor;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const newHistory = canvasHistory.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setCanvasHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreCanvas(canvasHistory[newStep]);
    }
  };

  const redo = () => {
    if (historyStep < canvasHistory.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreCanvas(canvasHistory[newStep]);
    }
  };

  const restoreCanvas = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setResult("");
    setExplanation("");
    setCanvasHistory([]);
    setHistoryStep(-1);
  };

  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsLoading(true);
    setResult("");
    setExplanation("");

    try {
      const imageData = canvas.toDataURL("image/png").split(",")[1];

      const response = await fetch("/api/smart-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        setExplanation(data.explanation);
        const question = data.recognized || "Drawing";
        setHistory(prev => [...prev, { question, answer: data.result }].slice(-5));
      } else {
        setResult("Error: " + data.error);
      }
    } catch (error) {
      setResult("Error analyzing drawing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16">
      {/* Simple Header */}
      <div className="bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button 
                variant="outline" 
                className="border border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <h1 className="text-5xl font-black text-blue-600 dark:text-blue-400 text-center flex-1" style={{ fontFamily: '"Press Start 2P", "Courier New", monospace', textShadow: '3px 3px 0px rgba(0,0,0,0.3)', letterSpacing: '0.1em', imageRendering: 'pixelated' }}>
              SMART CALCULATOR
            </h1>
            
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Draw or write anything - Math, Science, English, or any subject!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drawing Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-black dark:text-white tracking-wide">
                  Draw or Write Your Question
                </h2>
                
                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color.value
                          ? "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-96 bg-white dark:bg-zinc-950 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 touch-none"
                style={{ 
                  touchAction: 'none',
                  cursor: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 2v20M2 12h20\' stroke=\'%23000\' stroke-width=\'2\' fill=\'none\'/%3E%3Cpath d=\'M12 2v20M2 12h20\' stroke=\'%23fff\' stroke-width=\'1\' fill=\'none\'/%3E%3C/svg%3E") 12 12, crosshair'
                }}
              />

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={undo}
                  disabled={historyStep <= 0}
                  variant="outline"
                  className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  title="Undo"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  onClick={redo}
                  disabled={historyStep >= canvasHistory.length - 1}
                  variant="outline"
                  className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  title="Redo"
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  onClick={clearCanvas}
                  variant="outline"
                  className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={analyzeDrawing}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Solve
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-3">
                  ✅ Answer
                </h3>
                <p className="text-2xl font-bold text-black dark:text-white mb-4">{result}</p>
                
                {explanation && (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-green-200 dark:border-green-800/50">
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                      💡 Explanation:
                    </h4>
                    <p className="text-zinc-700 dark:text-zinc-300 text-sm">{explanation}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  📜 Recent Calculations
                </h3>
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div key={index} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">{item.question}</p>
                      <p className="text-black dark:text-white font-bold">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                🎯 How to Use
              </h3>
              <ul className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">📐</span>
                  <span>Math: Solve equations, calculations, geometry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">🔬</span>
                  <span>Science: Explain concepts, diagrams, formulas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">📝</span>
                  <span>English: Grammar, spelling, word meanings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">✨</span>
                  <span>Any Subject: Just draw or write your question!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
