'use client';

import React, { useState } from 'react';
import type { CrudEntry } from './crud-data-access';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export function CrudCreate({ onCreate }: { onCreate: (title: string, content: string) => Promise<void> }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    return (
        <div className="card">
            <div className="card-content p-4 space-y-4">
                <h3 className="text-lg font-medium">Create New Entry</h3>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Title"
                        className="w-full p-2 border rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Content"
                        rows={3}
                        className="w-full p-2 border rounded"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary w-full"
                    onClick={() => {
                        if (title && content) {
                            onCreate(title, content).then(() => {
                                setTitle('');
                                setContent('');
                            });
                        }
                    }}
                    disabled={!title || !content}
                >
                    Create Entry
                </button>
            </div>
        </div>
    );
}

export function CrudList({
    entries,
    onUpdate,
    onDelete,
}: {
    entries: CrudEntry[];
    onUpdate: (id: string, content: string) => void;
    onDelete: (id: string) => void;
}) {
    if (entries.length === 0) {
        return (
            <div className="card">
                <div className="card-content text-center py-12">
                    <div className="space-y-2">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                            <Edit className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No entries yet</h3>
                        <p className="text-muted-foreground">Create your first entry to get started!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Your Entries ({entries.length})</h3>
            </div>
            <div className="card-content">
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <CrudCard key={entry.id} entry={entry} onUpdate={onUpdate} onDelete={onDelete} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export const CrudCard: React.FC<{
    entry: CrudEntry;
    onUpdate: (id: string, content: string) => void;
    onDelete: (id: string) => void;
}> = ({
    entry,
    onUpdate,
    onDelete,
}) => {
        const [editing, setEditing] = useState(false);

        if (editing) {
            return <CrudEdit entry={entry} onUpdate={onUpdate} onCancel={() => setEditing(false)} />;
        }

        return (
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50 hover:border-border transition-colors">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Entry #{entry.id}</p>
                        <p className="text-foreground break-words">{entry.content}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            className="text-primary hover:text-primary/80 transition-colors p-1"
                            onClick={() => setEditing(true)}
                            title="Edit entry"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            className="text-destructive hover:text-destructive/80 transition-colors p-1"
                            onClick={() => onDelete(entry.id)}
                            title="Delete entry"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

export function CrudEdit({
    entry,
    onUpdate,
    onCancel,
}: {
    entry: CrudEntry;
    onUpdate: (id: string, content: string) => void;
    onCancel: () => void;
}) {
    const [content, setContent] = useState(entry.content);

    return (
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Entry #{entry.id}</label>
                    <textarea
                        className="min-h-[100px] resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        className="flex-1"
                        onClick={() => onUpdate(entry.id, content)}
                        disabled={!content.trim() || content === entry.content}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                    <button
                        className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                        onClick={onCancel}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
