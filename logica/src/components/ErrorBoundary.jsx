import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-[#04120a] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-[#081f12] border border-emerald-500/30 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white">Recuperación Automática</h2>
            <p className="text-xs text-emerald-200/80">
              Ocurrió un detalle inesperado en la pantalla. Tus datos y lotes guardados están seguros.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" /> Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
