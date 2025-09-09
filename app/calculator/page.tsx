"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Calculator, ToggleLeft, ToggleRight } from "lucide-react"
import { useSoundEffects } from "@/hooks/useSoundEffects"

export default function StudentCalculator() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = useState(false)
  const [isScientific, setIsScientific] = useState(false)
  const [memory, setMemory] = useState(0)
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg')
  const [history, setHistory] = useState<string[]>([])
  
  const { playHoverSound, playClickSound, playSuccessSound } = useSoundEffects()

  const inputDigit = (digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit)
      setWaitingForNewValue(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.")
      setWaitingForNewValue(false)
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".")
    }
  }

  const clear = () => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNewValue(false)
  }

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
      
      // Add to history
      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${newValue}`
      setHistory(prev => [historyEntry, ...prev.slice(0, 4)])
    }

    setWaitingForNewValue(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue
      case "-":
        return firstValue - secondValue
      case "×":
        return firstValue * secondValue
      case "÷":
        return secondValue !== 0 ? firstValue / secondValue : 0
      case "%":
        return firstValue % secondValue
      case "^":
        return Math.pow(firstValue, secondValue)
      default:
        return secondValue
    }
  }

  const performScientificOperation = (func: string) => {
    const inputValue = parseFloat(display)
    let result: number

    switch (func) {
      case "sin":
        result = Math.sin(angleMode === 'deg' ? inputValue * Math.PI / 180 : inputValue)
        break
      case "cos":
        result = Math.cos(angleMode === 'deg' ? inputValue * Math.PI / 180 : inputValue)
        break
      case "tan":
        result = Math.tan(angleMode === 'deg' ? inputValue * Math.PI / 180 : inputValue)
        break
      case "log":
        result = Math.log10(inputValue)
        break
      case "ln":
        result = Math.log(inputValue)
        break
      case "√":
        result = Math.sqrt(inputValue)
        break
      case "x²":
        result = inputValue * inputValue
        break
      case "1/x":
        result = inputValue !== 0 ? 1 / inputValue : 0
        break
      case "π":
        result = Math.PI
        break
      case "e":
        result = Math.E
        break
      default:
        result = inputValue
    }

    setDisplay(String(result))
    setWaitingForNewValue(true)
    
    // Add to history
    const historyEntry = `${func}(${inputValue}) = ${result}`
    setHistory(prev => [historyEntry, ...prev.slice(0, 4)])
  }

  const handleMemory = (action: string) => {
    const currentValue = parseFloat(display)
    
    switch (action) {
      case "MC":
        setMemory(0)
        break
      case "MR":
        setDisplay(String(memory))
        setWaitingForNewValue(true)
        break
      case "M+":
        setMemory(memory + currentValue)
        break
      case "M-":
        setMemory(memory - currentValue)
        break
      case "MS":
        setMemory(currentValue)
        break
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Casio FX-991</h1>
          <p className="text-gray-600 dark:text-gray-400">Advanced scientific calculator with glass morphism design</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-2xl border border-white/20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl relative overflow-hidden">
              {/* Glass highlights */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/50 to-transparent dark:from-white/10 dark:to-transparent z-0 rounded-t-3xl"></div>
              <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-teal-300/20 dark:bg-teal-500/10 blur-2xl z-0"></div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-2xl z-0"></div>
              <div className="relative z-10">
              {/* Mode Toggle and Casio Branding */}
              <div className="flex flex-col mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 mr-2 uppercase tracking-wider">CASIO</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 italic">NATURAL-V.P.A.M.</span>
                  </div>
                  <div className="bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-sm">
                    <span className="text-xs font-medium text-teal-800 dark:text-teal-200">SOLAR POWERED</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${
                      !isScientific ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Basic
                    </span>
                    <Switch
                      checked={isScientific}
                      onCheckedChange={(checked) => {
                        playClickSound('secondary')
                        setIsScientific(checked)
                      }}
                      className="data-[state=checked]:bg-teal-600"
                    />
                    <span className={`text-sm font-medium ${
                      isScientific ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Scientific
                    </span>
                  </div>
                  
                  {isScientific && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={angleMode === 'deg' ? 'default' : 'outline'}
                        onClick={() => {
                          playClickSound('secondary')
                          setAngleMode('deg')
                        }}
                        onMouseEnter={() => playHoverSound('button')}
                        className={`text-xs ${angleMode === 'deg' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                      >
                        DEG
                      </Button>
                      <Button
                        size="sm"
                        variant={angleMode === 'rad' ? 'default' : 'outline'}
                        onClick={() => {
                          playClickSound('secondary')
                          setAngleMode('rad')
                        }}
                        onMouseEnter={() => playHoverSound('button')}
                        className={`text-xs ${angleMode === 'rad' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                      >
                        RAD
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Display - Casio style LCD */}
              <div className="mb-6">
                <div className="w-full h-20 bg-gradient-to-b from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-teal-950 rounded-lg flex flex-col justify-end p-3 text-2xl font-mono border border-teal-300/50 dark:border-teal-800/50 shadow-inner relative overflow-hidden">
                  {/* LCD dot pattern overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] [background-size:3px_3px] opacity-20 dark:opacity-30 pointer-events-none"></div>
                  
                  {/* Status indicators */}
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <div className="flex space-x-2">
                      <span className="text-teal-800 dark:text-teal-300 font-semibold">{angleMode.toUpperCase()}</span>
                      {memory !== 0 && <span className="text-amber-600 dark:text-amber-400 font-semibold">M</span>}
                    </div>
                    <span className="text-teal-800 dark:text-teal-300">{isScientific ? 'SCIENTIFIC' : 'BASIC'}</span>
                  </div>
                  
                  <div className="flex justify-end items-center">
                    <span className="text-slate-900 dark:text-emerald-200 font-digital">{display}</span>
                  </div>
                  
                  {operation && (
                    <div className="text-right text-sm text-teal-700 dark:text-teal-500 mt-1">
                      {previousValue} {operation}
                    </div>
                  )}
                </div>
              </div>

              {/* Memory and Special Functions - Casio style */}
              {isScientific && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      playClickSound('secondary')
                      handleMemory('MC')
                    }}
                    onMouseEnter={() => playHoverSound('button')}
                    className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400 h-10"
                  >
                    MC
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      playClickSound('secondary')
                      handleMemory('MR')
                    }}
                    onMouseEnter={() => playHoverSound('button')}
                    className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400 h-10"
                  >
                    MR
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleMemory('M+')} 
                    className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400 h-10"
                  >
                    M+
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleMemory('M-')} 
                    className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400 h-10"
                  >
                    M-
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleMemory('MS')} 
                    className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:border-amber-800/50 dark:text-amber-400 h-10"
                  >
                    MS
                  </Button>
                </div>
              )}

              {/* Scientific Functions Row - Casio style */}
              {isScientific && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('sin')} 
                    className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:border-sky-800/50 dark:text-sky-400 h-10"
                  >
                    sin
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('cos')} 
                    className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:border-sky-800/50 dark:text-sky-400 h-10"
                  >
                    cos
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('tan')} 
                    className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:border-sky-800/50 dark:text-sky-400 h-10"
                  >
                    tan
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('log')} 
                    className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:border-sky-800/50 dark:text-sky-400 h-10"
                  >
                    log
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('ln')} 
                    className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 dark:border-sky-800/50 dark:text-sky-400 h-10"
                  >
                    ln
                  </Button>
                </div>
              )}

              {/* Second Scientific Functions Row - Casio style */}
              {isScientific && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('√')} 
                    className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/50 dark:text-indigo-400 h-10"
                  >
                    √
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('x²')} 
                    className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/50 dark:text-indigo-400 h-10"
                  >
                    x²
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('1/x')} 
                    className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/50 dark:text-indigo-400 h-10"
                  >
                    1/x
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('π')} 
                    className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/50 dark:text-indigo-400 h-10"
                  >
                    π
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => performScientificOperation('e')} 
                    className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:border-indigo-800/50 dark:text-indigo-400 h-10"
                  >
                    e
                  </Button>
                </div>
              )}

              {/* Main Calculator Buttons - Casio style */}
              <div className="grid grid-cols-4 gap-3">
                {/* Row 1 */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    playClickSound('secondary')
                    clear()
                  }}
                  onMouseEnter={() => playHoverSound('button')}
                  className="col-span-2 bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:border-rose-800/50 dark:text-rose-400 h-12"
                >
                  AC
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => performOperation('%')}
                  className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:border-emerald-800/50 dark:text-emerald-400 h-12"
                >
                  %
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => performOperation('÷')}
                  className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:border-emerald-800/50 dark:text-emerald-400 h-12"
                >
                  ÷
                </Button>

                {/* Row 2 */}
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    playClickSound('primary')
                    inputDigit('7')
                  }}
                  onMouseEnter={() => playHoverSound('button')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  7
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('8')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  8
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('9')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  9
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => performOperation('×')}
                  className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:border-emerald-800/50 dark:text-emerald-400 h-12"
                >
                  ×
                </Button>

                {/* Row 3 */}
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('4')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  4
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('5')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  5
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('6')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  6
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => performOperation('-')}
                  className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:border-emerald-800/50 dark:text-emerald-400 h-12"
                >
                  -
                </Button>

                {/* Row 4 */}
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('1')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  1
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('2')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  2
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('3')}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  3
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => performOperation('+')}
                  className="bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:border-emerald-800/50 dark:text-emerald-400 h-12"
                >
                  +
                </Button>

                {/* Row 5 */}
                <Button 
                  variant="secondary" 
                  onClick={() => inputDigit('0')} 
                  className="col-span-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  0
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={inputDecimal}
                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm h-12"
                >
                  .
                </Button>
                <Button
                  onClick={() => {
                    playSuccessSound()
                    performOperation('=')
                  }}
                  onMouseEnter={() => playHoverSound('button')}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 shadow-md h-12"
                >
                  =
                </Button>

                {/* Power operation for scientific mode */}
                {isScientific && (
                  <Button 
                    variant="outline" 
                    onClick={() => performOperation('^')} 
                    className="col-span-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 border-violet-200 text-violet-700 dark:from-violet-950/40 dark:to-fuchsia-950/40 dark:hover:from-violet-900/50 dark:hover:to-fuchsia-900/50 dark:border-violet-800/50 dark:text-violet-400 h-12 mt-2"
                  >
                    xʸ (Power)
                  </Button>
                )}
              </div>
              
              {/* Casio branding at bottom */}
              <div className="flex justify-between items-center mt-4 px-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">FX-991ES PLUS</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">NATURAL DISPLAY</div>
              </div>
            </div>
            </Card>
          </div>

          {/* History & Info Panel */}
          <div className="space-y-6">
            {/* Calculator Info */}
            <Card className="p-6 shadow-xl border border-white/20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl relative overflow-hidden">
              {/* Glass highlights */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/50 to-transparent dark:from-white/10 dark:to-transparent z-0 rounded-t-3xl"></div>
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-2xl z-0"></div>
              <div className="relative z-10">
              <h3 className="text-xl font-bold text-teal-900 dark:text-teal-400 mb-4 flex items-center">
                <span className="w-2 h-5 bg-teal-500 dark:bg-teal-400 mr-2 rounded-sm"></span>
                Calculator Info
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mode</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {isScientific ? 'Scientific' : 'Basic'}
                  </span>
                </div>
                
                {isScientific && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Angle Mode</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {angleMode.toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Memory</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {memory}
                  </span>
                </div>
              </div>
              </div>
            </Card>

            {/* History */}
            <Card className="p-6 shadow-xl border border-white/20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl relative overflow-hidden">
              {/* Glass highlights */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/50 to-transparent dark:from-white/10 dark:to-transparent z-0 rounded-t-3xl"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-teal-300/20 dark:bg-teal-500/10 blur-2xl z-0"></div>
              <div className="relative z-10">
              <h3 className="text-xl font-bold text-teal-900 dark:text-teal-400 mb-4 flex items-center">
                <span className="w-2 h-5 bg-teal-500 dark:bg-teal-400 mr-2 rounded-sm"></span>
                History
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No calculations yet
                  </p>
                ) : (
                  history.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg text-sm font-mono text-slate-900 dark:text-teal-100 border border-teal-100/30 dark:border-teal-900/30 shadow-sm mb-2"
                    >
                      {entry}
                    </div>
                  ))
                )}
              </div>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6 shadow-xl border border-white/20 bg-gradient-to-br from-teal-50/80 to-indigo-50/80 dark:from-teal-900/20 dark:to-indigo-900/20 backdrop-blur-md rounded-3xl relative overflow-hidden">
              {/* Glass highlights */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 dark:to-transparent z-0 rounded-t-3xl"></div>
              <div className="relative z-10">
              <h3 className="text-lg font-bold text-teal-900 dark:text-teal-400 mb-3 flex items-center">
                <span className="w-2 h-4 bg-teal-500 dark:bg-teal-400 mr-2 rounded-sm"></span>
                Quick Tips
              </h3>
              
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="flex items-center"><span className="text-teal-600 dark:text-teal-400 mr-1 text-lg">•</span> Toggle between Basic and Scientific modes</p>
                <p className="flex items-center"><span className="text-teal-600 dark:text-teal-400 mr-1 text-lg">•</span> Scientific mode includes trigonometric functions</p>
                <p className="flex items-center"><span className="text-teal-600 dark:text-teal-400 mr-1 text-lg">•</span> Change angle mode (DEG/RAD) for trig functions</p>
                <p className="flex items-center"><span className="text-teal-600 dark:text-teal-400 mr-1 text-lg">•</span> Use memory functions (MC, MR, M+, M-, MS)</p>
                <p className="flex items-center"><span className="text-teal-600 dark:text-teal-400 mr-1 text-lg">•</span> View calculation history on the right</p>
              </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
