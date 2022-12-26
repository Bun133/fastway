import * as dotenv from "dotenv"

export function loadEnv() {
    dotenv.config({path:"./src/env.env"})
}