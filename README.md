# Shopping Cart – Object-Oriented JavaScript checkpoint

## Run the project

1. Extract the `Shopping-Card` folder.
2. Open `index.html` in a browser, or start a local server from inside the folder:

   ```bash
   python -m http.server 8000
   ```

3. Open `http://localhost:8000`.

Bootstrap and Font Awesome are loaded from CDNs, so an internet connection is needed for those visual elements. The cart logic itself uses plain JavaScript.

## Object-oriented structure

- `Product`: stores `id`, `name`, and `price`.
- `ShoppingCartItem`: stores a `Product` instance and its `quantity`; `getTotalPrice()` calculates `product.price * quantity`.
- `ShoppingCart`: owns an `items` array containing `ShoppingCartItem` instances and provides:
  - `getTotalItems()` – sum of all quantities in the cart.
  - `getTotalPrice()` – total monetary value of the cart.
  - `addItem(product, quantity)` – adds a product or increases its existing quantity.
  - `decreaseItem(productId, quantity)` – decreases quantity and removes the line at zero.
  - `removeItem(productId)` – removes the complete product line.
  - `displayCart()` – synchronizes product quantities and the displayed total with the object model.

The existing product cards are used to create `Product` objects at page initialization. The plus, minus, delete, and favorite controls remain available. The cart instance is also exposed as `window.shoppingCart` for inspection in the browser console.

## Run the tests

Node.js is required. From inside the `Shopping-Card` folder, run:

```bash
node --test tests/shopping-cart.test.js
```

The tests cover product creation, item price calculation, adding and aggregating products, totals, decreasing quantities, removing items, and invalid input handling.
