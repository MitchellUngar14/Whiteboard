import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'whiteboard_data';
const CHANNEL_NAME = 'whiteboard_sync';

const defaultData = {
    tasks: [],
    theme: 'dark' // 'dark' | 'light'
};

export function useStore() {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultData;
    });

    // Persist to LocalStorage and Broadcast
    const broadcastUpdate = useCallback((newData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        setData(newData);
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ type: 'UPDATE', payload: newData });
        channel.close();
    }, []);

    // Listen for updates from other windows
    useEffect(() => {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (event) => {
            if (event.data.type === 'UPDATE') {
                setData(event.data.payload);
            }
        };
        return () => channel.close();
    }, []);

    // Theme Toggler
    const toggleTheme = useCallback(() => {
        const newTheme = data.theme === 'dark' ? 'light' : 'dark';
        const newData = { ...data, theme: newTheme };
        broadcastUpdate(newData);
        document.documentElement.setAttribute('data-theme', newTheme);
    }, [data, broadcastUpdate]);

    // Ensure theme is applied on mount/change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', data.theme);
    }, [data.theme]);

    // Task Actions
    const addTask = useCallback((task) => {
        const newTask = {
            id: crypto.randomUUID(),
            x: Math.random() * (window.innerWidth - 200),
            y: Math.random() * (window.innerHeight - 200),
            ...task
        };
        const newData = { ...data, tasks: [...data.tasks, newTask] };
        broadcastUpdate(newData);
    }, [data, broadcastUpdate]);

    const updateTask = useCallback((id, updates) => {
        const newData = {
            ...data,
            tasks: data.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        };
        broadcastUpdate(newData);
    }, [data, broadcastUpdate]);

    const deleteTask = useCallback((id) => {
        const newData = {
            ...data,
            tasks: data.tasks.filter(t => t.id !== id)
        };
        broadcastUpdate(newData);
    }, [data, broadcastUpdate]);

    const bringToFront = useCallback((id) => {
        const task = data.tasks.find(t => t.id === id);
        if (!task) return;
        const otherTasks = data.tasks.filter(t => t.id !== id);
        const newData = { ...data, tasks: [...otherTasks, task] };
        broadcastUpdate(newData);
    }, [data, broadcastUpdate]);

    const sendToBack = useCallback((id) => {
        const task = data.tasks.find(t => t.id === id);
        if (!task) return;
        const otherTasks = data.tasks.filter(t => t.id !== id);
        const newData = { ...data, tasks: [task, ...otherTasks] };
        broadcastUpdate(newData);
    }, [data, broadcastUpdate]);

    return {
        data,
        toggleTheme,
        addTask,
        updateTask,
        deleteTask,
        bringToFront,
        sendToBack
    };
}
