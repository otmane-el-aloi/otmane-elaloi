import { useNavigate } from "react-router-dom";

export function useAppNavigation() {
  const navigate = useNavigate();

  const navigateTo = (
    name: "home" | "blog" | "post" | "advent" | "advent-problem",
    params?: { slug?: string; day?: number }
  ) => {
    if (name === "home") navigate("/home");
    else if (name === "blog") navigate("/blog");
    else if (name === "post") navigate(`/blog/${params?.slug ?? ""}`);
    else if (name === "advent") navigate("/advent");
    else if (name === "advent-problem") navigate(`/advent/${params?.day ?? ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { navigateTo };
}