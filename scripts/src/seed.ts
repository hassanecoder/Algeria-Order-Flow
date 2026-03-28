import { db } from "@workspace/db";
import {
  ordersTable,
  customersTable,
  agentsTable,
  productsTable,
  settingsTable,
} from "@workspace/db/schema";

const WILAYAS = [
  "Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif", "Sidi Bel Abbès",
  "Tizi Ouzou", "Béjaïa", "Tlemcen", "Biskra", "Boumerdès", "Tipaza", "Médéa",
  "Mostaganem", "Skikda", "Guelma", "El Tarf", "Souk Ahras",
];

const COMMUNES: Record<string, string[]> = {
  "Alger": ["Bab El Oued", "El Harrach", "Hussein Dey", "Bir Mourad Raïs", "Kouba"],
  "Oran": ["Bir El Djir", "Es Senia", "Arzew", "Ain Turck", "Mers El Kebir"],
  "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane", "Zighoud Youcef", "Ibn Ziad"],
  "Annaba": ["El Bouni", "El Hadjar", "Berrahal", "Seraïdi", "Chetaïbi"],
  "Blida": ["Boufarik", "Meftah", "Larbaa", "Bougara", "Chiffa"],
  "Sétif": ["El Eulma", "Ain Oulmane", "Bougaa", "Ain Azel", "Djemila"],
  "Tizi Ouzou": ["Draa Ben Khedda", "Boghni", "Azazga", "Ouacifs", "Maatkas"],
  "Béjaïa": ["Akbou", "Tazmalt", "Sidi Aich", "Kherrata", "Amizour"],
  "Batna": ["Barika", "Arris", "Ain Touta", "Tazoult", "N'Gaous"],
};

function getCommune(wilaya: string): string {
  const communes = COMMUNES[wilaya] || [`Centre ${wilaya}`];
  return communes[Math.floor(Math.random() * communes.length)];
}

const ALGERIAN_FIRST_NAMES = ["Mohamed", "Ahmed", "Ali", "Omar", "Youcef", "Karim", "Samir",
  "Fatima", "Amina", "Sara", "Nadia", "Lina", "Rania", "Meriem", "Houda", "Amel", "Sonia",
  "Hamza", "Riadh", "Walid", "Bilal", "Rachid", "Hocine", "Mustapha", "Abdelkader"];

const ALGERIAN_LAST_NAMES = ["Benali", "Boudjenah", "Meziani", "Hamidi", "Belkacem", "Khelifi",
  "Mansouri", "Brahimi", "Bensaid", "Bouazza", "Rahmani", "Zerrouk", "Mahmoudi", "Cherif",
  "Hadj", "Belaidi", "Benkhelifa", "Belmimoun", "Oukaci", "Merzougui"];

function randomName() {
  const fn = ALGERIAN_FIRST_NAMES[Math.floor(Math.random() * ALGERIAN_FIRST_NAMES.length)];
  const ln = ALGERIAN_LAST_NAMES[Math.floor(Math.random() * ALGERIAN_LAST_NAMES.length)];
  return `${fn} ${ln}`;
}

function randomPhone() {
  const prefixes = ["05", "06", "07"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const rest = Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
  return `${prefix}${rest}`;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 14) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

const PRODUCTS_DATA = [
  { name: "Cafetière Électrique Deluxe", sku: "CAF-001", defaultPrice: 3500, category: "Électroménager", stock: 45 },
  { name: "Blender Professionnel 800W", sku: "BLE-002", defaultPrice: 5800, category: "Électroménager", stock: 32 },
  { name: "Robot Aspirateur Automatique", sku: "ROB-003", defaultPrice: 18500, category: "Électroménager", stock: 15 },
  { name: "Chaussures de Sport Homme", sku: "CHU-004", defaultPrice: 4200, category: "Mode", stock: 78 },
  { name: "Sac à Main Femme Cuir", sku: "SAC-005", defaultPrice: 6900, category: "Mode", stock: 25 },
  { name: "Montre Homme Élégante", sku: "MON-006", defaultPrice: 12000, category: "Accessoires", stock: 20 },
  { name: "Parfum Homme 100ml", sku: "PAR-007", defaultPrice: 3800, category: "Beauté", stock: 60 },
  { name: "Crème Visage Hydratante", sku: "CRE-008", defaultPrice: 1500, category: "Beauté", stock: 120 },
  { name: "Huile d'Argan Pure 100ml", sku: "HUI-009", defaultPrice: 2200, category: "Beauté", stock: 85 },
  { name: "Écouteurs Bluetooth 5.0", sku: "ECO-010", defaultPrice: 2900, category: "Électronique", stock: 55 },
  { name: "Batterie Externe 20000mAh", sku: "BAT-011", defaultPrice: 3200, category: "Électronique", stock: 40 },
  { name: "Coque iPhone Magnétique", sku: "COQ-012", defaultPrice: 800, category: "Électronique", stock: 200 },
  { name: "Vêtement Sport Femme", sku: "VET-013", defaultPrice: 3600, category: "Mode", stock: 65 },
  { name: "Supplément Protéine Whey 1kg", sku: "PRO-014", defaultPrice: 4500, category: "Santé", stock: 30 },
  { name: "Ensemble Cuisine Inox 8 pièces", sku: "ENS-015", defaultPrice: 8900, category: "Cuisine", stock: 18 },
];

const STATUSES = ["pending", "confirmed", "in_transit", "delivered", "returned", "cancelled"] as const;
const STATUS_WEIGHTS = [0.15, 0.1, 0.15, 0.45, 0.1, 0.05];

function weightedStatus(): string {
  const r = Math.random();
  let cumSum = 0;
  for (let i = 0; i < STATUS_WEIGHTS.length; i++) {
    cumSum += STATUS_WEIGHTS[i];
    if (r <= cumSum) return STATUSES[i];
  }
  return "delivered";
}

function generateOrderNumber(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CMD-${year}${month}${day}-${rand}`;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(ordersTable);
  await db.delete(customersTable);
  await db.delete(agentsTable);
  await db.delete(productsTable);
  await db.delete(settingsTable);

  // Seed settings
  await db.insert(settingsTable).values({
    companyName: "AlgéShop Express",
    companyPhone: "0550123456",
    defaultShippingCost: "500",
    currency: "DZD",
    lowStockThreshold: 10,
    autoConfirmOrders: false,
  });
  console.log("✓ Settings seeded");

  // Seed products
  const products = await db.insert(productsTable).values(
    PRODUCTS_DATA.map(p => ({
      name: p.name,
      sku: p.sku,
      defaultPrice: String(p.defaultPrice),
      stock: p.stock,
      category: p.category,
      active: true,
    }))
  ).returning();
  console.log(`✓ ${products.length} products seeded`);

  // Seed agents
  const agentsData = [
    { name: "Karim Benali", phone: "0555101010", wilaya: "Alger", status: "active" },
    { name: "Said Brahimi", phone: "0555202020", wilaya: "Oran", status: "active" },
    { name: "Hocine Meziani", phone: "0555303030", wilaya: "Constantine", status: "active" },
    { name: "Yacine Hamidi", phone: "0555404040", wilaya: "Annaba", status: "active" },
    { name: "Omar Khelifi", phone: "0555505050", wilaya: "Blida", status: "active" },
    { name: "Rachid Mansouri", phone: "0555606060", wilaya: "Sétif", status: "active" },
    { name: "Bilal Zerrouk", phone: "0555707070", wilaya: "Tizi Ouzou", status: "active" },
    { name: "Walid Boudjenah", phone: "0555808080", wilaya: "Béjaïa", status: "inactive" },
  ];
  const agents = await db.insert(agentsTable).values(agentsData).returning();
  console.log(`✓ ${agents.length} agents seeded`);

  // Seed customers
  const customersData = Array.from({ length: 80 }, () => {
    const wilaya = WILAYAS[Math.floor(Math.random() * WILAYAS.length)];
    return {
      name: randomName(),
      phone: randomPhone(),
      phone2: Math.random() > 0.6 ? randomPhone() : null,
      wilaya,
      commune: getCommune(wilaya),
      address: `Rue ${Math.floor(Math.random() * 50) + 1}, Cité ${["El Moudjahid", "Les Orangers", "El Wiam", "Beau Fraisier", "Les Pins"][Math.floor(Math.random() * 5)]}`,
      notes: null,
    };
  });
  const customers = await db.insert(customersTable).values(customersData).returning();
  console.log(`✓ ${customers.length} customers seeded`);

  // Seed orders (200 orders over last 60 days)
  const ordersData = Array.from({ length: 200 }, (_, i) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const agent = Math.random() > 0.3 ? agents[Math.floor(Math.random() * agents.length)] : null;
    const status = weightedStatus();
    const quantity = Math.floor(Math.random() * 3) + 1;
    const unitPrice = Number(product.defaultPrice) * (0.9 + Math.random() * 0.2);
    const shippingCost = [500, 600, 700, 800, 1000][Math.floor(Math.random() * 5)];
    const totalAmount = quantity * unitPrice + shippingCost;
    const createdAt = randomDate(60);
    const orderNumber = generateOrderNumber(createdAt);

    return {
      orderNumber: `${orderNumber}-${i.toString().padStart(3, "0")}`,
      status,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerPhone2: customer.phone2,
      wilaya: customer.wilaya,
      commune: customer.commune,
      address: customer.address,
      productName: product.name,
      productId: product.id,
      quantity,
      unitPrice: String(Math.round(unitPrice)),
      totalAmount: String(Math.round(totalAmount)),
      shippingCost: String(shippingCost),
      notes: Math.random() > 0.7 ? "Livraison urgente" : null,
      agentId: agent?.id ?? null,
      customerId: customer.id,
      createdAt,
      updatedAt: createdAt,
      deliveredAt: status === "delivered" ? new Date(createdAt.getTime() + 86400000 * (Math.floor(Math.random() * 5) + 1)) : null,
    };
  });

  await db.insert(ordersTable).values(ordersData);
  console.log(`✓ ${ordersData.length} orders seeded`);
  console.log("\n✅ Database seeded successfully!");
}

main().catch(console.error).finally(() => process.exit(0));
