import type { JSX } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout, { rootLoader } from "./routes/root";
import { AdventLayout, adventLoader } from "./routes/advent";
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdventPage from "./pages/AdventOfDataPage";
import AdventProblemPage from "./pages/AdventOfDataProblemPage";
import { FEATURES } from "./config";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    loader: rootLoader,
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "home", element: <HomePage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      ...(FEATURES.adventCalendar
        ? [
          {
            id: "advent",
            path: "advent",
            loader: adventLoader,
            element: <AdventLayout />,
            children: [
              { index: true, element: <AdventPage /> },
              { path: ":day", element: <AdventProblemPage /> },
            ],
          },
        ]
        : []),
    ],
  },
]);

export default function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
