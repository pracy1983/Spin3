import React, { useState } from 'react';
import { Info, Upload } from 'lucide-react';
import { ContextUploadModal } from './ContextUploadModal';
import { ContextSummary } from './context/ContextSummary';
import { useContextSummaries } from './context/useContextSummaries';

export function ContextPanel() {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showPodcastModal, setShowPodcastModal] = useState(false);
  const { summaries, confirmed, updateSummary, confirmSummary } = useContextSummaries();

  const handleGuestConfirm = async (files: File[], links: string[]) => {
    await updateSummary('guest', files, links);
    setShowGuestModal(false);
  };

  const handlePodcastConfirm = async (files: File[], links: string[]) => {
    await updateSummary('podcast', files, links);
    setShowPodcastModal(false);
  };

  return (
    <div className="w-full p-4 lg:p-6 bg-gray-800 rounded-lg shadow-lg shadow-purple-500/5 border border-purple-500/10 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Contexto da Venda</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <button
            onClick={() => setShowGuestModal(true)}
            className={`w-full p-4 border rounded-lg text-left transition-all duration-300 ${
              summaries.guest ? 'bg-purple-900/30 border-purple-500/30' : 'border-gray-700 hover:border-purple-500/30 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-medium text-white">Sobre o Cliente</h3>
            </div>
            <p className="text-sm text-gray-400">
              Adicione informações sobre o cliente para gerar perguntas mais relevantes
            </p>
          </button>
          {summaries.guest && (
            <ContextSummary
              type="guest"
              summary={summaries.guest}
              onConfirm={() => confirmSummary('guest')}
              isConfirmed={confirmed.guest}
            />
          )}
        </div>

        <div>
          <button
            onClick={() => setShowPodcastModal(true)}
            className={`w-full p-4 border rounded-lg text-left transition-all duration-300 ${
              summaries.podcast ? 'bg-purple-900/30 border-purple-500/30' : 'border-gray-700 hover:border-purple-500/30 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-medium text-white">Sobre o Produto/Serviço</h3>
            </div>
            <p className="text-sm text-gray-400">
              Adicione informações sobre o produto/serviço para melhor contextualização
            </p>
          </button>
          {summaries.podcast && (
            <ContextSummary
              type="podcast"
              summary={summaries.podcast}
              onConfirm={() => confirmSummary('podcast')}
              isConfirmed={confirmed.podcast}
            />
          )}
        </div>
      </div>

      <ContextUploadModal
        type="guest"
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onConfirm={handleGuestConfirm}
      />

      <ContextUploadModal
        type="podcast"
        isOpen={showPodcastModal}
        onClose={() => setShowPodcastModal(false)}
        onConfirm={handlePodcastConfirm}
      />
    </div>
  );
}