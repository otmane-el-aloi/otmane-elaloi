---
day: 3
title: "The Skew Hell"
tags: ["spark", "join", "skew", "performance"]
---

---
> Disclaimer: this problem is inspired by real-world challenges, with details simplified for the exercise.
---

### Scenario

A global company has a large transactions dataset and a small currency exchange rate table. The transactions table (sales_txn) contains sales records with various currencies:

```yml
txn_id, date, amount, currency_code, ... (other fields)
```

The exchange rate table (fx_rates) provides a daily conversion rate to USD for each currency:

```yml
currency_code, date, usd_rate
```


To analyze all sales in a single currency, you join transactions with exchange rates on currency_code and date:

```python
sales_df = spark.table("sales_txn")
fx_df    = spark.table("fx_rates")
result_df = sales_df.join(fx_df, on=["currency_code","date"]) \
                    .withColumn("amount_usd", F.col("amount") * F.col("usd_rate"))
```


About 70% of all transactions are in "USD" currency (which has a trivial rate of 1.0). This means "USD" appears disproportionately often as a join key.

### Symptoms

* Straggler task in join: The Spark join runs with a shuffle. Most tasks handle a balanced number of rows, but one task (handling the "USD" key partition) processes an enormous fraction of the data. This becomes a straggler that dramatically slows the job’s completion.

### Your Challenges

* Diagnose the problem: Why is the "USD" key causing a performance bottleneck in the join? Explain in terms of Spark’s shuffle partitioning and how key frequency can lead to skewed partitions. What does this mean for the join algorithm’s execution?

* Outline two possible solutions to handle the skew.
