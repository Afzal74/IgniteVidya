"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Play, CheckCircle, X, Timer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface ComparisonQuestion {
  id: number;
  leftNumber: number;
  rightNumber: number;
  correctAnswer: string;
  explanation: string;
}

export default function ComparisonGamePage() {
  const [mounted, setMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questions, setQuestions] = useState<ComparisonQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    setMounted(true);
    generateQuestions();
  }, []);

  useEffect(() => {
    if (gameStarted && !gameCompleted && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer("", true);
    }
  }, [gameStarted, gameCompleted, showResult, timeLeft]);

  const generateQuestions = () => {
    const newQuestions: ComparisonQuestion[] = [];
    for (let i = 0; i < 10; i++) {
      const leftNumber = Math.floor(Math.random() * 100) + 1;
      let rightNumber = Math.floor(Math.random() * 100) + 1;
      
      // Ensure variety
      if (Math.random() > 0.7) {
        rightNumber = leftNumber; // Some equal questions
      }

      let correctAnswer = "";
      let explanation = "";

      if (leftNumber > rightNumber) {
        correctAnswer = ">";
        explanation = `${leftNumber} is greater than ${rightNumber}`;
      } else if (leftNumber < rightNumber) {
        correctAnswer = "<";
        explanation = `${leftNumber} is less than ${rightNumber}`;
      } else {
        correctAnswer = "=";
        explanation = `${leftNumber} is equal to ${rightNumber}`;
      }

      newQuestions.push({
        id: i + 1,
        leftNumber,
        rightNumber,
        correctAnswer,
        explanation
      });
    }
    setQuestions(newQuestions);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setTimeLeft(30);
    setScore(0);
    setCorrectAnswers(0);
  };

  const handleAnswer = (answer: string, timeUp: boolean = false) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = !timeUp && answer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer("");
        setShowResult(false);
        setTimeLeft(30);
      } else {
        setGameCompleted(true);
      }
    }, timeUp ? 1500 : 2500);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setTimeLeft(30);
    generateQuestions();
    setScore(0);
    setCorrectAnswers(0);
  };

  if (!mounted) return null;

  // Game Start Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-4">
            <Link href="/grade/6/mathematics">
              <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mathematics
              </Button>
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl md:text-3xl">🔢</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Number Comparison Game
              </h1>
              <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
                Compare numbers and select the correct symbol! Test your skills with timed challenges.
              </p>
            </div>

            <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
              <div className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-black dark:text-white mb-4 text-center">
                  How to Play
                </h2>
                
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-black dark:text-white mb-3 text-center">Symbols</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2">
                      <div className="text-2xl mb-1 font-bold text-zinc-700 dark:text-zinc-300">{">"}</div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Greater than</p>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-2xl mb-1 font-bold text-zinc-700 dark:text-zinc-300">{"<"}</div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Less than</p>
                    </div>
                    <div className="text-center p-2">
                      <div className="text-2xl mb-1 font-bold text-zinc-700 dark:text-zinc-300">=</div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Equal to</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-6 md:mb-8">
                  <Button 
                    size="lg" 
                    onClick={startGame}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Game
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  // Game Complete Screen
  if (gameCompleted) {
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    let grade = "D";
    let message = "Keep practicing!";
    
    if (percentage >= 90) {
      grade = "A+";
      message = "Outstanding! 🎉";
    } else if (percentage >= 80) {
      grade = "A";
      message = "Excellent work! ⭐";
    } else if (percentage >= 70) {
      grade = "B";
      message = "Great job! 👏";
    } else if (percentage >= 60) {
      grade = "C";
      message = "Good effort! 💪";
    }

    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-4">
                Game Complete!
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
              
              <div className="text-6xl font-bold mb-4 text-green-600">
                {grade}
              </div>
            </div>

            <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 mb-6">
              <div className="p-6">
                <h2 className="text-lg font-bold text-black dark:text-white mb-4 text-center">Final Results</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Score</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{score}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Correct</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{correctAnswers}/10</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Accuracy</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{percentage}%</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Play Again
              </Button>
              <Link href="/grade/6/mathematics">
                <Button size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Mathematics
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main Game
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <section className="pt-20 md:pt-24 pb-8 px-2 md:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Question {currentQuestion + 1}/{questions.length}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Score: {score}
              </span>
            </div>
            
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Timer className="h-5 w-5" />
              {timeLeft}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mb-8">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Main Game Card */}
          <Card className="shadow-xl border-zinc-200 dark:border-zinc-800">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-black dark:text-white mb-6 text-center">
                Compare the numbers
              </h2>

              {/* Numbers */}
              <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {currentQ?.leftNumber}
                </div>
                
                <div className="text-4xl text-zinc-400">?</div>
                
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {currentQ?.rightNumber}
                </div>
              </div>

              {/* Answer Buttons */}
              <div className="flex justify-center gap-4 mb-6">
                {[">", "<", "="].map((symbol) => (
                  <Button
                    key={symbol}
                    onClick={() => handleAnswer(symbol)}
                    disabled={showResult}
                    className="w-16 h-16 text-2xl font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    {symbol}
                  </Button>
                ))}
              </div>

              {/* Result Display */}
              {showResult && (
                <div className="mt-6 text-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {selectedAnswer === currentQ?.correctAnswer ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="text-lg font-bold text-green-600">Correct! 🎉</span>
                      </>
                    ) : (
                      <>
                        <X className="h-6 w-6 text-red-600" />
                        <span className="text-lg font-bold text-red-600">
                          {timeLeft === 0 ? "Time's up! ⏰" : "Try again! 🤔"}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">{currentQ?.explanation}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
