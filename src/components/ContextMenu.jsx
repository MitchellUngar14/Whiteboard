import { useState, useEffect } from 'react';

export function ContextMenu({ x, y, taskId, onAction, onClose, theme }) {
    const [view, setView] = useState('main'); // 'main' | 'colors'
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));

        const handleClickOutside = (e) => {
            onClose();
        };

        const timer = setTimeout(() => {
            window.addEventListener('click', handleClickOutside);
            window.addEventListener('contextmenu', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('click', handleClickOutside);
            window.removeEventListener('contextmenu', handleClickOutside);
        };
    }, [onClose]);

    const palettes = {
        dark: {
            blue: 'hsl(190, 100%, 50%)',   // Neon Cyan
            green: 'hsl(140, 100%, 50%)',  // Neon Green
            pink: 'hsl(320, 100%, 50%)',   // Neon Pink
            yellow: 'hsl(60, 100%, 50%)',  // Neon Yellow
            red: 'hsl(0, 100%, 60%)',      // Neon Red
            bg: 'rgba(20, 20, 20, 0.9)',
            border: 'rgba(255, 255, 255, 0.2)'
        },
        light: {
            blue: 'hsl(210, 80%, 40%)',    // Deep Blue
            green: 'hsl(150, 80%, 30%)',   // Deep Green
            pink: 'hsl(330, 80%, 40%)',    // Deep Pink
            yellow: 'hsl(45, 100%, 40%)',  // Deep Gold
            red: 'hsl(0, 80%, 45%)',       // Deep Red
            bg: 'rgba(255, 255, 255, 0.95)',
            border: 'rgba(0, 0, 0, 0.1)'
        }
    };

    const palette = palettes[theme] || palettes.dark;

    const renderSegment = (key, label, angle, callback, color, index) => {
        const radius = 70;
        const rad = (angle * Math.PI) / 180;
        // Final position
        const bx = Math.cos(rad) * radius;
        const by = Math.sin(rad) * radius;

        // Staggered animation delay
        const delay = index * 0.05;

        const btnColor = color || palette.bg;
        const textColor = color ? (theme === 'dark' ? '#000' : '#fff') : 'var(--text-1)';

        return (
            <button
                key={key}
                onClick={(e) => {
                    e.stopPropagation();
                    callback();
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // Animate from center (0,0) to final (bx,by)
                    transform: isVisible
                        ? `translate(calc(-50% + ${bx}px), calc(-50% + ${by}px)) scale(1)`
                        : `translate(-50%, -50%) scale(0)`,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    padding: 0,
                    background: btnColor,
                    border: color ? 'none' : `1px solid ${palette.border}`,
                    boxShadow: isVisible ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                    color: textColor,
                    transition: `transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s, box-shadow 0.2s`,
                    cursor: 'pointer',
                    zIndex: 10
                }}
                title={label}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = `translate(calc(-50% + ${bx}px), calc(-50% + ${by}px)) scale(1.2)`;
                    e.currentTarget.style.zIndex = 20;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = `translate(calc(-50% + ${bx}px), calc(-50% + ${by}px)) scale(1)`;
                    e.currentTarget.style.zIndex = 10;
                }}
            >
                {label}
            </button>
        );
    };

    const mainActions = [
        { key: 'front', label: '⬆️', angle: -90, action: () => onAction('front', taskId) },
        { key: 'back', label: '⬇️', angle: 90, action: () => onAction('back', taskId) },
        { key: 'color', label: '🎨', angle: 0, action: () => setView('colors') },
        { key: 'delete', label: '🗑️', angle: 180, action: () => onAction('delete', taskId) },
    ];

    const colorActions = [
        { key: 'blue', label: '', color: palette.blue, angle: -90, action: () => onAction('color', { id: taskId, color: palette.blue }) },
        { key: 'green', label: '', color: palette.green, angle: -30, action: () => onAction('color', { id: palette.green }) }, // Fix: pass color directly or object? App handler expects object with color
        // Wait, app handler: if (action === 'color') updateTask(payload.id, { color: payload.color }); implies payload is {id, color}
        // Let's check the first one: action: () => onAction('color', { id: taskId,  color: palette.blue }) - YES.
        { key: 'yellow', label: '', color: palette.yellow, angle: 30, action: () => onAction('color', { id: taskId, color: palette.yellow }) },
        { key: 'pink', label: '', color: palette.pink, angle: 90, action: () => onAction('color', { id: taskId, color: palette.pink }) },
        { key: 'red', label: '', color: palette.red, angle: 150, action: () => onAction('color', { id: taskId, color: palette.red }) },
        { key: 'back', label: '⬅️', angle: 210, action: () => setView('main') }
    ];

    // Correction for green above
    colorActions[1].action = () => onAction('color', { id: taskId, color: palette.green });

    const currentActions = view === 'main' ? mainActions : colorActions;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                pointerEvents: 'none'
            }}
        >
            <div style={{
                position: 'absolute',
                top: y,
                left: x,
                pointerEvents: 'auto',
                width: '0',
                height: '0'
            }}>
                {/* Center Hub */}
                <div style={{
                    width: '10px',
                    height: '10px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: isVisible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: 0.5
                }} onClick={(e) => e.stopPropagation()} />

                {currentActions.map((action, i) =>
                    renderSegment(action.key, action.label, action.angle, action.action, action.color, i)
                )}
            </div>
        </div>
    );
}
