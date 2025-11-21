---
day: 2
title: "The Netty Direct Buffer Leak"
tags: ["spark", "performance", "OOM"]
---

You see java.lang.OutOfMemoryError: Direct buffer memory. Your spark.executor.memoryOverhead is generous.

This is often caused by the Netty transport layer. When spark.network.io.preferDirectBufs is true, Netty uses off-heap memory for shuffle fetches.

Explain the relationship between the number of open connections (fan-in from thousands of mappers), the spark.network.io.numConnectionsPerPeer, and the JVM Garbage Collector's inability to reclaim DirectByteBuffers fast enough. Why does System.gc() need to be called explicitly by the framework to clean these?