import React, { useState } from 'react';

export default function Dashboard() {
  // Estado temporário apenas para visualizarmos a tela enquanto ligamos com o Firebase
  const [osList, setOsList] = useState([
    {
      id: '1',
      numeroOS: '1023',
      cliente: 'Carlos Silva',
      contato: '(43) 99999-8888',
      tipo: 'notebook',
      defeito: 'Não liga após queda de energia',
      status: 'Aguardando',
      previsao: '15/10/2026'
    },
    {
      id: '2',
      numeroOS: '1024',
      cliente: 'Ana Souza',
      contato: '(43) 98888-7777',
      tipo: 'desktop',
      defeito: 'Tela azul constante ao abrir jogos',
      status: 'Em andamento - Limpeza',
      previsao: '16/10/2026'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Cabeçalho do Dashboard */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Ordens de Serviço do Dia</h1>
          <p className="text-slate-400 text-sm">Gerencie o fluxo de atendimento da assistência técnica</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg flex items-center gap-2"
        >
          <span>+ Nova OS</span>
        </button>
      </div>

      {/* Grid de Cards das OS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {osList.map((os) => (
          <div
            key={os.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md hover:border-blue-500 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide border border-blue-500/20">
                  OS #{os.numeroOS}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  os.status.includes('Aguardando') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {os.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{os.cliente}</h3>
              <p className="text-slate-400 text-sm mb-3">Aparelho: <span className="text-slate-200 capitalize font-medium">{os.tipo}</span></p>
              
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Defeito Relatado:</p>
                <p className="text-sm text-slate-300 line-clamp-2">{os.defeito}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-700">
              <span>Entrega: {os.previsao}</span>
              <span className="text-blue-400 font-medium hover:underline">Ver detalhes →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal simples de aviso para criarmos o form a seguir */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Criar Nova Ordem de Serviço</h2>
            <p className="text-slate-300 text-sm mb-6">Aqui colocaremos os campos solicitados (número da OS, tipo de aparelho, defeito, serviços pré-aprovados, datas e contato do cliente).</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}