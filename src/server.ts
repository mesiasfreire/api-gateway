import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { DataSources } from 'apollo-server-core/dist/requestPipeline';
import { importSchema } from 'graphql-import';
import resolvers from './resolvers';
import fs from 'fs';
import http from 'http';
import https from 'https';

import { config, microService } from './config';
import * as dataSources from './dataSources';
import { IDataSources } from './interfaces';

const apollo = new ApolloServer({
  typeDefs: importSchema(`${__dirname}/schemas/index.graphql`),
  resolvers,
  dataSources: (): DataSources<IDataSources> => {
    return {
      userApi: new dataSources.UserAPI(microService),
      catalogoApi: new dataSources.CatalogoAPI(microService),
      geralApi: new dataSources.GeralAPI(microService),
      controleAcessoAPi: new dataSources.ControleAcessoAPi(microService),
      pessoaApi: new dataSources.PessoaAPi(microService)
    }
  },
  context: () => {
    return {
      token: 'teste',
    };
  },
});

const app = express();
apollo.applyMiddleware({ app });

let server;
if (config.ssl && config.ssl === 'true') {
  server = https.createServer(
    {
      key: fs.readFileSync(`${config.sslKey}`),
      cert: fs.readFileSync(`${config.sslCrt}`),
    },
    app,
  );
} else {
  server = http.createServer(app);
}

export { server, apollo, config };
