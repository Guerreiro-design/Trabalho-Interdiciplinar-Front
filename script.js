//Modo claro e escuro SUSU

let checkbox = document.getElementById("check");
let SolLua = document.getElementById("SolLua");

if (checkbox) {
    checkbox.addEventListener("click", () => {
        document.body.classList.toggle("lightmode");
        if (SolLua && SolLua.getAttribute("src") === "IMG's/sol.png") {
            SolLua.setAttribute("src", "IMG's/lua.png");
        } else if (SolLua) {
            SolLua.setAttribute("src", "IMG's/sol.png");
        }
    });
}


// 2. Filtros

function filtrarCategoria(categoriaSelecionada) {
    const produtos = document.querySelectorAll('.item-produto');
    const titulo = document.getElementById('titulo-categoria');
    const campoPesquisa = document.getElementById('campo-pesquisa');

    if (campoPesquisa) {
        campoPesquisa.value = '';
    }

    if (titulo) {
        if (categoriaSelecionada === 'todos') {
            titulo.innerText = 'Todos os Produtos';
        } else {
            titulo.innerText = categoriaSelecionada.charAt(0).toUpperCase() + categoriaSelecionada.slice(1);
        }
    }

    produtos.forEach(produto => {
        const categoriaProduto = produto.getAttribute('data-categoria');
        if (categoriaSelecionada === 'todos' || categoriaProduto === categoriaSelecionada) {
            produto.style.display = 'block';
        } else {
            produto.style.display = 'none';
        }
    });

    const secaoCardapio = document.getElementById('cardapio');
    if (secaoCardapio) {
        secaoCardapio.scrollIntoView({ behavior: 'smooth' });
    }
}


// 3. Barra de Pesquisa

function pesquisarProdutos() {
    const termo = document.getElementById('campo-pesquisa').value.toLowerCase();
    const produtos = document.querySelectorAll('.item-produto');
    const titulo = document.getElementById('titulo-categoria');

    if (titulo) {
        titulo.innerText = termo.trim() !== '' ? `Resultados para: "${termo}"` : 'Todos os Produtos';
    }

    produtos.forEach(produto => {
        const nome = produto.querySelector('h3') ? produto.querySelector('h3').innerText.toLowerCase() : '';
        const descricao = produto.querySelector('p') ? produto.querySelector('p').innerText.toLowerCase() : '';

        if (nome.includes(termo) || descricao.includes(termo)) {
            produto.style.display = 'block';
        } else {
            produto.style.display = 'none';
        }
    });
}


// 4. Carrinho

let carrinho = JSON.parse(localStorage.getItem('sushi_warrior_carrinho')) || [];
const TAXA_FRETE = 8.00;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    carregarPerfilEHistorico();
    configurarBotoesAdicionar();
});

function configurarBotoesAdicionar() {
    document.querySelectorAll('.item-produto .btn-add:not([onclick])').forEach(botao => {
        botao.addEventListener('click', () => adicionarDoCard(botao));
    });
}

function adicionarDoCard(btn) {
    const card = btn.closest('.item-produto');
    if (!card) return;

    const nomeEl = card.querySelector('h3');
    const precoEl = card.querySelector('.preco');
    const imgEl = card.querySelector('img');

    if (!nomeEl || !precoEl) return;

    const nome = nomeEl.innerText;
    const precoTexto = precoEl.innerText;
    
    const precoLimpo = precoTexto.replace(/[^0-9,/.]/g, '').replace(',', '.');
    const preco = parseFloat(precoLimpo);

    if (isNaN(preco)) return;

    const imagem = imgEl ? imgEl.getAttribute('src') : '';

    adicionarAoCarrinho(nome, preco, imagem);
}

function adicionarAoCarrinho(nome, preco, imagem) {
    const itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nome,
            preco: preco,
            imagem: imagem,
            quantidade: 1
        });
    }

    salvarEAtualizar();
    abrirCarrinho();
}

function alterarQuantidade(index, delta) {
    carrinho[index].quantidade += delta;

    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }

    salvarEAtualizar();
}

function salvarEAtualizar() {
    localStorage.setItem('sushi_warrior_carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

function calcularSubtotal() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function atualizarCarrinho() {
    const containerItens = document.getElementById('itens-carrinho');
    const elementoTotal = document.getElementById('preco-total');
    const elementoContador = document.getElementById('contador-carrinho');

    if (!containerItens) return;

    containerItens.innerHTML = '';
    let totalItens = 0;
    const subtotal = calcularSubtotal();

    if (carrinho.length === 0) {
        containerItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    } else {
        carrinho.forEach((item, index) => {
            totalItens += item.quantidade;

            const divItem = document.createElement('div');
            divItem.classList.add('item-carrinho');
            divItem.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}">
                <div class="info-item">
                    <h4>${item.nome}</h4>
                    <span class="preco-item">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                    <div class="controles-qtd">
                        <button class="btn-qtd" onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button class="btn-qtd" onclick="alterarQuantidade(${index}, 1)">+</button>
                    </div>
                </div>
            `;
            containerItens.appendChild(divItem);
        });
    }

    if (elementoTotal) elementoTotal.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (elementoContador) elementoContador.innerText = totalItens;
}

function abrirCarrinho(e) {
    if (e) e.preventDefault();
    const drawer = document.getElementById('carrinho-drawer');
    const overlay = document.getElementById('carrinho-overlay');
    if (drawer) drawer.classList.add('ativo');
    if (overlay) overlay.classList.add('ativo');
}

function fecharCarrinho() {
    const drawer = document.getElementById('carrinho-drawer');
    const customDrawer = document.getElementById('customizador-drawer');
    const overlay = document.getElementById('carrinho-overlay');

    if (drawer) drawer.classList.remove('ativo');
    if (customDrawer) customDrawer.classList.remove('ativo');
    if (overlay) overlay.classList.remove('ativo');
}


// 5. Me Pague Filho 

function abrirCheckout() {
    if (carrinho.length === 0) {
        alert('Adicione itens ao carrinho antes de continuar!');
        return;
    }

    fecharCarrinho();

    const subtotal = calcularSubtotal();
    const totalFinal = subtotal + TAXA_FRETE;

    const subtotalEl = document.getElementById('checkout-subtotal');
    const freteEl = document.getElementById('checkout-frete');
    const totalEl = document.getElementById('checkout-total');

    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (freteEl) freteEl.innerText = `R$ ${TAXA_FRETE.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.innerText = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;

    const modalPagamento = document.getElementById('modal-pagamento');
    if (modalPagamento) modalPagamento.classList.add('ativo');
}

function fecharModalPagamento() {
    const modalPagamento = document.getElementById('modal-pagamento');
    if (modalPagamento) modalPagamento.classList.remove('ativo');
}

const BAIXAR_JSON_DO_PEDIDO = true;

function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

function baixarJson(objeto, nomeArquivo) {
    const blob = new Blob([JSON.stringify(objeto, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function carimboDeData(data) {
    const dois = n => String(n).padStart(2, '0');
    return `${data.getFullYear()}${dois(data.getMonth() + 1)}${dois(data.getDate())}`
        + `-${dois(data.getHours())}${dois(data.getMinutes())}${dois(data.getSeconds())}`;
}

function montarPedido() {
    const agora = new Date();

    const itens = carrinho.map(item => ({
        nome: item.nome,
        precoUnitario: arredondar(item.preco),
        quantidade: item.quantidade,
        subtotal: arredondar(item.preco * item.quantidade)
    }));
    const subtotal = arredondar(itens.reduce((soma, item) => soma + item.subtotal, 0));

    const campoEndereco = document.getElementById('endereco') || document.getElementById('endereco-entrega');
    const opcaoRadio = document.querySelector('input[name="pagamento"]:checked');
    const campoSelectPagamento = document.getElementById('forma-pagamento');
    const metodoPagamento = opcaoRadio ? opcaoRadio.value : (campoSelectPagamento ? campoSelectPagamento.value : '');

    let usuario = null;
    try { usuario = JSON.parse(localStorage.getItem('sushi_warrior_usuario')); } catch (err) { }

    return {
        data: agora.toLocaleDateString('pt-BR'),
        criadoEm: agora.toISOString(),
        status: 'confirmado',
        cliente: usuario ? {
            nome: usuario.nome || '',
            cpf: usuario.cpf || '',
            telefone: usuario.telefone || '',
            cep: usuario.cep || ''
        } : null,
        entrega: { endereco: campoEndereco ? campoEndereco.value.trim() : '' },
        pagamento: { metodo: metodoPagamento },
        itens: itens,
        subtotal: subtotal,
        frete: arredondar(TAXA_FRETE),
        total: arredondar(subtotal + TAXA_FRETE)
    };
}

function confirmarPagamento(e) {
    if (e) e.preventDefault();

    if (carrinho.length === 0) return;

    const novoPedido = montarPedido();

    let historicoPedidos = [];
    try { historicoPedidos = JSON.parse(localStorage.getItem('sushi_warrior_pedidos')) || []; } catch (err) { }
    historicoPedidos.push(novoPedido);
    localStorage.setItem('sushi_warrior_pedidos', JSON.stringify(historicoPedidos));

    if (BAIXAR_JSON_DO_PEDIDO) {
        try {
            baixarJson(novoPedido, `pedido-${carimboDeData(new Date())}.json`);
        } catch (err) {
            console.warn('Não foi possível baixar o JSON do pedido:', err);
        }
    }

    fecharModalPagamento();
    carrinho = [];
    salvarEAtualizar();

    const modalStatus = document.getElementById('modal-status-pedido');
    if (modalStatus) modalStatus.classList.add('ativo');
    iniciarContadorEntrega(35 * 60);
}


// 6. MONTE O SEU 

let monteSeuEstado = {
    sashimi_salmao: { nome: "Sashimi Salmão", preco: 3.50, qtd: 0 },
    hot_roll:       { nome: "Hot Roll", preco: 2.80, qtd: 0 },
    niguiri_salmao: { nome: "Niguiri Salmão", preco: 3.00, qtd: 0 },
    uramaki_salmao: { nome: "Uramaki Salmão", preco: 2.70, qtd: 0 }
};

function abrirModalMonteSeu() {
    const customDrawer = document.getElementById('customizador-drawer');
    const overlay = document.getElementById('carrinho-overlay');

    if (customDrawer) customDrawer.classList.add('ativo');
    if (overlay) overlay.classList.add('ativo');
}

function fecharCustomizador() {
    const customDrawer = document.getElementById('customizador-drawer');
    const overlay = document.getElementById('carrinho-overlay');

    if (customDrawer) customDrawer.classList.remove('ativo');
    if (overlay) overlay.classList.remove('ativo');
}

function alterarPecaCustom(idPeca, delta) {
    if (!monteSeuEstado[idPeca]) return;

    monteSeuEstado[idPeca].qtd = Math.max(0, monteSeuEstado[idPeca].qtd + delta);

    const elementoQtd = document.getElementById(`qtd-${idPeca}`);
    if (elementoQtd) {
        elementoQtd.innerText = monteSeuEstado[idPeca].qtd;
    }

    atualizarSubtotalCustomizador();
}

function calcularTotalCustomizador() {
    let total = 0;
    for (let key in monteSeuEstado) {
        total += monteSeuEstado[key].qtd * monteSeuEstado[key].preco;
    }
    return total;
}

function atualizarSubtotalCustomizador() {
    const total = calcularTotalCustomizador();
    const elementoTotal = document.getElementById('preco-customizador');

    if (elementoTotal) {
        elementoTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

function resetarCustomizador() {
    for (let key in monteSeuEstado) {
        monteSeuEstado[key].qtd = 0;
        const elementoQtd = document.getElementById(`qtd-${key}`);
        if (elementoQtd) elementoQtd.innerText = '0';
    }
    atualizarSubtotalCustomizador();
}

function confirmarCombinadoCustomizado() {
    let pecasSelecionadas = [];
    let totalPecas = 0;

    for (let key in monteSeuEstado) {
        const item = monteSeuEstado[key];
        if (item.qtd > 0) {
            pecasSelecionadas.push(`${item.qtd}x ${item.nome}`);
            totalPecas += item.qtd;
        }
    }

    if (totalPecas === 0) {
        alert('Selecione pelo menos uma peça para montar o seu combinado!');
        return;
    }

    const valorTotal = calcularTotalCustomizador();
    const nomeCustomizado = `Combinado Customizado (${pecasSelecionadas.join(', ')})`;

    adicionarAoCarrinho(nomeCustomizado, valorTotal, "IMG's/CombinadoEx.jpg");

    resetarCustomizador();
    fecharCustomizador();
}


// 7. Status do pedido

function iniciarContadorEntrega(segundosTotais) {
    if (timerInterval) clearInterval(timerInterval);

    const elementoTimer = document.getElementById('timer-contagem');

    function atualizarDisplay() {
        if (!elementoTimer) return;

        const minutos = Math.floor(segundosTotais / 60);
        const segundos = segundosTotais % 60;

        const minFormatted = String(minutos).padStart(2, '0');
        const segFormatted = String(segundos).padStart(2, '0');

        elementoTimer.innerText = `${minFormatted}:${segFormatted}`;

        if (segundosTotais <= 0) {
            clearInterval(timerInterval);
            elementoTimer.innerText = "00:00 - Chegou!";
        } else {
            segundosTotais--;
        }
    }

    atualizarDisplay();
    timerInterval = setInterval(atualizarDisplay, 1000);
}

function fecharModalStatus() {
    const modalStatus = document.getElementById('modal-status-pedido');
    if (modalStatus) modalStatus.classList.remove('ativo');
}


// 8. Login, Cadastro e Perfil

const BAIXAR_JSON_DO_USUARIO = true;

function mascaraTel(el) {
    const input = el || document.getElementById("Tel");
    if (!input) return;
    let tel = input.value.replace(/\D/g, ''); 
    
    if (tel.length > 0) {
        tel = "+" + tel;
    }
    if (tel.length > 3) {
        tel = tel.slice(0, 3) + " " + tel.slice(3);
    }
    if (tel.length > 5) {
        tel = tel.slice(0, 4) + "(" + tel.slice(4);
    }
    if (tel.length > 8) {
        tel = tel.slice(0, 7) + ") " + tel.slice(7);
    }
    if (tel.length > 14) {
        tel = tel.slice(0, 14) + "-" + tel.slice(14);
    }

    input.value = tel.slice(0, 19); 
}

function mascaraCep(el) {
    const input = el || document.getElementById("Cep");
    if (!input) return;
    let cep_formatado = input.value.replace(/\D/g, ''); 

    if (cep_formatado.length > 2) {
        cep_formatado = cep_formatado.slice(0, 2) + "." + cep_formatado.slice(2);
    }
    if (cep_formatado.length > 6) {
        cep_formatado = cep_formatado.slice(0, 6) + "-" + cep_formatado.slice(6);
    }

    input.value = cep_formatado.slice(0, 10);
}

function mascaraCpf(el) {
    const input = el || document.getElementById("CPF");
    if (!input) return;
    let cpf_formulario = input.value.replace(/\D/g, ''); 

    if (cpf_formulario.length > 3) {
        cpf_formulario = cpf_formulario.slice(0, 3) + "." + cpf_formulario.slice(3);
    }
    if (cpf_formulario.length > 7) {
        cpf_formulario = cpf_formulario.slice(0, 7) + "." + cpf_formulario.slice(7);
    }
    if (cpf_formulario.length > 11) {
        cpf_formulario = cpf_formulario.slice(0, 11) + "-" + cpf_formulario.slice(11);
    }

    input.value = cpf_formulario.slice(0, 14);
}

function RespostaLogin() {
    const elNome = document.getElementById('login-nome');
    const elSenha = document.getElementById('login-senha');

    if (!elNome || !elSenha) return;

    const nome = elNome.value.trim();
    const senha = elSenha.value.trim();

    if (!nome || !senha) {
        alert('Por favor, preencha o seu nome e a sua senha!');
        return;
    }

    let contasSalvas = [];
    try { contasSalvas = JSON.parse(localStorage.getItem('sushi_warrior_contas')) || []; } catch (err) { }
    
    const contaEncontrada = contasSalvas.find(c => c.nome.trim().toLowerCase() === nome.toLowerCase());

    const dadosUsuario = contaEncontrada
        ? { ...contaEncontrada }
        : { nome: nome };

    localStorage.setItem('sushi_warrior_usuario', JSON.stringify(dadosUsuario));
    window.location.href = 'Perfil.html';
}

function RespostaCriacao() {
    const elNome = document.getElementById('cad-nome');
    const elSenha = document.getElementById('cad-senha');
    const elConfSenha = document.getElementById('cad-confirmar-senha');
    const elCep = document.getElementById('Cep');
    const elCpf = document.getElementById('CPF');
    const elTel = document.getElementById('Tel');

    if (!elNome || !elSenha) return;

    const nome = elNome.value.trim();
    const senha = elSenha.value.trim();
    const confirmSenha = elConfSenha ? elConfSenha.value.trim() : '';
    const cep = elCep ? elCep.value.trim() : '';
    const cpf = elCpf ? elCpf.value.trim() : '';
    const tel = elTel ? elTel.value.trim() : '';

    if (!nome || !senha) {
        alert('Por favor, preencha o nome e a senha para criar sua conta!');
        return;
    }

    if (elConfSenha && senha !== confirmSenha) {
        alert('As senhas digitadas não correspondem!');
        return;
    }

    let contasSalvas = [];
    try { contasSalvas = JSON.parse(localStorage.getItem('sushi_warrior_contas')) || []; } catch (err) { }

    const jaExiste = contasSalvas.some(c => c.nome.trim().toLowerCase() === nome.toLowerCase());
    if (jaExiste) {
        alert('Já existe uma conta cadastrada com esse nome! Faça login ou escolha outro nome.');
        return;
    }

    const dadosUsuario = {
        nome: nome,
        cep: cep,
        cpf: cpf,
        telefone: tel,
        criadoEm: new Date().toISOString()
    };

    localStorage.setItem('sushi_warrior_usuario', JSON.stringify(dadosUsuario));

    contasSalvas.push(dadosUsuario);
    localStorage.setItem('sushi_warrior_contas', JSON.stringify(contasSalvas));

    if (BAIXAR_JSON_DO_USUARIO) {
        try {
            baixarJson(dadosUsuario, `usuario-${carimboDeData(new Date())}.json`);
        } catch (err) {
            console.warn('Não foi possível baixar o JSON do cadastro:', err);
        }
    }

    setTimeout(() => { window.location.href = 'Perfil.html'; }, 400);
}

function carregarPerfilEHistorico() {
    const elNome = document.getElementById('perfil-nome');
    if (!elNome) return;

    const dadosSalvos = localStorage.getItem('sushi_warrior_usuario');

    if (!dadosSalvos) {
        alert('Faça login primeiro para acessar o seu perfil!');
        window.location.href = 'Login.html';
        return;
    }

    const usuario = JSON.parse(dadosSalvos);
    elNome.innerText = `Olá, ${usuario.nome}!`;

    if (document.getElementById('perfil-cpf')) document.getElementById('perfil-cpf').innerText = usuario.cpf || 'Não informado';
    if (document.getElementById('perfil-tel')) document.getElementById('perfil-tel').innerText = usuario.telefone || 'Não informado';
    if (document.getElementById('perfil-cep')) document.getElementById('perfil-cep').innerText = usuario.cep || 'Não informado';

    const todosPedidos = JSON.parse(localStorage.getItem('sushi_warrior_pedidos')) || [];
    const historicoPedidos = todosPedidos.filter(pedido =>
        pedido.cliente &&
        pedido.cliente.nome &&
        pedido.cliente.nome.trim().toLowerCase() === usuario.nome.trim().toLowerCase()
    );

    const elHistorico = document.getElementById('historico-pedidos');
    const elTotalGastou = document.getElementById('total-gastou');

    if (historicoPedidos.length === 0) {
        if (elHistorico) elHistorico.innerText = 'Nenhum pedido realizado ainda.';
        if (elTotalGastou) elTotalGastou.innerText = 'R$ 0,00';
        return;
    }

    const totalGastoAcumulado = historicoPedidos.reduce((soma, pedido) => soma + pedido.total, 0);

    if (elTotalGastou) {
        elTotalGastou.innerText = `R$ ${totalGastoAcumulado.toFixed(2).replace('.', ',')}`;
    }

    if (elHistorico) {
        elHistorico.innerHTML = historicoPedidos.map((pedido, index) => {
            const itensFormatados = pedido.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
            return `
                <div style="margin-bottom: 12px; padding: 10px; border: 1px solid var(--border-color, #444); border-radius: 8px;">
                    <strong>Pedido #${index + 1} — ${pedido.data}</strong><br>
                    <span style="font-size: 0.9rem;">${itensFormatados}</span><br>
                    <strong style="color: var(--cor-salmao, #ff5555);">Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}</strong>
                </div>
            `;
        }).join('');
    }
}

function fazerLogout() {
    localStorage.removeItem('sushi_warrior_usuario');
    localStorage.removeItem('sushi_warrior_carrinho');
    carrinho = [];
    window.location.href = 'Login.html';
}