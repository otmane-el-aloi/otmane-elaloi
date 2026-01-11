import type { Profile, Skill, Cert, Project } from "./types";
import { Database, Workflow, CheckCircle2, Rocket, Award } from "lucide-react";

export const FEATURES = {
  blogBanner: false,
  BlogSpotlight: true,
  skills: true,
  certs: true,
  services: false,
  selectedWork: false,
  sideProjects: false,
  blog: true,
  adventCalendar: false,
};

export const PROFILE: Profile = {
  name: "Otmane EL ALOI",
  title: "Another Data Guy",
  location: "Paris, FR",
  headline:
    "Hi 👋, I’m  Otmane EL ALOI, a Data Engineer building reliable, scalable, and cost-efficient data platforms across diverse industries. My core expertise is data engineering, strengthened by a background in data science and MLOps. And while you’re reading this, I’m probably learning something new. I am currently working as Data Engineer at TotalEnergies Digital Factory",
  email: "elaloi.otmane@gmail.com",
  socials: {
    github: "https://github.com/otmane-el-aloi",
    linkedin: "https://www.linkedin.com/in/otmane-elaloi/",
    twitter: "",
  },
  resumeUrl: "/otmane_el_aloi_resume.pdf",
};

export const SKILLS: Skill[] = [
  { icon: Database, label: "Data Architecture & Modeling", notes: "Dimensional · Lakehouse · Data Contracts" },
  { icon: Workflow, label: "Batch & Streaming Pipelines", notes: "Idempotency · Exactly-once · Backfills" },
  { icon: Workflow, label: "Reliability & Orchestration", notes: "SLAs/SLOs · Retries · Backpressure" },
  { icon: CheckCircle2, label: "Data Quality & Testing", notes: "Assertions · Freshness · Lineage" },
  { icon: Rocket, label: "Cost & Performance", notes: "Clusters sizing · File layout · Query optimization" },
  { icon: Award, label: "Governance & Security", notes: "Access models · Privacy · Auditing" },
];

export const CERTS: Cert[] = [
  {
    name: "Databricks Certified Data Engineer Professional",
    issuer: "Databricks",
    date: "2025-10-04",
    credentialUrl: "https://credentials.databricks.com/37d110cb-4c35-4a82-a586-c11790d747d8#acc.QnwNJjUd",
    logo: "",
    isNew: true,
  },
  {
    name: "Databricks Certified Gen AI Engineer Associate",
    issuer: "Databricks",
    date: "2025-01-01",
    credentialUrl: "https://credentials.databricks.com/09ed8535-9acd-48dc-923b-535cd3096a81#acc.vOjSq9ZI",
    logo: "",
  },
  {
    name: "Microsoft Certified: Azure Data Engineer Associate (DP-203)",
    issuer: "Microsoft",
    date: "2024-01-01",
    credentialUrl:
      "https://www.credly.com/badges/ceeeec1c-7365-4f2c-9115-a0a80e1cd68e/linked_in_profile",
    logo: "",
  },
  {
    name: "Microsoft Certified: Data Scientist Associate (DP-100)",
    issuer: "Microsoft",
    date: "2023-01-01",
    credentialUrl:
      "https://www.credly.com/badges/882b7bee-0b47-43e6-979f-195f73be5c0d/linked_in_profile",
    logo: "",
  },
  {
    name: "Databricks Certified Data Engineer Associate",
    issuer: "Databricks",
    date: "2023-01-01",
    credentialUrl: "https://credentials.databricks.com/14f726cd-2a98-483c-9e55-720345530281",
    logo: "",
  },
];

export const SELECTED_WORK: Project[] = [
  {
    title: "La Poste · Finance — Spark/Scala pipelines",
    summary:
      "Migrated & optimized batch data platform. Spark/Scala jobs cut from ~5h to ~30m. Reworked Airflow orchestration for visibility & flexibility. Moved workloads to Cloudera Data Engineering on Kubernetes.",
    stack: ["Spark (Scala)", "Airflow", "Cloudera", "Kubernetes"],
  },
  {
    title: "Daher · Avion — Event-Driven on Azure",
    summary:
      "Reduced Azure data platform cost by ~10×. Stabilized ops with monitoring/logging dashboards. ETL on Databricks 3× faster. Ported ~150 flight-performance algos from Python to PySpark. Set up Dev/Qual/Prod and CI/CD.",
    stack: ["Azure", "Databricks", "PySpark", "Azure DevOps"],
  },
  {
    title: "AS24 — Serverless BI for Jira",
    summary:
      "Designed a serverless solution on Azure for tracking Jira support activity (run ~$5/month). Built Functions (time/blob/durable), Azure SQL model, and Power BI dashboards. IaC with Terraform + Azure DevOps.",
    stack: ["Azure Functions", "Azure SQL", "Power BI", "Terraform"],
  },
];

export const SIDE_PROJECTS: Project[] = [
  {
    title: "Lakehouse TPC-DS Benchmark on Databricks",
    summary:
      "Benchmarked TPC-DS 1TB dataset on Databricks Photon vs standard Spark runtime. Tuned Delta caching, Z-Ordering, and file compaction for max throughput.",
    stack: ["Databricks", "Delta Lake", "Spark SQL", "Photon", "dbt"],
    link: "https://github.com/otmane-el-aloi/lakehouse-tpcds-benchmark",
  },
  {
    title: "Open-source Airflow DAG Templates for Medallion Architecture",
    summary:
      "Created a ready-to-use Airflow DAG library for Bronze → Silver → Gold pipelines with data quality checks and lineage.",
    stack: ["Airflow", "Great Expectations", "Spark", "Delta Lake"],
    link: "https://github.com/otmane-el-aloi/airflow-medallion-dags",
  },
  {
    title: "dbt + Spark CI/CD Pipeline",
    summary:
      "Automated dbt runs on Spark clusters with GitHub Actions. Includes slim CI, docs hosting, and test artifacts publishing.",
    stack: ["dbt", "Spark", "GitHub Actions", "Databricks CLI"],
    link: "https://github.com/otmane-el-aloi/dbt-spark-ci-cd",
  },
];
