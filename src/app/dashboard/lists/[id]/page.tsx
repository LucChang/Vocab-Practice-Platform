'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Volume2 } from 'lucide-react';
import { Loading } from '@/components/ui';



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
    const [filling, setFilling] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [editingWordId, setEditingWordId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Word>>({});


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

    async function handleGenerateQuestions() {
        if (!list || list.words.length === 0) {
            alert('Add some words first!');
            return;
        }
        setGenerating(true);
        try {
            const res = await fetch(`/api/word-lists/${id}/generate-questions`, {
                method: 'POST',
            });
            if (res.ok) {
                const data = await res.json();
                alert(`Successfully generated ${data.count} questions!`);
            } else {
                alert('Failed to generate questions. Please try again.');
            }
        } catch (error) {
            console.error('Failed to generate questions', error);
            alert('An error occurred.');
        } finally {
            setGenerating(false);
        }
    }

    async function handleAutoFill() {
        if (!newWord.word) return;
        setFilling(true);
        try {
            const res = await fetch('/api/ai/word-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: newWord.word }),
            });

            if (res.ok) {
                const data = await res.json();
                setNewWord(prev => ({
                    ...prev,
                    meaning: data.meaning || prev.meaning,
                    partOfSpeech: data.partOfSpeech || prev.partOfSpeech,
                    example: data.example || prev.example,
                }));
            } else {
                alert('Failed to auto-fill. Please check your API key or try again.');
            }
        } catch (error) {
            console.error('Auto-fill failed', error);
        } finally {
            setFilling(false);
        }
    }

    async function examine_fill() {
        if (!list || list.words.length === 0) return;
        const incompleteWords = list.words.filter(w => !w.meaning?.trim() || !w.partOfSpeech?.trim() || !w.example?.trim());
        console.log(incompleteWords);
        if (incompleteWords.length === 0) {
            alert('All words are already filled!');
            return;
        }

        setFilling(true);
        let failedCount = 0;

        try {
            // Batch lookup
            const res = await fetch('/api/ai/batch-word-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ words: incompleteWords.map(w => w.word) }),
            });

            if (res.ok) {
                const results = await res.json();
                console.log('Batch API results:', results);

                // Process results
                for (const word of incompleteWords) {
                    // Find the result for this word by case-insensitive matching
                    const data = results.find((r: any) => r.word.toLowerCase() === word.word.toLowerCase());

                    if (data) {
                        console.log(`Updating ${word.word} with:`, data);
                        // Update the word in the database
                        const updateRes = await fetch(`/api/words/${word.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                meaning: !word.meaning ? data.meaning : word.meaning,
                                partOfSpeech: !word.partOfSpeech ? data.partOfSpeech : word.partOfSpeech,
                                example: !word.example ? data.example : word.example,
                            }),
                        });

                        if (!updateRes.ok) {
                            console.error(`Failed to update DB for ${word.word}`);
                            failedCount++;
                        }
                    } else {
                        console.warn(`No AI result found for ${word.word}`);
                        failedCount++;
                    }
                }

                fetchList(); // Refresh the list

                if (failedCount > 0) {
                    alert(`Finished with ${failedCount} errors. Some words could not be updated.`);
                }
            } else {
                const errData = await res.json();
                console.error('Batch lookup failed:', errData);
                alert(`Failed to batch lookup words via AI: ${errData.details || errData.error || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Examine fill failed', error);
            alert('An error occurred during auto-fill.');
        } finally {
            setFilling(false);
        }
    }

    function handleStartEdit(word: Word) {
        setEditingWordId(word.id);
        setEditForm({
            word: word.word,
            meaning: word.meaning,
            partOfSpeech: word.partOfSpeech,
            example: word.example,
        });
    }

    function handleCancelEdit() {
        setEditingWordId(null);
        setEditForm({});
    }

    async function handleSaveEdit(wordId: string) {
        try {
            const res = await fetch(`/api/words/${wordId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setEditingWordId(null);
                setEditForm({});
                fetchList(); // Refresh list
            } else {
                alert('Failed to save changes');
            }
        } catch (error) {
            console.error('Failed to update word', error);
            alert('An error occurred while saving.');
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

    if (loading) return <Loading />;
    if (!list) return <div className="container" style={{ padding: '40px' }}>List not found</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{list.title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{list.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-accent"
                        onClick={examine_fill}
                        disabled={filling}
                    >
                        {filling ? '...' : '✨'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateQuestions}
                        disabled={generating || list.words.length === 0}
                    >
                        {generating ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
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
                                <div key={word.id} className="card">
                                    {editingWordId === word.id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <input
                                                    className="input"
                                                    value={editForm.word || ''}
                                                    onChange={e => setEditForm(prev => ({ ...prev, word: e.target.value }))}
                                                    placeholder="Word"
                                                />
                                                <input
                                                    className="input"
                                                    value={editForm.partOfSpeech || ''}
                                                    onChange={e => setEditForm(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                                                    placeholder="Part of Speech"
                                                />
                                            </div>
                                            <input
                                                className="input"
                                                value={editForm.meaning || ''}
                                                onChange={e => setEditForm(prev => ({ ...prev, meaning: e.target.value }))}
                                                placeholder="Meaning"
                                            />
                                            <input
                                                className="input"
                                                value={editForm.example || ''}
                                                onChange={e => setEditForm(prev => ({ ...prev, example: e.target.value }))}
                                                placeholder="Example"
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button className="btn" onClick={handleCancelEdit} style={{ fontSize: '0.875rem', padding: '8px 16px' }}>Cancel</button>
                                                <button className="btn btn-primary" onClick={() => handleSaveEdit(word.id)} style={{ fontSize: '0.875rem', padding: '8px 16px' }}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => handleStartEdit(word)}
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit_note</span>
                                                </button>
                                                <button
                                                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteWord(word.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Word (e.g. Ephemeral)"
                                        value={newWord.word}
                                        onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', padding: '12px' }}
                                        onClick={handleAutoFill}
                                        disabled={filling || !newWord.word}
                                        title="Auto-fill with AI"
                                    >
                                        {filling ? '...' : '✨'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Meaning (e.g. Lasting for a short time)"
                                    value={newWord.meaning}
                                    onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
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
