---
day: 3
title: "Cluster Sizing"
tags: ["spark", "performance", "joins"]
---

You have a cluster with:

- **10 Nodes**
- **Each Node:** 64 Cores, 256GB RAM.
- **Overhead:** Leave 1 Core and 4GB RAM per node for OS/Hadoop daemons.

**Task:** Design the optimal Spark Submit configuration (`--num-executors`, `--executor-cores`, `--executor-memory`, `--driver-memory`, `--spark.memory.fraction`) for a job that performs a massive Shuffle (requiring high execution memory).

**Constraints:**

1. Maximize parallelism (Target 3-5 cores per executor).
2. Maximize memory available for the shuffle (Execution Memory).
3. Ensure you don't hit the YARN container maximum limits.
4. Account for `spark.executor.memoryOverhead` (assume 10%).

*Calculate the exact numbers.*