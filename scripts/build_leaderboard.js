const fs = require("fs");
const path = require("path");

const {
  GITHUB_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  DISCUSSION_CATEGORY_SLUG = "", // optional
  OUTPUT_PATH = "public/data/advent/leaderboard.json",
} = process.env;

if (!GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN in env.");
  process.exit(1);
}
if (!REPO_OWNER || !REPO_NAME) {
  console.error("Missing REPO_OWNER or REPO_NAME in env.");
  process.exit(1);
}

const endpoint = "https://api.github.com/graphql";

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
  }
  return json.data;
}

const qCategoryId = `
  query($owner:String!, $name:String!) {
    repository(owner:$owner, name:$name) {
      discussionCategories(first: 50) {
        nodes { id, slug, name }
      }
    }
  }
`;

const qDiscussionsPage = `
  query($owner:String!, $name:String!, $after:String, $categoryId:ID) {
    repository(owner:$owner, name:$name) {
      discussions(first: 50, after: $after, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
        pageInfo { hasNextPage endCursor }
        nodes {
          number
          title
          author { login avatarUrl }
          comments(first: 100) {
            pageInfo { hasNextPage endCursor }
            nodes { author { login } }
          }
        }
      }
    }
  }
`;

const qCommentsPage = `
  query($owner:String!, $name:String!, $number:Int!, $after:String) {
    repository(owner:$owner, name:$name) {
      discussion(number:$number) {
        comments(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { author { login } }
        }
      }
    }
  }
`;

async function getCategoryIdBySlug(slug) {
  if (!slug) return null;
  const data = await gql(qCategoryId, { owner: REPO_OWNER, name: REPO_NAME });
  const cats = data?.repository?.discussionCategories?.nodes || [];
  const hit = cats.find((c) => (c.slug || "").toLowerCase() === slug.toLowerCase());
  return hit ? hit.id : null;
}

async function* iterateDiscussions(categoryId) {
  let after = null;
  while (true) {
    const data = await gql(qDiscussionsPage, {
      owner: REPO_OWNER,
      name: REPO_NAME,
      after,
      categoryId,
    });
    const conn = data?.repository?.discussions;
    if (!conn) break;
    for (const node of conn.nodes || []) yield node;
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
}

async function* iterateAllComments(number) {
  // The first 100 comments are fetched in qDiscussionsPage. This function is for pagination beyond that.
  let after = null;
  while (true) {
    const data = await gql(qCommentsPage, {
      owner: REPO_OWNER,
      name: REPO_NAME,
      number,
      after,
    });
    const conn = data?.repository?.discussion?.comments;
    if (!conn) break;
    for (const node of conn.nodes || []) yield node;
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
}

async function buildLeaderboard() {
  const scores = new Map(); // login -> { user, contributions, avatar_url }

  const addScore = (login, avatar) => {
    if (!login) return;
    const prev = scores.get(login) || { user: login, contributions: 0, avatar_url: avatar || undefined };
    prev.contributions += 1;
    if (!prev.avatar_url && avatar) prev.avatar_url = avatar;
    scores.set(login, prev);
  };

  const categoryId = await getCategoryIdBySlug(DISCUSSION_CATEGORY_SLUG);

  for await (const d of iterateDiscussions(categoryId)) {
    // +1 for opening the discussion (I should change this to be weighted differently?)
    addScore(d?.author?.login, d?.author?.avatarUrl);

    // Count comments (paginated)
    // We already have first 100 comments (if any) in d.comments
    for (const c of d?.comments?.nodes || []) {
      addScore(c?.author?.login);
    }
    if (d?.comments?.pageInfo?.hasNextPage) {
      for await (const c of iterateAllComments(d.number)) {
        addScore(c?.author?.login);
      }
    }
  }

  // sort by contributions desc, then user asc
  const rows = Array.from(scores.values())
    .filter((r) => !!r.user)
    .sort((a, b) => (b.contributions - a.contributions) || a.user.localeCompare(b.user));

  // Massage shape to match your page expectations (user / solved / points optional)
  const output = rows.map((r, i) => ({
    user: r.user,
    solved: r.contributions,       // reuse "solved" label on UI to mean "contributions"
    points: r.contributions,        // simple 1:1; adjust if you want different weights
    avatar_url: r.avatar_url || undefined,
    rank: i + 1,
  }));

  // Ensure directory
  const outPath = path.resolve(process.cwd(), OUTPUT_PATH);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");

  console.log(`Wrote ${output.length} rows to ${OUTPUT_PATH}`);
}

buildLeaderboard().catch((e) => {
  console.error(e);
  process.exit(1);
});
