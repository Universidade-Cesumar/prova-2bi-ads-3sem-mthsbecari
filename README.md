# https://universidade-cesumar.github.io/prova-2bi-ads-3sem-mthsbecari/

# Controle de Materiais - Almoxarifado

## Sobre o projeto

Sistema desenvolvido para controle de materiais de um almoxarifado de enfermagem.

O sistema permite cadastrar materiais, visualizar o estoque disponível, realizar baixas de materiais e excluir registros.

Os dados são armazenados utilizando a MockAPI.

## Funcionalidades

* Cadastro de materiais;
* Listagem de materiais em estoque;
* Atualização da quantidade disponível;
* Baixa de estoque;
* Exclusão de materiais;
* Validação para impedir retiradas inválidas.

## Tecnologias utilizadas

* HTML
* CSS
* JavaScript
* MockAPI

## Validação de retirada

O sistema possui uma função para validar a retirada de materiais.

A retirada só é permitida quando:

* A quantidade é maior que zero;
* A quantidade não ultrapassa o estoque disponível.

## Como executar

1. Abrir o arquivo `index.html`;
2. Utilizar o formulário para cadastrar materiais;
3. Gerenciar os materiais diretamente pela tabela.

## Estrutura

* `index.html` - estrutura da página
* `style.css` - estilos da interface
* `main.js` - lógica da aplicação
