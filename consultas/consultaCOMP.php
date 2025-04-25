<?php
include_once('../conexao.php');
$data_inicial = $_REQUEST['data_inicio'];
$data_final = $_REQUEST['data_fim'];
$linha = $_REQUEST['linha'];

// Switch das operações
$nome_operacao = [];
switch ($linha) {
    case 'REGIO':
        $nome_operacao = ['OP140', 'OP135', 'OP130', 'OP120', 'OP110', 'OP100', 'OP80', 'OP70', 'OP60', 'OP50', 'OP40', 'OP30', 'OP25','OP20', 'OP10'];
        break;
    case 'GEM':
        $nome_operacao = ['OP90', 'OP80', 'OP75', 'OP70', 'OP60', 'OP50', 'OP40', 'OP30', 'OP20', 'OP10', 'OP05' ];
        break;
    case 'FPK':
        $nome_operacao = ['S8S9'];
        break;
    case 'STELLANTIS':
        $nome_operacao = ['OPS3', 'OPS4', 'OPS5', 'OPS6A', 'OPS7', 'OPS8']; 
        break;
    default:
        echo json_encode(['erro' => 'Linha inválida']);
        exit;
}

// Converte o array de operações para uma string formatada para o IN
$operacoes_string = "'" . implode("','", $nome_operacao) . "'";

// Encontra a operação com mais falhas (contagem distinta por serial_number)
$sql_max_falhas = "SELECT nome_operacao, COUNT(DISTINCT serial_number) AS total_falhas
                    FROM test_steps
                    WHERE area = 'FA'
                    AND linha = '$linha'
                    AND nome_operacao IN ($operacoes_string)
                    AND result = 1
                    AND test_date BETWEEN '$data_inicial' AND '$data_final'
                    GROUP BY nome_operacao
                    ORDER BY total_falhas DESC
                    LIMIT 1";

$result_max_falhas = mysqli_query($conexao, $sql_max_falhas);
if (!$result_max_falhas) {
    echo json_encode(['erro' => mysqli_error($conexao)]);
    exit;
}

if (mysqli_num_rows($result_max_falhas) == 0) {
    echo json_encode([]);
    exit;
}
// validações de sistema/ variavel
$row_max_falhas = mysqli_fetch_assoc($result_max_falhas);
$operacao_mais_falhas = $row_max_falhas['nome_operacao'];

// Busca o FTT por dia para a operação com mais falhas
$sql_ftt_por_dia = "SELECT 
            TRUNCATE(
                ((SUM(CASE WHEN result = 0 THEN 1 ELSE 0 END) - SUM(CASE WHEN result = 1 THEN 1 ELSE 0 END)) / SUM(CASE WHEN result = 0 THEN 1 ELSE 0 END)) * 100, 
                2
            ) AS ftt,
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
                    AND nome_operacao =  '$operacao_mais_falhas'
                    AND result IN (0, 1) 
                    AND test_date BETWEEN '$data_inicial' AND '$data_final'
            ) AS distinct_results
        GROUP BY 
            data 
        ORDER BY 
            STR_TO_DATE (data, '%d/%m')";

$result_ftt_por_dia = mysqli_query($conexao, $sql_ftt_por_dia);
if (!$result_ftt_por_dia) {
    echo json_encode(['erro' => mysqli_error($conexao)]);
    exit;
}

$ftt_diario = [];
$total_ftt = 0;
$num_dias = 0;

while ($resultado = mysqli_fetch_assoc($result_ftt_por_dia)) {
    $ftt_diario[] = ['data' => $resultado['data'], 'ftt' => $resultado['ftt']];
    $total_ftt += $resultado['ftt'];
    $num_dias++;
}

$media_ftt = ($num_dias > 0) ? round($total_ftt / $num_dias, 2) : 0;

echo json_encode(['ftt_diario' => $ftt_diario, 'media_ftt' => $media_ftt, 'operacao_mais_falhas' => $operacao_mais_falhas]);
?>

