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
        res.send(`/*
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
            </html>*/
            <div>
                <p>Usuário ou senha inválidos!</p>
                <a href="/login.html">Tentar novamente</a>
            </div>
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
        <h1>Menu do Sistema</h1>
        <p>Último acesso: ${ultimoAcesso}</p>
        <ul>
            <li><a href="/cadastroUsuario.html">Cadastro de Usuários</a></li>
            <li><a href="/batePapo.html">Bate-papo</a></li>
            <li><a href="/logout">Sair</a></li>
        </ul>
    `);
});

app.get('/cadastroUsuario.html', verificarAutenticacao, (req, res) => {
    res.send(`
        <form method="POST" action="/cadastrarUsuario">
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
    `);
});

app.post('/cadastrarUsuario', verificarAutenticacao, (req, res) => {
    const { nome, dataNascimento, apelido } = req.body;
    if (!nome || !dataNascimento || !apelido) {
        return res.send(`
            <p>Todos os campos são obrigatórios!</p>
            <a href="/cadastroUsuario.html">Voltar</a>
        `);
    }

    listaUsuarios.push({ nome, dataNascimento, apelido });
    res.redirect('/cadastroUsuario.html');
});

app.get('/batePapo.html', verificarAutenticacao, (req, res) => {
    res.send(`
        <h1>Bate-papo</h1>
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
        <a href="/">Voltar ao Menu</a>
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
