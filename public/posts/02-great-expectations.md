---
title: Building Reliable Data Pipelines with Great Expectations
slug: data-quality-great-expectations
date: 2025-08-16
tags: [Data Quality, Great Expectations, Lakehouse]
published: true
---

Delivering **trustworthy data** is just as important as delivering it fast.  
Here’s how I use [Great Expectations](https://greatexpectations.io/) to ensure data quality in modern Lakehouse pipelines.

---

## 1. Why Data Quality Matters

Without automated checks, bad data can silently propagate, breaking dashboards, ML models, or downstream systems.

**Common issues:**
- Missing or null values
- Wrong data types
- Out-of-range metrics

---

## 2. Installing Great Expectations

You can install via pip:

```bash
pip install great-expectations
````

Then initialize:

```bash
great_expectations init
```

---

## 3. Creating Expectations

An *Expectation* is simply a data test. For example:

```python
from great_expectations.dataset import PandasDataset

df_ge = PandasDataset(df)
df_ge.expect_column_values_to_not_be_null("user_id")
df_ge.expect_column_values_to_be_between("age", min_value=0, max_value=120)
```

---

## 4. Integrating with Spark

Great Expectations supports Spark DataFrames too:

```python
from great_expectations.dataset import SparkDFDataset

spark_df_ge = SparkDFDataset(spark_df)
spark_df_ge.expect_table_row_count_to_be_between(min_value=1)
spark_df_ge.expect_column_to_exist("transaction_amount")
```

---

## 5. Automating in Pipelines

You can run expectations:

* **Inside Airflow DAGs**
* As part of **dbt tests**
* Before publishing data to a **Gold layer**

Example Airflow task:

```python
from airflow.operators.python import PythonOperator

validate_data = PythonOperator(
    task_id="validate_gold_table",
    python_callable=run_ge_validation
)
```

---

## 6. Reporting & Alerts

Great Expectations can:

* Generate **HTML validation reports**
* Send Slack or email alerts
* Store results in S3, GCS, or ADLS

![GE Data Docs example](/images/posts/data-quality-great-expectations/ge-data-docs.png)

---

### Final Thoughts

By adding **data quality gates** to your Lakehouse pipelines, you prevent costly errors and build trust in your analytics.

> Data without trust is just noise.

```
