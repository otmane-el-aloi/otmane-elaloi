---
title: "Making Databricks Bundles Smarter with Jinja + YAML"
slug: "databricks-bundles-jinja-yaml"
date: 2025-09-05
tags: [Databricks, Bundles, YAML, Jinja, Data Engineering]
published: false
featured: true
---

If you’ve worked with **Databricks Bundles**, you already know: the YAML configs start simple, but they don’t stay that way.  

The moment you introduce multiple environments (dev, staging, prod) and 10+ jobs, the files get *big*, repetitive, and fragile. You change one Spark version in prod, forget to do it in staging, and suddenly nothing lines up.  

That’s why I think databrikcs should bring back jinja :( like it was in dbx.

Let’s break down what works well, and what usually backfires.

---

## *Good* Patterns for Jinja in Bundles

### 1. Centralize your cluster config
Instead of sprinkling the same cluster definition across 5 jobs, define it once:

```yaml
{% set cluster_defaults = {
  "spark_version": "14.3.x-scala2.12",
  "node_type_id": "i3.xlarge",
  "autoscale": {"min_workers": 2, "max_workers": 6}
} %}

clusters:
  bronze_cluster: {{ cluster_defaults | tojson }}
```

Now Spark upgrades are one-liner changes. No hunting.

---

### 2. Share jobs across environments

Same jobs, different workspaces? Don’t duplicate:

```yaml
# dev.yml
workspace: "dev-workspace"
{% include "templates/jobs.yml.j2" %}

# prod.yml
workspace: "prod-workspace"
{% include "templates/jobs.yml.j2" %}
```

Your jobs live in `templates/jobs.yml.j2`.
The only difference between environments is a few overrides — not the whole file.

---

### 3. Parameterize storage paths

Hardcoding `/mnt/dev` vs `/mnt/prod` is a recipe for drift. Do this instead:

```yaml
paths:
  bronze: "{{ globals.storage }}/bronze"
  silver: "{{ globals.storage }}/silver"
  gold: "{{ globals.storage }}/gold"
```

Then in `globals.yml` you define storage once per environment:

```yaml
# dev globals
storage: "/mnt/dev"

# prod globals
storage: "/mnt/prod"
```

Clean, consistent, and no more broken references.

---

### 4. Validate before you deploy

One common mistake: “it renders, so it must be valid.”
Not true. YAML might render fine, but Bundles will still choke on bad schema.

**Quick tip**: run the rendered config through a validator (e.g. Pydantic or a JSON schema). Fail fast, locally, before you push and wait 5 minutes for a Databricks error.

Here is a shorter version of the validator I usually use:

```python
import sys
import yaml
from pydantic import BaseModel, Field, ValidationError
from typing import Optional, Dict, Any

class ClusterConfig(BaseModel):
    spark_version: str
    node_type_id: str
    autoscale: Optional[Dict[str, int]]


class JobConfig(BaseModel):
    name: str
    tasks: list


class BundleConfig(BaseModel):
    clusters: Dict[str, ClusterConfig]
    jobs: Dict[str, JobConfig]


def validate_bundle(path: str):
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    try:
        BundleConfig(**data)
        print(f"{path} is valid!")
    except ValidationError as e:
        print(f"{path} failed validation:\n{e}")
        sys.exit(1)


if __name__ == "__main__":
    for file in sys.argv[1:]:
        validate_bundle(file)

```
---

### 5. Keep overrides minimal

Dev vs prod should be *90% identical*. Override only what really changes (like workspace, cluster size, or storage root). If your prod and dev YAMLs look nothing alike, you’re just forking configs, not templating.

---

## Pitfalls to Watch Out For

* **Secrets in YAML**
  Never drop tokens or passwords straight into config. Use [Databricks Secrets](https://docs.databricks.com/en/security/secrets/index.html). (Right ? Never...)

* **Over-engineering templates**
  If your Jinja templates look like a Python script, you’ve gone too far. Keep them boring.

* **Too many includes**
  Includes are great, but 6 layers deep? Nobody wants to debug that.

* **Skipping validation**
  Databricks error messages aren’t fun. Save yourself time — validate configs locally before deploy.

---

## How I Usually Structure This

Here’s a folder structure that works well:

```
bundles/
  dev.yml
  prod.yml
  staging.yml
  globals.yml
  templates/
    jobs.yml.j2
    clusters.yml.j2
scripts/
  validate.py   # schema validation before deploy
```

* `globals.yml` → environment-specific stuff (like storage, workspace).
* `templates/` → reusable pieces (jobs, clusters, alerts).
* `scripts/validate.py` → check rendered YAML for schema issues.

---

## Wrapping up

Jinja + YAML in Bundles is like duct tape for Databricks configs:
super handy, but dangerous if you go overboard.

* Centralize defaults (clusters, paths)
* Reuse jobs with includes
* Keep environment overrides tiny
* Never put secrets in YAML
* Validate before deploy

Follow that, and your bundle configs will scale gracefully instead of turning into a config graveyard.

---

Thanks for reading — hope this saves you some debugging time.  
See you around 😉
