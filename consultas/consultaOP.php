<?php

include_once('../conexao.php');

$data_inicial = $_REQUEST['data_inicio'];
$data_final = $_REQUEST['data_fim'];
$linha = $_REQUEST['linha'];

// Switch para definir as operações com tratamento para evitar SQL Injection
$nome_operacao = [];
switch ($linha) {
    case 'REGIO':
        $nome_operacao = ['OP70'];
        break;
    case 'GEM':
        $nome_operacao = ['OP80'];
        break;
    case 'FPK':
        $nome_operacao = ['S8S9'];
        break;
    case 'STELLANTIS':
        $nome_operacao = ['OPS7A'];
        break;
    default:
        // Lançar um erro ou retornar um JSON indicando erro é mais adequado
        echo json_encode(['erro' => 'Linha inválida']);
        exit; // Encerra a execução
}


$operacoes_string = "'" . implode("','", $nome_operacao) . "'";

$sql = "SELECT 
            TRUNCATE(
                (
                    (SUM(CASE WHEN result = 0 THEN 1 ELSE 0 END)) 
                    / SUM(CASE WHEN result = 0 OR result = 1 THEN 1 ELSE 0 END)
                ) * 100, 
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
                    AND nome_operacao IN ($operacoes_string) 
                    AND result IN (0, 1) 
                    AND test_date BETWEEN '$data_inicial' AND '$data_final'
            ) AS distinct_results
        GROUP BY 
            data";

//echo $sql; // Útil para debug

$sql_query = mysqli_query($conexao, $sql);

if (!$sql_query) {
    // Trata erros de query SQL
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
