# Vocab Learning Platform (VocaLab)

A modern, AI-powered vocabulary learning application designed to help users build and master their personal word lists. Built with Next.js 15, React 19, and Google's Gemini AI.

## 🌟 Features

- **AI-Powered Word Lookup**: Automatically fetch meanings, parts of speech, and example sentences using Google Gemini AI.
- **Smart Word Lists**: Organize your vocabulary into custom lists.
- **Interactive Dashboard**: Track your progress and manage your collections.
- **Quiz Generation**: (In Progress) Generate practice questions based on your word lists.
- **Modern UI**: Features a beautiful Glassmorphism design system with smooth animations and responsive layout.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules / Global CSS with CSS Variables (Glassmorphism design), `clsx`, `tailwind-merge`
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **AI Integration**: Google Generative AI (Gemini)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google AI Studio API Key (for Gemini)
- A PostgreSQL database (local or hosted, e.g., Supabase, Neon)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Vocab_Learning_Platform
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add the following:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/vocalab?schema=public"
    GEMINI_API_KEY="your_gemini_api_key_here"
    ```

4.  **Initialize the Database**
    Run the Prisma migration to set up your database schema:
    ```bash
    npx prisma migrate dev
    ```

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/             # Backend API endpoints (AI lookup, word lists)
│   ├── dashboard/       # User dashboard and list management
│   └── ...
├── components/          # Reusable UI components
│   └── ui/              # Core design system (Button, Card, Input)
├── lib/                 # Utilities and library configurations (Prisma, Utils)
└── ...
```

## 🎨 Design System

The project uses a custom Glassmorphism design system defined in `globals.css`.
- **Colors**: HSL-based color variables for easy theming.
- **Components**: Reusable UI components located in `src/components/ui`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
