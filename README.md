# Leitura Banrisul Cartões

O projeto realiza a navegado nas paginas de credenciados do site da banrisul cartões armazenando em um arquivo CSV os dados destes credenciados. 

Antes de executar é necessário aplicar o seguinte comando no prompt dentro da pasta do projeto, para instalar suas dependências.

`npm install`

Para alterar o produto que será consulta é necessário alterar o parâmetro de entrada da função InicializaProcesso, de acordo com o produto desejado.

 - Alimentação
 - Refeição
 - Presente

Para alterar as cidades que serão consultadas é necessario alterar a array de cidade adicionando as cidades desejadas.

    var cidades = ["Rio Grande"];
    var cidades = ["Porto Alegre", "Gravatai", "Canoas"];

O arquivo com os resultados fica armazenado na pasta do projeto com o nome de "resultados.csv".
