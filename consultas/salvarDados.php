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

    // Verifica se já existe um registro com a mesma linha, data e falha
    $checkSql = "SELECT id FROM plano_de_acao WHERE linha = '$linha' AND dataRegistro = '$dataRegistro' AND falha = '$falha'";
    $checkResult = mysqli_query($conexao, $checkSql);

    if (mysqli_num_rows($checkResult) > 0) {
        // Se existir, atualiza o registro
        $updateSql = "UPDATE plano_de_acao SET operacao = '$operacao', causa = '$causa', acao = '$acao', responsavel = '$responsavel', dataprevista = '$dataprevista', status = '$status' WHERE linha = '$linha' AND dataRegistro = '$dataRegistro' AND falha = '$falha'";
        if (mysqli_query($conexao, $updateSql)) {
            echo "Dados atualizados com sucesso!";
        } else {
            echo "Erro ao atualizar os dados: " . mysqli_error($conexao);
        }
    } else {
        // Se não existir, insere um novo registro
        $insertSql = "INSERT INTO plano_de_acao (linha, operacao, falha, causa, acao, responsavel, dataprevista, status, dataRegistro) VALUES ('$linha', '$operacao', '$falha', '$causa', '$acao', '$responsavel', '$dataprevista', '$status', '$dataRegistro')";
        if (mysqli_query($conexao, $insertSql)) {
            echo "Dados salvos com sucesso!";
        } else {
            echo "Erro ao salvar os dados: " . mysqli_error($conexao);
        }
    }
} else {
    echo "Método inválido. Use POST para enviar os dados.";
}

?>