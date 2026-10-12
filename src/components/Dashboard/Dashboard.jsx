import React, { useState, useEffect } from 'react';
import { db, auth } from '../../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './Dashboard.css';
import DetalhesOS from '../DetalhesOS/DetalhesOS';

export default function Dashboard({ onLogout, userEmail }) {
  const [osList, setOsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [editingId, setEditingId] = useState(null);

  // Estados para o Modal de Novo Usuário
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [criandoUsuario, setCriandoUsuario] = useState(false);

  // Estado para o Modal de Confirmação de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [osToDelete, setOsToDelete] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Estados para o Modal de Logs e Filtros
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsList, setLogsList] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Filtros de Logs
  const [filtroLogUsuario, setFiltroLogUsuario] = useState('');
  const [filtroLogData, setFiltroLogData] = useState('');
  const [filtroLogAcao, setFiltroLogAcao] = useState('');
  const [filtroLogOS, setFiltroLogOS] = useState('');

  // Listas únicas para os filtros de select dos logs
  const usuariosUnicos = Array.from(new Set(logsList.map(log => log.usuario).filter(Boolean)));
  const numerosOSUnicos = Array.from(new Set(logsList.map(log => log.numeroOS).filter(Boolean))).sort((a, b) => a - b);

  // Estado para controlar qual OS está aberta na tela de detalhes
  const [osAberta, setOsAberta] = useState(null);

  // 👇 ADICIONE ESSA VERIFICAÇÃO AQUI:
  if (osAberta) {
    return (
      <DetalhesOS
        os={osAberta}
        onBack={() => setOsAberta(null)}
        onUpdateOS={async (osAtualizada) => {
          await updateDoc(doc(db, 'ordens_servico', osAtualizada.id), osAtualizada);
          setOsAberta(osAtualizada);
        }}
      />
    );
  }

  // Se nenhuma OS estiver aberta, o componente continua renderizando o painel normal abaixo:
  return (
    <div className="dashboard-wrapper">
      {/* Cabeçalho do Dashboard, Filtros, Cards, etc... */}
    </div>
  );
}

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

  // Função auxiliar para gravar histórico na coleção "logs"
  const registrarLog = async (acao, numOS) => {
    try {
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, '0');
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const ano = agora.getFullYear();
      const horas = String(agora.getHours()).padStart(2, '0');
      const minutos = String(agora.getMinutes()).padStart(2, '0');

      const dataFormatada = `${dia}/${mes}/${ano} - ${horas}:${minutos}`;
      const usuarioLogado = userEmail || 'Usuário desconhecido';

      await addDoc(collection(db, 'logs'), {
        usuario: usuarioLogado,
        acao: acao,
        numeroOS: numOS,
        dataFormatted: dataFormatada,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Erro ao registrar log no Firebase: ", error);
    }
  };

  const getDefaultDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Estados do Formulário de OS
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

  // Buscar Logs em tempo real quando o modal de logs estiver aberto
  useEffect(() => {
    if (!isLogsModalOpen) return;
    setLoadingLogs(true);
    const q = collection(db, 'logs');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordena por mais recente primeiro
      lista.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setLogsList(lista);
      setLoadingLogs(false);
    }, (error) => {
      console.error("Erro ao buscar logs: ", error);
      setLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [isLogsModalOpen]);

  // Filtragem dos Logs
  const logsFiltrados = logsList.filter(log => {
    const usuarioMatch = filtroLogUsuario === '' || log.usuario?.toLowerCase().includes(filtroLogUsuario.toLowerCase());
    const acaoMatch = filtroLogAcao === '' || log.acao === filtroLogAcao;
    const osMatch = filtroLogOS === '' || String(log.numeroOS || '').toLowerCase().includes(filtroLogOS.toLowerCase());
    const dataMatch = filtroLogData === '' || (log.dataFormatted && log.dataFormatted.includes(filtroLogData));

    return usuarioMatch && acaoMatch && osMatch && dataMatch;
  });

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
    setDataPrevisao(os.previsao && os.previsao !== 'Não informada' ? os.previsao : '');
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (os, e) => {
    e.stopPropagation();
    setOsToDelete(os);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!osToDelete) return;
    setExcluindo(true);
    try {
      const numOSExcluida = osToDelete.numeroOS;
      await deleteDoc(doc(db, 'ordens_servico', osToDelete.id));
      await registrarLog('excluiu', numOSExcluida);

      setDeleteModalOpen(false);
      setOsToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir OS: ", error);
      alert("Erro ao excluir OS no Firebase.");
    } finally {
      setExcluindo(false);
    }
  };

  // Função para cadastrar novo usuário (Apenas Admin)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    setCriandoUsuario(true);

    try {
      await createUserWithEmailAndPassword(auth, novoEmail, novaSenha);
      setUserSuccess('Usuário cadastrado com sucesso!');
      setNovoEmail('');
      setNovaSenha('');
      setTimeout(() => {
        setIsUserModalOpen(false);
        setUserSuccess('');
      }, 2000);
    } catch (err) {
      console.error("Erro ao criar usuário: ", err);
      if (err.code === 'auth/email-already-in-use') {
        setUserError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setUserError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setUserError('Erro ao cadastrar usuário. Tente novamente.');
      }
    } finally {
      setCriandoUsuario(false);
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
        updatedBy: userEmail,
      };

      if (editingId) {
        await updateDoc(doc(db, 'ordens_servico', editingId), dadosOS);
        await registrarLog('editou', numeroOS);
      } else {
        await addDoc(collection(db, 'ordens_servico'), {
          ...dadosOS,
          createdBy: userEmail,
          status: 'Aguardando',
          createdAt: new Date()
        });
        await registrarLog('criou', numeroOS);
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
            Conectado como <strong className="text-slate-200">{userEmail}</strong>
          </p>
        </div>
        
        <div className="dashboard-actions-group">
          
          {/* Botão de Logs do Sistema (Visível apenas para o Admin) */}
          {userEmail === 'scoobydevmurilo@gmail.com' && (
            <button
              onClick={() => setIsLogsModalOpen(true)}
              className="btn-logs-header"
              title="Auditoria e Logs do Sistema"
            >
              <span>📋</span> Logs
            </button>
          )}

          {/* Botão de Novo Usuário (Visível apenas para o seu e-mail) */}
          {userEmail === 'scoobydevmurilo@gmail.com' && (
            <button
              onClick={() => { setIsUserModalOpen(true); setUserError(''); setUserSuccess(''); }}
              className="btn-user-add"
              title="Cadastrar novo técnico"
            >
              <span>👤+</span> Novo Usuário
            </button>
          )}

          <button onClick={handleOpenNewModal} className="dashboard-btn-new">
            <span className="text-lg">+</span> Nova OS
          </button>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-logout"
              title="Encerrar Sessão"
            >
              <span>🚪</span> Sair
            </button>
          )}
        </div>
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
                <span 
                  onClick={(e) => { e.stopPropagation(); setOsAberta(os); }}
                  className="text-blue-400 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  Abrir OS →
                </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
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
            <div className="modal-confirm-actions">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="btn-secondary flex-1 py-3"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindo}
                onClick={handleConfirmDelete}
                className="btn-danger flex-1 py-3"
              >
                {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LOGS DO SISTEMA */}
      {isLogsModalOpen && (
        <div className="modal-overlay">
          <div className="logs-modal-container">
            
            {/* Header Fixo do Modal de Logs */}
            <div className="modal-fixed-header">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📋</span> Auditoria de Logs do Sistema
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Histórico completo de rastreabilidade de ações dos técnicos.
                </p>
              </div>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="modal-close-btn"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {/* Corpo do Modal de Logs */}
            <div className="modal-fixed-body flex flex-col gap-4">
              
{/* Filtros de Logs Atualizados (Com Selects) */}
              <div className="logs-filters-grid">
                <div className="form-group !mb-0">
                  <label className="form-label">Filtrar por Usuário</label>
                  <select
                    value={filtroLogUsuario}
                    onChange={(e) => setFiltroLogUsuario(e.target.value)}
                    className="form-input text-xs py-2"
                  >
                    <option value="">Todos os Usuários</option>
                    {usuariosUnicos.map((user, idx) => (
                      <option key={idx} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group !mb-0">
                  <label className="form-label">Filtrar por Ação</label>
                  <select
                    value={filtroLogAcao}
                    onChange={(e) => setFiltroLogAcao(e.target.value)}
                    className="form-input text-xs py-2"
                  >
                    <option value="">Todas as Ações</option>
                    <option value="criou">Criou</option>
                    <option value="editou">Editou</option>
                    <option value="excluiu">Excluiu</option>
                  </select>
                </div>

                <div className="form-group !mb-0">
                  <label className="form-label">Filtrar por Nº da OS</label>
                  <select
                    value={filtroLogOS}
                    onChange={(e) => setFiltroLogOS(e.target.value)}
                    className="form-input text-xs py-2"
                  >
                    <option value="">Todas as OS</option>
                    {numerosOSUnicos.map((num, idx) => (
                      <option key={idx} value={num}>OS #{num}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group !mb-0">
                  <label className="form-label">Filtrar por Data</label>
                  <input
                    type="text"
                    value={filtroLogData}
                    onChange={(e) => setFiltroLogData(e.target.value)}
                    placeholder="Ex: 12/10/2026"
                    className="form-input text-xs py-2"
                  />
                </div>
              </div>

              {/* Tabela de Logs Limpa (Sem coluna mensagem) */}
              <div className="logs-table-container">
                {loadingLogs ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Carregando registros de auditoria...</div>
                ) : logsFiltrados.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">Nenhum log encontrado com os filtros aplicados.</div>
                ) : (
                  <table className="logs-table">
                    <thead>
                      <tr>
                        <th>Data / Hora</th>
                        <th>Usuário</th>
                        <th>Ação</th>
                        <th>Nº OS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsFiltrados.map((log) => (
                        <tr key={log.id}>
                          <td className="whitespace-nowrap font-medium text-slate-300">{log.dataFormatted}</td>
                          <td className="text-blue-400 font-medium">{log.usuario}</td>
                          <td>
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase ${
                              log.acao === 'criou' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              log.acao === 'editou' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {log.acao}
                            </span>
                          </td>
                          <td className="font-bold text-white">#{log.numeroOS}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* Rodapé Fixo do Modal de Logs */}
            <div className="modal-fixed-footer justify-between">
              <span className="text-xs text-slate-400">
                Total de registros exibidos: <strong className="text-slate-200">{logsFiltrados.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsLogsModalOpen(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Fechar Logs
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Novo Usuário (Restrito ao Admin) */}
      {isUserModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-md">
            
            <div className="modal-header-box">
              <div>
                <h2 className="text-xl font-bold text-white">Cadastrar Novo Técnico</h2>
                <p className="text-slate-400 text-xs mt-1">Adicione um novo acesso ao sistema</p>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="modal-close-btn"
                title="Fechar"
              >
                ✕
              </button>
            </div>

            {userError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-3.5 rounded-xl text-center mb-4">
                {userError}
              </div>
            )}

            {userSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium p-3.5 rounded-xl text-center mb-4">
                {userSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="flex flex-col gap-1">
              <div className="form-group">
                <label className="form-label">E-mail do Novo Técnico</label>
                <input
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="tecnico2@assistencia.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Senha Temporária</label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criandoUsuario}
                  className="btn-primary"
                >
                  {criandoUsuario ? 'Cadastrando...' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de OS */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container-fixed">
            
            {/* 1. Header Fixo */}
            <div className="modal-fixed-header">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {editingId ? 'Altere as informações necessárias da OS.' : 'Preencha as informações iniciais para registrar o aparelho.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
                title="Fechar"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitOS} className="modal-form-wrapper">
              
              {/* 2. Conteúdo com Scroll Interno */}
              <div className="modal-fixed-body">
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
              </div>

              {/* 3. Rodapé Fixo */}
              <div className="modal-fixed-footer">
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