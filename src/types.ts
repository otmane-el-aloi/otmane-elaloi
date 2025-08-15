// src/types.ts
import React from "react";

/* Core shared types */
export interface Socials {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface Profile {
  name: string;
  title: string;
  location?: string;
  headline: string;
  email: string;
  socials: Socials;
  resumeUrl?: string;
}

export interface Skill {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  notes: string;
}

export interface Cert {
  name: string;
  issuer: string;
  date: string;              // ISO or yyyy-mm-dd
  credentialUrl?: string;
  logo?: string;
}

export interface Project {
  title: string;
  summary: string;
  stack: string[];
  link?: string;
}

export type RouteName = "home" | "blog" | "post";
export interface Route {
  name: RouteName;
  params?: { slug?: string };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  dateISO: string;
  published: boolean;
  content: string;
}
