// js/api.js

const mockCartas = Array.from({ length: 30 }, (_, index) => {
    const raridades = ["Comum", "Incomum", "Rara", "Épica", "Lendária"];
    const raridadeSorteada = raridades[Math.floor(Math.random() * raridades.length)];
    
    return {
        id: index + 1,
        nome: `Criatura do Rift ${index + 1}`,
        raridade: raridadeSorteada,
        preco: (Math.random() * (150 - 5) + 5),
        quantidade: Math.floor(Math.random() * 5), // Agora gera de 0 a 4 cópias
        imagem: `https://placehold.co/300x420/1e293b/8b5cf6?text=Carta+${index + 1}` 
    };
});

export function getTodasAsCartas() {
    return mockCartas;
}

export function getMinhaVitrine() {
    return mockCartas.filter(c => c.quantidade > 0).slice(0, 5); // Garante que a vitrine só puxe cartas que você tem
}

export function salvarNovasQuantidades(mudancas) {
    mockCartas.forEach(carta => {
        if (mudancas[carta.id] !== undefined) {
            carta.quantidade = mudancas[carta.id];
        }
    });
    console.log("Salvo no banco simulado!", mockCartas);
}