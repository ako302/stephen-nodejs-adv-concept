const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

//redis config
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

//'this' scope: query instance

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    if(!this.useCache) {
        return exec.apply(this, arguments);
    }
    // console.log(this.getQuery());
    // console.log(this.mongooseCollection.name);
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    console.log(key);

    //check redis cache contains the key or not
    const cacheValue = await client.hget(this.hashKey, key);

    //if yes, return redis cache
    if(cacheValue){
        console.log('cahced /n: '+cacheValue);
        
        //JSON.parse return as plain js object, but the function expects return as mongoose document
        // return JSON.parse(cacheValue);

        //'this' contains model
        const doc = JSON.parse(cacheValue);

        if(Array.isArray(doc)) {
            return doc.map(d => new this.model(d));
        } else {
            return new this.model(doc);
        }
    }
    //else issue query and store result in redis

    const result= await exec.apply(this, arguments);
    
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    console.log(result.validate);

    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};