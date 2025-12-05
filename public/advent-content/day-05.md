---
day: 5
title: "The Endless Lineage"
tags: ["spark", "lineage", "checkpoint", "delta", "performance"]
---

---
> Disclaimer: this problem is inspired by real-world challenges, with details simplified for the exercise.
---

### Scenario

You’re building a **unified profitability pipeline** that combines:

* Refinery production data (volumes, yields, energy consumption)
* OPEX / CAPEX costs from finance
* Transfer prices & FX rates

Goal: **daily profitability at asset / unit / product level**, implemented as a single **PySpark job** that runs in production.

Over time, requirements kept changing and the team just kept appending transformations to the same DataFrame:

```python
df = spark.table("fact_bronze_refinery")

df = df.join(dim_assets, "asset_id", "left")
df = df.join(dim_products, "product_id", "left")
df = df.withColumn("net_volume", ...)
df = df.withColumn("standard_yield", ...)
df = df.join(finance_silver, ["company_id", "period"], "left")
df = df.withColumn("unit_margin", ...)
# more joins, more windows, more withColumns, more filters, more “patches”...

df = df.withColumn("debug_flag", ...)
df = df.filter("debug_flag != 'drop'")
df = df.withColumn("some_intermediate", ...)
# and so on… always reusing `df` and chaining more steps
```

After many iterations the job now includes joins, windows, UDFs, filters, and ad-hoc corrections from previous refactors.

At the end, the job writes the result:

```python
df.write.format("delta") \
  .mode("overwrite") \
  .saveAsTable("profitability_gold_daily")
```

### Symptoms

* **Unstable behavior:** Small code changes cause unexpected performance shifts or optimizer decisions.
* **Hard debugging:** Failures inside the plan are difficult to trace back because the logical / physical plan is huge. (It is very hard to map code to spark plans!)

### Your Challenges

* Explain why very long Spark lineage can hurt planning, performance and debuggability in a PySpark job.
* Discuss why `cache()` alone is not enough to solve lineage explosion and when you would use checkpoint vs. writing intermediate Delta tables.
