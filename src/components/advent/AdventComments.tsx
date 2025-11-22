import Giscus from "@giscus/react";

type AdventCommentsProps = {
  term: string; // Unique identifier for the advent problem
  theme: "light" | "dark";
};

export default function AdventComments({ term, theme }: AdventCommentsProps) {
  return (
    <div className="mt-10">
      <Giscus
        repo="otmane-el-aloi/otmane-elaloi"
        repoId="R_kgDOGq3KWQ"
        category="Advent Discussions"
        categoryId="DIC_kwDOGq3KWc4Cvned"
        mapping="specific"
        term={term}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        lang="en"
        theme={theme === "dark" ? "dark_dimmed" : "light"}
      />
    </div>
  );
}
