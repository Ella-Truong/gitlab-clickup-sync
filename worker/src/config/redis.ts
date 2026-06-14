import Redis from "ioredis";

export const redis = new Redis(
    process.env.REDIS_URL!, {
        maxRetriesPerRequest: null
    }
)

redis.on("connect", () => {
    console.log("Connect to Redis")
})

redis.on("ready",() => {
    console.log("Redis ready")
})

redis.on("error", (err) => {
    console.error("Redis error: ", err)
})