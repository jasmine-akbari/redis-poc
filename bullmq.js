require('dotenv').config()
const { Job, Worker, Queue, QueueScheduler } = require('bullmq');

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

const myWorker = new Worker('myqueue', async (job) => {
        try {
            return await console.log(`${job.name} is being processed`);
        } catch (err) {
            console.log("Job failed with error: " + err);
        }
    },
    {
        connection: configuration,
        concurrency: 50,
    }
);

// Start event listeners
myQueue.on('waiting', job => console.info (
    `A job called ${job.name}, with an id of ${job.id} is waiting`,
));

myQueue.on('active', job  => console.info(
    `Job ${job} is now active`,
));

myWorker.on('completed', job => console.info(
    `Job: ${job.name} id: ${job.id} has completed, returned value: ${job.returnvalue}`,
));

// myWorker.on('progress',  => console.info(
//     `${job} has failed with reason ${err}`,
// ));

myWorker.on('failed', (job, err) => console.info(
    `${job} has failed with reason ${err}`,
));

myWorker.on('error', err => {
    console.error(`Worker process Failed with error: ${err}`);
});
// End event listeners

(async () => {
    console.log(configuration)
    await myQueue.add('myJobName', { foo: 'bar' },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        },
    );
    await myQueue.add('myJobName', { qux: 'baz' },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        },
    );    

    process.exit(0)
})();