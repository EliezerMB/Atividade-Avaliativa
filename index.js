import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();

app.use(session({
    secret: 'MinhaChaveSecreta123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

let listaUsuarios = [];
let listaMensagens = [];

function verificarAutenticacao(req, res, next) {
    if (req.session.usuarioLogado) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

app.get('/login', (req, res) => {
    res.redirect('/login.html');
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === '123') {
        req.session.usuarioLogado = true;
        res.cookie('dataHoraUltimoLogin', new Date().toLocaleString(), {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });
        res.redirect('/');
    } else {
        res.send(`
            <html>
            <head>
            <title>Erro</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
            </head>
            <body>
            <div>
            <div class="alert alert-danger" role="alert">
                 Usuário ou senha inválidos! Favor Tentar Novamente 
            </div>
            <a href="/login.html" class="btn btn-primary">Tentar Novamente</a>
            </div>
            </body>
            </html>
            <!--
            <div>
                <p>Usuário ou senha inválidos!</p>
                <a href="/login.html">Tentar novamente</a>
            </div>
            -->
        `);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.get('/', verificarAutenticacao, (req, res) => {
    const ultimoAcesso = req.cookies['dataHoraUltimoLogin'] || 'Primeiro acesso';
    res.send(`
        <html>
        <head>
        <title>Página Inicial</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <body>
        <ul class="nav justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" href="/cadastroUsuario.html">Cadastro de Usuarios</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/batePapo.html">Sala De Bate-Papo</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/logout">Encerrar Sessão</a>
            </li>
            </ul>
            <footer>Último Acesso: ${ultimoAcesso}</footer>
        </body>
        </html>
        
        <!-- <h1>Menu do Sistema</h1>
        <p>Último Acesso: ${ultimoAcesso}</p>
        <ul>
            <li><a href="/cadastroUsuario.html">Cadastro de Usuários</a></li>
            <li><a href="/batePapo.html">Bate-papo</a></li>
            <li><a href="/logout">Sair</a></li>
        </ul>-->
    `);
});

app.get('/cadastroUsuario.html', verificarAutenticacao, (req, res) => {
    res.send(`
        <html>
        <head>
        <title>Cadastro De Usuarios</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <body>
            <form method="POST" action="/cadastrarUsuario">
            <div class="form-group">
                <label for="formGroupExampleInput">Nome:</label>
                <input type="text" class="form-control" id="formGroupExampleInput" name="nome" placeholder="Ex: Joao Batista Santos">
            </div>
            <div class="form-group">
                <label for="formGroupExampleInput">Email:</label>
                <input type="email" class="form-control" id="formGroupExampleInput" name="email" placeholder="Ex:5423joaobatistasantos@gamil.com">
            </div>
            <div class="form-group">
                <label for="formGroupExampleInput2">Apelido:</label>
                <input type="text" class="form-control" id="formGroupExampleInput2" name="apelido" placeholder="Jao B.">
            </div>
            <div class="form-group">
                <label>Data de Nascimento:</label>
                <input type="date" class="form-control" name="dataNascimento" />
            </div>
            <button type="submit" class="btn btn-success">Cadastrar</button>
        </form>
    
    <h2>Usuários Cadastrados</h2>
    <ul>
        ${listaUsuarios.map(u => `<li>Apelido:${u.apelido} ||E-mail:${u.email} ||Nome:(${u.nome}) ||Data de Cadastro:${u.dataNascimento} </li>`).join('')}
    </ul>
    <br>
    <a href="/" class="btn btn-primary">Voltar ao Cadastro</a>
</body>
</html>

        <!--<form method="POST" action="/cadastrarUsuario">
            <label>Nome: <input type="text" name="nome" /></label>
            <label>Data de Nascimento: <input type="date" name="dataNascimento" /></label>
            <label>Apelido: <input type="text" name="apelido" /></label>
            <button type="submit">Cadastrar</button>
        </form>
        <h2>Usuários cadastrados</h2>
        <ul>
            ${listaUsuarios.map(u => `<li>${u.apelido} (${u.nome})</li>`).join('')}
        </ul>
        <a href="/">Voltar ao Menu</a>
        -->
    `);
});

app.post('/cadastrarUsuario', verificarAutenticacao, (req, res) => {
    const { nome, dataNascimento, apelido, email } = req.body;
    if (!nome || !dataNascimento || !apelido || !email) {
        return res.send(`
            <html>
            <head>
             <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
            </head>
            <body>
            <div class="jumbotron">
                <h1 class="display-4">Erro Detectado</h1>
                <p class="lead">Todos os campos são obrigatórios!.</p>
                <hr class="my-4">
                <p>Por Favor Verificar os Dado de Cadastro, Pois Algun se encontra preechido de forma errada  </p>
                <a class="btn btn-primary btn-lg" href="/cadastroUsuario.html" role="button">Voltar</a>
            </div>
            </body>
            </html>


            <!--<p>Todos os campos são obrigatórios!</p>
            <a href="/cadastroUsuario.html">Voltar</a>-->
        `);
    }

    listaUsuarios.push({ nome, dataNascimento, apelido , email });
    res.redirect('/cadastroUsuario.html');
});

app.get('/batePapo.html', verificarAutenticacao, (req, res) => {
    res.send(`
            html
<html>
<head>
    <title>Sala De Bate-Papo</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
</head>
<body>
    <form method="POST" action="/postarMensagem">
        <h1> Sala de Bate-Papo</h1>
        <br>
        <label>Usuário:
            <select name="usuario">
                ${listaUsuarios.map(u => `<option value="${u.apelido}">${u.apelido}</option>`).join('')}
            </select>
        </label>
        <br><br>
        <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text">Mensagem</span>
            </div>
            <textarea class="form-control" name="mensagem" aria-label="Com textarea"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
        <ul>
            ${listaMensagens.map(m => `<li>${m.dataHora} - ${m.usuario}: ${m.mensagem}</li>`).join('')}
        </ul>
        <br>
        <a href="/" class="btn btn-primary">Voltar ao Menu</a>
    </form>
</body>
</html>


       <!-- <h1>Bate-papo</h1>
        <form method="POST" action="/postarMensagem">
            <label>Usuário:
                <select name="usuario">
                    ${listaUsuarios.map(u => `<option value="${u.apelido}">${u.apelido}</option>`).join('')}
                </select>
            </label>
            <label>Mensagem: <input type="text" name="mensagem" /></label>
            <button type="submit">Enviar</button>
        </form>
        <h2>Mensagens</h2>
        <ul>
            ${listaMensagens.map(m => `<li>${m.dataHora} - ${m.usuario}: ${m.mensagem}</li>`).join('')}
        </ul>
        <a href="/">Voltar ao Menu</a>--> 
    `);
});

app.post('/postarMensagem', verificarAutenticacao, (req, res) => {
    const { usuario, mensagem } = req.body;
    if (!usuario || !mensagem) {
        return res.send(`
            <p>Usuário e mensagem são obrigatórios!</p>
            <a href="/batePapo.html">Voltar</a>
        `);
    }

    listaMensagens.push({ usuario, mensagem, dataHora: new Date().toLocaleString() });
    res.redirect('/batePapo.html');
});

const porta = 3000;
const host = '0.0.0.0';

app.listen(porta, host, () => {
    console.log(`Servidor iniciado e em execução no endereço http://${host}:${porta}`);
});
