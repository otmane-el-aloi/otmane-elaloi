import fs from "node:fs";
import path from "node:path";

const GH_TOKEN = process.env.GH_TOKEN;

if (!GH_TOKEN) {
  console.error("GH_TOKEN is required");
  process.exit(1);
}

const CATEGORY_ID = "DIC_kwDOGq3KWc4Cvned"; // "Advent Of Data - 2025"
const REPO_OWNER = "otmane-el-aloi";
const REPO_NAME = "otmane-elaloi";
const OUTPUT_FILE = path.join("public", "advent-content", "commenters.json");

async function run() {
  const stats = new Map();

  for await (const discussionId of fetchDiscussions()) {
    for await (const comment of fetchDiscussionComments(discussionId)) {
      const login = comment.author?.login;
      if (!login) continue;
      const avatarUrl = comment.author?.avatarUrl ?? "";
      const profileUrl = comment.author?.url ?? `https://github.com/${login}`;
      const ts = comment.createdAt;

      const entry = stats.get(login) ?? {
        login,
        comments: 0,
        avatarUrl,
        profileUrl,
        lastCommentedAt: ts,
      };

      entry.comments += 1;
      if (!entry.lastCommentedAt || new Date(ts) > new Date(entry.lastCommentedAt)) {
        entry.lastCommentedAt = ts;
      }
      entry.avatarUrl = entry.avatarUrl || avatarUrl;
      entry.profileUrl = entry.profileUrl || profileUrl;

      stats.set(login, entry);
    }
  }

  const items = Array.from(stats.values()).sort((a, b) => {
    if (b.comments !== a.comments) return b.comments - a.comments;
    return new Date(b.lastCommentedAt).getTime() - new Date(a.lastCommentedAt).getTime();
  });

  const payload = {
    updatedAt: new Date().toISOString(),
    items,
  };

  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2));
  console.log("Wrote leaderboard to", OUTPUT_FILE, "with", items.length, "users");
}

async function* fetchDiscussions() {
  let cursor = null;
  while (true) {
    const data = await githubGraphql(
      `
        query($cursor: String) {
          repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
            discussions(first: 50, after: $cursor, categoryId: "${CATEGORY_ID}") {
              nodes { id }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      `,
      { cursor }
    );

    const conn = data.repository?.discussions;
    if (!conn) break;

    for (const node of conn.nodes ?? []) {
      if (node?.id) yield node.id;
    }

    if (conn.pageInfo?.hasNextPage) {
      cursor = conn.pageInfo.endCursor;
    } else {
      break;
    }
  }
}

async function* fetchDiscussionComments(discussionId) {
  let cursor = null;
  while (true) {
    const data = await githubGraphql(
      `
        query($id: ID!, $cursor: String) {
          node(id: $id) {
            ... on Discussion {
              comments(first: 100, after: $cursor) {
                nodes {
                  createdAt
                  author {
                    login
                    url
                    avatarUrl
                  }
                }
                pageInfo { hasNextPage endCursor }
              }
            }
          }
        }
      `,
      { id: discussionId, cursor }
    );

    const comments = data.node?.comments;
    if (!comments) break;

    for (const node of comments.nodes ?? []) {
      if (node?.author?.login?.endsWith?.("[bot]")) continue;
      yield node;
    }

    if (comments.pageInfo?.hasNextPage) {
      cursor = comments.pageInfo.endCursor;
    } else {
      break;
    }
  }
}

async function githubGraphql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GH_TOKEN}`,
      "User-Agent": "advent-leaderboard-updater",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GraphQL error: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    console.error(JSON.stringify(json.errors, null, 2));
    throw new Error("GitHub GraphQL returned errors");
  }
  return json.data;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
