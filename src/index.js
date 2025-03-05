import { app } from "./app.js";
import { connectDB } from "./db/index.js";

connectDB()
    .then(() => {
        const port = process.env.PORT || 5000
        app.listen(port, () => {
            console.log(`Server is running at port: ${port}`)
        })
    })
    .catch ((err) => (
        console.log(`An error while connecting the db ${err}`)
    ))
