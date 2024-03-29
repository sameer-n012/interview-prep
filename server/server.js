import { QuestionDBManager } from './cache.js';
import express from 'express'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch'
import cors from 'cors'
import { ChromadbClient } from './chromadbClient.js';
import { large_prompt_template, small_prompt_template } from './prompt_template.js';

globalThis.fetch = fetch

dotenv.config();

const app = express();
const port = 5000;
const dbm = new QuestionDBManager('question_cache.json')
const chromadbClient = new ChromadbClient();
chromadbClient.setCollection();
setInterval(dbm.save, 1000 * 60); // save db every minute

app.use(cors())

app.get('/', (req, res) => {
    res.send('This is the server');
})

app.get('/gen/:topic', async (req, res) => {
    try {
        console.log(req.params.topic)
        const input = req.params.topic.replace(":", "");
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.MODEL_NAME });

        function withTimeout(ms, promise) {
            let timeout = new Promise((resolve, reject) => {
                let id = setTimeout(() => {
                    clearTimeout(id);
                    reject('Timed out in '+ ms + 'ms.')
                }, ms)
            })
        
            return Promise.race([
                promise,
                timeout
            ])
        }
        
        // Usage:
        let example = undefined;
        try {
            example = await withTimeout(1000 * 30, chromadbClient.query(input, 3));
        } catch(e) {
            console.log(e);
        }

        let prompt = undefined;
        if (example == undefined) {
            prompt = small_prompt_template(input);
            console.log('No examples retrieved. Using small prompt template.');
        } else {
            prompt = large_prompt_template(input, example);
            console.log('Examples retrieved. Using large prompt template.');
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/^\s*(\$){4}\s*/g, "").replace(/\s*(\$){4}\s*$/g, "");

        await dbm.insert(input, text);

        console.log(`${input}: ${text}`);
        res.send(text)
    } catch (err) {
        console.log(`${err}`);
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