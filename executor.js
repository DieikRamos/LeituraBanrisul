const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

//Cria Navegador
let navegador;
var contador = 0;

//Array de cidades a serem consultadas
var cidades = ["Rio Grande"];
//var cidades = ["Porto Alegre", "Gravatai", "Canoas"];

var categorias;
var produto;

fs.writeFileSync("./resultado.csv", "");

InicializaProcesso("Refeição");

async function InicializaProcesso(Cartao) {
  //Seleciona Cartão
  if (Cartao == "Refeição") {
    produto = "13";
    categorias = "RESTAURANTE;FAST FOOD;SUPERMERCADOS;POSTOS DE COMBUSTIVEL;PADARIA;CHURRASCARIA;BAR;LOJAS EM GERAL;SAUDE;SERVICOS;REFRIGERACAO".split(
      ";"
    );
  } else if (Cartao == "Alimentação") {
    produto = "14";
    categorias = "RESTAURANTE;FAST FOOD;SUPERMERCADOS;POSTOS DE COMBUSTIVEL;PADARIA;CHURRASCARIA;BAR;LOJAS EM GERAL;SAUDE;SERVICOS;REFRIGERACAO".split(
      ";"
    );
  } else {
    produto = "17";
    categorias = "LOJAS EM GERAL;HOTEL;RESTAURANTE;SUPERMERCADOS;LIVRARIA/EDITORA;FAST FOOD;FARMACIA;OFICINA MECÂNICA;POSTOS DE COMBUSTIVEL;AUDIO E VIDEO;AUTO PECAS;MATERIAL DE CONSTRUCAO;AGROPECUARIA;ESTETICA;FERRAGEM;MAQUINAS AGRICOLAS;PADARIA;POSTO DE COMBUSTIVEL E OFICINA MECÂNICA;VESTUARIO E CALCADO;OTICA;LAVANDERIA;COMERCIO EM GERAL;CFC;PAPELARIA;ESPACO CULTURAL;SAUDE;SERVICOS;CONFECCÕES;BAR;INFORMATICA;POSTO AVANCADO;OPTICA;BAZAR;COSMETICOS;JOALHERIA;BEBE E INFANTIL;DISTRIBUIDORA;CHURRASCARIA;TELEFONIA;COOPERATIVA;ELETRODOMESTICOS;TABACARIA;COMERCIALIZACAO DE INSUMOS;REFRIGERACAO;MEDICAMENTOS VETERINARIOS;UNIDADE DE PRODUCAO;CINEMA;CENTRO DESENV.TECNOLOG".split(
      ";"
    );
  }

  navegador = await puppeteer.launch({ headless: true });

  await cidades.forEach(async (cidade) => {
    await categorias.forEach(async (categoria) => {
      InitCategoria(categoria, cidade);
    });
  });
}
async function InitCategoria(categoria, cidade) {
  await carregaCategoria("RS", categoria, cidade);
}

async function carregaCategoria(Estado, Categoria, Cidade) {
  //Final da Categoria

  let pagina = await navegador.newPage();
  await pagina.setDefaultNavigationTimeout(0);
  await pagina.setViewport({ width: 1920, height: 1080 });

  await carregaPagina(pagina, 1, Estado, Categoria, Cidade);
}

async function carregaPagina(pagina, nroPagina, Estado, Categoria, Cidade) {
  //Navega para o url
  await pagina.goto(
    "http://www.banrisulservicos.com.br/bdr/link/bdrw99hw_rede_credenciada_lista_ajax.asp?rdProduto=" +
      produto +
      "&cmbEstado=" +
      Estado +
      "&cmbCategoria=" +
      Categoria +
      "&cmbCidade=" +
      Cidade +
      "&pagAtual=" +
      nroPagina
  );

  //Carrega todo html
  const data = await pagina.evaluate(() => document.querySelector("*").outerHTML);

  const $ = cheerio.load(data);

  //Remove as tags html

  var html = $(".lista").html();

  //Testa o final do arquivo
  if (html != '<hr class="separador-cinza">' && html != null) {
    html = html.replace(/<(?:.|\n)*?>/gm, "\n").substr(1); // remove all html tags
    //Quebra o conteudo quando houver 3 quebras de linha
    var conteudo = html.split("\n\n\n");

    //Para cada credenciado
    for (var x = 0; x < conteudo.length; x++) {
      CarregaCredenciado(conteudo[x], Categoria);
    }
    console.log(Cidade + " - " + Categoria + " - Fim Pagina " + nroPagina + " - Credenciados - " + conteudo.length + " / " + contador);
  }

  if ($("a").length > 1 || $("a").text() == "Próximo >>") {
    carregaPagina(pagina, nroPagina + 1, Estado, Categoria, Cidade);
  }
}

async function CarregaCredenciado(Credenciado, Categoria) {
  //Remove Quebras de linha e substitui por ;
  var atributos = Credenciado.replace(/\n\n/g, ";").replace(/\n/g, "").split(";");

  //Cria varial dos credenciados
  var oCred = {};

  //Para cada atributo
  for (var x = 0; x < atributos.length; x++) {
    var atributo;
    var valor;

    //Testa se é o nome do estabelecimento
    if (atributos[x].split(":").length > 1) {
      //Grava atributos separando por :
      atributo = atributos[x].split(":")[0].trim();
      valor = atributos[x].split(":")[1].trim();
    } else if (atributos[x].split(":")[0].trim() != "") {
      atributo = "Nome";
      valor = atributos[x].split(":")[0].trim();
    }

    oCred[atributo] = valor;
  }
  oCred["Categoria"] = Categoria;

  fs.appendFileSync(
    "./resultado.csv",
    oCred["Categoria"] +
      ";" +
      oCred["Nome"] +
      ";" +
      oCred["Endereço"] +
      ";" +
      oCred["CEP"] +
      ";" +
      oCred["Bairro"] +
      ";" +
      oCred["Município"] +
      ";" +
      oCred["Estado"] +
      "\n"
  );
  contador++;
}
