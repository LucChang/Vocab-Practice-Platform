'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Brain, TrendingUp, MoreVertical } from 'lucide-react';

interface WordList {
    id: string;
    title: string;
    description: string | null;
    tags: string | null;
    createdAt: string;
    _count: {
        words: number;
        questions: number;
    };
}

export default function Dashboard() {
    const [wordLists, setWordLists] = useState<WordList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLists() {
            try {
                const res = await fetch('/api/word-lists');
                if (res.ok) {
                    const data = await res.json();
                    setWordLists(data);
                }
            } catch (error) {
                console.error('Failed to load lists', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLists();
    }, []);

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back! Ready to learn some new words?</p>
                </div>
                <Link href="/dashboard/lists/new" className="btn btn-primary">
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    New List
                </Link>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {/* Stats Cards */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', color: 'var(--primary)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{wordLists.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Lists</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(var(--secondary-h), var(--secondary-s), var(--secondary-l), 0.1)', color: 'var(--secondary)' }}>
                        <Brain size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>0</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Words Learned</div>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(var(--accent-h), var(--accent-s), var(--accent-l), 0.1)', color: 'var(--accent)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>0%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Score</div>
                    </div>
                </div>
            </div>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Your Word Lists</h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</div>
                ) : wordLists.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                            <BookOpen size={48} style={{ opacity: 0.5 }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>No lists yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Create your first word list to start generating quizzes.</p>
                        <Link href="/dashboard/lists/new" className="btn btn-primary">Create List</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {wordLists.map((list) => (
                            <Link href={`/dashboard/lists/${list.id}`} key={list.id} className="card" style={{ position: 'relative', transition: 'transform 0.2s', cursor: 'pointer', display: 'block' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{list.title}</h3>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); /* TODO: Dropdown */ }}>
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', minHeight: '40px' }}>
                                    {list.description || 'No description provided.'}
                                </p>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <BookOpen size={16} /> {list._count.words} words
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Brain size={16} /> {list._count.questions} quizzes
                                    </span>
                                </div>
                                {list.tags && (
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {list.tags.split(',').map(tag => (
                                            <span key={tag} style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.1)' }}>
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
