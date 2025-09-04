---
title: Understanding VOID Columns in Delta Lake
slug: delta-lake-void-columns
date: 2025-09-04
tags: [Spark, Delta Lake, Data Engineering, Schema Evolution, featured]
published: true
featured: true
---

If you work with Spark and Delta Lake long enough, you’ll eventually bump into this annoying error. Your job runs fine, life is good, and then suddenly a **merge** blows up with something like:

> [DELTA_MERGE_ADD_VOID_COLUMN] Cannot add column X with type VOID. Please explicitly specify a non-void type.

So what’s really going on here? And more importantly, how do you keep it from happening again?  
Let’s dig in.

---

## What is a VOID column?

In Spark, when a column only has `null` values **and no explicit type**, Spark infers it as `NullType`.  
Delta Lake calls that **VOID**.

That’s fine if you’re just *storing* nulls in an existing typed column (`DOUBLE`, `STRING`, etc.).  
But the trouble starts when you try to **add a new column** of type `NullType/VOID` to a Delta table. Delta doesn’t know how to evolve the schema without a real type.

---

## How VOID shows up

You probably didn’t create a VOID column on purpose. It usually sneaks in through patterns like:

- `withColumn("col", F.lit(None))`
- `F.when(...).otherwise(None)` (when every row hits the `otherwise`)
- Aggregations that resolve to all-null values
- Creating empty DataFrames without a schema, then unioning them later
- …and a few more edge cases

Here’s a quick repro:

```python
from pyspark.sql import functions as F
from pyspark.sql.types import StructType, StructField, IntegerType

# Target table
df = spark.createDataFrame([(1,)], schema=StructType([StructField("id", IntegerType())]))
df.write.format("delta").mode("overwrite").save("/tmp/void_demo")

# Source with a VOID column
src = spark.createDataFrame([(1,)], ["id"]).withColumn("wasted_energy_kw", F.lit(None))

from delta.tables import DeltaTable
tgt = DeltaTable.forPath(spark, "/tmp/void_demo")

(
  tgt.alias("t")
  .merge(src.alias("s"), "t.id = s.id")
  .whenMatchedUpdateAll()
  .whenNotMatchedInsertAll()
  .execute()
)
# -> [DELTA_MERGE_ADD_VOID_COLUMN] ... type VOID
```

Fix is simple: **cast it**.

```python
from pyspark.sql.types import DoubleType

src_typed = src.withColumn("wasted_energy_kw", F.lit(None).cast(DoubleType()))

(
  tgt.alias("t")
  .merge(src_typed.alias("s"), "t.id = s.id")
  .whenMatchedUpdateAll()
  .whenNotMatchedInsertAll()
  .execute()
)
```

---

## Real-world gotchas

### 1. Placeholder columns

Always cast your nulls:

```python
df = df.withColumn("foo_score", F.lit(None).cast("double"))
```

Or, for conditional logic:

```python
df = df.withColumn(
    "signal",
    F.when(F.col("ok"), F.col("value").cast("double"))
     .otherwise(F.lit(None).cast("double"))
)
```

---

### 2. Numeric expressions collapsing to null

If Spark can’t infer a type, it falls back to null. Keep it numeric:

```python
acc = sum(F.coalesce(F.col(c).cast("double"), F.lit(0.0)) for c in cols)
df = df.withColumn("total_kw", acc)
```

---

### 3. Empty DataFrames and unions

Never union empty frames without a schema. Define it upfront:

```python
from pyspark.sql.types import StructType, StructField, StringType, DoubleType
schema = StructType([
  StructField("id", StringType()),
  StructField("wasted_energy_kw", DoubleType())
])
empty = spark.createDataFrame([], schema)
df = empty.unionByName(real_df, allowMissingColumns=True)
```

---

### 4. Delta merges with evolving schemas

Auto-merge can help with new *typed* columns (but not VOID):

```python
spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")
```

Still—cast explicitly before the merge.

---

### 5. A reusable pattern: ensure typed columns

```python
from pyspark.sql.types import DoubleType

required_metrics = [
  "performance_kw", "process_kw", "wasted_energy_kw"
]

def ensure_columns(df, cols, dtype=DoubleType()):
    for c in cols:
        if c not in df.columns:
            df = df.withColumn(c, F.lit(None).cast(dtype))
        else:
            df = df.withColumn(c, F.col(c).cast(dtype))
    return df

df_norm = ensure_columns(df, required_metrics)
```

Why bother?

- Your downstream math stays stable (all doubles).
- Delta schema evolution stays safe.
- You don’t wake up to VOID errors at 2 a.m.

---

## Wrapping up

VOID columns aren’t really a Delta bug. They’re just Spark telling you: *“Hey, you gave me an untyped column. Please fix it.”*

So remember:

- All-null without a cast ⇒ `NullType` (VOID)  
- Always cast when you introduce nulls  
- Seed schemas for empty frames  
- Use typed literals (`0.0`, not `None`) in math  

---

Thanks for reading — hope this saves you some debugging time.  
See you around 😉
