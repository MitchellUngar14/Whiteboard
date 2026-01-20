import { useState, useRef, useEffect } from 'react';

export function TaskCard({ task, onUpdate, onDelete, onEdit, onContextMenu }) {
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    const initialPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Unified move handler
        const handleMove = (clientX, clientY) => {
            if (!hasMoved.current) {
                const dx = clientX - dragStart.current.x;
                const dy = clientY - dragStart.current.y;
                if (Math.hypot(dx, dy) > 5) {
                    hasMoved.current = true;
                    setIsDragging(true);
                } else {
                    return;
                }
            }

            if (hasMoved.current) {
                const dx = clientX - dragStart.current.x;
                const dy = clientY - dragStart.current.y;
                // Calculate new position based on initial start + movement delta
                const newX = initialPos.current.x + dx;
                const newY = initialPos.current.y + dy;

                if (cardRef.current) {
                    cardRef.current.style.left = `${newX}px`;
                    cardRef.current.style.top = `${newY}px`;
                }
            }
        };

        const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            if (isDragging || hasMoved.current) {
                e.preventDefault();
            }
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        };

        const handleEnd = (clientX, clientY) => {
            if (hasMoved.current) {
                setIsDragging(false);
                const dx = clientX - dragStart.current.x;
                const dy = clientY - dragStart.current.y;
                const newX = initialPos.current.x + dx;
                const newY = initialPos.current.y + dy;
                onUpdate(task.id, { x: newX, y: newY });
            }
            hasMoved.current = false;
        };

        const handleMouseUp = (e) => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            handleEnd(e.clientX, e.clientY);
        };

        const handleTouchEnd = (e) => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            const touch = e.changedTouches[0];
            handleEnd(touch.clientX, touch.clientY);
        };

        const handleStart = (clientX, clientY) => {
            initialPos.current = {
                x: cardRef.current.offsetLeft,
                y: cardRef.current.offsetTop
            };
            dragStart.current = { x: clientX, y: clientY };
            hasMoved.current = false;
        };

        const handleMouseDown = (e) => {
            if (e.target.closest('button') || e.target.closest('.resize-handle')) return;
            handleStart(e.clientX, e.clientY);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        };

        const handleTouchStart = (e) => {
            if (e.target.closest('button') || e.target.closest('.resize-handle')) return;
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        };

        const element = cardRef.current;
        if (element) {
            element.addEventListener('mousedown', handleMouseDown);
            element.addEventListener('touchstart', handleTouchStart, { passive: false });
        }

        return () => {
            if (element) {
                element.removeEventListener('mousedown', handleMouseDown);
                element.removeEventListener('touchstart', handleTouchStart);
            }
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [task.id, onUpdate]);



    // Resize Logic
    const [isResizing, setIsResizing] = useState(false);
    const initialSize = useRef({ w: 0, h: 0 });
    const resizeStart = useRef({ x: 0, y: 0 });

    const handleResizeStart = (e) => {
        e.stopPropagation(); // Prevent drag start
        setIsResizing(true);
        const rect = cardRef.current.getBoundingClientRect();
        initialSize.current = { w: rect.width, h: rect.height };
        resizeStart.current = { x: e.clientX, y: e.clientY };

        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;

        const minBaseHeight = isNote ? 80 : 80;
        const newWidth = Math.max(200, initialSize.current.w + dx);
        let newHeight = Math.max(minBaseHeight, initialSize.current.h + dy);

        if (cardRef.current) {
            cardRef.current.style.width = `${newWidth}px`;
            cardRef.current.style.height = `${newHeight}px`;

            // Check for content overflow and snap to scrollHeight
            if (cardRef.current.scrollHeight > cardRef.current.offsetHeight) {
                newHeight = cardRef.current.scrollHeight;
                cardRef.current.style.height = `${newHeight}px`;
            }
        }
    };

    const handleResizeEnd = (e) => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);

        // Calculate final dims based on last move or current style
        // Best to just recalc from event to match move logic or read computed style?
        // Let's use the delta methodology again for consistency or read style.
        // Reading style is safest for "what the user sees".
        if (cardRef.current) {
            const w = parseInt(cardRef.current.style.width);
            const h = parseInt(cardRef.current.style.height);
            onUpdate(task.id, { width: w, height: h });
        }
    };

    // Touch support for resize
    const handleResizeTouchStart = (e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        setIsResizing(true);
        const rect = cardRef.current.getBoundingClientRect();
        initialSize.current = { w: rect.width, h: rect.height };
        resizeStart.current = { x: touch.clientX, y: touch.clientY };

        window.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
        window.addEventListener('touchend', handleResizeTouchEnd);
    };

    const handleResizeTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - resizeStart.current.x;
        const dy = touch.clientY - resizeStart.current.y;

        const minBaseHeight = isNote ? 80 : 80;
        const newWidth = Math.max(200, initialSize.current.w + dx);
        let newHeight = Math.max(minBaseHeight, initialSize.current.h + dy);

        if (cardRef.current) {
            cardRef.current.style.width = `${newWidth}px`;
            cardRef.current.style.height = `${newHeight}px`;

            // Check for content overflow and snap to scrollHeight
            if (cardRef.current.scrollHeight > cardRef.current.offsetHeight) {
                newHeight = cardRef.current.scrollHeight;
                cardRef.current.style.height = `${newHeight}px`;
            }
        }
    };

    const handleResizeTouchEnd = () => {
        setIsResizing(false);
        window.removeEventListener('touchmove', handleResizeTouchMove);
        window.removeEventListener('touchend', handleResizeTouchEnd);

        if (cardRef.current) {
            const w = parseInt(cardRef.current.style.width);
            const h = parseInt(cardRef.current.style.height);
            onUpdate(task.id, { width: w, height: h });
        }
    };


    // Dynamic Styles based on task colors
    const isNote = task.type === 'note';

    const cardStyle = {
        position: 'absolute',
        left: task.x,
        top: task.y,
        width: task.width ? `${task.width}px` : (isNote ? '240px' : '300px'),
        height: task.height ? `${task.height}px` : 'auto',
        minHeight: isNote ? '80px' : 'auto',
        backgroundColor: isNote ? (task.color || '#f1c40f') : 'var(--bg-2)', // Yellow default for notes
        borderRadius: isNote ? '2px' : 'var(--radius-md)',
        boxShadow: isDragging || isResizing ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isNote ? 'none' : `1px solid ${task.color || 'var(--primary)'}`,
        zIndex: isDragging || isResizing ? 1000 : 1,
        transition: isResizing || isDragging ? 'none' : 'box-shadow 0.2s, transform 0.2s', // Disable transition during interaction
        transform: isDragging ? 'scale(1.05) rotate(2deg)' : (isNote ? 'rotate(-1deg)' : 'scale(1)'),
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isNote ? 'center' : 'flex-start'
    };

    return (
        <div
            ref={cardRef}
            style={cardStyle}
            onDoubleClick={() => onEdit && onEdit(task)}
            onContextMenu={onContextMenu}
        >
            <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {task.title && (
                    <h3 style={{
                        color: isNote ? 'rgba(0,0,0,0.7)' : (task.titleColor || 'var(--text-1)'),
                        marginBottom: '8px',
                        fontWeight: isNote ? 700 : 600,
                        fontSize: isNote ? '1.1rem' : '1.2rem',
                        textAlign: isNote ? 'center' : 'left'
                    }}>
                        {task.title}
                    </h3>
                )}

                {task.description && (
                    <div
                        style={{
                            color: isNote ? 'rgba(0,0,0,0.8)' : (task.descColor || 'var(--text-2)'),
                            fontSize: isNote ? '1.1rem' : '0.95rem',
                            marginBottom: '12px',
                            textAlign: isNote ? 'center' : 'left',
                            flex: 1,
                            fontFamily: isNote ? '"Comic Sans MS", "Chalkboard SE", sans-serif' : 'inherit',
                            lineHeight: 1.5,
                            wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{ __html: task.description }}
                        className="task-content"
                    />
                )}

                {!isNote && task.subInfo && (
                    <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--bg-3)',
                        color: task.subInfoColor || 'var(--text-3)',
                        fontSize: '0.85rem'
                    }}>
                        <ul>
                            {task.subInfo.split('\n').map((line, i) => (
                                <li key={i} style={{ marginLeft: '16px' }}>{line}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                opacity: 0,
                transition: 'opacity 0.2s'
            }} className="actions">
                <button
                    onClick={() => onDelete(task.id)}
                    style={{ color: 'var(--text-3)', padding: '4px' }}
                >
                    ✕
                </button>
            </div>

            {/* Resize Handle */}
            <div
                className="resize-handle"
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeTouchStart}
                style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '30px',
                    height: '30px',
                    cursor: 'nwse-resize',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '4px',
                    opacity: 0.5
                }}
            >
                {/* Visual Grip */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2L10 0V12H0L2 10H8V2Z" fill="currentColor" fillOpacity="0.5" />
                    <path d="M12 12L0 12L12 0L12 12Z" fill="currentColor" />
                </svg>
            </div>

            <style>{`
        div:hover .actions { opacity: 1; }
        .task-content pre {
            background: var(--bg-3);
            padding: 12px;
            border-radius: var(--radius-sm);
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            margin: 8px 0;
            white-space: pre-wrap;
            border: 1px solid rgba(255,255,255,0.05);
            color: var(--text-1);
        }
        .task-content code {
            font-family: inherit;
            background: var(--bg-3);
            padding: 2px 4px;
            border-radius: 4px;
        }
      `}</style>
        </div>
    );
}
