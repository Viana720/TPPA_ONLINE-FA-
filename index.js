 

 $(document).ready(function () {
    // Carregar as opções do dropdown ao carregar a página
    $.ajax({
        url: 'consultas/dropdownLinha.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dropdown = $('.dropdown-menu');
            dropdown.empty(); // Limpa qualquer opção estática
            data.forEach(function (linha) {
                dropdown.append(`<li><a class="dropdown-item" href="#" data-value="${linha}">${linha}</a></li>`);
            });
        },
        error: function () {
            alert("Erro ao carregar as linhas do banco de dados.");
        }
    });
});


/////////////////////////////////////////////////////////////////////////////Selecionar uma linha////////////////////////////////////////////////////////////////////////////////////
let linhaSelecionada = null;

$(document).on('click', '.dropdown-item', function (e) {
    e.preventDefault();
    linhaSelecionada = $(this).data('value'); // Captura o valor 
    $('#dropdownMenuButton').text(`${linhaSelecionada}`); // Atualiza o texto do botão
});

/////////////////////////////////////////////////////////////////////////////Gerar os graficos////////////////////////////////////////////////////////////////////////////////////////
$(function () {
    $(this).on('click', '#carregaGraficos', function (e) {
        e.preventDefault();

        const dataPicker1 = $('#date-picker').val();
        const dataPicker2 = $('#date-picker2').val();

        if (!dataPicker1 || !dataPicker2) {
            Swal.fire({
                icon: "error",
                iconColor: "#D50D0D",
                background: "#F0AFAF",
                title: "Por favor, selecione as datas!",
                showConfirmButton: false,
                timer: 1500
            });// Alerta de erro
        } else if (!linhaSelecionada) {
            Swal.fire({
                icon: "error",
                iconColor: "#D50D0D",
                background: "#F0AFAF",
                title: "Por favor, selecione o processo!",
                showConfirmButton: false,
                timer: 1500
            });// Alerta de erro
        } else {
            Swal.fire({
                icon: "success",
                iconColor:"#0ae8a1",
                background: "#B8FFFA",
                title: "Gerando os gráficos!",
                showConfirmButton: false,
                timer: 1500
            });
            chartOPEX(dataPicker1, dataPicker2, linhaSelecionada);
            chartCOMP(dataPicker1, dataPicker2, linhaSelecionada);
            chartPARETO(dataPicker1, dataPicker2, linhaSelecionada);
            payenter(dataPicker1, dataPicker2, linhaSelecionada);
        }
    });

});

///////////////////////////////////////////////////////////////////Criar um grafico vazio (OPEX e Composto)///////////////////////////////////////////////////////////////////////// 
function criarGraficoVazio(ctx, titulo) {
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                borderWidth: 1,
                backgroundColor: ['#2980B9', '#5499C7', '#7FB3D5', '#A9CCE3', '#A9CCE3'],
            }],
        },
        options: {
            indexAxis: 'x',
            plugins: {
                title: { display: true, text: titulo },
                legend: { display: false },
                datalabels: {
                    anchor: 'center',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 14 },
                    formatter: function(value) { return value; }
                },
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 1 } },
                x: {
                    ticks: {
                        padding: 10,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function(value, index, values) {
                            const label = this.getLabelForValue(value);
                            return label.length > 23 ? '...' + label.slice(-23) : label;
                        }
                    }
                },
            },
        },
        plugins: [ChartDataLabels]
    });
    return chart;
}

//////////////////////////////////////////////////////////////////////Criar um grafico vazio para o pareto/////////////////////////////////////////////////////////////////////////
function criarGraficoVazioPareto(ctx, titulo) {
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                borderWidth: 1,
                backgroundColor: ['#2980B9', '#5499C7', '#7FB3D5', '#A9CCE3', '#A9CCE3'],
                barPercentage: 1,
                categoryPercentage: 1
            }],
        },
        options: {
            indexAxis: 'x',
            plugins: {
                title: { display: true, text: titulo },
                legend: { display: false },
                datalabels: {
                    anchor: 'center',
                    align: 'end',
                    color: '#000',
                    font: { weight: 'bold', size: 14 },
                    formatter: function(value) { return value; }
                },
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 1 } },
                x: {
                    ticks: {
                        autoSkip: false,
                        maxRotation: 50,
                        minRotation: 50,
                        padding: 0,
                        callback: function(value, index, values) {
                            const label = this.getLabelForValue(value);
                            return label.length > 23 ? '...' + label.slice(-23) : label;
                        }
                    },
                    stacked: true
                },
            },
        },
        plugins: [ChartDataLabels]
    });
    return chart;
}

document.addEventListener('DOMContentLoaded', function() {
    const ctx1 = document.getElementById('g1');
    criarGraficoVazio(ctx1, 'FTT - OPEX | Average: 0.00%');

    const ctx2 = document.getElementById('g2');
    criarGraficoVazio(ctx2, 'FTT - | Average: 0.00%');

    const ctx3 = document.getElementById('g3');
    criarGraficoVazioPareto(ctx3, 'TOP FAILURES');
});

//////////////////////////////////////////////////////////////////////////////////FTT opex/////////////////////////////////////////////////////////////////////////////////////////
function chartOPEX(dataPicker1, dataPicker2, linhaSelecionada) {
    const ctx = document.getElementById('g1');
    
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'consultas/consultaOP.php',
        data: { data_inicio: dataPicker1, data_fim: dataPicker2, linha: linhaSelecionada },
        success: function(data) {
           
            let chart = Chart.getChart(ctx);

            if (chart) {
                chart.destroy();
            }

            var array_resultado = [];
            data.forEach(function(descricao, indice) {
                array_resultado[indice] = descricao.resultado;
            });

            const media2 = (Math.floor((array_resultado.reduce((acc, val) => acc + parseFloat(val), 0) / array_resultado.length) * 100) / 100).toFixed(2);

            var array_data = [];
            data.forEach(function(descricao, indice) {
                array_data[indice] = descricao.data;
            });

            chart = criarGraficoVazio(ctx, 'FTT - OPEX | Average: ' + media2 + '%'+'         '+'Target: 98.5'+'%');
            chart.data.labels = array_data;
            chart.data.datasets[0].data = array_resultado;
            chart.update();

            console.log("Dados recebidos:", data);
            spinner.style.display = 'none'; // Oculta o spinner
            
            
           
        },
        error: function() {
            alert("Erro ao carregar dados. Por favor, tente novamente.");
            
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////FTT composto//////////////////////////////////////////////////////////////////////////////////////
function chartCOMP(dataPicker1, dataPicker2, linhaSelecionada) {
    const ctx = document.getElementById('g2');
    const spinner = document.getElementById('loading-spinner'); // Adiciona esta linha
    spinner.style.display = 'flex'; // Mostra o spinner

    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'consultas/consultaCOMP.php',
        data: { data_inicio: dataPicker1, data_fim: dataPicker2, linha: linhaSelecionada },
        success: function(data) {
           
            let chart = Chart.getChart(ctx);

            if (chart) {
                chart.destroy();
            }

            // Adiciona o nome da operação e a média do FTT ao título
            const titulo = `FTT - ${data.operacao_mais_falhas} | Average: ${data.media_ftt}%         Target: 98.5%`;

            // Inicializa o gráfico com a função criarGraficoVazio
            chart = criarGraficoVazio(ctx, titulo);

            // Extrai dados de FTT por dia
            var array_data = [];
            var array_resultado = [];
            data.ftt_diario.forEach(function(item) {
                array_data.push(item.data); // Usa o campo 'data' formatado
                array_resultado.push(item.ftt); // Usa o campo 'ftt'
            });

            // Atualiza os dados do gráfico
            chart.data.labels = array_data;
            chart.data.datasets[0].data = array_resultado;
            chart.update();

            console.log("Dados recebidos:", data);
            spinner.style.display = 'none'; // Oculta o spinner
        },
        error: function() {
            
            alert("Erro ao carregar dados. Por favor, tente novamente.");
           
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////Pareto///////////////////////////////////////////////////////////////////////////////////////
function chartPARETO(dataPicker1, dataPicker2, linhaSelecionada) {
            const ctx = document.getElementById('g3');
           
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: 'consultas/consultaPareto.php',
                data: { data_inicio: dataPicker1, data_fim: dataPicker2, linha: linhaSelecionada },
                success: function(data) {
                    let chart = Chart.getChart(ctx);
        
                    if (chart) {
                        chart.destroy();
                    }
        
                    chart = criarGraficoVazioPareto(ctx, 'TOP FAILURES');
        
                    var array_resultado = [];
                    var array_data = [];
        
                    data.forEach(function(descricao, indice) {
                        array_resultado[indice] = descricao.quantidade;
                        // Combine test_step e nome_operacao para o rótulo
                        array_data[indice] = descricao.test_step + ' (' + descricao.nome_operacao + ')';
                    });
        
                    chart.data.labels = array_data;
                    chart.data.datasets[0].data = array_resultado;
                    chart.update();
        
                    console.log("Dados recebidos:", data);
                },


                error: function() {
                  
                    alert("Erro ao carregar dados. Por favor, tente novamente.");
                  
                }
            });
        }        
//////////////////////////////////////////////////////////////////////////////////////Paynter//////////////////////////////////////////////////////////////////////////////////////
function payenter(dataPicker1, dataPicker2, linhaSelecionada) {
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'consultas/payenter.php',
        data: {
            data_inicio: dataPicker1,
            data_fim: dataPicker2,
            linha: linhaSelecionada
        },
        success: function (data) {
            console.log('Dados recebidos:', data); // Inspeciona os dados recebidos

            let tabelaBody = $('#tabelaResultados tbody');
            tabelaBody.empty(); // Limpa a tabela antes de inserir os novos dados

            if (data && data.length > 0) {
                data.forEach(item => {
                    let linha = `
                        <tr>
                            <td>${item.dia}</td>
                            <td>${item.nome_operacao}</td>
                            <td>${item.total_serial_numbers}</td>
                        </tr>
                    `;
                    tabelaBody.append(linha);
                });
            } else {
                tabelaBody.append(`
                    <tr>
                        <td colspan="3">Nenhum dado encontrado</td>
                    </tr>
                `);
            }
        },
        error: function (xhr, status, error) {
            console.error('Erro na requisição:', xhr.responseText, status, error);

            let tabelaBody = $('#tabelaResultados tbody');
            tabelaBody.empty();
            tabelaBody.append(`
                <tr>
                    <td colspan="3">Erro ao buscar dados</td>
                </tr>
            `);
        }
    });
}

/////////////////////////////////////////////////////////////////////////////Salvar informações no banco////////////////////////////////////////////////////////////////////////////
function saveForm(modalId) {
    const dataPickerX = $('#date-picker').val();

    if (!linhaSelecionada) {
        Swal.fire({
            icon: "error",
            iconColor: "#D50D0D",
            background: "#F0AFAF",
            title: "Por favor, selecione um processo!",
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    const operacao = document.querySelector(`#operacao${modalId}`);
    const falha = document.querySelector(`#falha${modalId}`);
    const causa = document.querySelector(`#causa${modalId}`);
    const acao = document.querySelector(`#acao${modalId}`);
    const responsavel = document.querySelector(`#responsaveis${modalId}`);
    const dataprevista = document.querySelector(`#implementacao${modalId}`);
    const status = document.querySelector(`input[name="status${modalId}"]:checked`);

    if (!operacao.value || !falha.value || !causa.value || !acao.value || !responsavel.value || !dataprevista.value || !status) {
        Swal.fire({
            icon: "error",
            iconColor: "#D50D0D",
            background: "#F0AFAF",
            title: "Por favor, preencha todos os campos!",
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    const formData = new FormData();
    formData.append("linha", linhaSelecionada);
    formData.append("operacao", operacao.value);
    formData.append("falha", falha.value);
    formData.append("causa", causa.value);
    formData.append("acao", acao.value);
    formData.append("responsavel", responsavel.value);
    formData.append("dataprevista", dataprevista.value);
    formData.append("status", status.value);
    formData.append("dataRegistro", dataPickerX);

    fetch('consultas/salvarDados.php', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
            Swal.fire({
                icon: "success",
                iconColor: "#0ae8a1",
                background: "#B8FFFA",
                title: result, // Exibe a mensagem do servidor (Dados salvos ou atualizados)
                showConfirmButton: false,
                timer: 1500
            });
            clearForm(modalId);
        })
        .catch(error => {
            console.error('Erro:', error);
            Swal.fire({
                icon: "error",
                iconColor: "#D50D0D",
                background: "#F0AFAF",
                title: " Erro ao salvar, por favor tente novamente!",
                showConfirmButton: false,
                timer: 1500
            });
        });
}

////////////////////////////////////////////////////////////////////////////////Limpar o formulário/////////////////////////////////////////////////////////////////////////////////
function clearForm(modalId) {
    document.querySelector(`#operacao${modalId}`).value = '';
    document.querySelector(`#falha${modalId}`).value = '';
    document.querySelector(`#causa${modalId}`).value = '';
    document.querySelector(`#acao${modalId}`).value = '';
    document.querySelector(`#responsaveis${modalId}`).value = '';
    document.querySelector(`#implementacao${modalId}`).value = '';
    const radios = document.querySelectorAll(`input[name="status${modalId}"]`);
    radios.forEach(radio => radio.checked = false);
}

////////////////////////////////////////////////////////////////////// Mostrar dados no botao Action Plan////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const DOM = {
        botaoExibirTabela: document.getElementById('exibirTabela'),
        modalTabelaElement: document.getElementById('modalTabela'),
        tabelaDados: document.getElementById('tabelaDados'),
        tabelaExibicao: document.getElementById('tabelaExibicao'),
        tabelaExibicao2: document.getElementById('tabelaExibicao2'), // Adicionado
        formEdicao: document.getElementById('formEdicao'),
        botaoSalvarEdicao: document.getElementById('salvarEdicao'),
        botaoCancelarEdicao: document.getElementById('cancelarEdicao'),
        editIdInput: document.getElementById('editId'),
        editOperacaoInput: document.getElementById('editOperacao'),
        editFalhaInput: document.getElementById('editFalha'),
        editCausaInput: document.getElementById('editCausa'),
        editAcaoInput: document.getElementById('editAcao'),
        editResponsavelInput: document.getElementById('editResponsavel'),
        editDataprevistaInput: document.getElementById('editDataprevista'),
        editStatusSelect: document.getElementById('editStatus'),
        datePicker: document.getElementById('date-picker'),
        dropdownMenuButton: document.getElementById('dropdownMenuButton')
    };

    const myModal = new bootstrap.Modal(DOM.modalTabelaElement);
    let linhaSelecionadaParaEdicao = null;

    // Helper para exibir alertas com SweetAlert2
    function exibirAlerta(icon, title, text, background = "#B8FFFA", showConfirmButton = false, timer = 1500) {
        Swal.fire({ icon, title, text, background, showConfirmButton, timer });
    }

    async function buscarDados(url, bodyData) {
        try {
            const resposta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyData,
            });
            const dados = await resposta.json();
            if (dados.error) {
                console.error("Erro do PHP:", dados.error);
                exibirAlerta("error", "Erro no Servidor", dados.error);
                return null;
            }
            return dados;
        } catch (erro) {
            console.error('Erro na Requisição:', erro);
            exibirAlerta("error", "Erro de Rede", "Ocorreu um erro ao se comunicar com o servidor.");
            return null;
        }
    }

    function renderizarTabela(dados, elementoCorpoTabela) {
        elementoCorpoTabela.innerHTML = '';

        if (!dados || dados.length === 0) {
            const linha = elementoCorpoTabela.insertRow();
            const celula = linha.insertCell();
            celula.colSpan = 9; // Ajuste a coluna conforme a necessidade da tabela
            celula.textContent = "Nenhum dado foi registrado ainda!";
            return;
        }

        const colunasDados = ['operacao', 'falha', 'causa', 'acao', 'responsavel', 'dataprevista', 'status'];

        dados.forEach(item => {
            const linha = elementoCorpoTabela.insertRow();
            // Apenas adicione o data-id se a tabela for interativa (edição/exclusão)
            if (elementoCorpoTabela.id === 'tabelaDados') {
                linha.dataset.id = item.id;
            }

            colunasDados.forEach(chave => {
                const celula = linha.insertCell();
                celula.textContent = item[chave];
            });

            // Adicionar Botões de Edição e Excluir APENAS para a tabela dentro do modal
            if (elementoCorpoTabela.id === 'tabelaDados') {
                const celulaEdicao = linha.insertCell();
                const botaoEditar = document.createElement('button');
                botaoEditar.className = 'btn btn-sm btn-primary editar-linha botao-editar-customizado';
                botaoEditar.innerHTML = '<img src="./assets/img/Editar.svg" alt="Editar" style="width: 16px; height: 16px;">';
                botaoEditar.dataset.id = item.id;
                celulaEdicao.appendChild(botaoEditar);

                const celulaExcluir = linha.insertCell();
                const botaoExcluir = document.createElement('button');
                botaoExcluir.className = 'btn btn-sm btn-danger deletar-linha botao-deletar-customizado';
                botaoExcluir.innerHTML = '<img src="./assets/img/delete.svg" alt="Excluir" style="width: 16px; height: 16px; align-items: center; justify-content: center">';
                botaoExcluir.dataset.id = item.id;
                celulaExcluir.appendChild(botaoExcluir);
            }
        });
    }

    async function lidarComCliqueExibirTabela() {
        const { datePicker, dropdownMenuButton, tabelaDados, tabelaExibicao, tabelaExibicao2, formEdicao } = DOM;
        const data = datePicker.value;
        const linha = dropdownMenuButton.textContent.trim();

        if (!data || linha === "Line") {
            exibirAlerta("info", "Aviso, data e processo não selecionados!", "", "#EFEA5E", false, 1500);
            return;
        }

        const resultado = await buscarDados('consultas/buscarDados.php', `data=${data}&linha=${linha}`);
        if (resultado) {
            const arrayDados = Array.isArray(resultado) ? resultado : (resultado && Object.values(resultado)[0]);
            
            // Renderiza os dados na tabela do modal
            renderizarTabela(arrayDados || [], tabelaDados);
            
            // Renderiza os dados na nova tabela fora do modal
            renderizarTabela(arrayDados || [], tabelaExibicao2.getElementsByTagName('tbody')[0] || tabelaExibicao2.createTBody());
            
            tabelaExibicao.style.display = 'table';
            formEdicao.style.display = 'none';
            myModal.show();
        }
    }

    function preencherFormularioEdicao(linha) {
        linhaSelecionadaParaEdicao = linha;
        const { editIdInput, editOperacaoInput, editFalhaInput, editCausaInput, editAcaoInput, editResponsavelInput, editDataprevistaInput, editStatusSelect } = DOM;

        editIdInput.value = linha.dataset.id;
        editOperacaoInput.value = linha.cells[0].textContent;
        editFalhaInput.value = linha.cells[1].textContent;
        editCausaInput.value = linha.cells[2].textContent;
        editAcaoInput.value = linha.cells[3].textContent;
        editResponsavelInput.value = linha.cells[4].textContent;
        editDataprevistaInput.value = linha.cells[5].textContent;
        editStatusSelect.value = linha.cells[6].textContent;

        DOM.tabelaExibicao.style.display = 'none';
        DOM.formEdicao.style.display = 'block';
    }

    async function lidarComCliqueBotaoDeletar(idParaDeletar) {
        const resultadoConfirmacao = await Swal.fire({
            title: 'Você tem certeza?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3adabf',
            cancelButtonColor: '#f84626',
            confirmButtonText: 'Sim, excluir!'
        });

        if (resultadoConfirmacao.isConfirmed) {
            const resultadoExclusao = await buscarDados('consultas/deletarDados.php', `id=${idParaDeletar}`);
            if (resultadoExclusao && resultadoExclusao.success) {
                exibirAlerta('success', 'Excluído!', 'Os dados foram excluídos.');
                const linhaParaDeletar = DOM.tabelaDados.querySelector(`tr[data-id="${idParaDeletar}"]`);
                linhaParaDeletar?.remove(); // Operador de encadeamento opcional para remover
                
                // Remover a linha da tabela de exibição 2 também (opcional, dependendo da necessidade)
                const linhaParaDeletar2 = DOM.tabelaExibicao2.querySelector(`tr[data-id="${idParaDeletar}"]`);
                linhaParaDeletar2?.remove();

                if (DOM.tabelaDados.rows.length === 0) {
                    renderizarTabela([], DOM.tabelaDados);
                }
                if (DOM.tabelaExibicao2.getElementsByTagName('tbody')[0]?.rows.length === 0) {
                     renderizarTabela([], DOM.tabelaExibicao2.getElementsByTagName('tbody')[0] || DOM.tabelaExibicao2.createTBody());
                }
            }
        }
    }

    async function lidarComCliqueSalvarEdicao() {
        const { editIdInput, editOperacaoInput, editFalhaInput, editCausaInput, editAcaoInput, editResponsavelInput, editDataprevistaInput, editStatusSelect } = DOM;
        const id = editIdInput.value;
        const operacao = editOperacaoInput.value;
        const falha = editFalhaInput.value;
        const causa = editCausaInput.value;
        const acao = editAcaoInput.value;
        const responsavel = editResponsavelInput.value;
        const dataprevista = editDataprevistaInput.value;
        const status = editStatusSelect.value;

        const corpo = `id=${id}&operacao=${operacao}&falha=${falha}&causa=${causa}&acao=${acao}&responsavel=${responsavel}&dataprevista=${dataprevista}&status=${status}`;

        const resultadoAtualizacao = await buscarDados('consultas/atualizarDados.php', corpo);

        if (resultadoAtualizacao && resultadoAtualizacao.success) {
            exibirAlerta("success", "Dados atualizados com sucesso!", "", "#B8FFFA", false, 1500);
            if (linhaSelecionadaParaEdicao) {
                linhaSelecionadaParaEdicao.cells[0].textContent = operacao;
                linhaSelecionadaParaEdicao.cells[1].textContent = falha;
                linhaSelecionadaParaEdicao.cells[2].textContent = causa;
                linhaSelecionadaParaEdicao.cells[3].textContent = acao;
                linhaSelecionadaParaEdicao.cells[4].textContent = responsavel;
                linhaSelecionadaParaEdicao.cells[5].textContent = dataprevista;
                linhaSelecionadaParaEdicao.cells[6].textContent = status;
                DOM.tabelaExibicao.style.display = 'table';
                DOM.formEdicao.style.display = 'none';
                
                // Atualizar a linha correspondente na tabelaExibicao2 também
                const linhaNaTabela2 = DOM.tabelaExibicao2.querySelector(`tr[data-id="${id}"]`);
                if (linhaNaTabela2) {
                    linhaNaTabela2.cells[0].textContent = operacao;
                    linhaNaTabela2.cells[1].textContent = falha;
                    linhaNaTabela2.cells[2].textContent = causa;
                    linhaNaTabela2.cells[3].textContent = acao;
                    linhaNaTabela2.cells[4].textContent = responsavel;
                    linhaNaTabela2.cells[5].textContent = dataprevista;
                    linhaNaTabela2.cells[6].textContent = status;
                }

                linhaSelecionadaParaEdicao = null;
            }
        }
    }

    function lidarComCliqueCancelarEdicao() {
        DOM.tabelaExibicao.style.display = 'table';
        DOM.formEdicao.style.display = 'none';
        linhaSelecionadaParaEdicao = null;
    }

    // Inicialização dos Event Listeners
    if (DOM.botaoExibirTabela) {
        DOM.botaoExibirTabela.addEventListener('click', lidarComCliqueExibirTabela);
    } else {
        console.error("Botão 'exibirTabela' não encontrado!");
    }

    DOM.tabelaDados.addEventListener('click', function(event) {
        const botaoEditar = event.target.closest('.editar-linha');
        const botaoDeletar = event.target.closest('.deletar-linha');

        if (botaoEditar) {
            preencherFormularioEdicao(botaoEditar.closest('tr'));
        } else if (botaoDeletar) {
            lidarComCliqueBotaoDeletar(botaoDeletar.dataset.id);
        }
    });

    DOM.botaoSalvarEdicao?.addEventListener('click', lidarComCliqueSalvarEdicao);
    DOM.botaoCancelarEdicao?.addEventListener('click', lidarComCliqueCancelarEdicao);
});
///////////////////////////////////////////////////////////// Download da imagem da dashboard como arquivo em  PDF///////////////////////////////////////////////////////////////////
   document.addEventListener('DOMContentLoaded', function () {
    const downloadButton = document.getElementById('Download');
    const telaElement = document.getElementById('tela');

    if (downloadButton && telaElement) {
        downloadButton.addEventListener('click', function () {
            const telaWidth = telaElement.offsetWidth;
            const telaHeight = telaElement.offsetHeight;

            const pdfWidth = telaWidth;
            const pdfHeight = telaHeight;

            const scale = 6;

            const opt = {
                margin: 0,
                filename: 'TPPA_dashboard.pdf',
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: scale,
                    width: telaWidth,
                    height: telaHeight
                },
                jsPDF: {
                    unit: 'px', // Unidade em pixels
                    format: [pdfWidth, pdfHeight], // Formato personalizado
                    orientation: 'landscape'
                }
            };

            html2pdf().from(telaElement).set(opt).save();
        });
    } else {
        if (!downloadButton) console.error("Botão de download não encontrado!");
        if (!telaElement) console.error("Elemento 'tela' não encontrado!");
    }
});

//////////////////////////////////////////////////////////////////////Download da tabela do plano de ação///////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    const downloadButton2 = document.getElementById('Download2');
    const telaElement2 = document.getElementById('tela2'); // O elemento que você quer capturar (seu modal-content)
    const tabelaExibicao = document.getElementById('tabelaExibicao'); // **Adicionado para acessar a tabela**

    // Referências aos botões que você quer ocultar *apenas na captura do PDF*
    const closeButton = document.getElementById('fechar');
    const andonButton = document.getElementById('andon');
    const action = document.getElementById('action');

    // O downloadButton2 já está referenciado, e ele também será ocultado temporariamente

    // **IMPORTANTE: Adicionado tabelaExibicao à condição de verificação**
    if (downloadButton2 && telaElement2 && closeButton && andonButton && tabelaExibicao) {
        downloadButton2.addEventListener('click', async function () { // Adicionado 'async' aqui para usar 'await'
            // 1. Ocultar os botões *antes* de iniciar a captura
            closeButton.style.display = 'none';
            andonButton.style.display = 'none';
            downloadButton2.style.display = 'none';
            action.style.display = 'none';

            // --- INÍCIO DA LÓGICA PARA GARANTIR A DATA COMPLETA ---
            const targetDateCells = tabelaExibicao.querySelectorAll('td:nth-child(6)'); // Seleciona todas as células da 6ª coluna (Target Date)
            const originalTargetDateCellMinWidth = [];
            const originalTargetDateCellWhiteSpace = [];

            targetDateCells.forEach(cell => {
                // Guarda os estilos originais para restaurar depois
                originalTargetDateCellMinWidth.push(cell.style.minWidth);
                originalTargetDateCellWhiteSpace.push(cell.style.whiteSpace);

                // Aplica os estilos para garantir a exibição completa da data
                cell.style.minWidth = '95px'; // Uma largura mínima que deve caber "AAAA-MM-DD" (ajuste se precisar de mais espaço)
                cell.style.whiteSpace = 'nowrap'; // Impede que a data quebre a linha
            });

            // Adicionado um pequeno delay para que os estilos temporários sejam aplicados antes do html2canvas
            await new Promise(resolve => setTimeout(resolve, 100));
            // --- FIM DA LÓGICA PARA GARANTIR A DATA COMPLETA ---

            const opt2 = {
                margin: 10,
                filename: 'Action_Plan.pdf',
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 5 // Mantido em 5 como estava na sua original
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'landscape'
                }
            };

            // 2. Chamar html2pdf para gerar o PDF
            // Use .then() para reexibir os botões APÓS a conclusão da geração
            html2pdf().from(telaElement2).set(opt2).save().then(function() {
                // 3. Reexibir os botões *depois* que o PDF for gerado/salvo
                closeButton.style.display = '';
                andonButton.style.display = '';
                downloadButton2.style.display = 'flex'; // Mantido 'flex' como sugerido anteriormente

                // --- INÍCIO DA RESTAURAÇÃO DA LÓGICA DA DATA ---
                // Restaurar largura e white-space das células da data
                targetDateCells.forEach((cell, i) => {
                    cell.style.minWidth = originalTargetDateCellMinWidth[i];
                    cell.style.whiteSpace = originalTargetDateCellWhiteSpace[i];
                });
                // --- FIM DA RESTAURAÇÃO DA LÓGICA DA DATA ---
            });
        });
    } else {
        // Mensagens de erro mais específicas para depuração
        if (!downloadButton2) console.error("Botão de download ('Download2') não encontrado!");
        if (!telaElement2) console.error("Elemento principal para captura ('tela2') não encontrado!");
        if (!tabelaExibicao) console.error("Tabela ('tabelaExibicao') não encontrada!"); // Adicionado erro para tabela
        if (!closeButton) console.error("Botão 'Fechar' ('fechar') não encontrado!");
        if (!andonButton) console.error("Botão 'Andon' ('andon') não encontrado!");
    }
});

//////////////////////////////////////////////////////////////////////// Redirecionamento para o andon /////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const andonButton = document.getElementById('andon');

    if (andonButton) {
        andonButton.addEventListener('click', function() {
            console.log("Botão clicado!");
            window.open('http://10.137.174.13:8585/sistema_andon/view/cadastros/relatorioExcel.php', '_blank'); // Abre em uma nova aba
        });
    } else {
        console.error("Botão 'andon' não encontrado!");
    }
    
});


