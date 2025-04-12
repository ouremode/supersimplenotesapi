import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";
import { userRouter } from "./router/user";

const app = new Elysia()
  .use(
    cors({
      origin: "*",
      methods: ["GET","POST"],
      credentials: true,
    })
  )

  .use(logger())
  .use(ip())
  .use(
    rateLimit({
      max: 100,
      duration: 60000,
    })
  )
  .use(
    swagger({
      path: "/swagger",
    })
  )
  .get("/", () => {
    return { message: "Welcome to Elysia" };
  })
  .get("/health", () => ({ status: "ok" }))
  .use(userRouter)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);



declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      DATABASE_URL: string;
    }
  }
}
