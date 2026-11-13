"use strict";
//For the products in the stores availabl
class Product {
  constructor(id, name, price) {
    if (id === undefined || id === null || String(id).trim() === "") {
      throw new TypeError("A product must have a valid id.");
    }

    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError("A product must have a valid name.");
    }

    if (price === "" || price === null || price === undefined) {
      throw new TypeError("A product must have a valid price.");
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      throw new TypeError("A product price must be a non-negative number.");
    }

    this.id = String(id);
    this.name = name.trim();
    this.price = numericPrice;
  }
}

//I did this to represent on product and its quantity in the card
class ShoppingCartItem {
  constructor(product, quantity = 1) {
    if (!(product instanceof Product)) {
      throw new TypeError("ShoppingCartItem expects a Product instance.");
    }

    this.product = product;
    this.quantity = ShoppingCartItem.validateQuantity(quantity);
  }

  static validateQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new TypeError("Quantity must be a positive integer.");
    }
    return quantity;
  }

  getTotalPrice() {
    return roundMoney(this.product.price * this.quantity);
  }

  increaseQuantity(amount = 1) {
    ShoppingCartItem.validateQuantity(amount);
    this.quantity += amount;
    return this.quantity;
  }

  decreaseQuantity(amount = 1) {
    ShoppingCartItem.validateQuantity(amount);
    this.quantity = Math.max(0, this.quantity - amount);
    return this.quantity;
  }
}


class ShoppingCart {
  constructor({ productsContainer = null, totalElement = null, locale = "en-US", currency = "$" } = {}) {
    this.items = [];
    this.productsContainer = productsContainer;
    this.totalElement = totalElement;
    this.locale = locale;
    this.currency = currency;
  }

  getItem(productId) {
    return this.items.find((item) => item.product.id === String(productId)) || null;
  }


  addItem(product, quantity = 1) {
    if (!(product instanceof Product)) {
      throw new TypeError("addItem expects a Product instance.");
    }
    ShoppingCartItem.validateQuantity(quantity);

    const existingItem = this.getItem(product.id);
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
      return existingItem;
    }

    const newItem = new ShoppingCartItem(product, quantity);
    this.items.push(newItem);
    return newItem;
  }

  // To remove the cart line when it reaches zero. 
  decreaseItem(productId, quantity = 1) {
    ShoppingCartItem.validateQuantity(quantity);
    const item = this.getItem(productId);

    if (!item) {
      return false;
    }

    item.decreaseQuantity(quantity);
    if (item.quantity === 0) {
      this.removeItem(productId);
    }
    return true;
  }

  // method To get off the complete product line from the cart. 
  removeItem(productId) {
    const itemIndex = this.items.findIndex(
      (item) => item.product.id === String(productId)
    );

    if (itemIndex === -1) {
      return false;
    }

    this.items.splice(itemIndex, 1);
    return true;
  }


  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

//return total value of the cart
  getTotalPrice() {
    return roundMoney(
      this.items.reduce((total, item) => total + item.getTotalPrice(), 0)
    );
  }


  displayCart() {
    if (this.productsContainer) {
      const productCards = this.productsContainer.querySelectorAll(".product-item");

      productCards.forEach((card) => {
        const productId = card.dataset.productId;
        const item = this.getItem(productId);
        const quantityElement = card.querySelector(".quantity");

        if (quantityElement) {
          quantityElement.textContent = String(item ? item.quantity : 0);
        }
      });

      this.updateEmptyState(productCards.length);
    }

    if (this.totalElement) {
      const formattedTotal = new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(this.getTotalPrice());

      this.totalElement.textContent = `${formattedTotal} ${this.currency}`;
    }

    return {
      totalItems: this.getTotalItems(),
      totalPrice: this.getTotalPrice(),
    };
  }

  updateEmptyState(productCardCount) {
    if (!this.productsContainer) {
      return;
    }

    let emptyMessage = this.productsContainer.querySelector(".empty-cart");

    if (productCardCount === 0 && !emptyMessage) {
      emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-cart";
      emptyMessage.textContent = "Your cart is empty.";
      this.productsContainer.appendChild(emptyMessage);
    } else if (productCardCount > 0 && emptyMessage) {
      emptyMessage.remove();
    }
  }
}

function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function parsePrice(priceText) {
  const normalizedPrice = String(priceText)
    .trim()
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  const price = Number.parseFloat(normalizedPrice);

  if (!Number.isFinite(price) || price < 0) {
    throw new TypeError(`Invalid product price: ${priceText}`);
  }

  return price;
}

function initializeShoppingCart() {
  const productsContainer = document.querySelector(".list-products");
  const totalElement = document.querySelector(".total");

  if (!productsContainer || !totalElement) {
    console.error(
      "Shopping cart initialization failed: required HTML elements were not found."
    );
    return;
  }

  const shoppingCart = new ShoppingCart({ productsContainer, totalElement });
  const products = new Map();
  const productCards = productsContainer.querySelectorAll(".product-item");


  productCards.forEach((card) => {
    const productId = card.dataset.productId;
    const nameElement = card.querySelector(".card-title");
    const priceElement = card.querySelector(".unit-price");
    const quantityElement = card.querySelector(".quantity");

    if (!productId || !nameElement || !priceElement) {
      console.warn("A product card is missing its id, name, or price and was ignored.", card);
      return;
    }

    try {
      const product = new Product(
        productId,
        nameElement.textContent.trim(),
        parsePrice(priceElement.textContent)
      );
      products.set(product.id, product);


      const startingQuantity = Number.parseInt(quantityElement?.textContent.trim() || "0", 10);
      if (Number.isInteger(startingQuantity) && startingQuantity > 0) {
        shoppingCart.addItem(product, startingQuantity);
      }
    } catch (error) {
      console.error(`Could not initialize product "${productId}":`, error);
    }
  });


  productsContainer.addEventListener("click", (event) => {
    const clickedElement = event.target instanceof Element
      ? event.target
      : event.target?.parentElement;
    const button = clickedElement?.closest("button[data-action]");

    if (!button || !productsContainer.contains(button)) {
      return;
    }

    const productElement = button.closest(".product-item");
    if (!productElement) {
      return;
    }

    const productId = productElement.dataset.productId;
    const product = products.get(productId);
    if (!product) {
      return;
    }

    switch (button.dataset.action) {
      case "increase":
        shoppingCart.addItem(product);
        shoppingCart.displayCart();
        break;

      case "decrease":
        shoppingCart.decreaseItem(product.id);
        shoppingCart.displayCart();
        break;

      case "delete":
        shoppingCart.removeItem(product.id);
        products.delete(product.id);
        productElement.remove();
        shoppingCart.displayCart();
        break;

      case "like": {
        const isLiked = button.classList.toggle("is-liked");
        button.setAttribute("aria-pressed", String(isLiked));
        button.setAttribute(
          "aria-label",
          isLiked
            ? `Remove ${product.name} from favorites`
            : `Add ${product.name} to favorites`
        );
        break;
      }

      default:
        break;
    }
  });

  shoppingCart.displayCart();

  // To show the instance for learning/debugging in the browser console.
  window.shoppingCart = shoppingCart;
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeShoppingCart);
}

// this block is ignored by browsers(just to Export the classes for automated tests).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Product, ShoppingCartItem, ShoppingCart, roundMoney };
}
