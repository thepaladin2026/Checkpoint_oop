"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { Product, ShoppingCartItem, ShoppingCart } = require("../js/script.js");

test("Product stores id, name and price", () => {
  const product = new Product("p1", "Baskets", 100);
  assert.equal(product.id, "p1");
  assert.equal(product.name, "Baskets");
  assert.equal(product.price, 100);
});

test("ShoppingCartItem calculates its total price", () => {
  const product = new Product("p1", "Baskets", 100);
  const item = new ShoppingCartItem(product, 3);
  assert.equal(item.getTotalPrice(), 300);
});

test("ShoppingCart adds products and aggregates repeated additions", () => {
  const baskets = new Product("baskets", "Baskets", 100);
  const socks = new Product("socks", "Socks", 20);
  const cart = new ShoppingCart();

  cart.addItem(baskets);
  cart.addItem(baskets, 2);
  cart.addItem(socks, 3);

  assert.equal(cart.items.length, 2);
  assert.equal(cart.getItem("baskets").quantity, 3);
  assert.equal(cart.getTotalItems(), 6);
  assert.equal(cart.getTotalPrice(), 360);
  assert.ok(cart.items.every((item) => item instanceof ShoppingCartItem));
});

test("decreasing quantity removes a line when its quantity reaches zero", () => {
  const product = new Product("bag", "Bag", 50);
  const cart = new ShoppingCart();

  cart.addItem(product, 2);
  assert.equal(cart.decreaseItem("bag"), true);
  assert.equal(cart.getItem("bag").quantity, 1);
  assert.equal(cart.decreaseItem("bag"), true);
  assert.equal(cart.getItem("bag"), null);
  assert.equal(cart.getTotalItems(), 0);
  assert.equal(cart.getTotalPrice(), 0);
});

test("removeItem removes the complete product line", () => {
  const product = new Product("socks", "Socks", 20);
  const cart = new ShoppingCart();
  cart.addItem(product, 4);

  assert.equal(cart.removeItem("socks"), true);
  assert.equal(cart.removeItem("socks"), false);
  assert.equal(cart.items.length, 0);
});


test("displayCart synchronizes product quantities and the displayed total", () => {
  const quantityFor = () => ({ textContent: "0" });
  const cards = [
    {
      dataset: { productId: "baskets" },
      quantity: quantityFor(),
      querySelector(selector) {
        return selector === ".quantity" ? this.quantity : null;
      },
    },
    {
      dataset: { productId: "socks" },
      quantity: quantityFor(),
      querySelector(selector) {
        return selector === ".quantity" ? this.quantity : null;
      },
    },
  ];
  const productsContainer = {
    querySelectorAll(selector) {
      return selector === ".product-item" ? cards : [];
    },
    querySelector() {
      return null;
    },
  };
  const totalElement = { textContent: "" };
  const cart = new ShoppingCart({ productsContainer, totalElement });

  cart.addItem(new Product("baskets", "Baskets", 100), 2);
  cart.addItem(new Product("socks", "Socks", 20));
  const summary = cart.displayCart();

  assert.equal(cards[0].quantity.textContent, "2");
  assert.equal(cards[1].quantity.textContent, "1");
  assert.equal(totalElement.textContent, "220 $");
  assert.deepEqual(summary, { totalItems: 3, totalPrice: 220 });
});

test("invalid products and quantities are rejected", () => {
  assert.throws(() => new Product("p1", "Baskets", -1), TypeError);
  assert.throws(() => new ShoppingCartItem({}, 1), TypeError);
  assert.throws(() => new ShoppingCartItem(new Product("p1", "Baskets", 100), 0), TypeError);
  assert.throws(() => new ShoppingCart().addItem(new Product("p1", "Baskets", 100), -2), TypeError);
});
