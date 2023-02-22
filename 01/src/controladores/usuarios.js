const pool = require('../conexao');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt');



const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if(!nome || !email || !senha){
        return res.status(400).json({mensagem: "Preencha todos os campos obrigatórios"})
    }
        
    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10)
        
        const novoUsuario = await pool.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *', 
        [nome, email, senhaCriptografada])

        return res.status(201).json()
 
    } catch (error) {
        return res.status(400).json({mensagem: "Erro interno do servidor"})
        // 'Email já cadastrado em nosso sistema, insira outro email.'
    }
}

const login = async (req, res) => {
    const { email, senha } = req.body
    try {
        const usuario = await pool.query(
            'select * from usuarios where email = $1', 
            [email]
        )

        if(usuario.rowCount < 1) {
            return res.status(400).json({mensagem: "Email ou senha inválidos"})
        }

        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha)
        
        if(!senhaValida) {
            return res.status(400).json({mensagem: "Email ou senha inválidos"})
        }
        
        const token = jwt.sign({id: usuario.rows[0].id}, senhaJwt, {expiresIn: '1d'})  //token gerado

        const { senha: _, ...usuarioLogado} = usuario.rows[0]

    
        return res.status(200).json({ usuario: usuarioLogado, token})
    } catch (error) {
        return res.status(400).json({mensagem: "Erro interno do servidor"})
    }      
}

const cadastrarPokemon = async (req, res) => {
    const { nome, apelido, habilidades, imagem } = req.body

    if (!nome || !apelido || !habilidades || !imagem) {
        return res.status(400).json({mensagem: 'Preencha os campos obrigatórios'})
    }

    try {
        const pokemon = await pool.query(
            'insert into pokemons (usuario_id, nome, apelido, habilidades, imagem) values ($1, $2, $3, $4, $5) returning *',
            [tokenUsuario.id, nome, apelido, habilidades, imagem]
        )

        return res.status(201).json()
    
    } catch (error) {
        return res.status(400).json('Erro interno do servidor')
    }
}

const atualizarApelidoPokemon = async (req, res) => {
    const {apelido, id } = req.params
    
    try {
        const verificarId = await pool.query('select id from pokemons where id = $1',[id])

        if(verificarId.rowCount === 0) {
            return res.status(400).json({mensagem: 'O id informado não existe'})
        }
        
        const update = await pool.query(
            `update pokemons
            set apelido = $1
            where id = $2`,
            [apelido, id]
        )
     
        return res.status(200).json('Apelido atualizado com sucesso')
        
    } catch (error) {
        return res.status(400).json('Erro interno do servidor')
    }
}

const listarPokemons = async (req, res) => {
    
    try {
        const lista = await pool.query(
            'select * from pokemons where usuario_id = $1 order by id asc',
            [tokenUsuario.id])

            for (let item of lista.rows) {
                item.habilidades = item.habilidades.split(", ")
            }

        return res.status(200).json(lista.rows)

    } catch (error) {
        return res.status(400).json('Erro interno do servidor')
    }

}

const detalharPokemonPorId = async (req, res) => {
    const { id } = req.params

    try {
        const lista = await pool.query(
            'select * from pokemons where usuario_id = $1 and id = $2 order by id asc',
            [tokenUsuario.id, id])
            
            if(lista.rowCount === 0 ) {
                return res.status(400).json({mensagem: 'O id informado não existe'})
            }

            for (let item of lista.rows) {
                item.habilidades = item.habilidades.split(", ")
            }

        return res.status(200).json(lista.rows)

    } catch (error) {
        return res.status(400).json('Erro interno do servidor')
    }
}

const excluirPokemon = async (req, res) => {
    const { id } = req.params

    try {
        const excluir = await pool.query(
            'delete from pokemons where id = $1', [id])
            
            if(excluir.rowCount === 0 ) {
                return res.status(400).json({mensagem: 'O id informado não existe'})
            }

        return res.status(200).json('Pokemón excluido com sucesso')

    } catch (error) {
        return res.status(400).json(error.message)
    }
}



module.exports = {
    cadastrarUsuario,
    login,
    cadastrarPokemon,
    atualizarApelidoPokemon,
    listarPokemons,
    detalharPokemonPorId,
    excluirPokemon
}