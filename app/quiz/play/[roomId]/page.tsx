"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, Trophy, Loader2, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number;
  order_number: number;
  image_url?: string;
}

export default function QuizPlayPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [auraPoints, setAuraPoints] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [quizEnded, setQuizEnded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const name = localStorage.getItem("quiz_participant_name");
    const pId = localStorage.getItem("quiz_participant_id");
    if (name) setParticipantName(name);
    if (pId) setParticipantId(pId);

    fetchQuizData();

    // Enable sound on first user interaction
    const enableSound = () => {
      setSoundEnabled(true);
      document.removeEventListener("click", enableSound);
    };
    document.addEventListener("click", enableSound);

    return () => document.removeEventListener("click", enableSound);
  }, [roomId]);

  useEffect(() => {
    if (room && questions.length > 0 && !answered && !quizEnded) {
      setTimeLeft(room.time_limit);
      setAuraPoints(1000);
    }
  }, [currentQuestionIndex, room, questions, answered, quizEnded]);

  useEffect(() => {
    if (timeLeft > 0 && !answered && !quizEnded) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Reduce aura points: 1000 points over time_limit seconds
          const pointsPerSecond = 1000 / (room?.time_limit || 15);
          setAuraPoints((prev) => Math.max(0, prev - pointsPerSecond));

          // Play tick sound when time is running low
          if (newTime <= 5 && newTime > 0) {
            playSound("tick");
          }

          if (newTime === 0) {
            handleTimeout();
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, answered, quizEnded, room]);

  const fetchQuizData = async () => {
    try {
      // Fetch room data
      const { data: roomData } = await supabase
        .from("quiz_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!roomData) {
        router.push("/quiz");
        return;
      }

      setRoom(roomData);

      // Fetch questions
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("room_id", roomId)
        .order("order_number", { ascending: true });

      if (questionsData) {
        setQuestions(questionsData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setLoading(false);
    }
  };

  const playSound = (type: "correct" | "wrong" | "tick" | "finish") => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "correct":
        // Happy ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(
          659.25,
          audioContext.currentTime + 0.1
        ); // E5
        oscillator.frequency.setValueAtTime(
          783.99,
          audioContext.currentTime + 0.2
        ); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case "wrong":
        // Descending sad notes
        oscillator.frequency.setValueAtTime(392.0, audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(
          329.63,
          audioContext.currentTime + 0.1
        ); // E4
        oscillator.frequency.setValueAtTime(
          261.63,
          audioContext.currentTime + 0.2
        ); // C4
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case "tick":
        // Quick tick sound
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.05
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      case "finish":
        // Victory fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(
            freq,
            audioContext.currentTime + i * 0.15
          );
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + i * 0.15 + 0.3
          );
          osc.start(audioContext.currentTime + i * 0.15);
          osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
        });
        break;
    }
  };

  const handleTimeout = () => {
    if (!answered) {
      playSound("wrong");
      setAnswered(true);
      setTimeout(() => {
        showLeaderboardAndContinue();
      }, 2000);
    }
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("quiz_participants")
      .select("*")
      .eq("room_id", roomId)
      .order("score", { ascending: false })
      .limit(10);

    if (data) {
      setLeaderboard(data);
    }
  };

  const showLeaderboardAndContinue = async () => {
    // Fetch latest leaderboard
    await fetchLeaderboard();

    // Show leaderboard
    setShowLeaderboard(true);

    // Wait 6 seconds then move to next question
    setTimeout(() => {
      setShowLeaderboard(false);
      moveToNextQuestion();
    }, 6000);
  };

  const handleAnswerSelect = async (answer: string) => {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;

    // Play sound
    playSound(isCorrect ? "correct" : "wrong");

    // Calculate points based on remaining aura
    const earnedPoints = isCorrect ? Math.round(auraPoints) : 0;
    const newScore = score + earnedPoints;
    setScore(newScore);

    // Update participant score in database
    if (participantId) {
      await supabase
        .from("quiz_participants")
        .update({
          score: newScore,
          answers_submitted: currentQuestionIndex + 1,
        })
        .eq("id", participantId);
    }

    // Show leaderboard after 2 seconds
    setTimeout(() => {
      showLeaderboardAndContinue();
    }, 2000);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      endQuiz();
    }
  };

  const endQuiz = async () => {
    playSound("finish");
    setQuizEnded(true);

    // Update room status if all questions answered
    if (participantId) {
      await supabase
        .from("quiz_participants")
        .update({
          answers_submitted: questions.length,
        })
        .eq("id", participantId);
    }

    // Fetch final leaderboard
    await fetchLeaderboard();
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  const getPixelOptionClass = (option: string) => {
    if (!answered) {
      return "bg-[#1a1a3e] border-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0f0f23] cursor-pointer";
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correct_answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) {
      return "bg-[#00ff41] border-[#00ff41] text-[#0f0f23] animate-pulse";
    }
    if (isSelected && !isCorrect) {
      return "bg-[#ff0000] border-[#ff0000] text-white animate-pulse";
    }
    return "bg-[#0f0f23] border-[#444] opacity-50";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f0f23]"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        <div className="text-center bg-[#1a1a3e] border-4 border-[#00ff41] p-8">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-xs text-[#00ff41]">LOADING...</p>
        </div>
      </div>
    );
  }

  // Leaderboard Display Component - Pixel Style
  if (showLeaderboard) {
    const myRank = leaderboard.findIndex((p) => p.id === participantId);
    const myData = leaderboard[myRank];

    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f0f23] p-2 sm:p-4"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-[#1a1a3e] border-4 border-[#ff00ff] p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-4 sm:mb-6"
            >
              <div className="text-3xl sm:text-5xl mb-3 sm:mb-4">🏆</div>
              <h2 className="text-xs sm:text-base md:text-xl font-bold text-[#00ff41] mb-2">
                LEADERBOARD
              </h2>
              <p className="text-[8px] sm:text-xs text-[#00d4ff]">
                STAGE {currentQuestionIndex + 1}/{questions.length}
              </p>
            </motion.div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {leaderboard.slice(0, 5).map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 border-4 ${
                    participant.id === participantId
                      ? "bg-[#00ff41] border-[#00ff41]"
                      : "bg-[#0f0f23] border-[#00d4ff]"
                  }`}
                  style={{ imageRendering: "pixelated" }}
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#1a1a3e] border-2 border-[#ff00ff] flex items-center justify-center font-bold text-[#ff00ff] text-xs sm:text-sm md:text-base">
                    {getRankEmoji(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-[8px] sm:text-xs md:text-sm truncate ${
                        participant.id === participantId
                          ? "text-[#0f0f23]"
                          : "text-[#00ff41]"
                      }`}
                    >
                      {participant.student_name}
                      {participant.id === participantId && (
                        <span className="ml-1 sm:ml-2">(YOU)</span>
                      )}
                    </p>
                    <p
                      className={`text-[6px] sm:text-[8px] ${
                        participant.id === participantId
                          ? "text-[#1a1a3e]"
                          : "text-[#00d4ff]"
                      }`}
                    >
                      {participant.answers_submitted} ANSWERED
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-lg md:text-2xl font-bold ${
                        participant.id === participantId
                          ? "text-[#0f0f23]"
                          : "text-[#ff00ff]"
                      }`}
                    >
                      {participant.score}
                    </p>
                    <p
                      className={`text-[6px] sm:text-[8px] ${
                        participant.id === participantId
                          ? "text-[#1a1a3e]"
                          : "text-[#00d4ff]"
                      }`}
                    >
                      PTS
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {myRank > 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t-4 border-dashed border-[#00d4ff] pt-3 sm:pt-4"
              >
                <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 bg-[#00ff41] border-4 border-[#00ff41]">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#1a1a3e] border-2 border-[#ff00ff] flex items-center justify-center text-[#ff00ff] font-bold text-xs sm:text-sm">
                    {myRank + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[8px] sm:text-xs md:text-sm text-[#0f0f23] truncate">
                      {myData?.student_name} (YOU)
                    </p>
                    <p className="text-[6px] sm:text-[8px] text-[#1a1a3e]">
                      {myData?.answers_submitted} ANSWERED
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm sm:text-lg md:text-2xl font-bold text-[#0f0f23]">
                      {myData?.score}
                    </p>
                    <p className="text-[6px] sm:text-[8px] text-[#1a1a3e]">
                      PTS
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4 sm:mt-6 bg-[#0f0f23] border-4 border-[#00ff41] p-2 sm:p-3"
            >
              <p className="text-[8px] sm:text-xs text-[#00ff41]">
                NEXT STAGE IN <span className="text-[#ff00ff]">6</span> SEC...
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (quizEnded) {
    const myRank = leaderboard.findIndex((p) => p.id === participantId);

    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f0f23] p-2 sm:p-4"
        style={{ fontFamily: '"Press Start 2P", cursive' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-[#1a1a3e] border-4 border-[#ff00ff] p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center mb-4"
            >
              <div className="text-5xl sm:text-7xl mb-4">🏆</div>
            </motion.div>
            <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-[#00ff41] mb-2 text-center">
              GAME COMPLETE!
            </h1>
            <p className="text-[8px] sm:text-xs text-[#00d4ff] mb-4 sm:mb-6 text-center">
              GREAT JOB, {participantName.toUpperCase()}!
            </p>

            <div className="bg-[#0f0f23] border-4 border-[#00ff41] p-4 sm:p-6 mb-4 sm:mb-6 text-center">
              <p className="text-[8px] sm:text-xs text-[#00d4ff] mb-2">
                FINAL SCORE
              </p>
              <p className="text-3xl sm:text-5xl font-bold text-[#00ff41] mb-2">
                {score}
              </p>
              <p className="text-xs sm:text-base font-semibold text-[#ff00ff] mb-1">
                RANK: #{myRank + 1}
              </p>
              <p className="text-[8px] sm:text-xs text-[#00d4ff]">
                {questions.length} STAGES CLEARED
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <h3 className="text-[10px] sm:text-sm font-bold text-[#00ff41] mb-3 text-center">
                FINAL RANKINGS
              </h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {leaderboard.slice(0, 10).map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-4 ${
                      participant.id === participantId
                        ? "bg-[#00ff41] border-[#00ff41]"
                        : "bg-[#0f0f23] border-[#00d4ff]"
                    }`}
                    style={{ imageRendering: "pixelated" }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#1a1a3e] border-2 border-[#ff00ff] flex items-center justify-center text-[#ff00ff] font-bold text-xs sm:text-sm">
                      {getRankEmoji(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-[8px] sm:text-xs truncate ${
                          participant.id === participantId
                            ? "text-[#0f0f23]"
                            : "text-[#00ff41]"
                        }`}
                      >
                        {participant.student_name}
                        {participant.id === participantId && (
                          <span className="ml-1 sm:ml-2">(YOU)</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-xl font-bold ${
                          participant.id === participantId
                            ? "text-[#0f0f23]"
                            : "text-[#ff00ff]"
                        }`}
                      >
                        {participant.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/quiz")}
              className="w-full bg-[#00ff41] border-4 border-[#00ff41] p-3 sm:p-4 text-[#0f0f23] font-bold text-xs sm:text-sm hover:bg-[#0f0f23] hover:text-[#00ff41] transition-colors"
              style={{ imageRendering: "pixelated" }}
            >
              BACK TO HOME
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div
      className="min-h-screen bg-[#0f0f23] p-2 sm:p-4 relative overflow-hidden"
      style={{ fontFamily: '"Press Start 2P", cursive' }}
    >
      {/* Pixel Grid Background */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)
        `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Animated Pixel Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-yellow-400"
            style={{
              boxShadow: "0 0 4px #fbbf24",
              imageRendering: "pixelated",
            }}
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
              opacity: Math.random(),
            }}
            animate={{
              opacity: [null, 1, 0.3, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto pt-4 sm:pt-8 relative z-10">
        {/* Sound Toggle - Pixel Style */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 bg-[#1a1a3e] border-4 border-[#00ff41] p-2 sm:p-3 hover:bg-[#00ff41] hover:text-[#0f0f23] transition-colors"
          style={{ imageRendering: "pixelated" }}
        >
          {soundEnabled ? (
            <span className="text-xs sm:text-sm">🔊</span>
          ) : (
            <span className="text-xs sm:text-sm">🔇</span>
          )}
        </button>
        {/* Header - Pixel Style */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1 w-full">
              <div className="bg-[#1a1a3e] border-4 border-[#00ff41] p-2 sm:p-3 mb-2">
                <p className="text-[8px] sm:text-xs text-[#00ff41] mb-1">
                  STAGE {currentQuestionIndex + 1}/{questions.length}
                </p>
                <div className="w-full bg-[#0f0f23] h-3 sm:h-4 border-2 border-[#00ff41] relative overflow-hidden">
                  <motion.div
                    className="bg-[#00ff41] h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a3e] border-4 border-[#ff00ff] p-2 sm:p-3 min-w-[100px] sm:min-w-[120px]">
              <p className="text-[8px] sm:text-xs text-[#ff00ff] mb-1">SCORE</p>
              <p className="text-lg sm:text-2xl font-bold text-[#00ff41]">
                {score}
              </p>
            </div>
          </div>
        </div>

        {/* Timer and Aura Points - Pixel Style */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div
            className={`bg-[#1a1a3e] border-4 p-3 sm:p-4 ${
              timeLeft <= 5
                ? "border-[#ff0000] animate-pulse"
                : "border-[#00d4ff]"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-3xl">⏱️</span>
              <div>
                <p className="text-[8px] sm:text-xs text-[#00d4ff] mb-1">
                  TIME
                </p>
                <p
                  className={`text-xl sm:text-3xl font-bold ${
                    timeLeft <= 5 ? "text-[#ff0000]" : "text-[#00ff41]"
                  }`}
                >
                  {timeLeft}s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a3e] border-4 border-[#ff00ff] p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-3xl">⚡</span>
              <div>
                <p className="text-[8px] sm:text-xs text-[#ff00ff] mb-1">
                  AURA
                </p>
                <p className="text-xl sm:text-3xl font-bold text-[#00ff41]">
                  {Math.round(auraPoints)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#1a1a3e] border-4 border-[#00ff41] p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
              <h1 className="text-xs sm:text-base md:text-xl font-bold text-[#00ff41] mb-6 sm:mb-8 leading-relaxed">
                {currentQuestion.question_text}
              </h1>

              {/* Question Image */}
              {currentQuestion.image_url && (
                <div className="mb-6 sm:mb-8">
                  <div className="relative w-full h-48 sm:h-64 md:h-80 bg-[#0f0f23] border-4 border-[#00d4ff] overflow-hidden">
                    <Image
                      src={currentQuestion.image_url}
                      alt="Question image"
                      fill
                      className="object-contain p-2"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {["A", "B", "C", "D"].map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={answered}
                    className={`p-3 sm:p-4 md:p-6 text-left transition-all border-4 ${getPixelOptionClass(
                      option
                    )}`}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    style={{ imageRendering: "pixelated" }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#0f0f23] border-2 border-[#00ff41] flex items-center justify-center font-bold text-[#00ff41] text-sm sm:text-base">
                        {option}
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-white flex-1 leading-relaxed">
                        {
                          currentQuestion[
                            `option_${option.toLowerCase()}` as keyof Question
                          ]
                        }
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 sm:mt-6 text-center bg-[#0f0f23] border-4 border-[#00ff41] p-3 sm:p-4"
                >
                  {selectedAnswer === currentQuestion.correct_answer ? (
                    <div>
                      <p className="text-sm sm:text-xl font-bold text-[#00ff41] mb-2">
                        CORRECT! 🎉
                      </p>
                      <p className="text-[10px] sm:text-sm text-[#00d4ff]">
                        +{Math.round(auraPoints)} POINTS
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm sm:text-xl font-bold text-[#ff0000] mb-2">
                        WRONG!
                      </p>
                      <p className="text-[10px] sm:text-sm text-[#00ff41]">
                        ANSWER: {currentQuestion.correct_answer}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
