import Giscus from "@giscus/react";

type CommentsProps = {
  slug: string;           // post.slug
  theme: "light" | "dark";
};

export default function Comments({ slug, theme }: CommentsProps) {
  return (
    <div className="mt-10">
      <Giscus
        repo="otmane-el-aloi/otmane-elaloi"          
        repoId="R_kgDOGq3KWQ"                   
        category="Blog Comments"                
        categoryId="DIC_kwDOGq3KWc4Cu-tL"  

        mapping="specific"
        term={slug}

        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        lang="en"
        
        theme={theme === "dark" ? "dark_dimmed" : "light"}
      />
    </div>
  );
}
