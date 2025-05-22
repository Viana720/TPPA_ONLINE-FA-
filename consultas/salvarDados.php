<?php

include('../conexao.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $linha = mysqli_real_escape_string($conexao, $_POST['linha']);
    $operacao = mysqli_real_escape_string($conexao, $_POST['operacao']);
    $falha = mysqli_real_escape_string($conexao, $_POST['falha']);
    $causa = mysqli_real_escape_string($conexao, $_POST['causa']);
    $acao = mysqli_real_escape_string($conexao, $_POST['acao']);
    $responsavel = mysqli_real_escape_string($conexao, $_POST['responsavel']);
    $dataprevista = mysqli_real_escape_string($conexao, $_POST['dataprevista']);
    $status = mysqli_real_escape_string($conexao, $_POST['status']);
    $dataRegistro = mysqli_real_escape_string($conexao, $_POST['dataRegistro']);

    // Insere um novo registro
    $insertSql = "INSERT INTO plano_de_acao (linha, operacao, falha, causa, acao, responsavel, dataprevista, status, dataRegistro) VALUES ('$linha', '$operacao', '$falha', '$causa', '$acao', '$responsavel', '$dataprevista', '$status', '$dataRegistro')";
    if (mysqli_query($conexao, $insertSql)) {
        echo "Dados salvos com sucesso!";
    } else {
        echo "Erro ao salvar os dados: " . mysqli_error($conexao);
    }
} else {
    echo "Método inválido. Use POST para enviar os dados.";
}

?>