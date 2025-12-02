---
day: 2
title: "UDFs Hell :) "
tags: ["spark", "udf", "performance", "arrow"]
---

---
> Disclaimer: this problem is inspired by real-world challenges, with details simplified for the exercise.
---
### Senario
The production team is building an **FPSO compressor performance** pipeline in PySpark.

For each timestamped row of raw sensors data, they need to compute **delivered power and efficiency KPIs** for three export gas compressors using detailed thermodynamics:

* Suction / discharge pressure & temperature
* Flow, speed, gas specific gravity, Z-factor
* Polytropic head and efficiency correlations
* Mechanical losses, gearbox efficiency, etc.

A process engineer provides a **complex Python class** `CompressorModel` that encapsulates all this:

```python
class CompressorModel:
    def __init__(self, map_file, gas_props):
        ...
    def delivered_power_kw(self, suction_p, discharge_p, flow, speed, z_factor, gas_sg, suction_t, discharge_t):
        ...
```

The data team wires this into a **regular PySpark scalar UDF**:

```python
from pyspark.sql import functions as F, types as T

model = CompressorModel("/dbfs/maps/comp_A.json", gas_props)

@F.udf("double")
def delivered_power_udf(suction_p, discharge_p, flow, speed, z_factor, gas_sg, suction_t, discharge_t):
    return model.delivered_power_kw(suction_p, discharge_p, flow, speed, z_factor, gas_sg, suction_t, discharge_t)

df_power = (
  spark.table("pi_compressor_signals")
       .withColumn("delivered_power_kw",
                   delivered_power_udf(
                       "suction_p_bar","discharge_p_bar","flow_scmh","speed_rpm",
                       "z_factor","gas_sg","suction_t_c","discharge_t_c"
                   ))
)
```

### Symptoms
They quickly notice that the PySpark job is very slow!

To improve performance, they switch to a **Pandas UDF (Arrow)** so data is passed in columnar batches to Python:

```python
from pyspark.sql.functions import pandas_udf, PandasUDFType

@pandas_udf("double", PandasUDFType.SCALAR)
def delivered_power_pandas_udf(
    suction_p, discharge_p, flow, speed, z_factor, gas_sg, suction_t, discharge_t
):
    return model.delivered_power_kw_vectorized(
        suction_p, discharge_p, flow, speed, z_factor, gas_sg, suction_t, discharge_t
    )

df_power = df.withColumn("delivered_power_kw",
                         delivered_power_pandas_udf(
                             "suction_p_bar","discharge_p_bar","flow_scmh","speed_rpm",
                             "z_factor","gas_sg","suction_t_c","discharge_t_c"
                         ))
```

Now the job **crashes with OOM on the executors**.
> Hint: probably it has to do with arrow batch size.

### Your Challenges

* Explain the OOM regarding the internals of jvm and spark.
	
* Calculate a reasonable value for `spark.sql.execution.arrow.maxRecordsPerBatch` to avoid OOM given:
	
	* **Executor RAM:** 16 GB
	* **Average row size in memory (after Spark projection to the inputs of the UDF):** 5 KB
	* **Concurrent tasks per executor:** 4
