
"use strict";

// Seleção dos elementos da página
const tamanhos = document.querySelectorAll('input[name="tamanho"]');
const adicionais = document.querySelectorAll('input[name="adicional"]');

const limiteTexto = document.getElementById("limite");
const alerta = document.getElementById("alerta");
const quantidade = document.getElementById("quantidade");
const resumoTamanho = document.getElementById("resumo-tamanho");
const listaResumo = document.getElementById("lista-resumo");
const totalElemento = document.getElementById("total");
const confirmar = document.getElementById("confirmar");
const resultado = document.getElementById("resultado");

const nomeCliente = document.getElementById("nome");
const telefoneCliente = document.getElementById("telefone");
const bairroCliente = document.getElementById("bairro");

const subtotalElemento = document.getElementById("subtotal");
const entregaElemento = document.getElementById("taxa-entrega");

// Preços dos copos
const precosTamanho = {
    300: 10,
    500: 15
};

// Limite de adicionais por tamanho
const limites = {
    300: 2,
    500: 4
};

// Taxas de entrega
const TAXA_CENTRO = 5;
const TAXA_OUTROS_BAIRROS = 10;

// DDDs brasileiros válidos
const dddsValidos = new Set([
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 24, 27, 28,
    31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49,
    51, 53, 54, 55,
    61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79,
    81, 82, 83, 84, 85, 86, 87, 88, 89,
    91, 92, 93, 94, 95, 96, 97, 98, 99
]);

// Formata valores em reais
const formatarMoeda = valor =>
    valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

// Obtém o tamanho selecionado
function obterTamanho() {
    const selecionado = document.querySelector(
        'input[name="tamanho"]:checked'
    );

    return selecionado ? Number(selecionado.value) : 300;
}

// Obtém os adicionais selecionados
function obterAdicionaisSelecionados() {
    return Array.from(adicionais).filter(item => item.checked);
}

// Calcula a taxa de entrega conforme o bairro
function obterTaxaEntrega() {
    const bairro = bairroCliente.value.trim();

    return bairro.toLocaleLowerCase("pt-BR") === "centro"
        ? TAXA_CENTRO
        : TAXA_OUTROS_BAIRROS;
}

// Calcula o subtotal do açaí com adicionais
function calcularSubtotal() {
    const tamanho = obterTamanho();

    return precosTamanho[tamanho] +
        obterAdicionaisSelecionados().reduce(
            (total, item) => total + Number(item.dataset.preco),
            0
        );
}

// Calcula o total com a entrega
function calcularTotal() {
    return calcularSubtotal() + obterTaxaEntrega();
}

// Mostra um alerta
function mostrarAlerta(mensagem) {
    alerta.textContent = mensagem;
    alerta.hidden = false;
}

// Esconde o alerta
function esconderAlerta() {
    alerta.textContent = "";
    alerta.hidden = true;
}

// Valida telefone com DDD
function telefoneValido(valor) {
    const digitos = valor.replace(/\D/g, "");

    if (digitos.length !== 10 && digitos.length !== 11) {
        return false;
    }

    const ddd = Number(digitos.slice(0, 2));

    if (!dddsValidos.has(ddd)) {
        return false;
    }

    // O primeiro dígito após o DDD não pode ser zero
    if (digitos[2] === "0") {
        return false;
    }

    // Celular com 11 dígitos deve começar com 9 após o DDD
    if (digitos.length === 11 && digitos[2] !== "9") {
        return false;
    }

    return true;
}

// Atualiza o resumo e os preços na tela
function atualizarTela() {
    const tamanho = obterTamanho();
    const limiteAtual = limites[tamanho];
    const selecionados = obterAdicionaisSelecionados();
    const subtotal = calcularSubtotal();
    const taxaEntrega = obterTaxaEntrega();
    const total = subtotal + taxaEntrega;

    resumoTamanho.textContent = `${tamanho} ml`;

    limiteTexto.textContent =
        `Você pode escolher até ${limiteAtual} adicionais.`;

    quantidade.textContent =
        `${selecionados.length} de ${limiteAtual}`;

    // Atualiza a lista de adicionais
    listaResumo.replaceChildren();

    if (selecionados.length === 0) {
        listaResumo.textContent = "Nenhum adicional selecionado.";
    } else {
        selecionados.forEach(item => {
            const elemento = document.createElement("p");

            elemento.textContent =
                `${item.value} - ` +
                formatarMoeda(Number(item.dataset.preco));

            listaResumo.appendChild(elemento);
        });
    }

    // Atualiza subtotal, entrega e total
    if (subtotalElemento) {
        subtotalElemento.textContent = formatarMoeda(subtotal);
    }

    if (entregaElemento) {
        entregaElemento.textContent = formatarMoeda(taxaEntrega);
    }

    totalElemento.textContent = formatarMoeda(total);
}

// Controla a alteração do tamanho do copo
tamanhos.forEach(tamanho => {
    tamanho.addEventListener("change", () => {
        const limiteAtual = limites[obterTamanho()];
        const selecionados = obterAdicionaisSelecionados();

        if (selecionados.length > limiteAtual) {
            selecionados.slice(limiteAtual).forEach(item => {
                item.checked = false;
            });

            mostrarAlerta(
                `O copo de ${obterTamanho()} ml permite até ` +
                `${limiteAtual} adicionais. Os excedentes foram removidos.`
            );
        } else {
            esconderAlerta();
        }

        atualizarTela();
    });
});

// Controla a seleção de adicionais
adicionais.forEach(adicional => {
    adicional.addEventListener("change", () => {
        const limiteAtual = limites[obterTamanho()];
        const selecionados = obterAdicionaisSelecionados();

        if (selecionados.length > limiteAtual) {
            adicional.checked = false;

            mostrarAlerta(
                `Limite atingido! O copo de ${obterTamanho()} ml ` +
                `permite no máximo ${limiteAtual} adicionais.`
            );
        } else {
            esconderAlerta();
        }

        atualizarTela();
    });
});

// Atualiza os valores quando o bairro muda
bairroCliente.addEventListener("input", atualizarTela);
bairroCliente.addEventListener("change", atualizarTela);

// Limpa alertas quando o cliente altera os dados
nomeCliente.addEventListener("input", esconderAlerta);
telefoneCliente.addEventListener("input", esconderAlerta);

// Confirma o pedido
confirmar.addEventListener("click", event => {
    event.preventDefault();
    esconderAlerta();

    const nome = nomeCliente.value.trim();
    const telefone = telefoneCliente.value.trim();
    const bairro = bairroCliente.value.trim();

    resultado.textContent = "";

    // 1. Valida campos obrigatórios
    if (!nome || !telefone || !bairro) {
        mostrarAlerta(
            "Preencha nome, telefone com DDD e bairro para confirmar."
        );
        return;
    }

    // 2. Valida o telefone
    if (!telefoneValido(telefone)) {
        mostrarAlerta(
            "Telefone inválido. Informe um telefone brasileiro com DDD."
        );
        return;
    }

    // 3. Valida o tamanho e os adicionais
    const tamanho = obterTamanho();
    const selecionados = obterAdicionaisSelecionados();

    if (
        !Object.prototype.hasOwnProperty.call(precosTamanho, tamanho) ||
        selecionados.length > limites[tamanho]
    ) {
        mostrarAlerta(
            "Verifique o tamanho do copo e a quantidade de adicionais."
        );
        return;
    }

    // 4. Calcula os valores finais
    const subtotal = calcularSubtotal();
    const taxaEntrega = obterTaxaEntrega();
    const total = subtotal + taxaEntrega;

    const nomesAdicionais = selecionados.length
        ? selecionados.map(item => item.value).join(", ")
        : "Nenhum";

    // 5. Exibe a confirmação com os valores
    resultado.textContent =
        `PEDIDO CONFIRMADO!\n` +
        `Cliente: ${nome}\n` +
        `Telefone: ${telefone}\n` +
        `Bairro: ${bairro}\n` +
        `Copo: ${tamanho} ml\n` +
        `Adicionais: ${nomesAdicionais}\n` +
        `Subtotal do açaí: ${formatarMoeda(subtotal)}\n` +
        `Taxa de entrega: ${formatarMoeda(taxaEntrega)}\n` +
        `TOTAL A PAGAR: ${formatarMoeda(total)}`;
});

// Inicializa a tela
atualizarTela();

