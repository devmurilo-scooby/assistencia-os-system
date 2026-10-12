// src/components/DetalhesOS/DetalhesOS.jsx
import React, { useState } from 'react';
import './DetalhesOS.css';

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
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [subAbaChecklist, setSubAbaChecklist] = useState('inicio');
  const [statusOS, setStatusOS] = useState(os.status || 'Aguardando');

  const itensPadrao = os.tipo === 'desktop' ? CHECKLIST_DESKTOP : CHECKLIST_NOTEBOOK;

  const [checklistInicio, setChecklistInicio] = useState(
    os.checklistInicio || itensPadrao.reduce((acc, item) => ({ ...acc, [item.id]: { checked: false, comentario: '' } }), {})
  );

  const [checklistFinal, setChecklistFinal] = useState(
    os.checklistFinal || itensPadrao.reduce((acc, item) => ({ ...acc, [item.id]: { checked: false, comentario: '' } }), {})
  );

  const [novoItemNome, setNovoItemNome] = useState('');
  const [itensCustomizados, setItensCustomizados] = useState(os.itensCustomizados || []);

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

  const handleAddCustomItem = () => {
    if (!novoItemNome.trim()) return;
    const novoId = `custom_${Date.now()}`;
    const novoItem = { id: novoId, label: novoItemNome.trim() };
    
    setItensCustomizados([...itensCustomizados, novoItem]);
    setChecklistInicio(prev => ({ ...prev, [novoId]: { checked: false, comentario: '' } }));
    setChecklistFinal(prev => ({ ...prev, [novoId]: { checked: false, comentario: '' } }));
    setNovoItemNome('');
  };

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

  const handleImprimir = () => window.print();

  const handleCopiar = () => {
    const textoResumo = `OS #${os.numeroOS} - Cliente: ${os.cliente} | Aparelho: ${os.tipo} | Status: ${statusOS}`;
    navigator.clipboard.writeText(textoResumo);
    alert(`Resumo copiado para a área de transferência referente à aba: [${abaAtiva.toUpperCase()}]!`);
  };

  const listaCompletaChecklist = [...itensPadrao, ...itensCustomizados];

  const formatDateTimeBR = (isoString) => {
    if (!isoString) return 'Não informada';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  return (
    <div className="os-page-wrapper">
      
      {/* 1. Barra Superior com Botão de Voltar Limpo */}
      <div className="os-top-bar">
        <button onClick={onBack} className="os-back-btn">
          <span>←</span> Voltar ao Painel
        </button>
        <span className="text-xs text-slate-400 font-mono">Sistema de Gestão Técnica</span>
      </div>

      {/* 2. Cabeçalho de Informações da OS */}
      <div className="os-info-header">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span>📋</span> OS #{os.numeroOS} — <span className="text-blue-400">{os.cliente}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 capitalize flex items-center gap-3">
            <span>Tipo: <strong className="text-slate-200">{os.tipo}</strong></span>
            <span>•</span>
            <span>Contato: <strong className="text-slate-200">{os.contato || 'Não informado'}</strong></span>
          </p>
        </div>

        <div className="os-status-pill">
          <span>Status:</span>
          <strong className="text-white">{statusOS}</strong>
        </div>
      </div>

      {/* 3. Navegação por Abas Principais */}
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

      {/* 4. Conteúdo Dinâmico */}
      <div className="os-page-content">
        
{/* ABA RESUMO EM CARDS LIMPOS E PROFISSIONAIS */}
        {abaAtiva === 'resumo' && (
          <div className="resumo-grid">
            
            {/* Card 1: Checklist & Defeitos Iniciais */}
            <div className="resumo-card">
              <div className="flex flex-col gap-4">
                <h3 className="resumo-card-title">
                  <span>⚠️</span> Defeito & Checklist Inicial
                </h3>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Descrição do Problema:</span>
                  <p className="text-slate-100 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed">
                    {os.defeito || 'Nenhum defeito detalhado inicialmente.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Data de Entrada:</span>
                <strong className="text-slate-200">{formatDateTimeBR(os.dataEntrada)}</strong>
              </div>
            </div>

            {/* Card 2: Tempos Registrados */}
            <div className="resumo-card">
              <div className="flex flex-col gap-4">
                <h3 className="resumo-card-title">
                  <span>⏱️</span> Tempos de Execução
                </h3>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <th className="p-3 font-semibold">Atividade</th>
                        <th className="p-3 font-semibold text-right">Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 text-slate-400 italic" colSpan="2">Nenhum tempo registrado até o momento.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Total acumulado:</span>
                <strong className="text-white font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">00:00:00</strong>
              </div>
            </div>

            {/* Card 3: Serviços e Comentários */}
            <div className="resumo-card">
              <div className="flex flex-col gap-4">
                <h3 className="resumo-card-title">
                  <span>💬</span> Serviços & Valores
                </h3>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Serviços Pré-Aprovados:</span>
                  {os.servicosPreAprovados?.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {os.servicosPreAprovados.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-200 font-medium">{s.nome}</span>
                          <span className="text-emerald-400 font-bold shrink-0 ml-2">
                            R$ {Number(s.valor || 0).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 bg-slate-950 p-3.5 rounded-xl border border-slate-800">Nenhum serviço cadastrado.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Previsão:</span>
                <strong className="text-slate-200">{formatDateTimeBR(os.previsao)}</strong>
              </div>
            </div>

          </div>
        )}

        {/* ABA CHECKLIST */}
        {abaAtiva === 'checklist' && (
          <div className="flex flex-col gap-6">
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

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3 items-center shadow-lg">
              <input
                type="text"
                value={novoItemNome}
                onChange={(e) => setNovoItemNome(e.target.value)}
                placeholder="Adicionar novo item personalizado ao checklist..."
                className="form-input flex-1 !mb-0 text-xs py-2.5"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-blue-600/20"
              >
                + Adicionar Item
              </button>
            </div>

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
                      <span className={`text-xs font-bold leading-relaxed ${dadosItem.checked ? 'text-blue-300 line-through' : 'text-white'}`}>
                        {item.label}
                      </span>
                      <div className="checklist-checkbox-box">
                        {dadosItem.checked ? '✓' : ''}
                      </div>
                    </div>

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

        {abaAtiva === 'tempos' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">⏱️</span>
            <h3 className="text-lg font-bold text-white">Controle de Tempos</h3>
            <p className="text-slate-400 text-xs max-w-sm">Módulo de cronômetro e registro de horas trabalhadas em desenvolvimento.</p>
          </div>
        )}

        {abaAtiva === 'comentarios' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">💬</span>
            <h3 className="text-lg font-bold text-white">Comentários e Histórico</h3>
            <p className="text-slate-400 text-xs max-w-sm">Módulo de notas técnicas detalhadas em desenvolvimento.</p>
          </div>
        )}

      </div>

{/* 5. BARRA DE RODAPÉ FIXA GLOBAL COM ALINHAMENTO PERFEITO */}
      <div className="os-fixed-footer-bar">
        
        <div className="os-footer-left-group">
          <button onClick={onBack} className="btn-os-action">
            <span>✕</span> Fechar
          </button>

          <div className="os-status-container">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status:</span>
            <select
              value={statusOS}
              onChange={(e) => setStatusOS(e.target.value)}
              className="os-status-select"
            >
              <option value="Aguardando">Aguardando</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Orçamento Enviado">Orçamento Enviado</option>
              <option value="Concluído">Concluído</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        <div className="os-footer-actions-group">
          <button onClick={handleImprimir} className="btn-os-action">
            <span>🖨️</span> Imprimir ({abaAtiva})
          </button>

          <button onClick={handleCopiar} className="btn-os-action">
            <span>📋</span> Copiar ({abaAtiva})
          </button>

          <button onClick={handleSalvarDados} className="btn-os-primary">
            <span>💾</span> Salvar Dados
          </button>

          <button onClick={() => { setStatusOS('Finalizado'); handleSalvarDados(); }} className="btn-os-danger">
            <span>🏁</span> Finalizar OS
          </button>
        </div>

      </div>

    </div>
  );
}