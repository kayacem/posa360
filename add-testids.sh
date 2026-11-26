#!/bin/bash
# Add data-testids to storefront components

# Product cards on homepage
find app -name "page.tsx" -path "*/\(storefront\)/*" ! -path "*/account/*" -exec sed -i 's/<div className="border rounded-lg/<div data-testid="product-card" className="border rounded-lg/g' {} \;

# Cart count badge
find src/components -name "*.tsx" -exec sed -i 's/<span className=".*cart.*count/<span data-testid="cart-count" className="cart-count/g' {} \;

# Order rows
find app -path "*/admin/orders/*" -name "*.tsx" -exec sed -i 's/<tr key={order.id}/<tr key={order.id} data-testid="order-row"/g' {} \;

# Return rows  
find app -path "*/admin/returns/*" -name "*.tsx" -exec sed -i 's/<tr key={ret.id}/<tr key={ret.id} data-testid="return-row"/g' {} \;

# Product rows
find app -path "*/admin/products/*" -name "*.tsx" -exec sed -i 's/<tr key={product.id}/<tr key={product.id} data-testid="product-row"/g' {} \;

# Cart items
find app -path "*/cart/*" -name "*.tsx" -exec sed -i 's/<div key={item.productId}/<div key={item.productId} data-testid="cart-item"/g' {} \;

echo "Data-testids added"
