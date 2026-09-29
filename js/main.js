// js/main.js
import { getTodasAsCartas, getMinhaVitrine, salvarNovasQuantidades } from './api.js';
import { renderizarCartas } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE TROCA DE ABAS ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('text-rift-accent', 'border-rift-primary');
                btn.classList.add('text-gray-400', 'border-transparent');
            });
            tabContents.forEach(content => {
                content.classList.remove('block');
                content.classList.add('hidden');
            });
            button.classList.remove('text-gray-400', 'border-transparent');
            button.classList.add('text-rift-accent', 'border-rift-primary');
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('block');
        });
    });

    // --- VARIÁVEIS DE ESTADO DA EDIÇÃO ---
    let isEditMode = false;
    let mudancasPendentes = {}; 
    let todasCartas = getTodasAsCartas();

    const btnEditar = document.getElementById('btn-editar-colecao');
    const btnSalvar = document.getElementById('btn-salvar-colecao');
    const containerColecao = document.getElementById('colecao-container');
    const inputBusca = document.getElementById('busca-nome');
    const selectFiltro = document.getElementById('filtro-quantidade');

    // Função auxiliar para re-desenhar a coleção aplicando Filtros e Buscas
    function atualizarTelaColecao() {
        const termoBusca = inputBusca.value.toLowerCase();
        const filtroTipo = selectFiltro.value;

        // Filtra a array antes de desenhar
        const cartasFiltradas = todasCartas.filter(carta => {
            // Pega a quantidade atual (considerando se o usuário está editando agora)
            const qtdAtual = mudancasPendentes[carta.id] !== undefined 
                ? mudancasPendentes[carta.id] 
                : carta.quantidade;

            // 1. Regra de Busca por Nome
            const passaNaBusca = carta.nome.toLowerCase().includes(termoBusca);

            // 2. Regra de Filtro de Quantidade
            let passaNoFiltro = true;
            if (filtroTipo === 'possuidas') passaNoFiltro = qtdAtual > 0;
            if (filtroTipo === 'faltantes') passaNoFiltro = qtdAtual === 0;

            // A carta só aparece se passar nas duas regras
            return passaNaBusca && passaNoFiltro;
        });

        // Manda desenhar apenas as filtradas
        renderizarCartas(cartasFiltradas, 'colecao-container', { 
            isEditMode: isEditMode, 
            mudancasPendentes: mudancasPendentes 
        });
    }

    // Ouvintes de eventos para a Busca e Filtro (Atualiza a tela em tempo real)
    inputBusca.addEventListener('input', atualizarTelaColecao);
    selectFiltro.addEventListener('change', atualizarTelaColecao);

    // Botão de Editar / Cancelar
    btnEditar.addEventListener('click', () => {
        isEditMode = !isEditMode; 
        
        if (isEditMode) {
            btnEditar.textContent = "Cancelar Edição";
            btnEditar.classList.replace('bg-gray-700', 'bg-red-600');
            btnEditar.classList.replace('hover:bg-gray-600', 'hover:bg-red-500');
            btnSalvar.classList.remove('hidden');
            btnSalvar.disabled = true; 
        } else {
            btnEditar.textContent = "Editar";
            btnEditar.classList.replace('bg-red-600', 'bg-gray-700');
            btnEditar.classList.replace('hover:bg-red-500', 'hover:bg-gray-600');
            btnSalvar.classList.add('hidden');
            mudancasPendentes = {}; 
        }
        
        atualizarTelaColecao();
    });

    // Interceptando os cliques de + e -
    containerColecao.addEventListener('click', (event) => {
        if (!isEditMode) return;
        const alvo = event.target;
        
        if (alvo.classList.contains('btn-mais') || alvo.classList.contains('btn-menos')) {
            const id = parseInt(alvo.getAttribute('data-id'));
            const cartaOriginal = todasCartas.find(c => c.id === id);
            let qtdAtual = mudancasPendentes[id] !== undefined ? mudancasPendentes[id] : cartaOriginal.quantidade;

            if (alvo.classList.contains('btn-mais')) {
                qtdAtual++;
            } else if (alvo.classList.contains('btn-menos') && qtdAtual > 0) {
                qtdAtual--;
            }

            mudancasPendentes[id] = qtdAtual;
            btnSalvar.disabled = false;
            atualizarTelaColecao();
        }
    });

    // Botão de Salvar
    btnSalvar.addEventListener('click', () => {
        if (Object.keys(mudancasPendentes).length === 0) return;
        salvarNovasQuantidades(mudancasPendentes);
        todasCartas = getTodasAsCartas(); // Atualiza dados
        btnEditar.click(); // Desativa modo edição
    });

    // RENDERIZAÇÃO INICIAL
    atualizarTelaColecao();
    renderizarCartas(getMinhaVitrine(), 'vitrine-container');
});