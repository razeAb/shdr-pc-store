import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { productRouter } from '../routes/productRoutes.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { productForViewer } from '../utils/productOwnership.js';

process.env.JWT_SECRET = 'local-test-only-secret';
process.env.PRODUCT_OWNER_EMAIL = 'owner@example.test';
const id = '507f1f77bcf86cd799439011';
let product;
const query = value => ({ select() { return this; }, lean: async () => value, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } });
User.findById = userId => query({ _id: userId, role: 'admin', email: userId === 'owner' ? 'owner@example.test' : 'other@example.test' });
Product.findById = () => query(structuredClone(product));
Product.findOne = () => query(structuredClone(product));
Product.exists = async () => ({ _id: id });
Product.findByIdAndUpdate = (_id, update) => {
  for (const [key, value] of Object.entries(update.$set)) {
    if (key.startsWith('ownerInfo.')) product.ownerInfo[key.split('.')[1]] = value;
    else product[key] = value;
  }
  return query(structuredClone(product));
};
Product.findOneAndUpdate = (filter, update) => {
  assert.deepEqual(filter.automationLocked, { $ne: true });
  if (product.automationLocked) return query(null);
  Object.assign(product, update);
  return query(structuredClone(product));
};
const app = express();
app.use(express.json());
app.use('/api/products', productRouter);
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const url = `http://127.0.0.1:${server.address().port}/api/products`;
async function request(path, body, who = 'owner', method = 'PATCH') {
  const response = await fetch(url + path, { method, headers: { 'Content-Type': 'application/json', ...(who ? { Authorization: `Bearer ${signToken({ userId: who, role: 'admin', email: 'owner@example.test' })}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, body: await response.json() };
}
test('owner-only data, atomic content lock, and independent stock updates', async () => {
  product = { _id: id, title: 'Original', price: 100, sku: 'AL-1', isActive: true, inStock: true, automationLocked: true, ownerInfo: { supplier: 'Supplier', purchaseCost: 60, costIncludesVat: true } };
  assert.equal(productForViewer(product).ownerInfo, undefined);
  const publicResult = await request(`/${id}`, undefined, null, 'GET');
  assert.equal(publicResult.status, 200);
  assert.equal(publicResult.body.ownerInfo, undefined);
  assert.equal(publicResult.body.automationLocked, undefined);
  assert.equal((await request(`/owner/${id}`, undefined, 'other', 'GET')).status, 403);
  assert.equal((await request(`/owner/${id}`, { purchaseCost: 1 }, 'other')).status, 403);
  assert.equal((await request(`/owner/${id}`, { price: 1 })).status, 400);
  assert.equal((await request(`/owner/${id}`, { purchaseCost: -1 })).status, 400);
  assert.equal((await request(`/${id}/edit`, { price: 200 })).status, 423);
  assert.equal((await request(`/${id}`, undefined, 'owner', 'DELETE')).status, 423);
  assert.equal((await request(`/${id}/toggle`, {})).status, 423);
  assert.equal((await request(`/${id}/stock`, { inStock: false, price: 1 })).status, 400);
  const stock = await request(`/${id}/stock`, { inStock: false });
  assert.equal(stock.status, 200);
  assert.equal(stock.body.inStock, false);
  assert.equal(stock.body.automationLocked, true);
  assert.equal(stock.body.ownerInfo.purchaseCost, 60);
  assert.equal(product.price, 100);
  assert.equal(product.title, 'Original');
  assert.equal((await request(`/${id}/stock`, { inStock: true }, 'other')).body.ownerInfo, undefined);
  assert.equal(product.inStock, true);
  assert.equal((await request(`/owner/${id}`, { purchaseCost: 0 })).body.ownerInfo.purchaseCost, 0);
  assert.equal((await request(`/owner/${id}`, { purchaseCost: null })).body.ownerInfo.purchaseCost, null);
  assert.equal((await request(`/owner/${id}`, { automationLocked: false })).status, 200);
  assert.equal((await request(`/${id}/edit`, { price: 200 })).status, 200);
  assert.equal(product.price, 200);
});
test.after(() => server.close());
