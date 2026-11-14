import fs from "fs";

let s = fs.readFileSync("prisma/seed.ts", "utf8");

s = s.replace(
  /new Date\("2026-07-19T23:59:59\.000Z"\)/g,
  "new Date(Date.now() + 1000 * 60 * 60 * 24 * 45)"
);

if (!s.includes("super@jerseystore.com")) {
  s = s.replace(
    `await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@jerseystore.com",
      passwordHash,
      role: "ADMIN",
    },
  });`,
    `await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "super@jerseystore.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@jerseystore.com",
      passwordHash,
      role: "ADMIN",
    },
  });`
  );

  s = s.replace(
    `console.log(\`Seeded \${products.length} products + admin/fan users\`);
  console.log("Admin: admin@jerseystore.com / jersey123");
  console.log("User:  fan@jerseystore.com / jersey123");`,
    `console.log(\`Seeded \${products.length} products + staff/fan users\`);
  console.log("Super: super@jerseystore.com / jersey123");
  console.log("Admin: admin@jerseystore.com / jersey123");
  console.log("User:  fan@jerseystore.com / jersey123");`
  );
}

fs.writeFileSync("prisma/seed.ts", s);
console.log("seed staff + dates updated");
