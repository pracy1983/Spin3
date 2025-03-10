import { Mic, MicOff } from 'lucide-react';
import { useState } from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => Promise<void>;
  label: string;
  error?: string | null;
}

export function RecordButton({ isRecording, onToggleRecording, label, error }: RecordButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await onToggleRecording();
    } catch (err) {
      console.error('Erro ao alternar gravação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-2 px-6 lg:px-8 py-3 rounded-full text-white font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20 ${
          isLoading 
            ? 'bg-gray-700 cursor-wait border border-gray-600' 
            : error
              ? 'bg-red-600/80 hover:bg-red-600 border border-red-400'
              : isRecording 
                ? 'bg-red-500/80 hover:bg-red-500 border border-red-400' 
                : 'bg-purple-600/80 hover:bg-purple-600 border border-purple-400'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Iniciando...</span>
          </>
        ) : error ? (
          <>
            <Mic className="w-5 h-5" />
            <span>Tentar Novamente</span>
          </>
        ) : isRecording ? (
          <>
            <MicOff className="w-5 h-5" />
            <span>Parar {label}</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span>Gravar {label}</span>
          </>
        )}
      </button>
    </div>
  );
}