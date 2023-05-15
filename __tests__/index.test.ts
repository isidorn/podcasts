import request from 'supertest';
import app from '../src/index';

function sum(a: number, b: number): number {
	return a + b;
}
	
describe('sum', () => {
	it('adds two numbers', () => {
		expect(sum(1, 2)).toBe(3);
	});
});

describe('GET /shows/:id', () => {
	it('should return a list of episodes for the specified show', async () => {
		const response = await request(app).get('/shows/123');
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('episodes');
		expect(Array.isArray(response.body.episodes)).toBe(true);
	});
  
	it('should return only the first 20 episodes if the request is coming from ChatGPT', async () => {
		const response = await request(app)
			.get('/shows/123')
			.set('User-Agent', 'ChatGPT');
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('episodes');
		expect(Array.isArray(response.body.episodes)).toBe(true);
		expect(response.body.episodes.length).toBe(20);
	});
  
	it('should return a 404 error if the show ID is invalid', async () => {
		const response = await request(app).get('/shows/invalid-id');
		expect(response.status).toBe(404);
	});
  });