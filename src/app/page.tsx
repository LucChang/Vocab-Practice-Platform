import Link from 'next/link';

export default function Home() {
  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <main className="animate-fade-in">
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          VocaLab
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px' }}>
          Master your vocabulary with AI-powered personalized quizzes and tracking.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Get Started
          </Link>
          <Link href="/about" className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
            Learn More
          </Link>
        </div>
      </main>

      <footer style={{ position: 'absolute', bottom: '20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        © 2025 VocaLab. Powered by Gemini 3.0
      </footer>
    </div>
  );
}
