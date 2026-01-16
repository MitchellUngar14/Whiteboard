import { useEffect, useRef, useState, memo } from 'react';

export const RichTextEditor = memo(({ initialValue, onChange, placeholder, autoFocus }) => {
    const editorRef = useRef(null);
    const initialContent = useRef(initialValue || '');

    // Focus and cursor management
    useEffect(() => {
        if (autoFocus && editorRef.current) {
            editorRef.current.focus();
            // Try to move cursor to end of content
            try {
                const range = document.createRange();
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (e) {
                // Ignore if range fails
            }
        }
    }, [autoFocus]);

    const handleInput = (e) => {
        const newHtml = e.currentTarget.innerHTML;
        onChange(newHtml);
    };

    const execCmd = (command, value = null) => {
        if (command === 'formatBlock' && value === 'PRE') {
            const currentBlock = document.queryCommandValue('formatBlock');
            if (currentBlock && currentBlock.toLowerCase() === 'pre') {
                document.execCommand('formatBlock', false, 'DIV');
            } else {
                document.execCommand(command, false, value);
            }
        } else {
            document.execCommand(command, false, value);
        }

        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    ');
        }
    };

    const ToolbarButton = ({ cmd, arg, label, active }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                execCmd(cmd, arg);
            }}
            className="glass"
            style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'var(--bg-3)',
                border: 'none',
                color: 'var(--text-1)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                minWidth: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            title={label}
            onMouseDown={e => e.preventDefault()}
        >
            {label}
        </button>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--bg-3)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-1)',
            minHeight: '150px'
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '4px',
                padding: '8px',
                background: 'var(--bg-2)',
                borderBottom: '1px solid var(--bg-3)'
            }}>
                <ToolbarButton cmd="bold" label="B" />
                <ToolbarButton cmd="underline" label="U" />
                <ToolbarButton cmd="insertUnorderedList" label="• List" />
                <ToolbarButton cmd="formatBlock" arg="PRE" label="{ }" />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: initialContent.current }}
                style={{
                    flex: 1,
                    padding: '12px',
                    outline: 'none',
                    color: 'var(--text-1)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    minHeight: '100px',
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto'
                }}
                className="rich-editor"
            />
            <style>{`
                .rich-editor b, .rich-editor strong { font-weight: 700; }
                .rich-editor u { text-decoration: underline; }
                .rich-editor ul { padding-left: 20px; list-style-type: disc; margin: 4px 0; }
                .rich-editor li { margin-bottom: 2px; }
                .rich-editor pre { 
                    background: var(--bg-3); 
                    padding: 8px; 
                    border-radius: 4px; 
                    font-family: monospace;
                    margin: 8px 0;
                    white-space: pre-wrap;
                }
                .rich-editor:empty:before {
                    content: '${placeholder || ''}';
                    color: var(--text-3);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
});
