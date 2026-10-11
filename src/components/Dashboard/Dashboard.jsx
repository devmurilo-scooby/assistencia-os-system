import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './Dashboard.css';

export default function Dashboard() {
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [editingId, setEditingId] = useState(null);

  // Estado para o Modal de Confirmação de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [osToDelete, setOsToDelete] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Função para aplicar máscara de telefone automático: (XX) XXXXX-XXXX
  const formatPhone = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Função para formatar data ISO para Padrão BR (DD/MM/AAAA - HH:mm)
  const formatDateTimeBR = (isoString) => {
    if (!isoString || isoString === 'Não informada') return 'Não informada';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const getDefaultDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Estados do Formulário
  const [numeroOS, setNumeroOS] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [contato, setContato] = useState('');
  const [tipoAparelho, setTipoAparelho] = useState('notebook');
  const [defeito, setDefeito] = useState('');
  const [servicosPreAprovados, setServicosPreAprovados] = useState([{ nome: '', valor: '' }]);
  const [dataEntrada, setDataEntrada] = useState(getDefaultDateTimeLocal());
  const [dataPrevisao, setDataPrevisao] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Buscar OS em tempo real
  useEffect(() => {
    const q = collection(db, 'ordens_servico');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOsList(lista);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar OS do Firebase: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleContatoChange = (e) => {
    setContato(formatPhone(e.target.value));
  };

  const handleAddServicoRow = () => {
    setServicosPreAprovados([...servicosPreAprovados, { nome: '', valor: '' }]);
  };

  const handleServicoChange = (index, field, value) => {
    const novosServicos = [...servicosPreAprovados];
    novosServicos[index][field] = value;
    setServicosPreAprovados(novosServicos);
  };

  const handleRemoveServicoRow = (index) => {
    const novosServicos = servicosPreAprovados.filter((_, i) => i !== index);
    setServicosPreAprovados(novosServicos);
  };

  const handleOpenNewModal = () => {
    setEditingId(null);
    setNumeroOS('');
    setNomeCliente('');
    setContato('');
    setTipoAparelho('notebook');
    setDefeito('');
    setServicosPreAprovados([{ nome: '', valor: '' }]);
    setDataEntrada(getDefaultDateTimeLocal());
    setDataPrevisao('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (os, e) => {
    e.stopPropagation();
    setEditingId(os.id);
    setNumeroOS(os.numeroOS || '');
    setNomeCliente(os.cliente || '');
    setContato(os.contato || '');
    setTipoAparelho(os.tipo || 'notebook');
    setDefeito(os.defeito || '');
    setServicosPreAprovados(os.servicosPreAprovados?.length > 0 ? os.servicosPreAprovados : [{ nome: '', valor: '' }]);
    setDataEntrada(os.dataEntrada || getDefaultDateTimeLocal());
    setDataPrevisao(os.previsao || '');
    setIsModalOpen(true);
  };

  // Abrir Modal de Confirmação de Exclusão Customizado
  const handleOpenDeleteModal = (os, e) => {
    e.stopPropagation();
    setOsToDelete(os);
    setDeleteModalOpen(true);
  };

  // Confirmar Exclusão no Firebase
  const handleConfirmDelete = async () => {
    if (!osToDelete) return;
    setExcluindo(true);
    try {
      await deleteDoc(doc(db, 'ordens_servico', osToDelete.id));
      setDeleteModalOpen(false);
      setOsToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir OS: ", error);
      alert("Erro ao excluir OS no Firebase.");
    } finally {
      setExcluindo(false);
    }
  };

  const handleSubmitOS = async (e) => {
    e.preventDefault();
    if (!numeroOS || !nomeCliente || !defeito) {
      alert('Por favor, preencha os campos obrigatórios (Número da OS, Cliente e Defeito).');
      return;
    }

    setSalvando(true);
    try {
      const dadosOS = {
        numeroOS,
        cliente: nomeCliente,
        contato,
        tipo: tipoAparelho,
        defeito,
        servicosPreAprovados: servicosPreAprovados.filter(s => s.nome.trim() !== ''),
        dataEntrada,
        previsao: dataPrevisao || 'Não informada',
      };

      if (editingId) {
        await updateDoc(doc(db, 'ordens_servico', editingId), dadosOS);
      } else {
        await addDoc(collection(db, 'ordens_servico'), {
          ...dadosOS,
          status: 'Aguardando',
          createdAt: new Date()
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar OS: ", error);
      alert("Erro ao salvar OS no Firebase.");
    } finally {
      setSalvando(false);
    }
  };

  const osFiltradas = osList.filter(os => {
    if (filtroStatus === 'todos') return true;
    const statusLower = (os.status || '').toLowerCase();
    if (filtroStatus === 'aguardando' && statusLower.includes('aguardando')) return true;
    if (filtroStatus === 'andamento' && statusLower.includes('em andamento')) return true;
    if (filtroStatus === 'orcamento' && statusLower.includes('orçamento')) return true;
    return false;
  });

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('aguardando')) return 'os-badge-status-amber';
    if (s.includes('andamento')) return 'os-badge-status-emerald';
    return 'os-badge-status-purple';
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* Cabeçalho */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            🛠️ Assistência Técnica - Ordens de Serviço
          </h1>
          <p className="dashboard-subtitle">
            Firebase Conectado • Painel em tempo real
          </p>
        </div>
        
        <button onClick={handleOpenNewModal} className="dashboard-btn-new">
          <span className="text-lg">+</span> Nova OS
        </button>
      </div>

      {/* Filtros Rápidos */}
      <div className="dashboard-filters">
        <button 
          onClick={() => setFiltroStatus('todos')}
          className={`filter-btn-base ${filtroStatus === 'todos' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
        >
          Todas ({osList.length})
        </button>
        <button 
          onClick={() => setFiltroStatus('aguardando')}
          className={`filter-btn-base ${filtroStatus === 'aguardando' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
        >
          Aguardando
        </button>
        <button 
          onClick={() => setFiltroStatus('andamento')}
          className={`filter-btn-base ${filtroStatus === 'andamento' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
        >
          Em Andamento
        </button>
        <button 
          onClick={() => setFiltroStatus('orcamento')}
          className={`filter-btn-base ${filtroStatus === 'orcamento' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
        >
          Orçamento Enviado
        </button>
      </div>

      {/* Estados de Carregamento e Vazio */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando ordens de serviço do Firebase...</div>
      ) : osList.length === 0 ? (
        <div className="empty-state-card">
          <div className="text-5xl mb-2">📋</div>
          <h3 className="text-xl font-bold text-white">Nenhuma OS cadastrada</h3>
          <p className="text-slate-400 text-sm max-w-xs mb-2">
            Não há ordens de serviço registradas no momento. Clique abaixo para iniciar.
          </p>
          <button onClick={handleOpenNewModal} className="dashboard-btn-new">
            + Criar Primeira OS
          </button>
        </div>
      ) : (
        /* Grid de Cards das OS */
        <div className="dashboard-grid">
          {osFiltradas.map((os) => (
            <div key={os.id} className="os-card">
              <div>
                <div className="os-card-header">
                  <span className="os-badge-num">OS #{os.numeroOS}</span>
                  <span className={getStatusBadgeClass(os.status)}>{os.status}</span>
                </div>

                <h3 className="os-client-name">{os.cliente}</h3>
                <p className="os-client-info">
                  <span>📱 {os.contato ? formatPhone(os.contato) : 'Sem contato'}</span>
                  <span>•</span>
                  <span className="capitalize font-semibold text-slate-300">💻 {os.tipo}</span>
                </p>
                
                <div className="os-defeito-box">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">Defeito Relatado:</p>
                  <p className="text-sm text-slate-300 line-clamp-2">{os.defeito}</p>
                </div>
              </div>

              <div>
                <div className="os-actions-row">
                  <button 
                    onClick={(e) => handleOpenEditModal(os, e)}
                    className="btn-card-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={(e) => handleOpenDeleteModal(os, e)}
                    className="btn-card-delete"
                  >
                    🗑️ Excluir
                  </button>
                </div>

                <div className="os-footer">
                  <span>Previsão: <strong className="text-slate-200">{formatDateTimeBR(os.previsao)}</strong></span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                    Abrir OS →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Customizado) */}
      {deleteModalOpen && osToDelete && (
        <div className="modal-overlay">
          <div className="modal-confirm-container">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-2xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Excluir Ordem de Serviço</h3>
              <p className="text-slate-400 text-sm">
                Tem certeza que deseja excluir a <strong className="text-slate-200">OS #{osToDelete.numeroOS}</strong> ({osToDelete.cliente})? Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindo}
                onClick={handleConfirmDelete}
                className="btn-danger flex-1"
              >
                {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de OS */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="text-xl font-bold text-white mb-1">
              {editingId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {editingId ? 'Altere as informações necessárias da OS.' : 'Preencha as informações iniciais para registrar o aparelho.'}
            </p>
            
            <form onSubmit={handleSubmitOS}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Número da OS *</label>
                  <input
                    type="text"
                    required
                    value={numeroOS}
                    onChange={(e) => setNumeroOS(e.target.value)}
                    placeholder="Ex: 1025"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de Aparelho</label>
                  <select
                    value={tipoAparelho}
                    onChange={(e) => setTipoAparelho(e.target.value)}
                    className="form-input"
                  >
                    <option value="notebook">Notebook</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contato do Cliente</label>
                  <input
                    type="text"
                    value={contato}
                    onChange={handleContatoChange}
                    placeholder="(43) 99999-9999"
                    maxLength={15}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Defeito Apresentado *</label>
                <textarea
                  required
                  rows="3"
                  value={defeito}
                  onChange={(e) => setDefeito(e.target.value)}
                  placeholder="Descreva o problema relatado..."
                  className="form-input"
                ></textarea>
              </div>

              {/* Serviços Pré-Aprovados */}
              <div className="form-group">
                <label className="form-label mb-2">Serviços Pré-Aprovados e Valores</label>
                <div className="space-y-3">
                  {servicosPreAprovados.map((servico, index) => (
                    <div key={index} className="servico-row">
                      <input
                        type="text"
                        value={servico.nome}
                        onChange={(e) => handleServicoChange(index, 'nome', e.target.value)}
                        placeholder="Nome do serviço (Ex: Limpeza)"
                        className="form-input flex-1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={servico.valor}
                        onChange={(e) => handleServicoChange(index, 'valor', e.target.value)}
                        placeholder="Valor (R$)"
                        className="form-input w-36"
                      />
                      {servicosPreAprovados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveServicoRow(index)}
                          className="bg-slate-800 hover:bg-red-500/20 text-red-400 px-3.5 py-3 rounded-xl border border-slate-700 transition cursor-pointer text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddServicoRow}
                  className="mt-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>+</span> Adicionar Nova Linha de Serviço
                </button>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Data e Hora de Entrada</label>
                  <input
                    type="datetime-local"
                    value={dataEntrada}
                    onChange={(e) => setDataEntrada(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data e Hora Prevista</label>
                  <input
                    type="datetime-local"
                    value={dataPrevisao}
                    onChange={(e) => setDataPrevisao(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-primary"
                >
                  {salvando ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Cadastrar OS')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}