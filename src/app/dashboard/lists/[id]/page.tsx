'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Volume2 } from 'lucide-react';

interface Word {
    id: string;
    word: string;
    meaning: string;
    partOfSpeech: string | null;
    example: string | null;
}

interface WordList {
    id: string;
    title: string;
    description: string | null;
    words: Word[];
}

export default function WordListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [list, setList] = useState<WordList | null>(null);
    const [loading, setLoading] = useState(true);
    const [newWord, setNewWord] = useState({ word: '', meaning: '', partOfSpeech: '', example: '' });
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchList();
    }, [id]);

    async function fetchList() {
        try {
            const res = await fetch(`/api/word-lists/${id}`);
            if (res.ok) {
                const data = await res.json();
                setList(data);
            }
        } catch (error) {
            console.error('Failed to load list', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteWord(wordId: string) {
        if (!confirm('Are you sure you want to delete this word?')) return;

        try {
            const res = await fetch(`/api/words/${wordId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchList();
            }
        } catch (error) {
            console.error('Failed to delete word', error);
        }
    }

    async function handleAddWord(e: React.FormEvent) {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await fetch(`/api/word-lists/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWord),
            });

            if (res.ok) {
                setNewWord({ word: '', meaning: '', partOfSpeech: '', example: '' });
                fetchList(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to add word', error);
        } finally {
            setAdding(false);
        }
    }

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;
    if (!list) return <div className="container" style={{ padding: '40px' }}>List not found</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{list.title}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{list.description}</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                {/* Word List */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '20px' }}>Words ({list.words.length})</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {list.words.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No words yet. Add some on the right!
                            </div>
                        ) : (
                            list.words.map((word) => (
                                <div key={word.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{word.word}</span>
                                            {word.partOfSpeech && (
                                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{word.partOfSpeech}</span>
                                            )}
                                        </div>
                                        <div style={{ marginBottom: '4px' }}>{word.meaning}</div>
                                        {word.example && (
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ex: {word.example}</div>
                                        )}
                                    </div>
                                    <button
                                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        onClick={() => handleDeleteWord(word.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add Word Form */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Add New Word</h3>
                        <form onSubmit={handleAddWord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Word (e.g. Ephemeral)"
                                    value={newWord.word}
                                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Meaning (e.g. Lasting for a short time)"
                                    value={newWord.meaning}
                                    onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Part of Speech"
                                    value={newWord.partOfSpeech}
                                    onChange={(e) => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Example Sentence"
                                    value={newWord.example}
                                    onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={adding}>
                                {adding ? 'Adding...' : (
                                    <>
                                        <Plus size={18} style={{ marginRight: '8px' }} /> Add Word
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
