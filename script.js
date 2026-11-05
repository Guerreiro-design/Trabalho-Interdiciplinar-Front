//Modo claro e escuro

let checkbox = document.getElementById("check");
let SolLua = document.getElementById("SolLua");

if (checkbox) {
    checkbox.addEventListener("click", () => {
        document.body.classList.toggle("lightmode");
        if (SolLua.getAttribute("src") === "IMG's/sol.png") {
            SolLua.setAttribute("src", "IMG's/lua.png");
        } else {
            SolLua.setAttribute("src", "IMG's/sol.png");
        }
    });
}

//Carrinho + negocio do pedido 
function filtrarCategoria(categoriaSelecionada) {
    const produtos = document.querySelectorAll('.item-produto');
    const titulo = document.getElementById('titulo-categoria');

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

let carrinho = JSON.parse(localStorage.getItem('sushi_warrior_carrinho')) || [];
const TAXA_FRETE = 8.00;
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    atualizarCarrinho();
    configurarBotoesAdicionar();
});

function configurarBotoesAdicionar() {
    const botoes = document.querySelectorAll('.btn-add');
    botoes.forEach(botao => {
        botao.addEventListener('click', (e) => {
            const card = e.target.closest('.item-produto');
            const nome = card.querySelector('h3').innerText;
            const precoTexto = card.querySelector('.preco').innerText;
            const imagem = card.querySelector('img').getAttribute('src');

            const preco = parseFloat(precoTexto.replace('R$', '').replace(',', '.').trim());

            adicionarAoCarrinho(nome, preco, imagem);
        });
    });
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

    elementoTotal.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    elementoContador.innerText = totalItens;
}

function abrirCarrinho(e) {
    if (e) e.preventDefault();
    document.getElementById('carrinho-drawer').classList.add('ativo');
    document.getElementById('carrinho-overlay').classList.add('ativo');
}

function fecharCarrinho() {
    document.getElementById('carrinho-drawer').classList.remove('ativo');
    document.getElementById('carrinho-overlay').classList.remove('ativo');
}

function abrirCheckout() {
    if (carrinho.length === 0) {
        alert('Adicione itens ao carrinho antes de continuar!');
        return;
    }

    fecharCarrinho();

    const subtotal = calcularSubtotal();
    const totalFinal = subtotal + TAXA_FRETE;

    document.getElementById('checkout-subtotal').innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('checkout-frete').innerText = `R$ ${TAXA_FRETE.toFixed(2).replace('.', ',')}`;
    document.getElementById('checkout-total').innerText = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;

    document.getElementById('modal-pagamento').classList.add('ativo');
}

function fecharModalPagamento() {
    document.getElementById('modal-pagamento').classList.remove('ativo');
}

function confirmarPagamento(e) {
    e.preventDefault();

    fecharModalPagamento();

    carrinho = [];
    salvarEAtualizar();

    document.getElementById('modal-status-pedido').classList.add('ativo');
    iniciarContadorEntrega(35 * 60);
}

function iniciarContadorEntrega(segundosTotais) {
    if (timerInterval) clearInterval(timerInterval);

    const elementoTimer = document.getElementById('timer-contagem');

    function atualizarDisplay() {
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
    document.getElementById('modal-status-pedido').classList.remove('ativo');
}

//Monte o seu

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




//Barra de pesquisa
function pesquisarProdutos() {
    const termo = document.getElementById('campo-pesquisa').value.toLowerCase();
    const produtos = document.querySelectorAll('.item-produto');
    const titulo = document.getElementById('titulo-categoria');

    if (titulo) {
        titulo.innerText = termo.trim() !== '' ? `Resultados para: "${termo}"` : 'Todos os Produtos';
    }

    produtos.forEach(produto => {
        const nome = produto.querySelector('h3').innerText.toLowerCase();
        const descricao = produto.querySelector('p').innerText.toLowerCase();

        if (nome.includes(termo) || descricao.includes(termo)) {
            produto.style.display = 'block';
        } else {
            produto.style.display = 'none';
        }
    });
}

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

//Mascara de login
function mascaraTel() {
    let tel = document.getElementById("Tel").value
    console.log(tel)
    document.getElementById("Tel").value = tel.slice(0, 20)
    if (tel[0] != "+") {
        if (tel[0] != undefined) {
            document.getElementById("Tel").value = "+" + tel[0]
        }
    }
    if (tel[3] != " ") {
        if (tel[3] != undefined) {
            document.getElementById("Tel").value = tel.slice(0, 3) + " " + tel[3]
        }
    }
    if (tel[4] != "(") {
        if (tel[4] != undefined) {
            document.getElementById("Tel").value = tel.slice(0, 4) + "(" + tel[4]
        }
    }
    if (tel[7] != ")") {
        if (tel[7] != undefined) {
            document.getElementById("Tel").value = tel.slice(0, 7) + ")" + tel[7]
        }
    }
    if (tel[8] != " ") {
        if (tel[8] != undefined) {
            document.getElementById("Tel").value = tel.slice(0, 8) + " " + tel[8]
        }
    }
    if (tel[10] != " ") {
        if (tel[10] != undefined) {
            document.getElementById("Tel").value = tel.slice(0, 10) + " " + tel[10]
        }
    }
    if (tel[15] != "-") {
        if (tel[15] != undefined) {
            document.getElementById("Tel").value = tel.slice(0, 15) + "-" + tel[15]
        }
    }
}


function mascaraCep()
        { var cep_formatado = document.getElementById("Cep").value
            if (cep_formatado[2]!=".")
            {
                if (cep_formatado[2]!=undefined)
                {
                    document.getElementById("Cep").value=cep_formatado.slice(0,2)+"."+cep_formatado[2];
                }
            }
        
            if (cep_formatado[6]!="-")
            {
                if(cep_formatado[6]!=undefined)
                {
                    document.getElementById("Cep").value=cep_formatado.slice(0,6)+"-"+cep_formatado[6]
                }
            }

        }       

function mascaraCpf(){
     var cpf = document.getElementById("CPF").value

     document.getElementById("CPF").value = cpf

     cpf = document.getElementById("CPF").value.slice(0,11)

     var cpf_formulario = document.getElementById("CPF").value

     if (cpf_formulario[3] != "."){
        if (cpf_formulario[3] != undefined){
            document.getElementById("CPF").value = cpf_formulario.slice(0,3) +"."+cpf_formulario[3];
        }
     }
     if (cpf_formulario[7] != "."){
        if (cpf_formulario[7] != undefined){
            document.getElementById("CPF").value = cpf_formulario.slice(0,7) +"."+cpf_formulario[7];
        }
     }
     if (cpf_formulario[11] != "-"){
        if (cpf_formulario[11] != undefined){
            document.getElementById("CPF").value = cpf_formulario.slice(0,11) +"-"+cpf_formulario[11];
        }
     }
}


function RespostaLogin(){
    alert("Parabens seu login foi feito com sucesso, parabens!")
}

function RespostaCriacao(){
    alert("Parabens sua conta foi criada com sucesso parabens!")
}

