import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import cookieSession from 'cookie-session'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieSession({
    name: 'Session',
    keys: [process.env.SESSION_KEY || 'S0me7R@nd0mStr!ng'],
    maxAge: (24 * 60 * 60 * 1000) // 24 hours
  }))
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * whitelist: true / Strip (remove) any properties that are not defined on the DTOs.
       * This prevents unexpected or malicious extra fields from reaching
       * your handlers by only allowing validated (whitelisted) properties.
       * Improves security and keeps inputs predictable.
       */
      whitelist: true
    })
  )
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
