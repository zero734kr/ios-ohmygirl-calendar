import express from "express"
import Cache from "./utils/cache"
import { errors } from "celebrate"

import indexRouter from "./routes"
import calendarRouter from "./routes/calendar"

const app = express()

if (!app.get("cache")) app.set("cache", new Cache(60000 * 30))

app.use(express.json())

app.use("/api", indexRouter)
app.use("/api/calendar", calendarRouter)

app.use(errors())


export default app
