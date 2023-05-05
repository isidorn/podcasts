import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import cors from 'cors';
import { Configuration, OpenAIApi } from "openai";
const openApiSpecification = require('../.well-known/openapi.json');

export default express;
const app = express();
app.use(cors());
dotenv.config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
app.use('/.well-known', express.static('.well-known'));
app.get('/shows', async (_req: Request, res: Response) => {
	const params = new URLSearchParams({
		limit: '8'
	});
	const response = await fetch(`${process.env.PODCAST_URL}shows?${params}`); 
	const json = await response.json();
	res.send(json);
});

app.get('/shows/:id', async (req: Request, res: Response) => {
	const response = await fetch(`${process.env.PODCAST_URL}shows/${req.params.id}`);
	const json = await response.json();
	res.send(json);
});

app.get('/episodes/:id', async (req: Request, res: Response) => {
	const response = await fetch(`${process.env.PODCAST_URL}episodes/${req.params.id}`);
	const json = await response.json();
	res.send(json);
});

app.get('/episodes/:id/summary', async (req: Request, res: Response) => {
	const response = await fetch(`${process.env.PODCAST_URL}episodes/${req.params.id}`);
	const episode = await response.json();
	const summaryResponse = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: `${episode.description}\n\nTl;dr`,
		temperature: 0.7,
		max_tokens: 60,
		top_p: 1.0,
		frequency_penalty: 0.0,
		presence_penalty: 1,
	});
	const summary = summaryResponse.data.choices[0].text;
	res.send({ summary });
});

app.get('/', (req: Request, res: Response) => {
	res.send('Friendly Podcast Server is running!');
});

// OpenAPI routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecification));
app.use(
	OpenApiValidator.middleware({
		apiSpec: './.well-known/openapi.json',
		validateRequests: true,
		validateResponses: true,
		ignorePaths: /\/\.well-known\// // Add this line to ignore the .well-known folder
	}),
);

const port = 8080;
app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});