// src/components/DetalhesOS/DetalhesOS.jsx
import React, { useState } from 'react';
import './DetalhesOS.css';

// Itens de Checklist padrão baseados no tipo de aparelho
const CHECKLIST_NOTEBOOK = [
  { id: 'bateria', label: 'Bateria / Autonomia' },
  { id: 'tela', label: 'Tela / Display (Riscos/Trincas)' },
  { id: 'teclado', label: 'Teclado (Teclas funcionais)' },
  { id: 'touchpad', label: 'Touchpad' },
  { id: 'carregador', label: 'Carregador / Fonte' },
  { id: 'portas_usb', label: 'Portas USB / Conexões' },
  { id: 'wi_fi', label: 'Placa Wi-Fi / Bluetooth' },
  { id: 'carcaca', label: 'Carcaça / Dobradiças' }
];

const CHECKLIST_DESKTOP = [
  { id: 'fonte', label: 'Fonte de Alimentação' },
  { id: 'placa_mae', label: 'Placa-Mãe / Vídeo Onboard' },
  { id: 'memorias', label: 'Memórias RAM' },
  { id: 'armazenamento', label: 'HD / SSD (Saúde e Leitura)' },
  { id: 'gabinete', label: 'Gabinete / Limpeza Interna' },
  { id: 'portas_traseiras', label: 'Conexões Traseiras / USB' },
  { id: 'cooler', label: 'Coolers e Dissipadores' }
];

export default function DetalhesOS({ os, onBack, onUpdateOS }) {
  // Aba principal ativa ('resumo', 'checklist', 'tempos', 'comentarios')
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  
  // Sub-aba do checklist ('inicio', 'final')
  const [subAbaChecklist, setSubAbaChecklist] = useState('inicio');

  // Status atual da OS
  const [statusOS, setStatusOS] = useState(os.status || 'Aguardando');

  // Estados dos Checklists (Início e Final salvos no objeto da OS ou locais)
  const itensPadrao = os.tipo === 'desktop' ? CHECKLIST_DESKTOP : CHECKLIST_NOTEBOOK;

  // Checklist de Início
  const [checklistInicio, setChecklistInicio] = useState(
    os.checklistInicio || itensPadrao.reduce((acc, item) => ({ ...acc, [item.id]: { checked: false, comentario: '' } }), {})
  );

  // Checklist Final
  const [checklistFinal, setChecklistFinal] = useState(
    os.checklistFinal || itensPadrao.reduce((acc, item) => ({ ...acc, [item.id]: { checked: false, comentario: '' } }), {})
  );

  // Itens customizados adicionados pelo técnico
  const [novoItemNome, setNovoItemNome] = useState('');
  const [itensCustomizados, setItensCustomizados] = useState(os.itensCustomizados || []);

  // Manipular marcação do checklist de Início
  const toggleCheckInicio = (id) => {
    setChecklistInicio(prev => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id]?.checked }
    }));
  };

  const updateComentarioInicio = (id, valor) => {
    setChecklistInicio(prev => ({
      ...prev,
      [id]: { ...prev[id], comentario: valor }
    }));
  };

  // Manipular marcação do checklist Final
  const toggleCheckFinal = (id) => {
    setChecklistFinal(prev => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id]?.checked }
    }));
  };

  const updateComentarioFinal = (id, valor) => {
    setChecklistFinal(prev => ({
      ...prev,
      [id]: { ...prev[id], comentario: valor }
    }));
  };

  // Adicionar item personalizado ao checklist
  const handleAddCustomItem = () => {
    if (!novoItemNome.trim()) return;
    const novoId = `custom_${Date.now()}`;
    const novoItem = { id: novoId, label: novoItemNome.trim() };
    
    setItensCustomizados([...itensCustomizados, novoItem]);
    setChecklistInicio(prev => ({ ...prev, [novoId]: { checked: false, comentario: '' } }));
    setChecklistFinal(prev => ({ ...prev, [novoId]: { checked: false, comentario: '' } }));
    setNovoItemNome('');
  };

  // Ações do Rodapé Fixo
  const handleSalvarDados = () => {
    const dadosAtualizados = {
      ...os,
      status: statusOS,
      checklistInicio,
      checklistFinal,
      itensCustomizados
    };
    if (onUpdateOS) onUpdateOS(dadosAtualizados);
    alert('Dados da OS salvos com sucesso!');
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleCopiar = () => {
    const textoResumo = `OS #${os.numeroOS} - Cliente: ${os.cliente} | Aparelho: ${os.tipo} | Status: ${statusOS}`;
    navigator.clipboard.writeText(textoResumo);
    alert(`Resumo copiado para a área de transferência referente à aba: [${abaAtiva.toUpperCase()}]!`);
  };

  const listaCompletaChecklist = [...itensPadrao, ...itensCustomizados];

  return (
    <div className="os-page-wrapper">
      
      {/* Topo / Header da Página da OS */}
      <div className="os-page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-700"
          >
            ← Voltar ao Painel
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span> OS #{os.numeroOS} - {os.cliente}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 capitalize">
              Tipo: <strong className="text-slate-200">{os.tipo}</strong> • Contato: {os.contato || 'Não informado'}
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 uppercase tracking-wider block">Status Atual</span>
          <span className="text-sm font-bold text-blue-400">{statusOS}</span>
        </div>
      </div>

      {/* Navegação por Abas Principais */}
      <div className="os-page-nav-tabs">
        <button
          onClick={() => setAbaAtiva('resumo')}
          className={`os-tab-btn ${abaAtiva === 'resumo' ? 'os-tab-btn-active' : 'os-tab-btn-inactive'}`}
        >
          <span>📊</span> Resumo
        </button>
        <button
          onClick={() => setAbaAtiva('checklist')}
          className={`os-tab-btn ${abaAtiva === 'checklist' ? 'os-tab-btn-active' : 'os-tab-btn-inactive'}`}
        >
          <span>✔️</span> Checklist
        </button>
        <button
          onClick={() => setAbaAtiva('tempos')}
          className={`os-tab-btn ${abaAtiva === 'tempos' ? 'os-tab-btn-active' : 'os-tab-btn-inactive'}`}
        >
          <span>⏱️</span> Tempos
        </button>
        <button
          onClick={() => setAbaAtiva('comentarios')}
          className={`os-tab-btn ${abaAtiva === 'comentarios' ? 'os-tab-btn-active' : 'os-tab-btn-inactive'}`}
        >
          <span>💬</span> Comentários
        </button>
      </div>

      {/* Conteúdo Dinâmico das Abas */}
      <div className="os-page-content">
        
        {/* 1. ABA DE RESUMO */}
        {abaAtiva === 'resumo' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card Defeitos Iniciais */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl md:col-span-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">Defeito Relatado Inicialmente</h3>
                <p className="text-slate-100 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm leading-relaxed">
                  {os.defeito || 'Nenhum defeito detalhado.'}
                </p>
              </div>

              {/* Card Informações Gerais */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">Informações</h3>
                  <div className="flex flex-col gap-2 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Entrada:</span>
                      <strong className="text-white">{os.dataEntrada || 'Não informada'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Previsão:</span>
                      <strong className="text-white">{os.previsao || 'Não informada'}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Serviços Pré-Aprovados */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Serviços Pré-Aprovados</h3>
              {os.servicosPreAprovados?.length > 0 ? (
                <div className="space-y-2">
                  {os.servicosPreAprovados.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-white font-medium">{s.nome}</span>
                      <span className="text-emerald-400 font-bold">R$ {Number(s.valor || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Nenhum serviço pré-aprovado cadastrado.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. ABA DE CHECKLIST */}
        {abaAtiva === 'checklist' && (
          <div className="flex flex-col gap-6">
            
            {/* Sub-abas de Checklist: Início / Final */}
            <div className="checklist-subtabs">
              <button
                onClick={() => setSubAbaChecklist('inicio')}
                className={`checklist-subtab-btn ${subAbaChecklist === 'inicio' ? 'checklist-subtab-active' : 'checklist-subtab-inactive'}`}
              >
                Início do Serviço
              </button>
              <button
                onClick={() => setSubAbaChecklist('final')}
                className={`checklist-subtab-btn ${subAbaChecklist === 'final' ? 'checklist-subtab-active' : 'checklist-subtab-inactive'}`}
              >
                Finalização do Serviço
              </button>
            </div>

            {/* Adicionar Novo Problema Personalizado */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3 items-center shadow-md">
              <input
                type="text"
                value={novoItemNome}
                onChange={(e) => setNovoItemNome(e.target.value)}
                placeholder="Adicionar novo item/problema personalizado ao checklist..."
                className="form-input flex-1 !mb-0 text-xs py-2.5"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                + Adicionar Item
              </button>
            </div>

            {/* GRADE DE CHECKLIST (Marcável estilo lista de mercado) */}
            <div className="checklist-grid">
              {listaCompletaChecklist.map((item) => {
                const isInicio = subAbaChecklist === 'inicio';
                const dadosItem = isInicio ? checklistInicio[item.id] || { checked: false, comentario: '' } : checklistFinal[item.id] || { checked: false, comentario: '' };

                return (
                  <div
                    key={item.id}
                    onClick={() => isInicio ? toggleCheckInicio(item.id) : toggleCheckFinal(item.id)}
                    className={`checklist-item-card ${dadosItem.checked ? 'checklist-item-card-checked' : ''}`}
                  >
                    <div className="checklist-item-header">
                      <span className={`text-xs font-bold ${dadosItem.checked ? 'text-blue-300 line-through' : 'text-white'}`}>
                        {item.label}
                      </span>
                      <div className="checklist-checkbox-box">
                        {dadosItem.checked ? '✓' : ''}
                      </div>
                    </div>

                    {/* Campo de comentário individual por item */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={dadosItem.comentario}
                        onChange={(e) => isInicio ? updateComentarioInicio(item.id, e.target.value) : updateComentarioFinal(item.id, e.target.value)}
                        placeholder={`Comentário (${subAbaChecklist})...`}
                        className="checklist-comment-input"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* 3. ABA DE TEMPOS (Placeholder Inicial) */}
        {abaAtiva === 'tempos' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">⏱️</span>
            <h3 className="text-lg font-bold text-white">Controle de Tempos</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              Os registros de cronômetro e tempos dedicados a esta OS aparecerão aqui em breve.
            </p>
          </div>
        )}

        {/* 4. ABA DE COMENTÁRIOS (Placeholder Inicial) */}
        {abaAtiva === 'comentarios' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">💬</span>
            <h3 className="text-lg font-bold text-white">Comentários e Histórico</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              Notas técnicas detalhadas e anotações do andamento do serviço.
            </p>
          </div>
        )}

      </div>

      {/* BARRA DE RODAPÉ FIXA GLOBAL */}
      <div className="os-fixed-footer-bar">
        
        {/* Seletor de Status e Botão Fechar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-os-action"
          >
            <span>✕</span> Fechar
          </button>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusOS}
              onChange={(e) => setStatusOS(e.target.value)}
              className="bg-transparent text-xs font-semibold text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="Aguardando" className="bg-slate-900 text-white">Aguardando</option>
              <option value="Em Andamento" className="bg-slate-900 text-white">Em Andamento</option>
              <option value="Orçamento Enviado" className="bg-slate-900 text-white">Orçamento Enviado</option>
              <option value="Concluído" className="bg-slate-900 text-white">Concluído</option>
            </select>
          </div>
        </div>

        {/* Botões de Ação Dinâmicos */}
        <div className="os-footer-actions-group">
          <button
            onClick={handleImprimir}
            className="btn-os-action"
            title="Imprimir relatório da aba atual"
          >
            <span>🖨️</span> Imprimir ({abaAtiva})
          </button>

          <button
            onClick={handleCopiar}
            className="btn-os-action"
            title="Copiar dados da aba atual"
          >
            <span>📋</span> Copiar ({abaAtiva})
          </button>

          <button
            onClick={handleSalvarDados}
            className="btn-os-primary"
          >
            <span>💾</span> Salvar Dados
          </button>

          <button
            onClick={() => { setStatusOS('Finalizado'); handleSalvarDados(); }}
            className="btn-os-danger"
          >
            <span>🏁</span> Finalizar OS
          </button>
        </div>

      </div>

    </div>
  );
}