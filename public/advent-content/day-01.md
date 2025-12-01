---
day: 1
title: "The 5000 KPI Projection"
tags: ["spark", "jvm", "codegen"]
---


![image](/images/fpso.png)
*Image generated with AI*

---
> Disclaimer: this problem is inspired by real-world challenges, with details simplified for the exercise.
--- 

### Scenario

You’re working on an **FPSO performance** pipeline.
All raw process data from OSIsoft PI lands as a *tall* Delta table:

```yml
pi_raw(
  asset_id        STRING,
  unit_id         STRING,
  ts              TIMESTAMP,
  suction_p_bar   DOUBLE,
  discharge_p_bar DOUBLE,
  flow_scmh       DOUBLE,
  speed_rpm       DOUBLE,
  gas_sg          DOUBLE,
  z_factor        DOUBLE,
  ...             -- ~200 more basic tags per row
)
```
Process & reliability engineers ask you to compute a very rich telemetry feature vector per row:

- About **5,000 KPI columns** per row, for data science and monitoring:
    - corrected flow, polytropic head, efficiency approximations,
    - various normalized temperatures / pressures,
    - domain-specific parameters built from the basic tags.

A colleague auto-generates the KPI code in PySpark:

```py
from pyspark.sql import functions as F

df = spark.table("pi_raw")

exprs = [
    "asset_id",
    "unit_id",
    "ts",
    "suction_p_bar",
    "discharge_p_bar",
    "flow_scmh",
    "speed_rpm"
]

# or anything that builds a very big method ;)
for i in range(5000):
    exprs.append(
        f"""
        (
          0.85 * pow(discharge_p_bar, 0.286)
          - 1.20 * log(suction_p_bar + 0.1)
          + 0.0001 * speed_rpm * flow_scmh
          + {i} * gas_sg
          - 0.3 * z_factor
        ) AS kpi_{i}
        """
    )

df_kpi = df.selectExpr(*exprs)
```


This is then written to a Delta table `pi_kpi_5k`.

### Symptoms

- In the physical plan you see the big `Project` **without a  star**.
- Runtime is much worse than expected for a simple scan + projection.

You are **not allowed** to change the *number* of KPIs (5,000 are required), and you must still produce **one wide KPI table** in the end (downstream jobs expect wide format).

### Your challenges
* Explain the syptomps ;)!
* Propose a solution that minimize I/O and helps spark keeps whole gen code for the projection.