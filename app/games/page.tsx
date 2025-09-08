"use client"

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          STEM Games Platform
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Welcome to IgniteVidya Games - Your STEM Learning Adventure
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              🎮 Upper Primary
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Foundation STEM for Classes 6-7
            </p>
            <ul className="space-y-2 text-sm">
              <li>🧮 Number Detective Adventures</li>
              <li>📐 Geometry Builder Odisha</li>
              <li>📊 Data Handler Village</li>
              <li>🔬 Matter Explorer Lab</li>
              <li>🌱 Life Systems Detective</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              🎯 Secondary
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Applied STEM for Classes 8-10
            </p>
            <ul className="space-y-2 text-sm">
              <li>🏗 Engineering Challenge Odisha</li>
              <li>📈 Statistics Sports Arena</li>
              <li>⚡ Physics Power Plant</li>
              <li>🧪 Chemistry Lab Master</li>
              <li>🌿 Biodiversity Guardian</li>
              <li>💻 Code for Odisha</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-purple-600">
              🚀 Higher Secondary
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Advanced STEM for +1, +2
            </p>
            <ul className="space-y-2 text-sm">
              <li>🎯 Calculus in Action</li>
              <li>📐 3D Geometry Studio</li>
              <li>⚛ Physics Research Lab</li>
              <li>🧬 Chemistry Innovation Hub</li>
              <li>🔬 Biology Research Center</li>
              <li>🤖 AI Innovation Lab</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">🏛️ Built for Odisha Students</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              All games incorporate local Odisha context including Chilika Lake, 
              Jagannath Temple, Konark Sun Temple, and real-world challenges 
              facing the state. Learn STEM through familiar cultural contexts!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
