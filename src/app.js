import express from 'express'
import cors from 'cors'


const app = express();

app.use(
    cors({
        origin: '*'
    })
)
app.use(express.json({limit: '128kb'}))
// app.use(express.urlencoded({limit: "128kb"}))
// app.use(bodyParser)

import userRouter from './route/user.route.js'
app.use('/api/v2/user', userRouter)

import linkRouter from './route/link.route.js'
app.use('/api/v2/link', linkRouter)

export {app}