import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Error Caught:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
            <h1 className="text-2xl font-black text-red-600 mb-4">Algo deu errado (Client Error)</h1>
            <p className="text-gray-600 mb-6">
              A aplicação encontrou um erro inesperado ao renderizar este componente.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-64 mb-6 border border-gray-200">
              <p className="font-bold text-red-800 mb-2">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-gray-500 whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors uppercase tracking-wider text-sm shadow-lg"
            >
              Recarregar Página
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="ml-4 text-red-600 font-bold hover:underline text-sm uppercase tracking-wider"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
