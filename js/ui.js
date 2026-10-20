// js/ui.js

export function renderizarColecao(cartas, containerId, options = {}) {
    const isEditMode = options.isEditMode || false;
    const mudancasPendentes = options.mudancasPendentes || {};
    const container = document.getElementById(containerId);
    if (!container) return; 
    container.innerHTML = ''; 

    cartas.forEach(carta => {
        let corRaridade = "text-gray-400";
        if (carta.raridade === "Lendária") corRaridade = "text-yellow-400";
        if (carta.raridade === "Épica") corRaridade = "text-purple-400";
        if (carta.raridade === "Rara") corRaridade = "text-blue-400";

        let qtdAtual = mudancasPendentes[carta.id] !== undefined ? mudancasPendentes[carta.id] : carta.quantidade;
        const isZerada = qtdAtual === 0;
        
        const div = document.createElement('div');
        div.className = `bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all duration-300 relative ${isZerada ? 'grayscale opacity-60' : 'hover:border-rift-primary cursor-pointer'}`;
        
        const corTag = isZerada ? 'bg-red-900/80 border-red-500 text-red-200' : 'bg-rift-dark/90 border-gray-600 text-white';
        
        let controlesEdicao = '';
        if (isEditMode) {
            controlesEdicao = `
                <div class="flex justify-between items-center mt-3 bg-gray-900 rounded-md p-1 border border-gray-700">
                    <button class="btn-menos bg-red-500/20 hover:bg-red-500 text-red-500 w-7 h-7 rounded font-bold" data-id="${carta.id}">-</button>
                    <span class="font-bold text-white">${qtdAtual}</span>
                    <button class="btn-mais bg-green-500/20 hover:bg-green-500 text-green-500 w-7 h-7 rounded font-bold" data-id="${carta.id}">+</button>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="absolute top-2 right-2 ${corTag} text-xs font-bold px-2 py-1 rounded-md border z-10">x${qtdAtual}</div>
            <img src="${carta.imagem}" class="w-full rounded-md mb-3 object-cover aspect-[3/4]">
            <h3 class="font-bold text-gray-100 text-sm truncate">${carta.nome}</h3>
            <div class="flex justify-between items-center mt-1"><span class="text-xs font-semibold ${corRaridade}">${carta.raridade}</span></div>
            ${controlesEdicao}
        `;
        container.appendChild(div);
    });
}

export function renderizarEdicaoVitrine(cartas, containerId, options = {}) {
    const isEditMode = options.isEditMode || false;
    const mudancasPendentes = options.mudancasPendentes || {};
    const container = document.getElementById(containerId);
    if (!container) return; 
    container.innerHTML = ''; 

    cartas.forEach(carta => {
        let qtdVendaAtual = mudancasPendentes[carta.id] !== undefined ? mudancasPendentes[carta.id] : carta.qtdVenda;
        
        const isZerada = qtdVendaAtual === 0;
        
        const div = document.createElement('div');
        div.className = `bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all duration-300 relative ${isZerada ? 'grayscale opacity-60' : 'border-rift-primary'}`;
        
        let controlesEdicao = '';
        if (isEditMode) {
            controlesEdicao = `
                <div class="flex justify-between items-center mt-3 bg-gray-900 rounded-md p-1 border border-gray-700">
                    <button class="btn-menos-vitrine bg-red-500/20 text-red-500 w-7 h-7 rounded font-bold" data-id="${carta.id}">-</button>
                    <span class="font-bold text-white text-xs">Vendendo: ${qtdVendaAtual}</span>
                    <button class="btn-mais-vitrine bg-green-500/20 text-green-500 w-7 h-7 rounded font-bold" data-id="${carta.id}">+</button>
                </div>
            `;
        } else if (!isZerada) {
            controlesEdicao = `<div class="mt-2 text-center bg-gray-900 rounded p-1 text-xs text-green-400 font-bold border border-green-900">Vendendo ${qtdVendaAtual} un.</div>`;
        }

        div.innerHTML = `
            <img src="${carta.imagem}" class="w-full rounded-md mb-3 object-cover aspect-[3/4]">
            <h3 class="font-bold text-gray-100 text-sm truncate">${carta.nome}</h3>
            <div class="mt-1 flex justify-between"><span class="text-rift-accent font-bold">R$ ${carta.precoVenda.toFixed(2)}</span></div>
            ${controlesEdicao}
        `;
        container.appendChild(div);
    });
}

export function renderizarListaLojas(lojas, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    lojas.forEach(loja => {
        const div = document.createElement('div');
        div.className = 'bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-rift-primary flex flex-col items-center text-center shadow-lg transition-colors';
        div.innerHTML = `
            <img src="${loja.avatar}" class="w-20 h-20 rounded-full mb-3 border-2 border-gray-600">
            <h3 class="font-bold text-gray-100 text-lg">${loja.nome}</h3>
            <p class="text-rift-accent font-semibold text-sm mb-5">${loja.qtdCartas} cartas à venda</p>
            <button class="btn-entrar-loja w-full bg-gray-700 hover:bg-rift-primary text-white py-2.5 rounded font-bold transition-colors" data-nome="${loja.nome}">Entrar na Loja</button>
        `;
        container.appendChild(div);
    });
}

export function renderizarCartasLoja(itensVenda, containerId, carrinhoAtual = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (itensVenda.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">Esta loja está vazia.</p>`;
        return;
    }

    itensVenda.forEach(item => {
        const itemNoCarrinho = carrinhoAtual.find(c => c.idVenda === item.idVenda);
        const qtdNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidadeSelecionada : 0;
        const atingiuLimite = qtdNoCarrinho >= item.quantidadeDisponivel;

        const div = document.createElement('div');
        div.className = 'bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-rift-primary flex flex-col relative transition-colors';
        
        let areaBotao = '';
        if (qtdNoCarrinho > 0) {
            areaBotao = `
                <div class="flex items-center space-x-1 bg-gray-900 rounded p-0.5 border border-gray-700">
                    <button class="btn-diminuir-carrinho text-red-400 hover:text-red-300 hover:bg-gray-800 px-2.5 py-0.5 rounded font-bold transition-colors" data-id="${item.idVenda}">-</button>
                    <span class="text-white text-xs font-bold px-1">${qtdNoCarrinho}</span>
                    <button class="btn-comprar-vitrine text-green-400 hover:text-green-300 hover:bg-gray-800 px-2.5 py-0.5 rounded font-bold transition-colors ${atingiuLimite ? 'opacity-50 cursor-not-allowed' : ''}" data-id="${item.idVenda}" data-vendedor="${item.vendedor}" ${atingiuLimite ? 'disabled' : ''}>+</button>
                </div>
            `;
        } else {
            areaBotao = `
                <button class="btn-comprar-vitrine text-white text-xs px-4 py-1.5 rounded font-bold shadow-md transition-all bg-rift-primary hover:bg-purple-500" data-id="${item.idVenda}" data-vendedor="${item.vendedor}">
                    Comprar
                </button>
            `;
        }

        div.innerHTML = `
            <div class="absolute top-2 right-2 bg-rift-dark border-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border z-10">Disp: ${item.quantidadeDisponivel}</div>
            <img src="${item.carta.imagem}" class="w-full rounded-md mb-3 object-cover aspect-[3/4]">
            <h3 class="font-bold text-gray-100 text-sm truncate">${item.carta.nome}</h3>
            <div class="mt-auto pt-3 border-t border-gray-700 flex justify-between items-center mt-3">
                <span class="text-rift-accent font-black text-sm">R$ ${item.precoVenda.toFixed(2)}</span>
                ${areaBotao}
            </div>
        `;
        container.appendChild(div);
    });
}

export function renderizarResultadosBusca(resultados, containerId, carrinhoAtual = []) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (resultados.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">Nenhuma carta encontrada com esse nome.</div>`;
        return;
    }

    resultados.forEach(item => {
        let corRaridade = "text-gray-400";
        if (item.carta.raridade === "Lendária") corRaridade = "text-yellow-400";
        if (item.carta.raridade === "Épica") corRaridade = "text-purple-400";
        if (item.carta.raridade === "Rara") corRaridade = "text-blue-400";

        const itemNoCarrinho = carrinhoAtual.find(c => c.idVenda === item.idVenda);
        const qtdNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidadeSelecionada : 0;
        const atingiuLimite = qtdNoCarrinho >= item.quantidadeDisponivel;

        let areaBotao = '';
        if (qtdNoCarrinho > 0) {
            areaBotao = `
                <div class="flex items-center justify-between flex-grow bg-gray-900 rounded border border-gray-700 px-1">
                    <button class="btn-diminuir-carrinho text-red-400 hover:text-red-300 hover:bg-gray-800 px-3 py-1 rounded font-bold transition-colors" data-id="${item.idVenda}">-</button>
                    <span class="text-white text-xs font-bold">${qtdNoCarrinho} no 🛒</span>
                    <button class="btn-add-carrinho text-green-400 hover:text-green-300 hover:bg-gray-800 px-3 py-1 rounded font-bold transition-colors ${atingiuLimite ? 'opacity-50 cursor-not-allowed' : ''}" data-id="${item.idVenda}" data-vendedor="${item.vendedor}" ${atingiuLimite ? 'disabled' : ''}>+</button>
                </div>
            `;
        } else {
            areaBotao = `
                <button class="btn-add-carrinho flex-grow bg-rift-primary hover:bg-purple-500 text-white text-xs px-2 py-1.5 rounded font-bold transition-colors" data-id="${item.idVenda}" data-vendedor="${item.vendedor}">
                    + Carrinho
                </button>
            `;
        }

        const div = document.createElement('div');
        div.className = 'bg-gray-800 rounded-lg p-4 border border-gray-700 flex space-x-4 shadow-lg hover:border-gray-500 transition-colors relative';
        
        div.innerHTML = `
            <div class="absolute top-2 right-2 bg-rift-dark border-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border z-10">Disp: ${item.quantidadeDisponivel}</div>
            <img src="${item.carta.imagem}" alt="${item.carta.nome}" class="w-24 rounded-md object-cover">
            <div class="flex-grow flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-gray-100 text-md">${item.carta.nome}</h3>
                    <span class="text-xs font-semibold ${corRaridade}">${item.carta.raridade}</span>
                    <p class="text-xs text-gray-400 mt-1">Vendedor: <span class="font-bold text-gray-200">${item.vendedor}</span></p>
                </div>
                <div class="mt-2">
                    <span class="text-rift-accent font-black block mb-2">R$ ${item.precoVenda.toFixed(2)}</span>
                    <div class="flex space-x-2">
                        ${areaBotao}
                        <button class="btn-ir-vitrine flex-grow bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1.5 rounded font-bold transition-colors border border-gray-600" data-vendedor="${item.nomeVendedorPuro}">
                            Ver Vitrine
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

export function renderizarCarrinho(itensCarrinho, containerId, idTotal) {
    const container = document.getElementById(containerId);
    const textTotal = document.getElementById(idTotal);
    if (!container || !textTotal) return;

    container.innerHTML = '';
    let valorTotal = 0;

    if (itensCarrinho.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center py-4">Carrinho vazio.</p>`;
        textTotal.textContent = "R\$ 0.00";
        return;
    }

    itensCarrinho.forEach((item, index) => {
        const subtotal = item.precoVenda * item.quantidadeSelecionada;
        valorTotal += subtotal;
        
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-700';
        
        div.innerHTML = `
            <div class="flex items-center space-x-3 w-2/3">
                <img src="${item.carta.imagem}" class="w-10 rounded">
                <div class="truncate">
                    <p class="text-sm font-bold text-gray-200 truncate">${item.carta.nome}</p>
                    <p class="text-xs text-gray-400">Vol.: <span class="text-white font-bold">${item.quantidadeSelecionada}</span> | ${item.vendedor}</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <span class="text-sm text-rift-accent font-bold">R$ ${subtotal.toFixed(2)}</span>
                <button class="btn-remover-carrinho text-red-500 hover:text-red-400 font-bold px-2 text-lg" data-index="${index}">&times;</button>
            </div>
        `;
        container.appendChild(div);
    });

    textTotal.textContent = `R$ ${valorTotal.toFixed(2)}`;
}

export function renderizarNotificacoes(notificacoes, containerId, idContador) {
    const container = document.getElementById(containerId);
    const contador = document.getElementById(idContador);
    if (!container || !contador) return;

    container.innerHTML = '';
    
    if (notificacoes.length > 0) {
        contador.textContent = notificacoes.length;
        contador.classList.remove('hidden');
    } else {
        contador.classList.add('hidden');
        container.innerHTML = `<p class="text-gray-500 text-center py-4">Nenhum pedido pendente.</p>`;
        return;
    }

    notificacoes.forEach(notif => {
        const div = document.createElement('div');
        div.className = 'bg-gray-900 p-3 rounded-lg border border-gray-700 flex flex-col space-y-3';
        
        div.innerHTML = `
            <div class="flex items-center space-x-3">
                <img src="${notif.imagemCarta}" class="w-12 rounded">
                <div>
                    <p class="text-sm text-gray-400">@${notif.comprador} quer comprar:</p>
                    <p class="text-sm font-bold text-gray-200">${notif.qtdDesejada}x ${notif.nomeCarta}</p>
                    <p class="text-rift-accent font-bold">Por R$ ${notif.valorTotal.toFixed(2)}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button class="btn-aceitar-pedido flex-grow bg-green-600 hover:bg-green-500 text-white text-xs py-2 rounded font-bold transition-colors" data-id="${notif.idNotificacao}">
                    Aceitar Venda
                </button>
                <button class="btn-recusar-pedido flex-grow bg-red-600 hover:bg-red-500 text-white text-xs py-2 rounded font-bold transition-colors" data-id="${notif.idNotificacao}">
                    Recusar
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}