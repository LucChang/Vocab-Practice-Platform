'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Brain, TrendingUp, MoreVertical, Trash2, Edit, X, Check } from 'lucide-react';
import { Loading } from '@/components/ui';

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

    // State for managing local UI actions
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [editingListId, setEditingListId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; description: string }>({ title: '', description: '' });

    useEffect(() => {
        fetchLists();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuOpenId) {
                // If the click is not on a menu button, close the menu
                const target = event.target as HTMLElement;
                if (!target.closest('.menu-trigger') && !target.closest('.menu-dropdown')) {
                    setMenuOpenId(null);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpenId]);

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

    function handleStartEdit(list: WordList) {
        setEditingListId(list.id);
        setEditForm({
            title: list.title,
            description: list.description || '',
        });
        setMenuOpenId(null);
    }

    function handleCancelEdit() {
        setEditingListId(null);
        setEditForm({ title: '', description: '' });
    }

    async function handleSaveEdit(id: string) {
        try {
            const res = await fetch(`/api/word-lists/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setEditingListId(null);
                fetchLists(); // Refresh data
            } else {
                alert('Failed to update list');
            }
        } catch (error) {
            console.error('Failed to update list', error);
            alert('An error occurred');
        }
    }

    async function handleDeleteList(id: string) {
        if (!confirm('Are you sure you want to delete this list? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/word-lists/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMenuOpenId(null);
                fetchLists(); // Refresh data
            } else {
                alert('Failed to delete list');
            }
        } catch (error) {
            console.error('Failed to delete list', error);
            alert('An error occurred');
        }
    }

    if (loading) return <Loading />;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back! Ready to learn some new words?</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/dashboard/quiz" className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <Brain size={20} style={{ marginRight: '8px' }} />
                        Global Quiz
                    </Link>
                    <Link href="/dashboard/lists/new" className="btn btn-primary">
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        New List
                    </Link>
                </div>
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

                {wordLists.length === 0 ? (
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
                        {wordLists.map((list) => {
                            const isEditing = editingListId === list.id;

                            if (isEditing) {
                                return (
                                    <div key={list.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input
                                                className="input"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="List Title"
                                                autoFocus
                                            />
                                        </div>
                                        <textarea
                                            className="input"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Description..."
                                            style={{ minHeight: '60px', resize: 'vertical' }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="btn btn-ghost" onClick={handleCancelEdit}>
                                                <X size={18} style={{ marginRight: '4px' }} /> Cancel
                                            </button>
                                            <button className="btn btn-primary" onClick={() => handleSaveEdit(list.id)}>
                                                <Check size={18} style={{ marginRight: '4px' }} /> Save
                                            </button>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link href={`/dashboard/lists/${list.id}`} key={list.id} className="card" style={{ position: 'relative', transition: 'transform 0.2s', cursor: 'pointer', display: 'block' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, wordBreak: 'break-word' }}>{list.title}</h3>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="menu-trigger"
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setMenuOpenId(menuOpenId === list.id ? null : list.id);
                                                }}
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {menuOpenId === list.id && (
                                                <div
                                                    className="menu-dropdown"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: 0,
                                                        background: 'var(--surface)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px',
                                                        zIndex: 10,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        minWidth: '150px',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStartEdit(list); }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            padding: '10px 16px', width: '100%', border: 'none', background: 'none',
                                                            cursor: 'pointer', textAlign: 'left', color: 'var(--foreground)',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                                                    >
                                                        <Edit size={16} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteList(list.id); }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '8px',
                                                            padding: '10px 16px', width: '100%', border: 'none', background: 'none',
                                                            cursor: 'pointer', textAlign: 'left', color: 'var(--error)',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,50,50,0.1)')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
