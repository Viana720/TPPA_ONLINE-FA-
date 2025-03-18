<?php
include_once('../conexao.php');

$linha = $_REQUEST['linha'];

// Consulta para obter as operações associadas à linha selecionada
$sql = "SELECT DISTINCT nome_operacao FROM test_steps WHERE area = 'FA' AND linha = '$linha'";
$result = mysqli_query($conexao, $sql);

$operations = [];
if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $operations[] = $row['nome_operacao'];
    }
}

echo json_encode($operations);
?>