import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// You (single master admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  mainBalance: numeric('main_balance', { precision: 12, scale: 2 }).default('0'),
  cryptoBalance: numeric('crypto_balance', { precision: 16, scale: 8 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Agent army (each = one outlet account)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  outlet: text('outlet'),
  outletAccountLabel: text('outlet_account_label'),
  fundBalance: numeric('fund_balance', { precision: 12, scale: 2 }).default('0'),
  status: text('status').default('idle'),
  cardsBought: integer('cards_bought').default(0),
  totalSpent: numeric('total_spent', { precision: 12, scale: 2 }).default('0'),
  lastActive: timestamp('last_active', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Encrypted outlet credentials
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentCredentials = pgTable('agent_credentials', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  outlet: text('outlet').notNull(),
  loginEmail: text('login_email'),
  loginPasswordEncrypted: text('login_password_encrypted'),
  apiKeyEncrypted: text('api_key_encrypted'),
  profileUrl: text('profile_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shopping missions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  cardName: text('card_name').notNull(),
  setName: text('set_name'),
  cardNumber: text('card_number'),
  maxPrice: numeric('max_price', { precision: 10, scale: 2 }),
  targetQuantity: integer('target_quantity').default(10),
  priority: text('priority').default('normal'),
  status: text('status').default('active'),
  fulfilled: integer('fulfilled').default(0),
  totalSpent: numeric('total_spent', { precision: 12, scale: 2 }).default('0'),
  sources: text('sources').default('tcgplayer,pokemoncenter,ebay'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Agent-to-campaign assignments
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const campaignAgents = pgTable(
  'campaign_agents',
  {
    id: serial('id').primaryKey(),
    campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
    agentId: integer('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
    isLead: boolean('is_lead').default(false),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueAssignment: uniqueIndex('idx_unique_campaign_agent').on(table.campaignId, table.agentId),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cards you've acquired
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  cardName: text('card_name').notNull(),
  setName: text('set_name').notNull(),
  cardNumber: text('card_number'),
  rarity: text('rarity'),
  condition: text('condition'),
  purchasePrice: numeric('purchase_price', { precision: 10, scale: 2 }).notNull(),
  marketPrice: numeric('market_price', { precision: 10, scale: 2 }),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  imageUrl: text('image_url'),
  tcgplayerId: text('tcgplayer_id'),
  acquiredBy: integer('acquired_by').references(() => agents.id),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  sourceOutlet: text('source_outlet'),
  status: text('status').default('inventory'),
  acquiredAt: timestamp('acquired_at', { withTimezone: true }).defaultNow(),
  soldAt: timestamp('sold_at', { withTimezone: true }),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shop storefront listings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const shopListings = pgTable('shop_listings', {
  id: serial('id').primaryKey(),
  inventoryId: integer('inventory_id').references(() => inventory.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  condition: text('condition'),
  images: jsonb('images'),
  status: text('status').default('active'),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  soldAt: timestamp('sold_at', { withTimezone: true }),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Customer orders
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  shopListingId: integer('shop_listing_id').references(() => shopListings.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'),
  paymentId: text('payment_id'),
  status: text('status').default('pending'),
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Your deposits (funding the war chest)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const deposits = pgTable('deposits', {
  id: serial('id').primaryKey(),
  method: text('method'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  providerPaymentId: text('provider_payment_id'),
  walletAddress: text('wallet_address'),
  txHash: text('tx_hash'),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// All money movement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  type: text('type'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  source: text('source'),
  fromEntity: text('from_entity'),
  toEntity: text('to_entity'),
  referenceId: text('reference_id'),
  campaignId: integer('campaign_id').references(() => campaigns.id),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Proxy per agent (critical: no shared IPs)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentProxies = pgTable('agent_proxies', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id')
    .references(() => agents.id, { onDelete: 'set null' })
    .unique(),
  proxyType: text('proxy_type'),
  proxyUrl: text('proxy_url').notNull(),
  provider: text('provider'),
  isActive: boolean('is_active').default(true),
  lastTested: timestamp('last_tested', { withTimezone: true }),
  testPassed: boolean('test_passed'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Outlet session state
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentSessions = pgTable(
  'agent_sessions',
  {
    id: serial('id').primaryKey(),
    agentId: integer('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
    outlet: text('outlet').notNull(),
    sessionData: text('session_data'),
    loggedIn: boolean('logged_in').default(false),
    lastRefreshed: timestamp('last_refreshed', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueSession: uniqueIndex('idx_unique_agent_outlet').on(table.agentId, table.outlet),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2-per-account limit enforcement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const agentCardLimits = pgTable(
  'agent_card_limits',
  {
    id: serial('id').primaryKey(),
    agentId: integer('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
    cardName: text('card_name').notNull(),
    setName: text('set_name'),
    purchasedCount: integer('purchased_count').default(0),
    maxAllowed: integer('max_allowed').default(2),
    reachedLimit: boolean('reached_limit').default(false),
  },
  (table) => ({
    uniqueCardLimit: uniqueIndex('idx_unique_agent_card').on(table.agentId, table.cardName, table.setName),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Full audit trail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    agentId: integer('agent_id').references(() => agents.id),
    campaignId: integer('campaign_id').references(() => campaigns.id),
    eventType: text('event_type').notNull(),
    level: text('level').default('info'),
    message: text('message').notNull(),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    agentIdx: index('idx_audit_agent').on(table.agentId, table.createdAt),
    campaignIdx: index('idx_audit_campaign').on(table.campaignId, table.createdAt),
  }),
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Condition disputes / returns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const conditionDisputes = pgTable('condition_disputes', {
  id: serial('id').primaryKey(),
  inventoryId: integer('inventory_id').references(() => inventory.id, { onDelete: 'cascade' }),
  listedCondition: text('listed_condition').notNull(),
  receivedCondition: text('received_condition').notNull(),
  status: text('status').default('open'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shipping labels
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const shippingLabels = pgTable('shipping_labels', {
  id: serial('id').primaryKey(),
  shopListingId: integer('shop_listing_id').references(() => shopListings.id, { onDelete: 'cascade' }),
  orderId: integer('order_id').references(() => orders.id),
  carrier: text('carrier'),
  service: text('service'),
  trackingNumber: text('tracking_number'),
  labelUrl: text('label_url'),
  cost: numeric('cost', { precision: 6, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scraped outlet listings
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const outletListings = pgTable('outlet_listings', {
  id: serial('id').primaryKey(),
  cardName: text('card_name').notNull(),
  setName: text('set_name'),
  outlet: text('outlet').notNull(),
  outletListingUrl: text('outlet_listing_url'),
  price: numeric('price', { precision: 10, scale: 2 }),
  seller: text('seller'),
  condition: text('condition'),
  inStock: boolean('in_stock').default(true),
  listingId: text('listing_id'),
  firstSeen: timestamp('first_seen', { withTimezone: true }).defaultNow(),
  lastSeen: timestamp('last_seen', { withTimezone: true }).defaultNow(),
});
