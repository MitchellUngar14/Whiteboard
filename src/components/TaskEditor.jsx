import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

export function TaskEditor({ task, onSave, onDelete, onCancel }) {
    const [type, setType] = useState(task.type || 'task');
    const [description, setDescription] = useState(task.description || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSave({
            ...task,
            type,
            title: formData.get('title'),
            description: description, // Use state directly
            color: formData.get('color')
        });
    };



    const handleTypeChange = (newType) => {
        setType(newType);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
        }} onClick={onCancel}>
            <div
                style={{
                    backgroundColor: 'var(--bg-2)',
                    padding: '24px',
                    borderRadius: 'var(--radius-lg)',
                    width: '90%',
                    maxWidth: '500px',
                    border: '1px solid var(--bg-3)',
                    boxShadow: 'var(--shadow-lg)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-1)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('task')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: type === 'task' ? 'var(--bg-3)' : 'transparent',
                                color: type === 'task' ? 'var(--text-1)' : 'var(--text-2)',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Task
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('note')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: type === 'note' ? 'var(--bg-3)' : 'transparent',
                                color: type === 'note' ? 'var(--text-1)' : 'var(--text-2)',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Note
                        </button>
                    </div>

                    {task.id && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this item?')) {
                                    onDelete(task.id);
                                    onCancel();
                                }
                            }}
                            style={{
                                color: 'var(--hue-danger)',
                                fontSize: '0.9rem',
                                padding: '4px 8px',
                                opacity: 0.8
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px' }}>Title {type === 'note' && '(Optional)'}</label>

                        <input
                            name="title"
                            defaultValue={task.title}
                            autoFocus={type === 'task'}
                            placeholder={type === 'note' ? 'Sticky Note Header...' : 'Task Title'}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--bg-3)',
                                backgroundColor: 'var(--bg-1)',
                                color: 'var(--text-1)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px' }}>Content (Optional)</label>
                        <RichTextEditor
                            key={task.id || 'new'}
                            initialValue={task.description}
                            onChange={setDescription}
                            placeholder={type === 'note' ? 'Type your note here...' : 'Description...'}
                            autoFocus={type === 'note'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px' }}>Color</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['var(--primary)', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'].map(color => (
                                <label key={color} style={{ cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="color"
                                        value={color}
                                        defaultChecked={
                                            task.color === color ||
                                            (!task.color && (color === (type === 'note' ? '#f1c40f' : 'var(--primary)')))
                                        }
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                        border: '2px solid var(--bg-1)',
                                        boxShadow: '0 0 0 2px var(--bg-3)',
                                        transition: 'transform 0.2s'
                                    }} className="color-swatch" />
                                </label>
                            ))}
                        </div>
                        <style>{`
                            input[type="radio"]:checked + .color-swatch {
                                transform: scale(1.2);
                                box-shadow: 0 0 0 2px var(--text-1);
                            }
                        `}</style>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text-2)',
                                fontWeight: 500
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '8px 24px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                fontWeight: 600
                            }}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
