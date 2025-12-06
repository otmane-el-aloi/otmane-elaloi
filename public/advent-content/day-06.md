---
day: 6
title: "The Cosmos of Hot Partitions"
tags: ["cosmosdb", "data-modeling", "partitioning", "throughput", "spark"]
---

---
> Disclaimer: this problem is inspired by real-world challenges, with details simplified for the exercise.
---

### Scenario

You’re designing a **real-time telemetry store** on Azure Cosmos DB for an FPSO .

All **sensor events**  from control systems are pushed into one Cosmos DB container `telemetry` and later processed by PySpark jobs for enrichment and aggregations.

The ingestion service writes documents like:

```jsonc
{
  "id": "event-<guid>",
  "assetId": "FPSO-01",
  "equipmentType": "centrifugal_compressor", // used as partition key
  "ts": "2025-11-30T12:34:56.789Z",
  "tag": "DISCH_PRESS_BAR",
  "value": 148.2,
  "quality": "GOOD",
  "site": "Offshore-BR-01"
  // + some metadata
}
```

To “keep related equipment together”, the team chose **`/equipmentType` as the partition key**, so all compressors, pumps, separators, etc. are grouped by type.

Cosmos is configured with **manual throughput** on the container (many thousands of RU/s), and is used by:

1. **Ingestion microservice** writing individual events at high frequency.
2. A **dashboard API** querying recent events for specific `assetId` and `equipmentType`.

With the fleet growing, engineers add more compressors to the same telemetry flow. Suddenly, ingestion and queries start hitting **429 (Request rate too large)** despite having “plenty” of RU/s configured on the container.

### Symptoms

* Ingestion logs show frequent 429s and retries on Cosmos writes for `equipmentType = "centrifugal_compressor"`.
* End-user APIs experience increased latency and occasional timeouts when reading recent compressor data by `assetId`.

### Your Challenges

* Explain the syptomps ;).
* Discuss why this data modeling decision hurts overall throughput and creates unpredictable latency for both writes and reads.
* Propose a better partitioning strategy (or combination of keys) for this telemetry workload and how it would distribute RU consumption more evenly.
