const express = require('express')
const rotas = express()

const {
    cadastrarUsuario,
    login,
    cadastrarPokemon,
    atualizarApelidoPokemon,
    listarPokemons,
    detalharPokemonPorId,
    excluirPokemon
} = require('./controladores/usuarios');

const verificarUsuarioLogado = require('./intermediarios/autorizacao');

rotas.post('/cadastrarUsuario', cadastrarUsuario);
rotas.post('/login', login);

rotas.use(verificarUsuarioLogado);

rotas.post('/cadastro-pokemon', cadastrarPokemon);
rotas.patch('/atualizar/:id/:apelido', atualizarApelidoPokemon);
rotas.get('/lista', listarPokemons);
rotas.get('/lista/:id', detalharPokemonPorId);
rotas.delete('/excluir/:id', excluirPokemon);

module.exports = rotas
