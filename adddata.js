import { connectToServer, getDb } from "./mongodb.js";


await connectToServer()

const db =getDb()

let array  =[
    {date:'2024-05-12T17:07:17.798Z',value:65},
    {date:'2024-05-12T17:08:17.798Z',value:70},
    {date:'2024-05-12T17:09:17.798Z',value:75},
    {date:'2024-05-12T17:10:17.798Z',value:82},
    {date:'2024-05-12T17:11:17.798Z',value:66},
    {date:'2024-05-12T17:12:17.798Z',value:74},
    {date:'2024-05-12T17:13:17.798Z',value:82}, 
    {date:'2024-05-12T17:14:17.798Z',value:60},
    {date:'2024-05-12T17:15:17.798Z',value:96},
]

const zid  =  async() => {
    await db.collection('sessions').updateMany({},{$set:{heart_records:array}})
    console.log('mrigel')
}

zid()
