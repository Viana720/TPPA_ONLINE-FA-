<?php

include_once('../conexao.php');
 $data_inicial=$_REQUEST['data_inicio'];
 $data_final=$_REQUEST['data_fim'];
 $linha = $_REQUEST['linha'];

// Switch das operações
$nome_operacao = [];
switch ($linha) {
    case 'REGIO':
        $nome_operacao = ['OP140', 'OP135', 'OP130', 'OP120', 'OP110', 'OP100', 'OP80', 'OP70', 'OP60', 'OP50', 'OP40', 'OP30', 'OP20', 'OP10'];
        break;
    case 'GEM':
        $nome_operacao = ['OP80'];
        break;
    case 'FPK':
        $nome_operacao = ['S8S9'];
        break;
    default:
       
        echo json_encode(['erro' => 'Linha inválida']);
        exit; // Encerra a execução
}
 
// Converte o array de operações para uma string formatada para o IN
$operacoes_string = "'" . implode("','", $nome_operacao) . "'";

$sql = "SELECT
    test_step,
    nome_operacao,  
    COUNT(*) AS quantidade,
    COUNT(DISTINCT serial_number) AS quantidade_serial_numbers
FROM
    test_steps
WHERE
    area = 'FA'
    AND linha = '$linha'
    AND nome_operacao IN ($operacoes_string)
    AND result = 1
    AND test_date BETWEEN '$data_inicial' AND '$data_final'
GROUP BY
    test_step, nome_operacao  -- Adicionado nome_operacao ao GROUP BY
ORDER BY
    quantidade DESC
LIMIT 10;";
 


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


