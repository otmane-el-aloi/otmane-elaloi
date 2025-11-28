import type { JSX } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import type { AdventProblem } from "../types";
import { loadAdventProblems } from "../lib/advent";

export interface AdventLoaderData {
  problems: AdventProblem[];
}

export async function adventLoader(): Promise<AdventLoaderData> {
  const problems = await loadAdventProblems();
  return { problems };
}

export function AdventLayout(): JSX.Element {
  const data = useLoaderData() as AdventLoaderData;
  return <Outlet context={data} />;
}
