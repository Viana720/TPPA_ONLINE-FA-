<?php

include_once('../conexao.php');

if (!$conexao) {
    die(json_encode(["error" => "Falha na conexão: " . mysqli_connect_error()])); // Retorna JSON em caso de erro de conexão
}

if (isset($_POST['data']) && isset($_POST['linha'])) {
    $data = mysqli_real_escape_string($conexao, $_POST['data']);
    $linha = mysqli_real_escape_string($conexao, $_POST['linha']);

    $dataObj = DateTime::createFromFormat('Y-m-d', $data);
    if ($dataObj !== false) {
        $data_formatada = $dataObj->format('Y-m-d');
    } else {
        die(json_encode(["error" => "Erro no formato da data. Formato esperado: YYYY-MM-DD"])); // Retorna JSON em caso de erro de data
    }

    $query = "SELECT operacao, falha, causa, acao, responsavel, dataprevista, status
              FROM plano_de_acao
              WHERE linha = '$linha' AND dataRegistro = '$data_formatada'";

    $resultado = mysqli_query($conexao, $query);

    if (!$resultado) {
        die(json_encode(["error" => "Erro na consulta: " . mysqli_error($conexao)])); // Retorna JSON em caso de erro de SQL
    }

    if (mysqli_num_rows($resultado) > 0) {
        $dados = array();
        while ($row = mysqli_fetch_assoc($resultado)) {
            $dados[] = $row;
        }
        echo json_encode($dados); // APENAS ESTE ECHO DEVE EXISTIR
    } else {
        echo json_encode(array()); // APENAS ESTE ECHO DEVE EXISTIR
    }
}

mysqli_close($conexao);
?>

