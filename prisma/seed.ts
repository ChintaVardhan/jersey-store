import { PrismaClient, Sport, Edition, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    slug: "argentina-home-jersey-fan-edition",
    image: "/products/argentina-home-jersey-fan-edition.jpg",
    name: "Argentina Home Jersey",
    description:
      "Sky-blue stripes, matchday energy. Fan Edition cut with breathable mesh — search-ready Argentina home jersey vibes for every Gen Z pitch night.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Argentina",
    priceInr: 1499,
    priceUsd: 29,
    compareAtInr: 1999,
    featured: true,
    isDrop: true,
    colors: JSON.stringify(["#74ACDF", "#FFFFFF"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#74ACDF", secondary: "#FFFFFF", accent: "#FFFFFF" }),
    searchable: "argentina home jersey messi football kit sky blue stripes",
  },
  {
    slug: "brazil-home-jersey-master-copy",
    image: "/products/brazil-home-jersey-master-copy.jpg",
    name: "Brazil Home Jersey",
    description:
      "Canary yellow classic. Master Copy finish with premium crest embroidery feel — the Brazil home jersey everyone searches for.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "Brazil",
    priceInr: 1899,
    priceUsd: 36,
    compareAtInr: 2499,
    featured: true,
    isDrop: true,
    colors: JSON.stringify(["#FFDF00", "#009C3B"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#FFDF00", secondary: "#009C3B", accent: "#002776" }),
    searchable: "brazil home jersey pele neymar football shirt yellow",
  },
  {
    slug: "india-cricket-jersey-custom-name",
    image: "/products/india-cricket-jersey-custom-name.jpg",
    name: "India Cricket Jersey — Custom Name",
    description:
      "Team India blue, built for stadium nights. Custom Build — add your name & number. Perfect for “India cricket jersey custom name” search intent.",
    sport: Sport.CRICKET,
    edition: Edition.CUSTOM_BUILD,
    team: "India",
    priceInr: 1699,
    priceUsd: 32,
    compareAtInr: 2199,
    featured: true,
    isDrop: false,
    colors: JSON.stringify(["#0033A0", "#FF9933"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#0033A0", secondary: "#FF9933", accent: "#FFFFFF" }),
    searchable: "india cricket jersey custom name dhoni kohli blue kit",
  },
  {
    slug: "real-madrid-home-jersey-fan-edition",
    image: "/products/real-madrid-home-jersey-fan-edition.jpg",
    name: "Real Madrid Home Jersey",
    description: "All-white regal energy. Fan Edition Real Madrid home jersey — clean, loud, match-ready.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Real Madrid",
    priceInr: 1599,
    priceUsd: 31,
    featured: true,
    colors: JSON.stringify(["#FFFFFF", "#FEBE10"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#F5F5F5", secondary: "#FEBE10", accent: "#00529F" }),
    searchable: "real madrid home jersey white football kit",
  },
  {
    slug: "barcelona-home-jersey-master-copy",
    image: "/products/barcelona-home-jersey-master-copy.jpg",
    name: "Barcelona Home Jersey",
    description: "Blaugrana stripes. Master Copy Barcelona home — premium feel for culé nights.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "Barcelona",
    priceInr: 1899,
    priceUsd: 36,
    featured: false,
    colors: JSON.stringify(["#A50044", "#004D98"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#A50044", secondary: "#004D98", accent: "#FFED02" }),
    searchable: "barcelona home jersey blaugrana football shirt",
  },
  {
    slug: "manchester-united-home-jersey",
    image: "/products/manchester-united-home-jersey.jpg",
    name: "Manchester United Home Jersey",
    description: "Theatre of Dreams red. Fan Edition United home jersey for every Old Trafford scroll.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Manchester United",
    priceInr: 1499,
    priceUsd: 29,
    featured: false,
    colors: JSON.stringify(["#DA291C", "#000000"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#DA291C", secondary: "#FFFFFF", accent: "#000000" }),
    searchable: "manchester united home jersey red football kit",
  },
  {
    slug: "portugal-home-jersey-fan-edition",
    image: "/products/portugal-home-jersey-fan-edition.jpg",
    name: "Portugal Home Jersey",
    description: "Verde e vermelho energy. Portugal home Fan Edition — Ronaldo-era search heat.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Portugal",
    priceInr: 1499,
    priceUsd: 29,
    featured: true,
    isDrop: true,
    colors: JSON.stringify(["#FF0000", "#006600"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#CE1126", secondary: "#006600", accent: "#FFD700" }),
    searchable: "portugal home jersey ronaldo football shirt red",
  },
  {
    slug: "england-cricket-odi-jersey",
    image: "/products/england-cricket-odi-jersey.jpg",
    name: "England Cricket ODI Jersey",
    description: "Navy ODI classic. England cricket jersey for ashes energy and street fits.",
    sport: Sport.CRICKET,
    edition: Edition.FAN_EDITION,
    team: "England",
    priceInr: 1599,
    priceUsd: 31,
    featured: false,
    colors: JSON.stringify(["#1A1A5E", "#CE1124"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#1A1A5E", secondary: "#CE1124", accent: "#FFFFFF" }),
    searchable: "england cricket odi jersey navy kit",
  },
  {
    slug: "australia-cricket-jersey-master-copy",
    image: "/products/australia-cricket-jersey-master-copy.jpg",
    name: "Australia Cricket Jersey",
    description: "Baggy green Master Copy. Australia cricket jersey with tournament-ready finish.",
    sport: Sport.CRICKET,
    edition: Edition.MASTER_COPY,
    team: "Australia",
    priceInr: 1799,
    priceUsd: 34,
    featured: true,
    colors: JSON.stringify(["#FFD100", "#00843D"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#FFD100", secondary: "#00843D", accent: "#000000" }),
    searchable: "australia cricket jersey baggy green yellow kit",
  },
  {
    slug: "psg-home-jersey-fan-edition",
    image: "/products/psg-home-jersey-fan-edition.jpg",
    name: "PSG Home Jersey",
    description: "Paris nights in navy & red. PSG Fan Edition — city-kit heat for the feed.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "PSG",
    priceInr: 1599,
    priceUsd: 31,
    featured: false,
    colors: JSON.stringify(["#004170", "#DA291C"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#004170", secondary: "#DA291C", accent: "#FFFFFF" }),
    searchable: "psg home jersey paris saint germain football kit",
  },
  {
    slug: "retro-football-shirt-90s-drop",
    image: "/products/retro-football-shirt-90s-drop.jpg",
    name: "Retro Football Shirt 90s Drop",
    description: "Throwback silhouettes, loud collars. Limited retro football shirt drop — Gen Z nostalgia bait.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "Retro Select",
    priceInr: 2099,
    priceUsd: 39,
    compareAtInr: 2699,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    colors: JSON.stringify(["#111111", "#C6FF3D"]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    imageColors: JSON.stringify({ primary: "#1a1a1a", secondary: "#C6FF3D", accent: "#FFFFFF" }),
    searchable: "retro football shirt 90s vintage kit drop",
  },
  {
    slug: "mi-ipl-style-cricket-jersey",
    image: "/products/mi-ipl-style-cricket-jersey.jpg",
    name: "Mumbai Blues Cricket Jersey",
    description: "IPL-night energy. Mumbai Blues cricket jersey — custom name ready for the stands.",
    sport: Sport.CRICKET,
    edition: Edition.CUSTOM_BUILD,
    team: "Mumbai Blues",
    priceInr: 1599,
    priceUsd: 31,
    featured: true,
    colors: JSON.stringify(["#004BA0", "#D1AB3E"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#004BA0", secondary: "#D1AB3E", accent: "#FFFFFF" }),
    searchable: "mumbai indians ipl cricket jersey custom name blue",
  },
  {
    slug: "csk-ipl-style-cricket-jersey",
    image: "/products/csk-ipl-style-cricket-jersey.jpg",
    name: "Chennai Super Yellows Jersey",
    description: "Whistle podu yellow. Custom Build CSK-vibe cricket jersey with name & number.",
    sport: Sport.CRICKET,
    edition: Edition.CUSTOM_BUILD,
    team: "Chennai Super Yellows",
    priceInr: 1599,
    priceUsd: 31,
    featured: false,
    colors: JSON.stringify(["#FDB913", "#0081C8"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#FDB913", secondary: "#0081C8", accent: "#000000" }),
    searchable: "chennai super kings csk cricket jersey yellow custom",
  },
  {
    slug: "germany-home-jersey-fan-edition",
    image: "/products/germany-home-jersey-fan-edition.jpg",
    name: "Germany Home Jersey",
    description: "White & black precision. Germany home Fan Edition — World Cup search staple.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Germany",
    priceInr: 1499,
    priceUsd: 29,
    featured: false,
    colors: JSON.stringify(["#FFFFFF", "#000000"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#F2F2F2", secondary: "#000000", accent: "#DD0000" }),
    searchable: "germany home jersey white football kit world cup",
  },
  {
    slug: "france-home-jersey-master-copy",
    image: "/products/france-home-jersey-master-copy.jpg",
    name: "France Home Jersey",
    description: "Bleu de France Master Copy. Premium France home jersey with tournament detailing.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "France",
    priceInr: 1899,
    priceUsd: 36,
    featured: true,
    colors: JSON.stringify(["#002654", "#ED2939"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#002654", secondary: "#FFFFFF", accent: "#ED2939" }),
    searchable: "france home jersey mbappe blue football kit",
  },
  {
    slug: "pakistan-cricket-jersey-custom",
    image: "/products/pakistan-cricket-jersey-custom.jpg",
    name: "Pakistan Cricket Jersey — Custom",
    description: "Green crescents energy. Custom Build Pakistan cricket jersey — name & number your way.",
    sport: Sport.CRICKET,
    edition: Edition.CUSTOM_BUILD,
    team: "Pakistan",
    priceInr: 1699,
    priceUsd: 32,
    featured: false,
    colors: JSON.stringify(["#01411C", "#FFFFFF"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#01411C", secondary: "#FFFFFF", accent: "#FFD700" }),
    searchable: "pakistan cricket jersey custom name green kit",
  },
  {
    slug: "liverpool-home-jersey-fan-edition",
    image: "/products/liverpool-home-jersey-fan-edition.jpg",
    name: "Liverpool Home Jersey",
    description: "You'll Never Walk Alone red. Liverpool Fan Edition for Anfield-core fits.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Liverpool",
    priceInr: 1499,
    priceUsd: 29,
    featured: false,
    colors: JSON.stringify(["#C8102E", "#00B2A9"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#C8102E", secondary: "#FFFFFF", accent: "#00B2A9" }),
    searchable: "liverpool home jersey red football kit ynwa",
  },
  {
    slug: "south-africa-cricket-jersey",
    image: "/products/south-africa-cricket-jersey.jpg",
    name: "South Africa Cricket Jersey",
    description: "Protea green Master Copy. South Africa cricket jersey for world cup weekends.",
    sport: Sport.CRICKET,
    edition: Edition.MASTER_COPY,
    team: "South Africa",
    priceInr: 1799,
    priceUsd: 34,
    featured: false,
    colors: JSON.stringify(["#007A4D", "#FFB81C"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#007A4D", secondary: "#FFB81C", accent: "#000000" }),
    searchable: "south africa cricket jersey protea green kit",
  },
  // ——— FIFA World Cup 2026 (USA · Canada · Mexico) demo drop ———
  {
    slug: "fifa-world-cup-2026-official-fan-jersey",
    image: "/products/fifa-world-cup-2026-official-fan-jersey.jpg",
    name: "FIFA World Cup 2026 Official Fan Jersey",
    description:
      "Tournament heat for USA–Canada–Mexico 2026. Fan Edition host-event jersey with lime-drop energy — search “World Cup 2026 jersey”.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "FIFA World Cup 2026",
    priceInr: 2199,
    priceUsd: 42,
    compareAtInr: 2799,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#C6FF3D", "#111111"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#111111", secondary: "#C6FF3D", accent: "#FFFFFF" }),
    searchable: "fifa world cup 2026 official fan jersey tournament kit usa canada mexico",
  },
  {
    slug: "usa-home-jersey-world-cup-2026",
    image: "/products/usa-home-jersey-world-cup-2026.jpg",
    name: "USA Home Jersey — World Cup 2026",
    description:
      "Stars & stripes host-nation energy. USA home Fan Edition built for World Cup 2026 matchdays across American stadiums.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "USA",
    priceInr: 1899,
    priceUsd: 36,
    compareAtInr: 2399,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#FFFFFF", "#002868"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#FFFFFF", secondary: "#BF0A30", accent: "#002868" }),
    searchable: "usa home jersey world cup 2026 usmnt football kit america",
  },
  {
    slug: "mexico-home-jersey-world-cup-2026",
    image: "/products/mexico-home-jersey-world-cup-2026.jpg",
    name: "Mexico Home Jersey — World Cup 2026",
    description:
      "El Tri green for the 2026 hosts. Master Copy Mexico home — Azteca-to-world-stage vibes.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "Mexico",
    priceInr: 1999,
    priceUsd: 38,
    compareAtInr: 2499,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#006847", "#CE1126"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#006847", secondary: "#CE1126", accent: "#FFFFFF" }),
    searchable: "mexico home jersey world cup 2026 el tri green football kit",
  },
  {
    slug: "canada-home-jersey-world-cup-2026",
    image: "/products/canada-home-jersey-world-cup-2026.jpg",
    name: "Canada Home Jersey — World Cup 2026",
    description:
      "Maple red host kit. Canada home Fan Edition for World Cup 2026 — north-side stadium nights.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "Canada",
    priceInr: 1899,
    priceUsd: 36,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#FF0000", "#FFFFFF"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#FF0000", secondary: "#FFFFFF", accent: "#000000" }),
    searchable: "canada home jersey world cup 2026 maple football kit",
  },
  {
    slug: "argentina-away-jersey-world-cup-2026",
    image: "/products/argentina-away-jersey-world-cup-2026.jpg",
    name: "Argentina Away Jersey — World Cup 2026",
    description:
      "Champions carry the stripe into 2026. Argentina away Master Copy — World Cup title-defense heat.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "Argentina",
    priceInr: 2099,
    priceUsd: 40,
    compareAtInr: 2699,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#001F5B", "#74ACDF"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#001F5B", secondary: "#74ACDF", accent: "#FFFFFF" }),
    searchable: "argentina away jersey world cup 2026 messi football kit navy",
  },
  {
    slug: "brazil-world-cup-2026-special-edition",
    image: "/products/brazil-world-cup-2026-special-edition.jpg",
    name: "Brazil World Cup 2026 Special Edition",
    description:
      "Amarelo special for the 2026 cycle. Limited Master Copy Brazil WC jersey — drop culture yellow.",
    sport: Sport.FOOTBALL,
    edition: Edition.MASTER_COPY,
    team: "Brazil",
    priceInr: 2199,
    priceUsd: 42,
    compareAtInr: 2899,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#FFDF00", "#009C3B"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#FFDF00", secondary: "#002776", accent: "#009C3B" }),
    searchable: "brazil world cup 2026 special edition jersey yellow football kit",
  },
  {
    slug: "england-world-cup-2026-home-jersey",
    image: "/products/england-world-cup-2026-home-jersey.jpg",
    name: "England Home Jersey — World Cup 2026",
    description:
      "Three Lions white for USA–Canada–Mexico. England WC 2026 Fan Edition — classic home, tournament print.",
    sport: Sport.FOOTBALL,
    edition: Edition.FAN_EDITION,
    team: "England",
    priceInr: 1899,
    priceUsd: 36,
    featured: false,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#FFFFFF", "#CF081F"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#F7F7F7", secondary: "#CF081F", accent: "#00247D" }),
    searchable: "england home jersey world cup 2026 three lions football kit",
  },
  {
    slug: "host-cities-world-cup-2026-custom-jersey",
    image: "/products/host-cities-world-cup-2026-custom-jersey.jpg",
    name: "WC 2026 Host Cities Custom Jersey",
    description:
      "Custom Build celebrating 2026 host cities across USA, Canada & Mexico. Add your name, number, city patch.",
    sport: Sport.FOOTBALL,
    edition: Edition.CUSTOM_BUILD,
    team: "World Cup 2026 Hosts",
    priceInr: 2299,
    priceUsd: 44,
    featured: true,
    isDrop: true,
    dropEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    colors: JSON.stringify(["#002868", "#C6FF3D"]),
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    imageColors: JSON.stringify({ primary: "#002868", secondary: "#C6FF3D", accent: "#BF0A30" }),
    searchable: "world cup 2026 host cities custom jersey usa canada mexico name number",
  },
];

async function main() {
  console.log("Seeding Jersey Store...");

  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.savedCustom.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("jersey123", 10);

  await prisma.user.create({
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
  });

  await prisma.user.create({
    data: {
      name: "Demo Fan",
      email: "fan@jerseystore.com",
      passwordHash,
      role: "USER",
    },
  });

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  const coupons: {
    code: string;
    type: CouponType;
    value: number;
    minOrderInr: number;
    maxDiscountInr: number | null;
    usageLimit: number;
  }[] = [
    { code: "MATCHDAY10", type: CouponType.PERCENT, value: 10, minOrderInr: 2499, maxDiscountInr: 500, usageLimit: 500 },
    { code: "KICKOFF200", type: CouponType.FLAT, value: 200, minOrderInr: 1999, maxDiscountInr: null, usageLimit: 250 },
    { code: "FIRSTKIT", type: CouponType.PERCENT, value: 15, minOrderInr: 1499, maxDiscountInr: 400, usageLimit: 1000 },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({ data: coupon });
  }

  console.log(`Seeded ${products.length} products, ${coupons.length} coupons + staff/fan users`);
  console.log("Super: super@jerseystore.com / jersey123");
  console.log("Admin: admin@jerseystore.com / jersey123");
  console.log("User:  fan@jerseystore.com / jersey123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
