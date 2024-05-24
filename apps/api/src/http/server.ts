import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  //   jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createAccount } from './routes/auth/create-account'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors)
app.register(createAccount)

app
  .listen({
    host: '0.0.0.0',
    port: 3333,
  })
  .then(() => console.log('HTTP Server is running'))
