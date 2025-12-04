---
day: 4
title: "Think deeper before adding a column :) "
tags: ["spark", "jvm"]
---

### Scenario

A team reports a performance regression: a previously stable Spark job now crashes during the shuffle reduce stage with:

```python
ExecutorLostFailure: java.lang.OutOfMemoryError
ShuffleBlockFetcherIterator: Too many fetch failures
GC overhead limit exceeded
```

Original Job:

```python
root
 ├─ user_id: long
 ├─ ts: long
 ├─ url: string (~100 bytes)
 └─ event: string (~5 bytes)
```

```python
events_per_user = (
    df.groupBy("user_id")
      .agg(
          collect_list(
              struct("ts", "url", "event")
          ).alias("events")
      )
)
```

- Each user has ~80 events.
- ~100,000 users.

New Job:

```python
df = df.withColumn("is_mobile", col("user_agent").contains("Mobile"))
```

```python
collect_list(
    struct("ts", "url", "event", "is_mobile")
)
```

### Your Challenges
* Explain  why adding a boolean column can increase shuffle size.(Hint: consider the internal row format Spark uses.)
* Why is the shuffle *reduce* stage more likely to OOM than the map stage? (Hint: think about what reduce tasks accumulate in memory.)
* What part of the query is the real memory hotspot?
* Propose **two practical fixes** that do *not* drop the boolean and do *not* scale up hardware.
