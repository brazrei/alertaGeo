<?php

class Usuario
{
    private $pdo;
    private $msgErro = "";

    public function getMsgErro()
    {
        global $msgErro;
        return $msgErro;
    }

    public function setMsgErro($e)
    {
        global $msgErro;

        $msgErro = $e;
    }

    public function conectar($nome, $host, $usuario, $senha)
    {
        global $pdo;
        try {

            $pdo = new PDO("mysql:dbname=" . $nome . ";host=" . $host, $usuario, $senha);
        } catch (PDOException $e) {
            $this->setMsgErro($e->getMessage());
        }
    }

    public function cadastrar($nome, $telefone, $email, $senha)
    {
        global $pdo;

        $sql = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :e");

        $sql->bindValue(":e", $email);

        $sql->execute();

        if ($sql->rowCount() > 0) {
            $this->setMsgErro("Usuário já cadastrado!");
            return false; // usuario já cadastrado
        } else {
            //cadastrar
            $sql = $pdo->prepare("INSERT INTO usuarios (nome, telefone, email, senha) VALUES (:n, :t, :e, :s)");

            $sql->bindValue(":n", $nome);
            $sql->bindValue(":t", $telefone);
            $sql->bindValue(":e", $email);
            $sql->bindValue(":s", $senha);
            try {
                $sql->execute();
                return true;
            } catch (PDOException $e) {
                $this->setMsgErro($e->getMessage());
                return false;
            }
        }
    }

    public function logar($email, $senha)
    {
        global $pdo;

        $sql = $pdo->prepare("SELECT id_usuario,senha,admin,nome FROM usuarios WHERE email = :e");
        $sql->bindValue(":e", $email);
        //$sql->bindValue(":s", password_verify( $senha, PASSWORD_DEFAULT));
        try {
            $sql->execute();
        } catch (PDOException $e) {
            //throw $th;
            $this->setMsgErro($e);
            return false;
        }
        $erro = true;
        if ($sql->rowCount() > 0) {
            //entrar no sistema
            $dado = $sql->fetch();
            if (password_verify($senha, $dado['senha'])) {
                session_start();
                //Set the session timeout for 2 seconds
                $timeout = 2;

                //Set the maxlifetime of the session
                ini_set("session.gc_maxlifetime", $timeout);

                //Set the cookie lifetime of the session
                ini_set("session.cookie_lifetime", $timeout);
                
                $_SESSION['id_usuario'] = $dado['id_usuario'];
                $_SESSION['ad'] = $dado['admin'];
                $_SESSION['nome'] = $dado['nome'];
                $erro = false;
                //return $_SESSION['ad'] ;
            }
        }
        if ($erro) {
            $this->setMsgErro("Usuário não encontrado ou senha incorreta!");
        }
        return !$erro;
    }
}
