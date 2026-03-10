import { LRUCache } from 'lru-cache';

// Generalized Cache for Ministries Aggregated Scores
const options = {
    max: 100, // Maximum items
    ttl: 1000 * 60 * 5, // 5 minutes standard TTL for these aggregations
};

export const scoreCache = new LRUCache<string, any>(options);
