// js/ui.js

export function renderizarCartas(cartas, containerId, options = {}) {
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

        let qtdAtual = mudancasPendentes[carta.id] !== undefined 
            ? mudancasPendentes[carta.id] 
            : carta.quantidade;

        // Verifica se a carta está zerada
        const isZerada = qtdAtual === 0;

        const div = document.createElement('div');
        
        // Se estiver zerada, fica preto/branco (grayscale) e perde a interatividade padrão.
        // Se tiver 1 ou mais, ganha as cores e os efeitos hover de pular e brilhar.
        const classesBase = 'bg-gray-800 rounded-lg p-3 border border-gray-700 transition-all duration-300 relative';
        const classesInterativas = isZerada 
            ? 'grayscale opacity-60' 
            : 'hover:border-rift-primary hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(139,92,246,0.3)] cursor-pointer';
            
        div.className = `${classesBase} ${classesInterativas}`;
        
        // A tag de quantidade SEMPRE aparece agora. Se for 0, ela fica vermelhinha para destacar.
        const corTag = isZerada ? 'bg-red-900/80 border-red-500 text-red-200' : 'bg-rift-dark/90 border-gray-600 text-white';
        const tagQuantidade = `<div class="absolute top-2 right-2 ${corTag} text-xs font-bold px-2 py-1 rounded-md border z-10">x${qtdAtual}</div>`;

        // Os botões de + e - só aparecem se o modo de edição estiver ativado
        let controlesEdicao = '';
        if (isEditMode) {
            controlesEdicao = `
                <div class="flex justify-between items-center mt-3 bg-gray-900 rounded-md p-1 border border-gray-700">
                    <button class="btn-menos bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white w-7 h-7 rounded flex items-center justify-center font-bold transition-colors" data-id="${carta.id}">-</button>
                    <span class="font-bold text-white">${qtdAtual}</span>
                    <button class="btn-mais bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white w-7 h-7 rounded flex items-center justify-center font-bold transition-colors" data-id="${carta.id}">+</button>
                </div>
            `;
        }

        div.innerHTML = `
            ${tagQuantidade}
            <img src="${carta.imagem}" alt="${carta.nome}" class="w-full rounded-md mb-3 object-cover aspect-[3/4]">
            <h3 class="font-bold text-gray-100 text-sm truncate">${carta.nome}</h3>
            <div class="flex justify-between items-center mt-1">
                <span class="text-xs font-semibold ${corRaridade}">${carta.raridade}</span>
            </div>
            ${controlesEdicao}
        `;
        
        container.appendChild(div);
    });
}