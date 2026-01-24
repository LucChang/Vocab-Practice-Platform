'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Trophy, Brain, Sparkles } from 'lucide-react';
import { Loading } from '@/components/ui';

interface Question {
    id: string;
    type: string; // 'multiple-choice'
    prompt: string;
    optionsJson: string; // JSON string of string[]
    correctAnswer: string;
    explanation: string | null;
}

interface ParsedQuestion extends Omit<Question, 'optionsJson'> {
    options: string[];
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [id]);

    async function fetchQuestions() {
        try {
            const res = await fetch(`/api/word-lists/${id}/quiz`);
            if (res.ok) {
                const data: Question[] = await res.json();
                const parsed = data.map(q => ({
                    ...q,
                    options: JSON.parse(q.optionsJson)
                }));
                // Shuffle questions
                const shuffled = parsed.sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
            }
        } catch (error) {
            console.error('Failed to load questions', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerateQuestions() {
        setGenerating(true);
        try {
            const res = await fetch(`/api/word-lists/${id}/generate-questions`, {
                method: 'POST',
            });
            if (res.ok) {
                const data = await res.json();
                // fetchQuestions will update the UI
                await fetchQuestions();
            } else {
                alert('Failed to generate questions. Please make sure the list has words.');
            }
        } catch (error) {
            console.error('Failed to generate questions', error);
            alert('An error occurred.');
        } finally {
            setGenerating(false);
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
        // Reshuffle
        setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
    }

    if (loading) return <Loading />;

    if (questions.length === 0) {
        return (
            <div className="container" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <Link href={`/dashboard/lists/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '40px', alignSelf: 'flex-start' }}>
                    <ArrowLeft size={20} /> Back to List
                </Link>

                <div className="card" style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <div style={{ padding: '24px', borderRadius: '50%', background: 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', color: 'var(--primary)' }}>
                        <Brain size={48} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>Time to Quiz!</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
                            Generate AI-powered multiple choice questions based on the words in this list.
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateQuestions}
                        disabled={generating}
                        style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        {generating ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <Sparkles size={20} /> Generate Quiz
                            </>
                        )}
                    </button>
                    {generating && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>This might take a few seconds...</p>}
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

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button onClick={restartQuiz} className="btn btn-primary">
                            <RefreshCw size={18} style={{ marginRight: '8px' }} /> Try Again
                        </button>
                        <Link href={`/dashboard/lists/${id}`} className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            Back to List
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <Link href={`/dashboard/lists/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <ArrowLeft size={20} /> Quit Quiz
            </Link>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '6px', width: '100%', background: 'var(--surface)', borderRadius: '100px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px', lineHeight: 1.4 }}>
                    {currentQuestion.prompt}
                </h2>

                <div style={{ display: 'grid', gap: '16px' }}>
                    {currentQuestion.options.map((option, idx) => {
                        let style: React.CSSProperties = {
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        };

                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) {
                                style.borderColor = 'var(--success)';
                                style.background = 'rgba(var(--success-rgb), 0.1)';
                                style.color = 'var(--success)';
                            } else if (option === selectedOption) {
                                style.borderColor = 'var(--error)';
                                style.background = 'rgba(var(--error-rgb), 0.1)';
                                style.color = 'var(--error)';
                            } else {
                                style.opacity = 0.5;
                            }
                        } else {
                            // Hover effect would be done in CSS, but for inline styles we can just rely on basic cursor pointer
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
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', animation: 'slideUp 0.3s ease' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                {selectedOption === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {currentQuestion.explanation}
                            </div>
                        </div>
                        <button onClick={handleNext} className="btn btn-primary" style={{ width: '100%' }}>
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
