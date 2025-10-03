import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Native WebSocket (no Socket.IO)
  app.useWebSocketAdapter(new WsAdapter(app));
  
  // Enable CORS for WebSocket connections
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
