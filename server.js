const express = require('express');
const bodyParser = require('body-parser');
const WomboDream = require('dream-api');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const dreamKey = "zbvJsKo8komGQe3J9zB9nWNn4FqGvSQx";

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Erro ao criar/conectar ao banco de dados:', err.message);
    } else {
        console.log('Banco de dados conectado com sucesso.');
    }
});

// Criação da tabela de usuários
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);

// Configuração de middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(
    session({
        secret: 'chave_secreta_para_sessao',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 3600000 }, // Sessão expira em 1 hora
    })
);

// Rota principal para servir o HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Endpoint para registro de usuário
app.post('/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    // Verifica se o e-mail já está registrado
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.get(checkQuery, [email], (err, row) => {
        if (err) {
            console.error('Erro ao verificar e-mail:', err.message);
            return res.status(500).json({ success: false, message: 'Erro ao verificar e-mail.' });
        }

        if (row) {
            return res.status(400).json({ success: false, message: 'E-mail já está registrado.' });
        }

        // Insere o novo usuário no banco de dados
        const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.run(insertQuery, [email, password], (err) => {
            if (err) {
                console.error('Erro ao registrar usuário:', err.message);
                return res.status(500).json({ success: false, message: 'Erro ao registrar usuário.' });
            }
            res.json({ success: true, message: 'Usuário registrado com sucesso.' });
        });
    });
});

// Endpoint para login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.get(query, [email, password], (err, row) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err.message);
            return res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
        }
        if (row) {
            req.session.isAuthenticated = true;
            req.session.user = { id: row.id, email: row.email };
            res.json({ success: true, message: 'Login realizado com sucesso.' });
        } else {
            res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
        }
    });
});

// Endpoint para verificar a sessão
app.get('/check-session', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// Middleware para proteger rotas
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.status(401).json({ error: 'Usuário não autenticado.' });
}

// Endpoint para gerar imagens (protegido)
app.post('/generate', isAuthenticated, async (req, res) => {
    const { style, prompt } = req.body;

    if (!style || !prompt) {
        return res.status(400).json({ error: 'O estilo e o prompt são obrigatórios.' });
    }

    try {
        const image = await WomboDream.generateImage(style, prompt, dreamKey);

        if (image.result) {
            return res.json({ imageUrl: image.result });
        } else {
            return res.status(500).json({
                error: 'Erro ao gerar imagem.',
                details: 'A API Wombo não retornou uma imagem válida.',
            });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao gerar imagem.', details: error.message });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
