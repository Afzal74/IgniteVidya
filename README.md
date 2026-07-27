# IgniteVidya Vault 🎓

A comprehensive academic companion application for IgniteVidya (Visvesvaraya Technological University) students.

## ✨ Features

- **📚 Study Materials**: Access notes, question papers, and lab programs
- **🧮 CGPA Calculator**: Calculate SGPA and CGPA with IgniteVidya's grading system
- **💡 Project Ideas**: Browse and discover engineering project concepts
- **🤖 AI Chat**: Interactive chat with IgniteVidya Companion and Afzal
- **🔍 Smart Search**: Find content across all sections
- **📱 Responsive Design**: Works perfectly on mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash script
   git clone <repository-url>
   cd IgniteVidya-vault
   ```

2. **Install dependencies**
   ```bash script
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI API Key (Required for chat features)
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

This application uses a **local JSON database** for data persistence. No external database setup required!

### Database Structure
- `data/notes.json` - Study notes and materials
- `data/question-papers.json` - Question papers and IgniteVidya official papers
- `data/lab-programs.json` - Programming lab solutions
- `data/projects.json` - Project ideas and concepts

### Adding Content
You can add new content by:
1. **Directly editing JSON files** in the `data/` directory
2. **Using the API endpoints** (POST requests to `/api/notes`, `/api/lab-programs`, etc.)
3. **Through the web interface** (upload forms in the respective sections)

## 🔧 API Endpoints

### Notes
- `GET /api/notes` - Fetch all notes with optional filters
- `POST /api/notes` - Add a new note

### Lab Programs
- `GET /api/lab-programs` - Fetch all lab programs with optional filters
- `POST /api/lab-programs` - Add a new lab program

### Projects
- `GET /api/projects` - Fetch all projects with optional filters
- `POST /api/projects` - Add a new project

### IgniteVidya Papers
- `GET /api/vtu-papers` - Fetch IgniteVidya official question papers

### Chat Features
- `POST /api/chat` - Terminal-style chat
- `POST /api/vtu-companion` - IgniteVidya Companion AI chat
- `POST /api/afzal-chat` - Chat with Afzal (the developer)

## 🎯 Getting Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## 📁 Project Structure

```
IgniteVidya-vault/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── notes/             # Notes page
│   ├── lab-programs/      # Lab programs page
│   ├── projects/          # Projects page
│   └── ...
├── components/            # React components
├── data/                  # JSON database files
├── lib/                   # Utility functions
└── public/               # Static assets
```

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Database**: Local JSON files with Node.js file system
- **AI**: Google Gemini API
- **Icons**: Lucide React

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Afzal** - CS Student & Developer
- Building tools for IgniteVidya community
- Passionate about helping fellow students

---

**IgniteVidya Vault** - Your Academic Companion 🎓
