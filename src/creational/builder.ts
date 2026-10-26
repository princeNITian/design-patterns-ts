/* Without Builder 
type OrderOptions = {
    deliverAddress?: string,
    giftWrap?: boolean,
    discountCode?: string
}

class Order {
    constructor(
        readonly customerId: string,
        public readonly items: string[],
        public readonly deliveryAddress?: string,
        public readonly giftWrap?: boolean,
        public readonly discountCode?: string
    ) {}
}

const order = new Order(
  "customer-42",
  ["book", "pen"],
  "12 Main Street",
  true,
  "SAVE10",
);

*/

/* With builder pattern */

type OrderData = {
  customerId: string;
  items: string[];
  deliveryAddress?: string;
  giftWrap: boolean;
  discountCode?: string;
};

class Order {
  private constructor(public readonly data: OrderData) {}

  static create(data: OrderData): Order {
    if (data.customerId.trim() === "") {
      throw new Error("customerId is required");
    }
    if (data.items.length === 0) {
      throw new Error("An order must contain at least one item");
    }
    return new Order({
      ...data,
      items: [...data.items],
    });
  }

  describe(): void {
    console.log(`Order for ${this.data.customerId}`);
    console.log(`Items: ${this.data.items.join(", ")}`);
  }
}

class OrderBuilder {
  private customerId?: string;
  private items: string[] = [];
  private deliveryAddress?: string;
  private giftWrap = false;
  private discountCode?: string;

  forCustomer(customerId: string): this {
    this.customerId = customerId;
    return this;
  }

  addItem(item: string): this {
    this.items.push(item);
    return this;
  }

  deliverTo(address: string): this {
    this.deliveryAddress = address;
    return this;
  }

  wrapAsGift(): this {
    this.giftWrap = true;
    return this;
  }

  applyDiscount(code: string): this {
    this.discountCode = code;
    return this;
  }

  build(): Order {
    if (!this.customerId) {
      throw new Error("Customer is required");
    }

    return Order.create({
      customerId: this.customerId,
      items: this.items,
      giftWrap: this.giftWrap,
      ...(this.deliveryAddress === undefined
        ? {}
        : { deliveryAddress: this.deliveryAddress }),
      ...(this.discountCode === undefined
        ? {}
        : { discountCode: this.discountCode }),
    });
  }
}

const order = new OrderBuilder()
  .forCustomer("customer-42")
  .addItem("book")
  .addItem("pen")
  .deliverTo("12 Main Street")
  .wrapAsGift()
  .applyDiscount("SAVE10")
  .build();

order.describe();