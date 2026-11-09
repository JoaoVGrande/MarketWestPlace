// js/main.js
import { setUsuarioLogado, getUsuarioLogado, getMinhaColecao, salvarMinhaColecao, getMinhaVitrine, salvarMinhaVitrine, getLojasMercado, getCartasDaVitrine, pesquisarCartasNoMercado, enviarPedidoDeCompra, getMinhasNotificacoes, responderPedido } from './api.js';
import { renderizarColecao, renderizarEdicaoVitrine, renderizarListaLojas, renderizarCartasLoja, renderizarCarrinho, renderizarNotificacoes, renderizarResultadosBusca } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE TROCA DE ABAS ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('text-rift-accent', 'border-rift-primary'));
            tabButtons.forEach(btn => btn.classList.add('text-gray-400', 'border-transparent'));
            tabContents.forEach(content => { content.classList.remove('block'); content.classList.add('hidden'); });
            
            button.classList.remove('text-gray-400', 'border-transparent');
            button.classList.add('text-rift-accent', 'border-rift-primary');
            document.getElementById(button.getAttribute('data-target')).classList.remove('hidden');
            document.getElementById(button.getAttribute('data-target')).classList.add('block');
        });
    });

    // --- SISTEMA DE LOGIN SIMULADO ---
    const seletorUsuario = document.getElementById('seletor-usuario');
    const headerAvatar = document.getElementById('header-avatar');
    
    function carregarDadosDoUsuario() {
        const user = getUsuarioLogado();
        headerAvatar.src = user.avatar;
        
        carrinho = [];
        document.getElementById('contador-carrinho').textContent = "0";
        renderizarCarrinho(carrinho, 'itens-carrinho-container', 'total-carrinho');
        
        atualizarTelaColecao();
        atualizarTelaVitrinePessoal();
        renderizarListaLojas(getLojasMercado(), 'mercado-lojas-container');
        document.getElementById('btn-voltar-mercado').click(); 
        atualizarNotificacoes();

        // Limpa a busca ao trocar de conta
        document.getElementById('busca-global-input').value = '';
        document.getElementById('busca-resultados-container').innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">Use a barra acima para pesquisar cartas no mercado global.</div>`;
    }

    function atualizarNotificacoes() {
        renderizarNotificacoes(getMinhasNotificacoes(), 'itens-notificacoes-container', 'contador-notificacoes');
    }

    seletorUsuario.addEventListener('change', (e) => {
        setUsuarioLogado(e.target.value);
        carregarDadosDoUsuario();
    });

    // --- COLEÇÃO ---
    let isEditModeColecao = false;
    let mudancasColecao = {}; 
    
    function atualizarTelaColecao() {
        const filtroTipo = document.getElementById('filtro-quantidade').value;
        const termoBusca = document.getElementById('busca-nome').value.toLowerCase();
        
        const cartas = getMinhaColecao().filter(carta => {
            const qtdAtual = mudancasColecao[carta.id] !== undefined ? mudancasColecao[carta.id] : carta.quantidade;
            const passaNaBusca = carta.nome.toLowerCase().includes(termoBusca);
            
            let passaNoFiltro = true;
            if (filtroTipo === 'possuidas') passaNoFiltro = qtdAtual > 0;
            if (filtroTipo === 'faltantes') passaNoFiltro = qtdAtual === 0;
            
            return passaNaBusca && passaNoFiltro;
        });
        renderizarColecao(cartas, 'colecao-container', { isEditMode: isEditModeColecao, mudancasPendentes: mudancasColecao });
    }

    // Ouvintes de busca na coleção
    document.getElementById('busca-nome').addEventListener('input', atualizarTelaColecao);
    document.getElementById('filtro-quantidade').addEventListener('change', atualizarTelaColecao);

    document.getElementById('btn-editar-colecao').addEventListener('click', (e) => {
        isEditModeColecao = !isEditModeColecao; 
        const btn = e.target;
        const btnSalvar = document.getElementById('btn-salvar-colecao');
        
        if (isEditModeColecao) {
            btn.textContent = "Cancelar Edição"; btn.classList.replace('bg-gray-700', 'bg-red-600');
            btnSalvar.classList.remove('hidden'); btnSalvar.disabled = true; 
        } else {
            btn.textContent = "Editar"; btn.classList.replace('bg-red-600', 'bg-gray-700');
            btnSalvar.classList.add('hidden'); mudancasColecao = {}; 
        }
        atualizarTelaColecao();
    });

    document.getElementById('colecao-container').addEventListener('click', (e) => {
        if (!isEditModeColecao) return;
        if (e.target.classList.contains('btn-mais') || e.target.classList.contains('btn-menos')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const original = getMinhaColecao().find(c => c.id === id);
            let qtd = mudancasColecao[id] !== undefined ? mudancasColecao[id] : original.quantidade;
            
            if (e.target.classList.contains('btn-mais')) qtd++;
            else if (qtd > 0) qtd--;
            
            mudancasColecao[id] = qtd;
            document.getElementById('btn-salvar-colecao').disabled = false;
            atualizarTelaColecao();
        }
    });

    document.getElementById('btn-salvar-colecao').addEventListener('click', () => {
        salvarMinhaColecao(mudancasColecao);
        document.getElementById('btn-editar-colecao').click(); 
    });


    // --- VITRINE PESSOAL (A SUA LOJA) ---
    let isEditModeVitrine = false;
    let mudancasVitrine = {};

    function atualizarTelaVitrinePessoal() {
        renderizarEdicaoVitrine(getMinhaVitrine(), 'vitrine-container', { 
            isEditMode: isEditModeVitrine, 
            mudancasPendentes: mudancasVitrine 
        });
    }

    document.getElementById('btn-editar-vitrine').addEventListener('click', (e) => {
        isEditModeVitrine = !isEditModeVitrine; 
        const btn = e.target;
        const btnSalvar = document.getElementById('btn-salvar-vitrine');
        
        if (isEditModeVitrine) {
            btn.textContent = "Cancelar Gerenciamento"; btn.classList.replace('bg-gray-700', 'bg-red-600');
            btnSalvar.classList.remove('hidden'); btnSalvar.disabled = true; 
        } else {
            btn.textContent = "Gerenciar Vitrine"; btn.classList.replace('bg-red-600', 'bg-gray-700');
            btnSalvar.classList.add('hidden'); mudancasVitrine = {}; 
        }
        atualizarTelaVitrinePessoal();
    });

    // Modificar preço e quantidade na Vitrine
    document.getElementById('vitrine-container').addEventListener('input', (e) => {
        if (!isEditModeVitrine) return;
        if (e.target.classList.contains('input-preco-vitrine')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const original = getMinhaVitrine().find(c => c.id === id);
            
            if (!mudancasVitrine[id]) mudancasVitrine[id] = { qtdVenda: original.qtdVenda, precoVenda: original.precoVenda };
            mudancasVitrine[id].precoVenda = parseFloat(e.target.value) || 0;
            document.getElementById('btn-salvar-vitrine').disabled = false;
        }
    });

    document.getElementById('vitrine-container').addEventListener('click', (e) => {
        if (!isEditModeVitrine) return;
        if (e.target.classList.contains('btn-mais-vitrine') || e.target.classList.contains('btn-menos-vitrine')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const original = getMinhaVitrine().find(c => c.id === id);
            
            if (!mudancasVitrine[id]) mudancasVitrine[id] = { qtdVenda: original.qtdVenda, precoVenda: original.precoVenda };
            
            if (e.target.classList.contains('btn-mais-vitrine')) mudancasVitrine[id].qtdVenda++;
            else if (mudancasVitrine[id].qtdVenda > 0) mudancasVitrine[id].qtdVenda--;
            
            document.getElementById('btn-salvar-vitrine').disabled = false;
            atualizarTelaVitrinePessoal();
        }
    });

    document.getElementById('btn-salvar-vitrine').addEventListener('click', () => {
        salvarMinhaVitrine(mudancasVitrine);
        document.getElementById('btn-editar-vitrine').click(); 
        renderizarListaLojas(getLojasMercado(), 'mercado-lojas-container'); 
    });


    // --- MERCADO, BUSCA E CARRINHO ---
    let carrinho = []; 
    let lojaAbertaAtualmente = null;

    function processarAdicaoCarrinho(oferta) {
        if (!oferta) return;
        let itemNoCarrinho = carrinho.find(item => item.idVenda === oferta.idVenda);

        if (itemNoCarrinho) {
            if (itemNoCarrinho.quantidadeSelecionada < oferta.quantidadeDisponivel) {
                itemNoCarrinho.quantidadeSelecionada++;
            }
        } else {
            carrinho.push({ ...oferta, quantidadeSelecionada: 1 });
        }
        atualizarUiCarrinhoGlobal();
    }

    function processarRemocaoCarrinho(idVenda) {
        const index = carrinho.findIndex(item => item.idVenda === idVenda);
        if (index !== -1) {
            if (carrinho[index].quantidadeSelecionada > 1) {
                carrinho[index].quantidadeSelecionada--; 
            } else {
                carrinho.splice(index, 1); 
            }
            atualizarUiCarrinhoGlobal();
        }
    }

    function atualizarUiCarrinhoGlobal() {
        const totalCartas = carrinho.reduce((acc, item) => acc + item.quantidadeSelecionada, 0);
        document.getElementById('contador-carrinho').textContent = totalCartas;
        renderizarCarrinho(carrinho, 'itens-carrinho-container', 'total-carrinho');

        if (lojaAbertaAtualmente && !document.getElementById('mercado-cartas-container').classList.contains('hidden')) {
            renderizarCartasLoja(getCartasDaVitrine(lojaAbertaAtualmente), 'mercado-cartas-container', carrinho);
        }
        const termoBusca = document.getElementById('busca-global-input').value;
        if (termoBusca.length > 0) {
            renderizarResultadosBusca(pesquisarCartasNoMercado(termoBusca), 'busca-resultados-container', carrinho);
        }
    }

    // Navegação nas Lojas do Mercado
    document.getElementById('mercado-lojas-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-entrar-loja')) {
            lojaAbertaAtualmente = e.target.getAttribute('data-nome');
            renderizarCartasLoja(getCartasDaVitrine(lojaAbertaAtualmente), 'mercado-cartas-container', carrinho);
            document.getElementById('mercado-lojas-container').classList.add('hidden');
            document.getElementById('mercado-cartas-container').classList.remove('hidden');
            document.getElementById('btn-voltar-mercado').classList.remove('hidden');
        }
    });

    document.getElementById('btn-voltar-mercado').addEventListener('click', () => {
        lojaAbertaAtualmente = null;
        document.getElementById('mercado-cartas-container').classList.add('hidden');
        document.getElementById('mercado-lojas-container').classList.remove('hidden');
        document.getElementById('btn-voltar-mercado').classList.add('hidden');
    });

    document.getElementById('mercado-cartas-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-comprar-vitrine') || e.target.classList.contains('btn-add-carrinho')) {
            const idVenda = e.target.getAttribute('data-id');
            const vendedor = e.target.getAttribute('data-vendedor');
            processarAdicaoCarrinho(getCartasDaVitrine(vendedor).find(i => i.idVenda === idVenda));
        }
        if (e.target.classList.contains('btn-diminuir-carrinho')) {
            const idVenda = e.target.getAttribute('data-id');
            processarRemocaoCarrinho(idVenda);
        }
    });

    // BUSCA GLOBAL
    const inputBuscaGlobal = document.getElementById('busca-global-input');
    const containerResultados = document.getElementById('busca-resultados-container');

    inputBuscaGlobal.addEventListener('input', (e) => {
        const termo = e.target.value;
        if (termo.length === 0) {
            containerResultados.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">Use a barra acima para pesquisar cartas no mercado global.</div>`;
        } else {
            renderizarResultadosBusca(pesquisarCartasNoMercado(termo), 'busca-resultados-container', carrinho);
        }
    });

    containerResultados.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-carrinho')) {
            const idVenda = e.target.getAttribute('data-id');
            const vendedor = e.target.getAttribute('data-vendedor');
            processarAdicaoCarrinho(getCartasDaVitrine(vendedor).find(i => i.idVenda === idVenda));
        }
        if (e.target.classList.contains('btn-diminuir-carrinho')) {
            const idVenda = e.target.getAttribute('data-id');
            processarRemocaoCarrinho(idVenda);
        }

        if (e.target.classList.contains('btn-ir-vitrine')) {
            const vendedorPuro = e.target.getAttribute('data-vendedor');
            document.querySelector('[data-target="mercado"]').click(); // Força a troca de aba
            lojaAbertaAtualmente = `@${vendedorPuro}`;
            renderizarCartasLoja(getCartasDaVitrine(lojaAbertaAtualmente), 'mercado-cartas-container', carrinho);
            document.getElementById('mercado-lojas-container').classList.add('hidden');
            document.getElementById('mercado-cartas-container').classList.remove('hidden');
            document.getElementById('btn-voltar-mercado').classList.remove('hidden');
            document.getElementById('mercado-titulo').textContent = `Vitrine de ${lojaAbertaAtualmente}`;
            document.getElementById('mercado-subtitulo').textContent = "Você chegou aqui através de uma busca.";
        }
    });
    
    // Controles do Carrinho
    document.getElementById('btn-abrir-carrinho').addEventListener('click', () => document.getElementById('modal-carrinho').classList.toggle('hidden'));
    document.getElementById('btn-fechar-carrinho').addEventListener('click', () => document.getElementById('modal-carrinho').classList.add('hidden'));

    document.getElementById('itens-carrinho-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover-carrinho')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            carrinho.splice(index, 1); 
            atualizarUiCarrinhoGlobal();
        }
    });

    document.getElementById('btn-finalizar-compra').addEventListener('click', () => {
        if (carrinho.length === 0) return;
        enviarPedidoDeCompra(carrinho);
        carrinho = [];
        atualizarUiCarrinhoGlobal();
        document.getElementById('modal-carrinho').classList.add('hidden');
        alert("Pedidos enviados! Aguarde os vendedores aceitarem a venda.");
    });


    // --- NOTIFICAÇÕES (SININHO) ---
    document.getElementById('btn-notificacoes').addEventListener('click', () => {
        document.getElementById('modal-notificacoes').classList.toggle('hidden');
    });
    
    document.getElementById('btn-fechar-notificacoes').addEventListener('click', () => {
        document.getElementById('modal-notificacoes').classList.add('hidden');
    });

    document.getElementById('itens-notificacoes-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-aceitar-pedido') || e.target.classList.contains('btn-recusar-pedido')) {
            const idNotificacao = e.target.getAttribute('data-id');
            const aceitar = e.target.classList.contains('btn-aceitar-pedido');
            
            responderPedido(idNotificacao, aceitar);
            
            atualizarNotificacoes();
            atualizarTelaColecao(); 
            atualizarTelaVitrinePessoal(); 
            renderizarListaLojas(getLojasMercado(), 'mercado-lojas-container');
            
            // Limpa o termo de busca global para forçar atualização se estiver aberto
            const termoBusca = document.getElementById('busca-global-input').value;
            if (termoBusca.length > 0) {
                renderizarResultadosBusca(pesquisarCartasNoMercado(termoBusca), 'busca-resultados-container', carrinho);
            }
        }
    });

    // INICIALIZA A TELA
    carregarDadosDoUsuario();
});