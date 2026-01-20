import { useState, useRef, useEffect } from 'react';

export function ImageCard({ task, onUpdate, onDelete, onContextMenu }) {
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);
    const initialPos = useRef({ x: 0, y: 0 });

    // Drag Logic
    useEffect(() => {
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
            if (e.target.closest('.resize-handle')) return;
            handleStart(e.clientX, e.clientY);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        };

        const handleTouchStart = (e) => {
            if (e.target.closest('.resize-handle')) return;
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
    const aspectRatio = useRef(1);

    const handleResizeStart = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        const rect = cardRef.current.getBoundingClientRect();
        initialSize.current = { w: rect.width, h: rect.height };
        aspectRatio.current = rect.width / rect.height;
        resizeStart.current = { x: e.clientX, y: e.clientY };

        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        const dx = e.clientX - resizeStart.current.x;

        // Maintain aspect ratio - use width change to calculate height
        const newWidth = Math.max(100, initialSize.current.w + dx);
        const newHeight = newWidth / aspectRatio.current;

        if (cardRef.current) {
            cardRef.current.style.width = `${newWidth}px`;
            cardRef.current.style.height = `${newHeight}px`;
        }
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);

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
        aspectRatio.current = rect.width / rect.height;
        resizeStart.current = { x: touch.clientX, y: touch.clientY };

        window.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
        window.addEventListener('touchend', handleResizeTouchEnd);
    };

    const handleResizeTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - resizeStart.current.x;

        // Maintain aspect ratio
        const newWidth = Math.max(100, initialSize.current.w + dx);
        const newHeight = newWidth / aspectRatio.current;

        if (cardRef.current) {
            cardRef.current.style.width = `${newWidth}px`;
            cardRef.current.style.height = `${newHeight}px`;
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

    const borderColor = task.color || 'var(--primary)';

    const cardStyle = {
        position: 'absolute',
        left: task.x,
        top: task.y,
        width: task.width ? `${task.width}px` : '250px',
        height: task.height ? `${task.height}px` : 'auto',
        backgroundColor: 'var(--bg-2)',
        borderRadius: 'var(--radius-md)',
        boxShadow: isDragging || isResizing ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        cursor: isDragging ? 'grabbing' : 'grab',
        border: `3px solid ${borderColor}`,
        zIndex: isDragging || isResizing ? 1000 : 1,
        transition: isResizing || isDragging ? 'none' : 'box-shadow 0.2s, transform 0.2s',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        userSelect: 'none',
        overflow: 'hidden'
    };

    return (
        <div
            ref={cardRef}
            style={cardStyle}
            onContextMenu={onContextMenu}
        >
            {/* Image */}
            <img
                src={task.imageData}
                alt={task.title || 'Image'}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    pointerEvents: 'none'
                }}
                draggable={false}
            />

            {/* Delete Button (shown on hover) */}
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                opacity: 0,
                transition: 'opacity 0.2s'
            }} className="actions">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    style={{
                        color: '#fff',
                        padding: '4px 8px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.9rem'
                    }}
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
                    background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 50%)',
                    borderBottomRightRadius: 'var(--radius-md)'
                }}
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2L10 0V12H0L2 10H8V2Z" fill="white" fillOpacity="0.5" />
                    <path d="M12 12L0 12L12 0L12 12Z" fill="white" />
                </svg>
            </div>

            <style>{`
                div:hover > .actions { opacity: 1; }
            `}</style>
        </div>
    );
}
