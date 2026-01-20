import { useState, useRef } from 'react';
import { useStore } from './hooks/useStore';
import { TaskCard } from './components/TaskCard';
import { ImageCard } from './components/ImageCard';
import { TaskEditor } from './components/TaskEditor';
import { ContextMenu } from './components/ContextMenu';

function App() {
  const { data, addTask, updateTask, deleteTask, toggleTheme, bringToFront, sendToBack } = useStore();
  const [editingTask, setEditingTask] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreateClick = () => {
    setShowCreateMenu(!showCreateMenu);
  };

  const handleCreateTask = () => {
    setShowCreateMenu(false);
    setEditingTask({
      title: '',
      description: '',
      color: 'var(--primary)'
    });
  };

  const handleCreateImage = () => {
    setShowCreateMenu(false);
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;

      // Create an image to get dimensions for aspect ratio
      const img = new Image();
      img.onload = () => {
        const maxWidth = 300;
        const aspectRatio = img.width / img.height;
        const width = Math.min(img.width, maxWidth);
        const height = width / aspectRatio;

        addTask({
          type: 'image',
          title: file.name,
          imageData: imageData,
          color: 'var(--primary)',
          width: width,
          height: height
        });
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
  };

  const handleSaveTask = (taskData) => {
    if (taskData.id) {
      updateTask(taskData.id, taskData);
    } else {
      addTask(taskData);
    }
    setEditingTask(null);
  };

  const handleContextMenu = (e, task) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      taskId: task.id
    });
  };

  const handleContextAction = (action, payload) => {
    if (action === 'front') bringToFront(payload);
    if (action === 'back') sendToBack(payload);
    if (action === 'delete') deleteTask(payload);
    if (action === 'color') updateTask(payload.id, { color: payload.color });
    setContextMenu(null);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      overflow: 'hidden'
    }} onClick={() => { setContextMenu(null); setShowCreateMenu(false); }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        zIndex: 10
      }}>
        <div className="flex-center" style={{ gap: '12px' }}>
          <h1 className="text-gradient header-title" style={{ fontSize: '2rem', fontWeight: 700 }}>
            Whiteboard
          </h1>
          <div className="glass" style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{data.tasks.length}</span>
          </div>
        </div>

        <div className="flex-center" style={{ gap: '12px' }}>
          <button
            onClick={toggleTheme}
            className="glass"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-1)',
              fontSize: '0.9rem',
              transition: 'transform 0.1s'
            }}
          >
            <span>{data.theme === 'dark' ? '☀' : '🌙'}</span>
            <span className="theme-toggle-text">{data.theme === 'dark' ? ' Light' : ' Dark'}</span>
          </button>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={handleCreateClick}
              className="btn-create"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                padding: '8px 24px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span className="btn-text-full">+ New</span>
              <span className="btn-text-short">+</span>
            </button>

            {/* Dropdown Menu */}
            {showCreateMenu && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  minWidth: '140px',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-lg)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={handleCreateTask}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: 'var(--text-1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>📝</span> Task / Note
                </button>
                <button
                  onClick={handleCreateImage}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: 'var(--text-1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>🖼️</span> Image
                </button>
              </div>
            )}
          </div>

          {/* Hidden file input for image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
        </div>
      </header>

      <main style={{
        flex: 1,
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--bg-3)'
      }}>
        {data.tasks.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            opacity: 0.5,
            pointerEvents: 'none'
          }}>
            <p style={{ color: 'var(--text-3)', fontSize: '1.2rem' }}>Canvas is Empty</p>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '8px' }}>Click "+ New" to start</p>
          </div>
        )}

        {data.tasks.map(task => (
          task.type === 'image' ? (
            <ImageCard
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onContextMenu={(e) => handleContextMenu(e, task)}
            />
          ) : (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onEdit={handleEditClick}
              onContextMenu={(e) => handleContextMenu(e, task)}
            />
          )
        ))}

        {editingTask && (
          <TaskEditor
            task={editingTask}
            onSave={handleSaveTask}
            onDelete={deleteTask}
            onCancel={() => setEditingTask(null)}
          />
        )}

        {contextMenu && (
          <ContextMenu
            {...contextMenu}
            theme={data.theme}
            onAction={handleContextAction}
            onClose={() => setContextMenu(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
