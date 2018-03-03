const express = require('express');
const TokenGenerator = require('uuid-token-generator');
const bodyParser = require('body-parser');

const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLInputObjectType } = require('graphql');

const cp = require('./db');
const sql = require('mssql');

let port = 9004;

const Secret = new GraphQLObjectType ({
  name: 'Secret',
  description: 'Secret',
  fields: {
    resultCode: {
      type: GraphQLInt
    },
    token: {
      type: GraphQLString
    },
    authCode: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    role: {
      type: GraphQLInt
    },
    roleDescription: {
      type: GraphQLString
    }
  }
})

const Token = new GraphQLObjectType ({
  name: 'token',
  description: 'token',
  fields: {
    resultCode: {
      type: GraphQLInt
    },
    token: {
      type: GraphQLString
    }
  }
})

const Queries = new GraphQLObjectType({
  name: 'Queries',
  description: 'Root Queries',
  fields: {
    getAuth: {
      name: 'GetAuth',
      description: 'Get authorization for main API GraphQL endpoint',
      type: Secret,
      args: {
        username: {
          type: GraphQLNonNull(GraphQLString)
        },
        password: {
          type: GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function (source, args) {
        return cp.then(pool => {	
          return pool.request()
          .input('username', sql.VarChar(50), args.username)
          .input('password', sql.VarChar(50), args.password)
          .query('exec gps.dbo.v3_Token_get @username, @password')
        }).then(result => {
          let secret = result.recordsets[0][0];
          //console.log(result.recordsets);
          //console.log(secret);
          return secret;
        }).catch(err => {
          console.log(err);
        })
      }
    },
    verify:{
      name: 'Verify',
      description: 'Check if token is good and get new token',
      type: Token,
      args: {
        authCode: {
          type: GraphQLNonNull(GraphQLString)
        },
        token: {
          type: GraphQLNonNull(GraphQLString)
        }
      },
      resolve: function (source, args) {
        //console.log('hello', args)
        return cp.then(pool => {	
          return pool.request()
          .input('authCode', sql.VarChar(50), args.authCode)
          .input('token', sql.VarChar(50), args.token)
          .query('exec gps.dbo.v3_Token_verify @authCode, @token')
        }).then(result => {
          let token = result.recordsets[0][0];
          //console.log(result.recordsets);
          //console.log(token);
          return token;
        }).catch(err => {
          console.log(err);
        })
      }
    }
  }
})

const schema = new GraphQLSchema({
  query: Queries
})

/* Only for testing purpose. In production environment, we will let database generate the Token */
let generateToken = () => {
  const tokgen = new TokenGenerator(256, TokenGenerator.BASE62);
  return tokgen.generate();
}

const app = express();

app.use(bodyParser.json())

// Header middleware
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
});

app.use('/auth/test', function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.sendStatus(200);
});

app.use('/auth/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true //set to false if you don't want graphiql enabled
}));

app.listen(port);
console.log('GraphQL API server running at localhost:'+ port);