import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected application error' };
  }

  componentDidCatch(error: Error) {
    console.error('PARADOX AgriProcure UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F3F6FA', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div style={{ maxWidth: 620, width: '100%', background: '#fff', border: '1px solid #D7DEE7', borderRadius: 16, padding: 28, boxShadow: '0 12px 40px rgba(15,23,42,.10)' }}>
            <h1 style={{ margin: 0, color: '#16233B', fontSize: 24 }}>PARADOX AgriProcure</h1>
            <p style={{ color: '#B42318', fontWeight: 700 }}>The application could not render.</p>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#475569', background: '#F8FAFC', padding: 14, borderRadius: 10 }}>{this.state.message}</pre>
            <button onClick={() => window.location.reload()} style={{ background: '#138808', color: '#fff', border: 0, borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>Reload website</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root was not found');

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
