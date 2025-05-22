<?php
include_once('../conexao.php');

$data_inicial = $_REQUEST['data_inicio'];
$data_final = $_REQUEST['data_fim'];
$linha = $_REQUEST['linha'];

 
// Switch das operações
$nome_operacao = [];
switch ($linha) {
    case 'REGIO':
        $nome_operacao = ['OP80'];
        break;
    case 'GEM':
        $nome_operacao = ['OP80',];
        break;
    case 'STELLANTIS':
            $nome_operacao = ['OPS6A'];
            break;
    case 'FPK':
        $nome_operacao = ['S8S9'];
        break;
    default:
        
        echo json_encode(['erro' => 'Linha inválida']);
        exit; 
}

// Converte o array de operações para uma string formatada para o IN
$operacoes_string = "'" . implode("','", $nome_operacao) . "'";

$sql = "SELECT 
                DATE(test_date) AS dia,
                nome_operacao,
                COUNT(DISTINCT serial_number) AS total_serial_numbers
                FROM test_steps
                WHERE area = 'FA'
                AND linha = '$linha'
                AND nome_operacao IN ($operacoes_string)
                AND result = 0
                AND test_date BETWEEN '$data_inicial' AND '$data_final'
                GROUP BY DATE(test_date), nome_operacao
                ORDER BY dia;
    ";
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
}

?>
