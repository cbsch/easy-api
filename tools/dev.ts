import { db, init, stop } from '../test/helpers'
import { startDb, stopDb } from '../test/docker'

init().then(async () => {
    await stop()
    console.log('done')
})


// startDb().then(async () => {
//     console.log('done') 
//     await stopDb()
// }).catch(async () => {
//     await stopDb()
// })