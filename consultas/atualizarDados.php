<?php

include_once('../conexao.php');

if (!$conexao) {
    die(json_encode(["error" => "Falha na conexão: " . mysqli_connect_error()]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $id = mysqli_real_escape_string($conexao, $_POST['id']);
    $operacao = mysqli_real_escape_string($conexao, $_POST['operacao']);
    $falha = mysqli_real_escape_string($conexao, $_POST['falha']);
    $causa = mysqli_real_escape_string($conexao, $_POST['causa']);
    $acao = mysqli_real_escape_string($conexao, $_POST['acao']);
    $responsavel = mysqli_real_escape_string($conexao, $_POST['responsavel']);
    $dataprevista = mysqli_real_escape_string($conexao, $_POST['dataprevista']);
    $status = mysqli_real_escape_string($conexao, $_POST['status']);

    $query = "UPDATE plano_de_acao SET
              operacao = '$operacao',
              falha = '$falha',
              causa = '$causa',
              acao = '$acao',
              responsavel = '$responsavel',
              dataprevista = '$dataprevista',
              status = '$status'
              WHERE id = $id";

    if (mysqli_query($conexao, $query)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Erro ao atualizar o registro: " . mysqli_error($conexao)]);
    }
} else {
    echo json_encode(["error" => "Requisição inválida: Método incorreto ou ID ausente."]);
}

mysqli_close($conexao);

?>