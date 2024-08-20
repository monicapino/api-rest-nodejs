import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import  request  from 'supertest'
import { app } from '../src/routes/app'

describe('Transaction routes', () => {

    
    beforeAll(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest') 
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })
    
    beforeEach(() => {
        /* execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest') */

    })
    
    it('should be able to create a new transaction', async () => {
         await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })
    
            .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })
        const cookies = createTransactionResponse.get('Set-Cookie')

        const listaTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies![0])
            .expect(200)
            
        expect(listaTransactionsResponse.body.transactions).toEqual([
                expect.objectContaining({
                    title: 'New transaction',
                    amount: 5000,
                }),
        ])
    })


    it('should be able to the summary', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })
        
            const cookies = createTransactionResponse.get('Set-Cookie')

            await request(app.server)
            .post('/transactions')
            .set('Cookie', cookies!)
            .send({
                title:'Debit transaction',
                amount: 2000,
                type: 'debit',
            })
        
        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies!)
            .expect(200)

            expect(summaryResponse.body.summary).toEqual({
            amount: 3000,
        })
        
    })

})