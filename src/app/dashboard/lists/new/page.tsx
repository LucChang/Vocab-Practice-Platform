'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewListPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/word-lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to create list');

            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <ArrowLeft size={20} /> Back to Dashboard
            </Link>

            <div className="card">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '24px' }}>Create New Word List</h1>

                {error && (
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff4444', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>List Title</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., TOEIC Essential 500"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
                        <textarea
                            className="input"
                            style={{ minHeight: '100px', resize: 'vertical' }}
                            placeholder="What is this list about?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Tags</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., exam, business, travel (comma separated)"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <Link href="/dashboard" className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : (
                                <>
                                    <Save size={20} style={{ marginRight: '8px' }} />
                                    Create List
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
