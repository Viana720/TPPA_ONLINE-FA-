 

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


// Selecionar uma linha
let linhaSelecionada = null;

$(document).on('click', '.dropdown-item', function (e) {
    e.preventDefault();
    linhaSelecionada = $(this).data('value'); // Captura o valor exato
    $('#dropdownMenuButton').text(`${linhaSelecionada}`); // Atualiza o texto do botão
});

// Gerar os graficos
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
                title: "Please select the dates!",
                showConfirmButton: false,
                timer: 1500
            });// Alerta de erro
        } else if (!linhaSelecionada) {
            Swal.fire({
                icon: "error",
                iconColor: "#D50D0D",
                background: "#F0AFAF",
                title: "Please select the process!",
                showConfirmButton: false,
                timer: 1500
            });// Alerta de erro
        } else {
            Swal.fire({
                icon: "success",
                iconColor:"#0ae8a1",
                background: "#B8FFFA",
                title: "Generating charts!",
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

// Criar um grafico vazio (OPEX e Composto) 
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

// Criar um grafico vazio para o pareto
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

// FTT opex
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

// FTT composto
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

// Pareto
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
// Paynter
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

// Salvar informações no banco
function saveForm(modalId) {
    const dataPickerX = $('#date-picker').val();

    if (!linhaSelecionada) {
        Swal.fire({
            icon: "error",
            iconColor: "#D50D0D",
            background: "#F0AFAF",
            title: "Please select a process and fill out the form!",
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
            title: "Please fill in all the fields before saving!",
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
                title: " Error saving data. Please try again!",
                showConfirmButton: false,
                timer: 1500
            });
        });
}

// Limpar o formulário
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

// Mostrar dados no botao Action Plan
document.addEventListener('DOMContentLoaded', function() {
    //console.log("DOM carregado!");

    const botao = document.getElementById('exibirTabela');
    const modalTabelaElement = document.getElementById('modalTabela'); // Obtém o elemento do modal
    const myModal = new bootstrap.Modal(modalTabelaElement); // Instancia o modal APENAS UMA VEZ


    if (botao) {
        botao.addEventListener('click', function() {
            console.log("Botão clicado!");

            const data = document.getElementById('date-picker').value;
            const linha = document.getElementById('dropdownMenuButton').textContent.trim();

            if (!data || linha === "Line") {
                Swal.fire({
                    icon: "info",
                    iconColor:"#ABF5FD",
                    background: "#EFEA5E",
                    title: "Warning, date and process are not selected!",
                    showConfirmButton: false,
                    timer: 1500
                });
                return;
            }

            fetch('consultas/buscarDados.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'data=' + data + '&linha=' + linha
            })
            .then(response => response.json())
            .then(data => {
                console.log("Dados recebidos:", data);

                if (data.error) {
                    console.error("Erro do PHP:", data.error);
                    alert(data.error);
                    return;
                }

                const tabelaDados = document.getElementById('tabelaDados');
                tabelaDados.innerHTML = '';

                let dataArray = data;
                if (!Array.isArray(data)) {
                    if (typeof data === 'object' && data !== null) {
                        const keys = Object.keys(data);
                        if (keys.length === 1 && Array.isArray(data[keys[0]])) {
                            dataArray = data[keys[0]];
                        } else if(keys.length === 0){
                            console.warn("Nenhum dado retornado do banco de dados.");
                            const row = tabelaDados.insertRow();
                            const cell = row.insertCell();
                            cell.colSpan = 7;
                            cell.textContent = "Data has not been registered yet!";
                            myModal.show();
                            return;
                        } else{
                          console.error("Formato de dados inesperado:", data);
                          return;
                        }
                    } else {
                        console.error("Formato de dados inválido:", data);
                        return;
                    }
                }

                if (dataArray && dataArray.length > 0) {
                    dataArray.forEach(item => {
                        const row = tabelaDados.insertRow();
                        const cell1 = row.insertCell();
                        const cell2 = row.insertCell();
                        const cell3 = row.insertCell();
                        const cell4 = row.insertCell();
                        const cell5 = row.insertCell();
                        const cell6 = row.insertCell();
                        const cell7 = row.insertCell();

                        cell1.textContent = item.operacao;
                        cell2.textContent = item.falha;
                        cell3.textContent = item.causa;
                        cell4.textContent = item.acao;
                        cell5.textContent = item.responsavel;
                        cell6.textContent = item.dataprevista;
                        cell7.textContent = item.status;
                    });
                } else {
                    const row = tabelaDados.insertRow();
                    const cell = row.insertCell();
                    cell.colSpan = 7;
                    cell.textContent = "Data has not been registered yet!";
                }

                myModal.show(); // Mostra o modal (instanciado apenas uma vez)
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro ao buscar os dados.');
            });
        });
    } else {
        console.error("Botão 'exibirTabela' não encontrado!");
    }
});

// Download da imagem da dashboard como arquivo em  PDF
   document.addEventListener('DOMContentLoaded', function () {
    const downloadButton = document.getElementById('Download');
    const telaElement = document.getElementById('tela');

    if (downloadButton && telaElement) {
        downloadButton.addEventListener('click', function () {
            const telaWidth = telaElement.offsetWidth;
            const telaHeight = telaElement.offsetHeight;

            const pdfWidth = telaWidth;
            const pdfHeight = telaHeight;

            const scale = 1;

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

// Download da tabela do plano de ação
document.addEventListener('DOMContentLoaded', function () {
    const downloadButton2 = document.getElementById('Download2');
    const telaElement2 = document.getElementById('tela2');

    if (downloadButton2 && telaElement2) {
        downloadButton2.addEventListener('click', function () {
            const opt2 = {
                margin: 10,
                filename: 'Action_Plan.pdf',
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 1
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'landscape'
                }
            };

            html2pdf().from(telaElement2).set(opt2).save();
        });
    } else {
        if (!downloadButton2) console.error("Botão de download não encontrado!");
        if (!telaElement2) console.error("Elemento 'tela' não encontrado!");
    }
});

// Redirecionamento para o andon
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

