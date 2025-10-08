// Calcula a distância em km entre dois pontos [lat, lng] usando Leaflet
// Exemplo de uso: calcularDistanciaLeaflet([lat1, lng1], [lat2, lng2])
function calcularDistanciaLeaflet(coord1, coord2) {
    // Necessário que a biblioteca Leaflet esteja carregada no HTML
    return L.latLng(coord1).distanceTo(L.latLng(coord2)) / 1000; // em km
}
/*uma função de calcular o frete de um filhote de cachorro atraves de uma cidade fixa e com opção de digitar o destino com cep ou cidade e estado*/


// Função auxiliar para buscar coordenadas por CEP (usando ViaCEP + Nominatim) ou por endereço (rua/cidade)
async function buscarCoordenadasDestino(valor) {
    // Se for CEP (apenas números, 8 dígitos)
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
        // Busca dados do endereço no ViaCEP
        const viaCepResp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const viaCepData = await viaCepResp.json();
        if (!viaCepData.erro) {
            // Monta endereço completo
            const enderecoCompleto = `${viaCepData.logradouro || ''}, ${viaCepData.bairro || ''}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
            // Busca coordenadas no Nominatim
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        }
    }
    // Se não for CEP, busca direto no Nominatim (rua, cidade, etc)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(valor + ', Brasil')}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
}

// Função principal de cálculo de frete
async function calcularFrete(event) {
    if (event) {
        event.preventDefault();
    }
    const cidadeOrigem = "Suzano, SP";
    const suzanoCoord = [-23.5428, -46.3108]; // Coordenadas fixas de Suzano
    const destinoInput = document.getElementById("cepDestino").value;
    const resultado = document.getElementById("resultado");
    if (!destinoInput) {
        alert("Por favor, insira o CEP, rua ou cidade de destino.");
        return;
    }

    // Buscar coordenadas do destino (CEP ou endereço) e calcular distância
    resultado.innerHTML = "Calculando distância...";
    const coordDestino = await buscarCoordenadasDestino(destinoInput);
    if (!coordDestino) {
        resultado.innerHTML = "Não foi possível localizar o destino informado.";
        return;
    }
    const kmRodados = calcularDistanciaLeaflet(suzanoCoord, coordDestino);

    // Cálculo do frete
    const valorPorKm = 1.50;
    const valorFrete = kmRodados * valorPorKm;
    resultado.innerHTML = `O valor do frete de ${cidadeOrigem} para ${destinoInput} é R$ ${valorFrete.toFixed(2)}<br>Distância: ${kmRodados.toFixed(2)} km`;
}

// Garante que o formulário use a função assíncrona
window.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('freteForm');
    if (form) {
        form.onsubmit = calcularFrete;
    }
});


