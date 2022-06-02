require('dotenv').config()
const { Job, Worker, Queue } = require('bullmq');

var host = process.env.REDIS_SERVER;
var key = process.env.REDIS_SERVER_PRIMARY_KEY;
var port = process.env.REDIS_SERVER_PORT;

const configuration = {
    host: host,
    port: port,
    password: key,
    tls: {
        servername: host
    },
    database: 1,
    maxRetriesPerRequest: null,
    // url: "rediss://" + host+ ':' + port,
	// password: key,
}

// TESTING IOREDIS CONNECTION TO REMOTE SERVER
// const connect = () => {
//     return redis.createClient(configuration);
// }

// const test = async () => {
    
//     // connect
//     const dbConnection = await connect();

//     dbConnection.on('connect', function () {
//         console.log("Connected to redisClient:", dbConnection);
//     });

//     dbConnection.on('error', function (err) {
//         console.log("unable to connect, exiting with error:" + err);
//     });

//     await dbConnection.set("mykey", "hello");

//     await dbConnection.get("mykey", (err, result) => {
//         if (err) {
//         console.error(err);
//         } else {
//         console.log(result); // Prints "value"
//         }
//     });

//     await dbConnection.quit();

// }

// test()
// .then(() => console.log("done"))
// .catch(err => console.log(err))

const myQueue = new Queue('myqueue', {
    connection: configuration,
    concurrency: 50,
});

const processor = async job => {
    try {
        console.log(job.data)
    } catch(err) {
        console.error(err)
    }
}

const myWorker = new Worker('myworker', processor, {
    connection: configuration,
    concurrency: 50,
});

// Start event listeners
myQueue.on('waiting', job => console.info (
    `A job called ${job.name}, with an id of ${job.id} is waiting`,
));

myQueue.on('active', job  => console.info(
    `Job ${job} is now active`,
));

myWorker.on('completed', job => console.info(
    `${job.id} has completed and returned ${job.returnvalue}`,
));

myWorker.on('failed', (job, err) => console.info(
    `${job} has failed with reason ${err}`,
));
// End event listeners

(async () => {
    await myQueue.add('myJobName', { foo: 'bar' });
    await myQueue.add('myJobName', { qux: 'baz' });

    await myQueue.process('myqueue', console.log(job.data))    

    process.exit(0)
})();