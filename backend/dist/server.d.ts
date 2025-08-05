import * as http from 'http';
import { Pool } from 'pg';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                user_id?: string;
                email: string;
                name: string;
                created_at: string;
            };
        }
    }
}
declare const pool: Pool;
declare const app: import("express-serve-static-core").Express;
declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export { app, pool, server };
//# sourceMappingURL=server.d.ts.map