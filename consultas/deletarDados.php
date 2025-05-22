<?php

include_once('../conexao.php');

if (!$conexao) {
    die(json_encode(["error" => "Falha na conexão: " . mysqli_connect_error()]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $id = mysqli_real_escape_string($conexao, $_POST['id']);

    $query = "DELETE FROM plano_de_acao WHERE id = $id";

    if (mysqli_query($conexao, $query)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Erro ao deletar o registro: " . mysqli_error($conexao)]);
    }
} else {
    echo json_encode(["error" => "Requisição inválida: Método incorreto ou ID ausente."]);
}

mysqli_close($conexao);

?>