import mongoose from 'mongoose'
import { DB_NAME } from '../constant.js'

const connectDB = async () => {
    try {
        const response = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log('DB is connected successfully')
    } catch (error) {
        console.log('There is an issue while connecting the data base');
    }
}

export {connectDB}
