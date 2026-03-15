import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary] Erreur capturée :', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;

    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full card p-8 text-center border-danger-500/30 bg-danger-500/5">
          <div className="w-16 h-16 rounded-full bg-danger-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-400" />
          </div>

          <h1 className="text-xl font-bold text-slate-100 mb-2">
            Une erreur est survenue
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            Un composant a planté. Voici les détails pour diagnostiquer le problème.
          </p>

          {error && (
            <div className="text-left mb-4 p-3 rounded-lg bg-space-900 border border-danger-500/20">
              <p className="text-xs font-semibold text-danger-400 mb-1">Erreur :</p>
              <p className="text-xs text-slate-300 font-mono break-all">
                {error.message || String(error)}
              </p>
            </div>
          )}

          {info?.componentStack && (
            <details className="text-left mb-6">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 mb-2">
                Stack trace (cliquez pour voir)
              </summary>
              <pre className="text-xs text-slate-500 font-mono overflow-auto max-h-40 p-3 bg-space-900 rounded border border-space-400/20 whitespace-pre-wrap">
                {info.componentStack}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger la page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, info: null });
                window.location.href = '/';
              }}
              className="btn-secondary gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
}
