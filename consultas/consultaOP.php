<?php

include_once('../conexao.php');

$data_inicial = $_REQUEST['data_inicio'];
$data_final = $_REQUEST['data_fim'];
$linha = $_REQUEST['linha'];

// Switch das operações
$operacoes = [];
switch ($linha) {
    case 'REGIO':
        $operacoes = [
            ['nome' => 'OP70', 'id' => 'AID048611']
        ];
        break;
    case 'GEM':
        $operacoes = [
            ['nome' => 'OP80', 'id' => 'AID046967'],
        ];
        break;
    case 'FPK':
        $operacoes = [
            ['nome' => 'S8S9', 'id' => 'FCTT-001'],
        ];
        break;
    default:
        echo json_encode(['erro' => 'Linha inválida']);
        exit;
}

// Constrói as cláusulas IN para nome e ID
$nomes_operacoes = array_column($operacoes, 'nome');
$ids_operacoes = array_column($operacoes, 'id');

$nomes_string = "'" . implode("','", $nomes_operacoes) . "'";
$ids_string = "'" . implode("','", $ids_operacoes) . "'";

$sql = "SELECT 
            TRUNCATE(
                (SUM(CASE WHEN result = 0 THEN 1 ELSE 0 END) / SUM(CASE WHEN result = 0 OR result = 1 THEN 1 ELSE 0 END)) * 100, 
                2
            ) AS resultado,
            DATE_FORMAT(test_date, '%d/%m') AS data
        FROM 
            (
                SELECT DISTINCT 
                    serial_number, 
                    result, 
                    test_date 
                FROM 
                    test_steps
                WHERE 
                    area = 'FA' 
                    AND linha = '$linha'
                    AND nome_operacao IN ($nomes_string)
                    AND id_estacao IN ($ids_string)
                    AND result IN (0, 1) 
                    AND test_date BETWEEN '$data_inicial' AND '$data_final'
            ) AS distinct_results
        GROUP BY 
            data
        ORDER BY 
            STR_TO_DATE(data, '%d/%m')";

$sql_query = mysqli_query($conexao, $sql);

if (!$sql_query) {
    echo json_encode(['erro' => mysqli_error($conexao)]);
    exit;
}

if (mysqli_num_rows($sql_query) > 0) {
    $vetor = [];
    while ($resultado = mysqli_fetch_assoc($sql_query)) {
        $vetor[] = $resultado;
    }
    echo json_encode($vetor);
} else {
    echo json_encode([]);
}

?>
