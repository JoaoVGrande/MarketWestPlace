// js/api.js

const mockCartas = [
    { id: 1, nome: "Dragão do Abismo", raridade: "Lendária", precoBase: 150.00, imagem: "https://placehold.co/300x420/1e293b/fbbf24?text=Dragao+do+Abismo" },
    { id: 2, nome: "Mago das Sombras", raridade: "Épica", precoBase: 85.50, imagem: "https://placehold.co/300x420/1e293b/c084fc?text=Mago+das+Sombras" },
    { id: 3, nome: "Guerreiro de Cristal", raridade: "Rara", precoBase: 45.00, imagem: "https://placehold.co/300x420/1e293b/60a5fa?text=Guerreiro+de+Cristal" },
    { id: 4, nome: "Goblin Saqueador", raridade: "Incomum", precoBase: 15.00, imagem: "https://placehold.co/300x420/1e293b/9ca3af?text=Goblin+Saqueador" },
    { id: 5, nome: "Essência de Mana", raridade: "Comum", precoBase: 5.00, imagem: "https://placehold.co/300x420/1e293b/9ca3af?text=Essencia+de+Mana" }
];

export const usuarios = {
    "MestreDoPortal": { nome: "MestreDoPortal", avatar: "https://ui-avatars.com/api/?name=Mestre+Do+Portal&background=8b5cf6&color=fff&bold=true" },
    "DarkSlayer": { nome: "DarkSlayer", avatar: "https://ui-avatars.com/api/?name=Dark+Slayer&background=ef4444&color=fff&bold=true" }
};

let usuarioLogado = "MestreDoPortal";

// BANCO DE DADOS (Agora com suporte completo)
const bancoDeDados = {
    "MestreDoPortal": {
        colecao: { 1: 1, 2: 2, 3: 0, 4: 4, 5: 3 },
        vitrine: { 1: { qtdVenda: 1, precoVenda: 160 }, 4: { qtdVenda: 2, precoVenda: 18 } },
        notificacoes: []
    },
    "DarkSlayer": {
        colecao: { 1: 0, 2: 3, 3: 5, 4: 1, 5: 10 },
        vitrine: { 2: { qtdVenda: 1, precoVenda: 95 }, 3: { qtdVenda: 2, precoVenda: 50 } },
        notificacoes: []
    }
};

// --- AUTENTICAÇÃO E DADOS GERAIS ---
export function setUsuarioLogado(id) { usuarioLogado = id; }
export function getUsuarioLogado() { return usuarios[usuarioLogado]; }
export function getCatálogoCompleto() { return mockCartas; }

// --- COLEÇÃO ---
export function getMinhaColecao() {
    const minhalista = bancoDeDados[usuarioLogado].colecao;
    return mockCartas.map(carta => ({
        ...carta,
        quantidade: minhalista[carta.id] !== undefined ? minhalista[carta.id] : 0
    }));
}

export function salvarMinhaColecao(mudancas) {
    Object.keys(mudancas).forEach(id => {
        bancoDeDados[usuarioLogado].colecao[id] = mudancas[id];
    });
}

// --- VITRINE ---
export function getMinhaVitrine() {
    const minhaVitrineData = bancoDeDados[usuarioLogado].vitrine || {};
    return mockCartas.map(carta => ({
        ...carta,
        qtdVenda: minhaVitrineData[carta.id] ? minhaVitrineData[carta.id].qtdVenda : 0,
        precoVenda: minhaVitrineData[carta.id] ? minhaVitrineData[carta.id].precoVenda : carta.precoBase
    }));
}

export function salvarMinhaVitrine(mudancas) {
    if (!bancoDeDados[usuarioLogado].vitrine) bancoDeDados[usuarioLogado].vitrine = {};
    Object.keys(mudancas).forEach(id => {
        if (!bancoDeDados[usuarioLogado].vitrine[id]) {
            bancoDeDados[usuarioLogado].vitrine[id] = { precoVenda: mockCartas.find(c => c.id == id).precoBase };
        }
        bancoDeDados[usuarioLogado].vitrine[id].qtdVenda = mudancas[id];
    });
}

// --- MERCADO E BUSCA ---
export function getLojasMercado() {
    const outrosUsuarios = Object.keys(bancoDeDados).filter(id => id !== usuarioLogado);
    return outrosUsuarios.map(idUser => {
        const vitrineDoCara = bancoDeDados[idUser].vitrine || {};
        const qtdCartas = Object.values(vitrineDoCara).filter(v => v.qtdVenda > 0).length;
        return {
            id: idUser,
            nome: `@${usuarios[idUser].nome}`,
            avatar: usuarios[idUser].avatar,
            qtdCartas: qtdCartas
        };
    }).filter(loja => loja.qtdCartas > 0);
}

export function getCartasDaVitrine(vendedorComArroba) {
    const idVendedor = vendedorComArroba.replace('@', '');
    const vitrineDoCara = bancoDeDados[idVendedor].vitrine || {};
    
    let cartasAVenda = []; // Corrigido a sintaxe do hífen definitivamente
    Object.keys(vitrineDoCara).forEach(idCarta => {
        const config = vitrineDoCara[idCarta];
        if (config.qtdVenda > 0) {
            const cartaBase = mockCartas.find(c => c.id == idCarta);
            cartasAVenda.push({
                idVenda: `vitrine_${idVendedor}_${idCarta}`,
                vendedor: `@${idVendedor}`,
                nomeVendedorPuro: idVendedor,
                carta: cartaBase,
                precoVenda: config.precoVenda,
                quantidadeDisponivel: config.qtdVenda
            });
        }
    });
    return cartasAVenda;
}

export function pesquisarCartasNoMercado(termoBusca) {
    if (!termoBusca || termoBusca.trim() === '') return [];
    const termo = termoBusca.toLowerCase();
    
    let todasOfertas = [];
    const outrosUsuarios = Object.keys(bancoDeDados).filter(id => id !== usuarioLogado);
    
    outrosUsuarios.forEach(idUser => {
        todasOfertas = todasOfertas.concat(getCartasDaVitrine(`@${idUser}`));
    });

    return todasOfertas.filter(item => item.carta.nome.toLowerCase().includes(termo));
}

// --- TRANSAÇÕES E NOTIFICAÇÕES ---
export function enviarPedidoDeCompra(carrinho) {
    carrinho.forEach(item => {
        const idVendedor = item.nomeVendedorPuro;
        bancoDeDados[idVendedor].notificacoes.push({
            idNotificacao: Date.now() + Math.floor(Math.random() * 10000), 
            comprador: usuarioLogado,
            idCarta: item.carta.id,
            nomeCarta: item.carta.nome,
            imagemCarta: item.carta.imagem,
            qtdDesejada: item.quantidadeSelecionada,
            valorTotal: item.quantidadeSelecionada * item.precoVenda,
            status: 'pendente'
        });
    });
}

export function getMinhasNotificacoes() {
    return bancoDeDados[usuarioLogado].notificacoes.filter(n => n.status === 'pendente');
}

export function responderPedido(idNotificacao, aceitar) {
    const pedido = bancoDeDados[usuarioLogado].notificacoes.find(n => n.idNotificacao == idNotificacao);
    if (!pedido) return;

    if (aceitar) {
        const idCarta = pedido.idCarta;
        
        // Desconta da vitrine de quem vendeu
        if (bancoDeDados[usuarioLogado].vitrine[idCarta]) {
            bancoDeDados[usuarioLogado].vitrine[idCarta].qtdVenda -= pedido.qtdDesejada;
            if(bancoDeDados[usuarioLogado].vitrine[idCarta].qtdVenda < 0) bancoDeDados[usuarioLogado].vitrine[idCarta].qtdVenda = 0;
        }
        
        // Desconta da coleção de quem vendeu
        if (bancoDeDados[usuarioLogado].colecao[idCarta]) {
            bancoDeDados[usuarioLogado].colecao[idCarta] -= pedido.qtdDesejada;
            if(bancoDeDados[usuarioLogado].colecao[idCarta] < 0) bancoDeDados[usuarioLogado].colecao[idCarta] = 0;
        }

        // Adiciona na coleção de quem comprou
        const comprador = pedido.comprador;
        if (!bancoDeDados[comprador].colecao[idCarta]) bancoDeDados[comprador].colecao[idCarta] = 0;
        bancoDeDados[comprador].colecao[idCarta] += pedido.qtdDesejada;
    }

    pedido.status = aceitar ? 'aceito' : 'recusado';
}