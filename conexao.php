<?php

$host = '10.218.172.40';
$base = 'TTPA';
$usuario = 'operador';
$senha = 'operador123#';
$porta = 3306;
$conexao = mysqli_connect($host, $usuario, $senha, $base, $porta);

if (!$conexao) {
    die("Connection failed: " . mysqli_connect_error());
} else {
    // echo "Connected successfully";
}

?>
