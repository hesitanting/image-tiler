import app from '../server'
import supertest from 'supertest'

const request = supertest(app)
const base = 'combo'
const uuid = '7326e81d-40b0-4053-8f33-bd22f9a53df9'

describe('validators', () => {

  test('should return an error if buffer format is wrong', async done => {
    let res = await request.get(`/${base}/${uuid}.png?buffer=AAA`)

    expect(res.status).toBe(422)

    res = await request.get(`/${base}/${uuid}.png?buffer=1.5`)

    expect(res.status).toBe(422)

    done()
  })

  test('should return an error if size format is wrong', async done => {
    let res = await request.get(`/${base}/${uuid}.png?size=AAA`)

    expect(res.status).toBe(422)

    res = await request.get(`/${base}/${uuid}.png?size=1.5`)

    expect(res.status).toBe(422)

    done()
  })

  test('should return an error if XYZ format is wrong', async done => {
    let res = await request.get(`/${base}/${uuid}/AA/21455/50471.png`)

    expect(res.status).toBe(422)

    res = await request.get(`/${base}/${uuid}/17/AA/50471.png`)

    expect(res.status).toBe(422)

    res = await request.get(`/${base}/${uuid}/17/21455/AA.png`)

    expect(res.status).toBe(422)

    done()
  })

  test('should return an error if UUID format is wrong', async done => {
    const res = await request.get(`/${base}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png`)

    expect(res.status).toBe(422)

    done()
  })

  afterAll(app.close)

})
