import app from "./app"
import http from "http"


const port = normalizePort(process.env.PORT || "3000")
app.set("port", port)

const server = http.createServer(app)


server.listen(port)
server.on("error", onError)
server.on("listening", onListening)


function normalizePort(val: string): number | boolean | string {
    const port = parseInt(val)

    if (isNaN(port)) return val

    if (port >= 0) return port

    return false
}

function onError(error: { syscall: string, code: string }) {
    if (error.syscall !== "listen") throw error

    const bind = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port

    const obj: Record<string, () => void> = {
        "EACCES": () => {
            console.error(bind + " requires elevated privileges")
            process.exit(1)
        },
        "EADDRINUSE": () => {
            console.error(bind + " is already in use")
            process.exit(1)
        }
    }

    if (obj[error.code]) return obj[error.code]()
    throw error
}


function onListening(): void {
    const addr = server.address()
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr?.port
    console.info("Listening on " + bind)
}
