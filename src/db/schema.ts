import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// You (single master admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  displayName: text('display_name'),
  mainBalance: real('main_balance').default(0),
  cryptoBalance: real('crypto_balance').default(0),
  createdAt: text('created_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Agent army (each = one outlet account)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agents = sqliteTable('agents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  outlet: text('outlet'),
  outletAccountLabel: text('outlet_account_label'),
  fundBalance: real('fund_balance').default(0),
  status: text('status').default('idle'),
  cardsBought: integer('cards_bought').default(0),
  totalSpent: real('total_spent').default(0),
  lastActive: text('last_active'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Encrypted outlet credentials
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentCredentials = sqliteTable('agent_credentials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id').references(() => agents.id, {
    onDelete: 'cascade',
  }),
  outlet: text('outlet').notNull(),
  loginEmail: text('login_email'),
  loginPasswordEncrypted: text('login_password_encrypted'),
  apiKeyEncrypted: text('api_key_encrypted'),
  profileUrl: text('profile_url'),
  createdAt: text('created_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shopping missions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const campaigns = sqliteTable('campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  cardName: text('card_name').notNull(),
  setName: text('set_name'),
  cardNumber: text('card_number'),
  maxPrice: real('max_price'),
  targetQuantity: integer('target_quantity').default(10),
  priority: text('priority').default('normal'),
  status: text('status').default('active'),
  fulfilled: integer('fulfilled').default(0),
  totalSpent: real('total_spent').default(0),
  sources: text('sources').default('tcgplayer,pokemoncenter,ebay'),
  notes: text('notes'),
  createdAt: text('created_at').default("datetime('now')"),
  updatedAt: text('updated_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Agent-to-campaign assignments
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const campaignAgents = sqliteTable(
  'campaign_agents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    campaignId: integer('campaign_id').references(() => campaigns.id, {
      onDelete: 'cascade',
    }),
    agentId: integer('agent_id').references(() => agents.id, {
      onDelete: 'cascade',
    }),
    isLead: integer('is_lead', { mode: 'boolean' }).default(false),
    assignedAt: text('assigned_at').default("datetime('now')"),
  },
  (table) => ({
    uniqueAssignment: uniqueIndex('idx_unique_campaign_agent').on(
      table.campaignId,
      table.agentId,
    ),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cards you've acquired
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardName: text('card_name').notNull(),
  setName: text('set_name').notNull(),
  cardNumber: text('card_number'),
  rarity: text('rarity'),
  condition: text('condition'),
  purchasePrice: real('purchase_price').notNull(),
  marketPrice: real('market_price'),
  salePrice: real('sale_price'),
  imageUrl: text('image_url'),
  tcgplayerId: text('tcgplayer_id'),
  acquiredBy: integer('acquired_by').references(() => agents.id),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  sourceOutlet: text('source_outlet'),
  status: text('status').default('inventory'),
  acquiredAt: text('acquired_at').default("datetime('now')"),
  soldAt: text('sold_at'),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shop storefront listings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const shopListings = sqliteTable('shop_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inventoryId: integer('inventory_id').references(() => inventory.id, {
    onDelete: 'cascade',
  }),
  title: text('title').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  condition: text('condition'),
  images: text('images'),
  status: text('status').default('active'),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  createdAt: text('created_at').default("datetime('now')"),
  soldAt: text('sold_at'),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Customer orders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shopListingId: integer('shop_listing_id').references(() => shopListings.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  total: real('total').notNull(),
  paymentMethod: text('payment_method'),
  paymentId: text('payment_id'),
  status: text('status').default('pending'),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  createdAt: text('created_at').default("datetime('now')"),
  updatedAt: text('updated_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Your deposits (funding the war chest)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const deposits = sqliteTable('deposits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  method: text('method'),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  providerPaymentId: text('provider_payment_id'),
  walletAddress: text('wallet_address'),
  txHash: text('tx_hash'),
  confirmedAt: text('confirmed_at'),
  createdAt: text('created_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// All money movement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type'),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  source: text('source'),
  fromEntity: text('from_entity'),
  toEntity: text('to_entity'),
  referenceId: text('reference_id'),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  description: text('description'),
  createdAt: text('created_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Proxy per agent (critical: no shared IPs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentProxies = sqliteTable('agent_proxies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id')
    .references(() => agents.id, { onDelete: 'set null' })
    .unique(),
  proxyType: text('proxy_type'),
  proxyUrl: text('proxy_url').notNull(),
  provider: text('provider'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastTested: text('last_tested'),
  testPassed: integer('test_passed', { mode: 'boolean' }),
  assignedAt: text('assigned_at').default("datetime('now')"),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Outlet session state
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentSessions = sqliteTable(
  'agent_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    agentId: integer('agent_id').references(() => agents.id, {
      onDelete: 'cascade',
    }),
    outlet: text('outlet').notNull(),
    sessionData: text('session_data'),
    loggedIn: integer('logged_in', { mode: 'boolean' }).default(false),
    lastRefreshed: text('last_refreshed'),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').default("datetime('now')"),
  },
  (table) => ({
    uniqueSession: uniqueIndex('idx_unique_agent_outlet').on(
      table.agentId,
      table.outlet,
    ),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2-per-account limit enforcement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentCardLimits = sqliteTable(
  'agent_card_limits',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    agentId: integer('agent_id').references(() => agents.id, {
      onDelete: 'cascade',
    }),
    cardName: text('card_name').notNull(),
    setName: text('set_name'),
    purchasedCount: integer('purchased_count').default(0),
    maxAllowed: integer('max_allowed').default(2),
    reachedLimit: integer('reached_limit', { mode: 'boolean' }).default(false),
  },
  (table) => ({
    uniqueCardLimit: uniqueIndex('idx_unique_agent_card').on(
      table.agentId,
      table.cardName,
      table.setName,
    ),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Full audit trail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    agentId: integer('agent_id').references(() => agents.id),
    campaignId: integer('campaign_id').references(() => campaigns.id),
    eventType: text('event_type').notNull(),
    level: text('level').default('info'),
    message: text('message').notNull(),
    metadata: text('metadata').default('{}'),
    createdAt: text('created_at').default("datetime('now')"),
  },
  (table) => ({
    agentIdx: index('idx_audit_agent').on(table.agentId, table.createdAt),
    campaignIdx: index('idx_audit_campaign').on(
      table.campaignId,
      table.createdAt,
    ),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Condition disputes / returns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const conditionDisputes = sqliteTable('condition_disputes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inventoryId: integer('inventory_id').references(() => inventory.id, {
    onDelete: 'cascade',
  }),
  listedCondition: text('listed_condition').notNull(),
  receivedCondition: text('received_condition').notNull(),
  status: text('status').default('open'),
  notes: text('notes'),
  createdAt: text('created_at').default("datetime('now')"),
  resolvedAt: text('resolved_at'),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shipping labels
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const shippingLabels = sqliteTable('shipping_labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shopListingId: integer('shop_listing_id').references(() => shopListings.id, {
    onDelete: 'cascade',
  }),
  orderId: integer('order_id').references(() => orders.id),
  carrier: text('carrier'),
  service: text('service'),
  trackingNumber: text('tracking_number'),
  labelUrl: text('label_url'),
  cost: real('cost'),
  createdAt: text('created_at').default("datetime('now')"),
  shippedAt: text('shipped_at'),
  deliveredAt: text('delivered_at'),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scraped outlet listings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const outletListings = sqliteTable('outlet_listings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cardName: text('card_name').notNull(),
  setName: text('set_name'),
  outlet: text('outlet').notNull(),
  outletListingUrl: text('outlet_listing_url'),
  price: real('price'),
  seller: text('seller'),
  condition: text('condition'),
  inStock: integer('in_stock', { mode: 'boolean' }).default(true),
  listingId: text('listing_id'),
  firstSeen: text('first_seen').default("datetime('now')"),
  lastSeen: text('last_seen').default("datetime('now')"),
});
