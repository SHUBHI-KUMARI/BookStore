---
config:
  layout: elk
  theme: redux
  look: classic
---
erDiagram
	direction LR
	USERS {
		UUID id PK ""  
		VARCHAR name  ""  
		VARCHAR email  ""  
		VARCHAR password  ""  
		VARCHAR role  ""  
		TIMESTAMP created_at  ""  
	}

	CATEGORIES {
		UUID id PK ""  
		VARCHAR name  ""  
		TEXT description  ""  
	}

	BOOKS {
		UUID id PK ""  
		VARCHAR title  ""  
		VARCHAR author  ""  
		DECIMAL price  ""  
		INT stock  ""  
		UUID category_id FK ""  
		TIMESTAMP created_at  ""  
	}

	USED_BOOKS {
		UUID id PK ""  
		UUID book_id FK ""  
		UUID seller_id FK ""  
		VARCHAR condition  ""  
		DECIMAL resale_price  ""  
		VARCHAR approval_status  ""  
		TIMESTAMP created_at  ""  
	}

	CARTS {
		UUID id PK ""  
		UUID user_id FK ""  
		TIMESTAMP created_at  ""  
	}

	CART_ITEMS {
		UUID id PK ""  
		UUID cart_id FK ""  
		UUID book_id FK ""  
		INT quantity  ""  
	}

	ORDERS {
		UUID id PK ""  
		UUID user_id FK ""  
		DECIMAL total_amount  ""  
		VARCHAR status  ""  
		VARCHAR payment_status  ""  
		TIMESTAMP created_at  ""  
	}

	ORDER_ITEMS {
		UUID id PK ""  
		UUID order_id FK ""  
		UUID book_id FK ""  
		INT quantity  ""  
		DECIMAL price  ""  
	}

	REVIEWS {
		UUID id PK ""  
		UUID user_id FK ""  
		UUID book_id FK ""  
		INT rating  ""  
		TEXT comment  ""  
		TIMESTAMP created_at  ""  
	}

	USERS||--o{CARTS:"owns"
	CARTS||--o{CART_ITEMS:"contains"
	BOOKS||--o{CART_ITEMS:"added_to"
	USERS||--o{ORDERS:"places"
	ORDERS||--o{ORDER_ITEMS:"contains"
	BOOKS||--o{ORDER_ITEMS:"ordered"
	USERS||--o{REVIEWS:"writes"
	BOOKS||--o{REVIEWS:"receives"
	CATEGORIES||--o{BOOKS:"categorizes"
	USERS||--o{USED_BOOKS:"sells"
	BOOKS||--o{USED_BOOKS:"base_book"