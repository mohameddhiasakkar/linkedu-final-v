import 'zone.js/node';
import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

// Create Express app
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/linkedu/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) 
    ? 'index.original.html' 
    : 'index.html';

  const angularApp = new AngularNodeAppEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Serve static files
  server.get(/.*\..*/, express.static(distFolder, { maxAge: '1y' }));

  // SSR handler
  server.get(/.*/, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const response = await angularApp.handle(req);
      if (response) {
        await writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, (err?: Error) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Only run the server if not requiring the bundle
if (isMainModule(import.meta.url)) {
  run();
}

export default createNodeRequestHandler(app());
