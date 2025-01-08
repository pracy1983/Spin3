import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export function RecordButton({ isRecording, onToggleRecording }: RecordButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onToggleRecording();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`fixed bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 lg:px-8 py-3 rounded-full text-white font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20 ${
        isLoading 
          ? 'bg-gray-700 cursor-wait border border-gray-600' 
          : isRecording 
            ? 'bg-red-500/80 hover:bg-red-500 border border-red-400' 
            : 'bg-purple-600/80 hover:bg-purple-600 border border-purple-400'
      }`}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="hidden sm:inline">Iniciando...</span>
        </>
      ) : isRecording ? (
        <>
          <MicOff className="w-5 h-5" />
          <span className="hidden sm:inline">Parar</span>
        </>
      ) : (
        <>
          <Mic className="w-5 h-5" />
          <span className="hidden sm:inline">Iniciar</span>
        </>
      )}
    </button>
  );
}