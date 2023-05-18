import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import cors from 'cors';
const openApiSpecification = require('../.well-known/openapi.json');

export default express;
const app = express();
const categoryId = 'a5ae013c-14a1-4c2d-a731-47fbbd0ba527';
const podcastApiUrl = 'https://ca-api-2ib46ponsk34o.yellowhill-c8bb1861.eastus2.azurecontainerapps.io/';
app.use(cors());
dotenv.config();

interface Show {
    id: string;
    title: string;
    description: string;
    episodes: Episode[];
    image: string;
}

interface Episode {
    description: string;
    id: string;
    title: string;
    published: string;
}

app.use('/.well-known', express.static('.well-known'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecification));

// Gets the list of shows
app.get('/shows', async (_req: Request, res: Response) => {
    const params = new URLSearchParams({
        limit: '6',
        categoryId
    });
    const response = await fetch(`${podcastApiUrl}shows?${params}`); 
    const json = await response.json();
    res.send(json);
});

// Gets the details of a show
app.get('/shows/:id', async (req: Request, res: Response) => {
    const response = await fetch(`${podcastApiUrl}shows/${req.params.id}`);
    const json: Show = await response.json();
    res.send(json);
});

// Gets the summary of an episode
app.get('/episodes/:id/summary', (req: Request, res: Response) => {
    fetch(`${process.env.PODCAST_URL}episodes/${req.params.id}`).then((response) => {
        response.json().then((json: Episode) => {
            const summary = json.description;
            res.send({ summary });
        });
    }, (error) => { 
        console.log(error);
        res.status(500).send({ error });
    });
});

app.get('/', (_req: Request, res: Response) => {
    res.send('Friendly Podcast Server is running!');
});

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