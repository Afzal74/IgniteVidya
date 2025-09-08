"use client"

import { gameClassData } from "@/lib/data/games-data"

export default function TestGamesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          STEM Games Platform
        </h1>
        
        <div className="space-y-8">
          {gameClassData.map((classLevel) => (
            <div key={classLevel.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">
                {classLevel.name} - {classLevel.subtitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {classLevel.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classLevel.subjects.map((subject) => (
                  <div key={subject.id} className="border rounded p-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-3">
                      <span className="text-2xl">{subject.emoji}</span>
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {subject.games.length} games available
                    </p>
                    
                    <div className="space-y-2">
                      {subject.games.map((game) => (
                        <div key={game.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{game.emoji}</span>
                            <span className="font-medium text-sm">{game.title}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {game.description}
                          </p>
                          <div className="flex justify-between items-center mt-2 text-xs">
                            <span>{game.estimatedTime}min</span>
                            <span>{game.auraPoints} pts</span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                              {game.difficultyLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
