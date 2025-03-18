
<?php
include_once('../conexao.php');

$sql = "SELECT DISTINCT linha FROM test_steps";
$result = mysqli_query($conexao, $sql);

$linhas = [];
while ($row = mysqli_fetch_assoc($result)) {
    $linhas[] = $row['linha'];
}

echo json_encode($linhas);
?>
