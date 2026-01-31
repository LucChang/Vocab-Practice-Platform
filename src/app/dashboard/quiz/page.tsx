'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, CheckCircle, XCircle, RefreshCw, Trophy, Settings } from 'lucide-react';
import { Loading } from '@/components/ui';

interface Question {
    id: string;
    type: string;
    prompt: string;
    options: string[];
    correctAnswer: string;
}

export default function GeneralQuizPage() {
    const [mode, setMode] = useState<'en-zh' | 'zh-en' | null>(null);
    const [useAI, setUseAI] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function startQuiz(selectedMode: 'en-zh' | 'zh-en') {
        setMode(selectedMode);
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/quiz/generate?mode=${selectedMode}&count=10&ai=${useAI}`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            } else {
                const err = await res.json();
                setError(err.error || 'Failed to load quiz');
                setMode(null); // Go back to selection
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred');
            setMode(null);
        } finally {
            setLoading(false);
        }
    }

    function handleOptionClick(option: string) {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    }

    function handleNext() {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    }

    function restartQuiz() {
        setScore(0);
        setCurrentIndex(0);
        setShowResults(false);
        setSelectedOption(null);
        setIsAnswered(false);
        setMode(null); // Go back to mode selection
        setQuestions([]);
    }

    if (loading) return <Loading />;

    // Mode Selection Screen
    if (!mode) {
        return (
            <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '40px' }}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>

                <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '24px', display: 'inline-flex', padding: '20px', borderRadius: '50%', background: 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', color: 'var(--primary)' }}>
                        <Brain size={48} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px' }}>General Vocabulary Quiz</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                        Test your knowledge across all your word lists. Select a mode to begin.
                    </p>

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(255,50,50,0.1)', color: 'var(--error)', borderRadius: '8px', marginBottom: '24px' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px', padding: '12px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '100px' }}>
                            <div style={{ position: 'relative', width: '40px', height: '24px' }}>
                                <input
                                    type="checkbox"
                                    checked={useAI}
                                    onChange={(e) => setUseAI(e.target.checked)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: useAI ? 'var(--primary)' : '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
                                <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: useAI ? '20px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                            </div>
                            <span style={{ fontSize: '0.95rem', userSelect: 'none' }}>
                                Enable AI Distractors <span style={{ fontSize: '0.8em', color: 'var(--primary)', marginLeft: '4px' }}>(Smarter Options)</span>
                            </span>
                        </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
                        <button
                            className="card card-hover"
                            onClick={() => startQuiz('en-zh')}
                            style={{ padding: '32px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>English → Chinese</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Match words to their meanings</p>
                        </button>

                        <button
                            className="card card-hover"
                            onClick={() => startQuiz('zh-en')}
                            style={{ padding: '32px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Chinese → English</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Match meanings to their words</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div className="card" style={{ padding: '40px' }}>
                    <div style={{ marginBottom: '24px', color: 'var(--primary)' }}>
                        <Trophy size={64} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>Quiz Complete!</h1>
                    <div style={{ fontSize: '1.25rem', marginBottom: '32px', color: 'var(--text-muted)' }}>
                        You scored <strong style={{ color: 'var(--foreground)' }}>{score} / {questions.length}</strong> ({percentage}%)
                    </div>

                    <button onClick={restartQuiz} className="btn btn-primary">
                        <RefreshCw size={18} style={{ marginRight: '8px' }} /> Start New Quiz
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    // Quiz Interface
    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => { if (confirm('Quit quiz?')) restartQuiz(); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                >
                    <ArrowLeft size={20} /> Quit
                </button>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Mode: {mode === 'en-zh' ? 'English → Chinese' : 'Chinese → English'}
                </div>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
            </div>

            <div style={{ height: '6px', width: '100%', background: 'var(--surface)', borderRadius: '100px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px', lineHeight: 1.4, textAlign: 'center' }}>
                    {currentQuestion.prompt}
                </h2>

                <div style={{ display: 'grid', gap: '16px' }}>
                    {currentQuestion.options.map((option, idx) => {
                        let style: React.CSSProperties = {
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            minHeight: '60px'
                        };

                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) {
                                style.borderColor = 'var(--success)'; // You might need to define this in CSS if not present, assume green
                                style.background = 'rgba(100, 255, 100, 0.1)';
                                style.color = '#4ade80';
                            } else if (option === selectedOption) {
                                style.borderColor = 'var(--error)';
                                style.background = 'rgba(255, 100, 100, 0.1)';
                                style.color = '#f87171';
                            } else {
                                style.opacity = 0.5;
                            }
                        } else {
                            // hover logic is typically CSS, harder with inline styles. Rely on basic behavior.
                        }

                        return (
                            <button
                                key={idx}
                                style={style}
                                onClick={() => handleOptionClick(option)}
                                disabled={isAnswered}
                            >
                                <span>{option}</span>
                                {isAnswered && option === currentQuestion.correctAnswer && <CheckCircle size={20} />}
                                {isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer && <XCircle size={20} />}
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', animation: 'slideUp 0.3s ease', display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleNext} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
