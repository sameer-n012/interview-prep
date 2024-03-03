import { QuestionDBManager } from './cache.js';
import express from 'express'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'
import cors from 'cors'

globalThis.fetch = fetch

dotenv.config();

const app = express();
const port = 5000;
const dbm = new QuestionDBManager('question_cache.json')
setInterval(dbm.save, 1000 * 60); // save db every minute

app.use(cors())

app.get('/', (req, res) => {
    res.send('This is the server');
})

app.get('/gen/:topic', async (req, res) => {
    try {
        console.log(req.params.topic)
        const input = req.params.topic
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.MODEL_NAME });

        const prompt = `You are an interviewer for a computer science position. \
                        You should not repeat the topic in your response. \
                        You should not provide examples of inputs and outputs in your response. \
                        Your response should ONLY include the question you are asking. \
                        Ask a programming question about the following topic to the interviewee: \n\
                        ${input}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        await dbm.insert(input, text);

        console.log(`${input}: ${text}`);
        res.send(text)
    } catch (err) {
        console.log(`${input}: ${err}`);
        res.send(err)
    }
})

app.get('/history/:s/:n', async (req, res) => {
    try {
        const n = req.params.n;
        const s = req.params.s
        const data = await dbm.getRecent(s, n)

        console.log(`${data}`);
        console.log(data)
        const result = data.map(d => { 
            return {
                '_id': d.$loki,
                'time': d.time,
                'topic': d.topic,
                'text': d.text
            }
        })
        res.send(result)
    } catch (err) {
        console.log(`${err}`);
        res.send(err)
    }
})

app.get('/search/:text/:s/:n', async (req, res) => {
    try {
        const n = req.params.n;
        const s = req.params.s;
        const text = req.params.text;
        console.log(text)
        const data = await dbm.getSimilar(text, s, n)

        console.log(`${data}`);
        console.log(data)
        const result = data.map(d => { 
            return {
                '_id': d.$loki,
                'time': d.time,
                'topic': d.topic,
                'text': d.text
            }
        })
        res.send(result)
    } catch (err) {
        console.log(`${err}`);
        res.send(err)
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})