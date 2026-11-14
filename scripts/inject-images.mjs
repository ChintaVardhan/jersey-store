import fs from "fs";

const path = "prisma/seed.ts";
let s = fs.readFileSync(path, "utf8");

// Avoid double-inject if re-run
if (s.includes('image: "/products/')) {
  console.log("images already present");
  process.exit(0);
}

s = s.replace(/slug: "([^"]+)",(\r?\n)/g, (_m, slug, nl) => {
  return `slug: "${slug}",${nl}    image: "/products/${slug}.jpg",${nl}`;
});

fs.writeFileSync(path, s);
console.log("injected image fields");
