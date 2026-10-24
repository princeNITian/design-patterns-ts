# Creational Design Patterns in TypeScript

A practical guide to the **five GoF creational design patterns**, using
TypeScript.

## What are creational design patterns?

Creational patterns organize **how objects are created**. They help keep
object construction separate from business logic, especially when object
creation becomes conditional, complex, or likely to change.

The five classic creational patterns are:

  -----------------------------------------------------------------------
  Pattern                 Main idea               Typical use
  ----------------------- ----------------------- -----------------------
  Factory Method          Let a subclass or       Select a notification
                          creator decide which    sender or payment
                          concrete product to     processor
                          create                  

  Abstract Factory        Create a family of      UI components for
                          related objects without different
                          naming their concrete   themes/platforms
                          classes                 

  Builder                 Construct a complex     Reports, configuration
                          object step by step     objects, orders

  Prototype               Create a new object by  Templates and
                          copying an existing one preconfigured objects

  Singleton               Ensure a class has one  Process-wide
                          shared instance         configuration or a
                                                  carefully managed
                                                  service
  -----------------------------------------------------------------------

> **Important:** Patterns are tools, not mandatory rules. For a simple
> `new User()` call, a design pattern may add unnecessary complexity.

------------------------------------------------------------------------

# 1. Factory Method

**Category:** Creational

## Definition

Factory Method defines a creation method in a common creator interface
or base class, allowing concrete creators to choose which product
implementation gets instantiated.

## Scenario: sending notifications

Imagine an application that sends notifications. At first, it only sends
email.

### Without the pattern

``` ts
type NotificationChannel = "email" | "sms";

class NotificationService {
  send(channel: NotificationChannel, message: string): void {
    if (channel === "email") {
      console.log(`Email: ${message}`);
    } else if (channel === "sms") {
      console.log(`SMS: ${message}`);
    } else {
      throw new Error("Unsupported channel");
    }
  }
}

const service = new NotificationService();
service.send("email", "Your order shipped");
```

This works, but every new channel can force us to edit the same service.
As the branches grow, the service becomes harder to maintain and test.

## Solution

Put the common behavior behind an interface, and let specialized
creators decide which implementation to create.

``` ts
interface Notifier {
  send(message: string): void;
}

class EmailNotifier implements Notifier {
  send(message: string): void {
    console.log(`Email: ${message}`);
  }
}

class SmsNotifier implements Notifier {
  send(message: string): void {
    console.log(`SMS: ${message}`);
  }
}

abstract class NotificationCreator {
  // Factory Method
  abstract createNotifier(): Notifier;

  // Shared business flow
  notify(message: string): void {
    const notifier = this.createNotifier();
    notifier.send(message);
  }
}

class EmailNotificationCreator extends NotificationCreator {
  createNotifier(): Notifier {
    return new EmailNotifier();
  }
}

class SmsNotificationCreator extends NotificationCreator {
  createNotifier(): Notifier {
    return new SmsNotifier();
  }
}

const creator: NotificationCreator = new EmailNotificationCreator();
creator.notify("Your order shipped");
```

### What changed?

-   `NotificationCreator` defines the workflow.
-   `createNotifier()` is the Factory Method.
-   Concrete creators choose the implementation.
-   The shared workflow works with the `Notifier` interface instead of
    concrete classes.

### When to use it

-   A base workflow should remain stable while the concrete product
    varies.
-   Subclasses or plugins need control over which product gets created.
-   You want to extend creation behavior without adding branches to one
    central service.

### Watch out

If the only variation is a simple two-value choice, a small factory
function may be clearer than a full inheritance hierarchy.

------------------------------------------------------------------------

# 2. Abstract Factory

**Category:** Creational

## Definition

Abstract Factory provides an interface for creating **families of
related objects** without specifying their concrete classes.

## Scenario: cross-platform UI

Suppose an app supports light and dark themes. Each theme needs a button
and a dialog that look consistent with one another.

### Without the pattern

``` ts
type Theme = "light" | "dark";

class Button {
  constructor(public theme: Theme) {}
}

class Dialog {
  constructor(public theme: Theme) {}
}

function createScreen(theme: Theme) {
  // Callers must remember to pass the same theme everywhere.
  return {
    button: new Button(theme),
    dialog: new Dialog(theme),
  };
}
```

This is manageable now, but as the family grows, callers may
accidentally mix a light button with a dark dialog.

## Solution

Create an abstract factory that produces the whole family.

``` ts
interface Button {
  render(): void;
}

interface Dialog {
  render(): void;
}

class LightButton implements Button {
  render(): void {
    console.log("Rendering light button");
  }
}

class LightDialog implements Dialog {
  render(): void {
    console.log("Rendering light dialog");
  }
}

class DarkButton implements Button {
  render(): void {
    console.log("Rendering dark button");
  }
}

class DarkDialog implements Dialog {
  render(): void {
    console.log("Rendering dark dialog");
  }
}

interface UIFactory {
  createButton(): Button;
  createDialog(): Dialog;
}

class LightUIFactory implements UIFactory {
  createButton(): Button {
    return new LightButton();
  }

  createDialog(): Dialog {
    return new LightDialog();
  }
}

class DarkUIFactory implements UIFactory {
  createButton(): Button {
    return new DarkButton();
  }

  createDialog(): Dialog {
    return new DarkDialog();
  }
}

function renderScreen(factory: UIFactory): void {
  const button = factory.createButton();
  const dialog = factory.createDialog();

  button.render();
  dialog.render();
}

renderScreen(new DarkUIFactory());
```

### What changed?

-   `UIFactory` describes the family of objects that can be created.
-   Each concrete factory creates a consistent family.
-   Client code depends on interfaces, not on `LightButton`,
    `DarkButton`, and similar concrete classes.

### When to use it

-   You have multiple families of related objects.
-   Objects within a family must be compatible.
-   You need to switch the entire family based on platform, theme,
    provider, or environment.

### Factory Method vs Abstract Factory

-   **Factory Method:** typically focuses on creating one product
    through an overridable method.
-   **Abstract Factory:** focuses on creating several related products
    through one factory interface.

An Abstract Factory can internally use Factory Methods, but the patterns
solve different design problems.

### Watch out

Adding a new *kind* of product to every family may require changing the
factory interface and all concrete factories.

------------------------------------------------------------------------

# 3. Builder

**Category:** Creational

## Definition

Builder separates the step-by-step construction of a complex object from
its final representation.

## Scenario: creating an order

An order may have required fields and optional settings such as a
delivery address, gift wrapping, and a discount code.

### Without the pattern

``` ts
type OrderOptions = {
  deliveryAddress?: string;
  giftWrap?: boolean;
  discountCode?: string;
};

class Order {
  constructor(
    public readonly customerId: string,
    public readonly items: string[],
    public readonly deliveryAddress?: string,
    public readonly giftWrap?: boolean,
    public readonly discountCode?: string,
  ) {}
}

const order = new Order(
  "customer-42",
  ["book", "pen"],
  "12 Main Street",
  true,
  "SAVE10",
);
```

As optional fields multiply, positional constructor arguments become
difficult to read and easy to mix up. A plain options object helps
readability, but a builder can also guide a multi-step construction
process and validate the final result.

## Solution

``` ts
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
      deliveryAddress: this.deliveryAddress,
      giftWrap: this.giftWrap,
      discountCode: this.discountCode,
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
```

### What changed?

-   Construction becomes readable and expressive.
-   Optional steps can be omitted.
-   Validation is centralized at `build()` and/or in the final object.
-   The caller doesn't need to understand the internal representation.

### When to use it

-   An object has many optional or dependent fields.
-   Construction involves multiple steps or validation.
-   You want readable construction code.
-   Different construction processes can produce the same type of
    object.

### Watch out

A builder is overkill for a small object with two or three
straightforward fields. Also, if a builder is reused, be careful about
leaking state between builds; this example intentionally keeps its
mutable state private.

------------------------------------------------------------------------

# 4. Prototype

**Category:** Creational

## Definition

Prototype creates new objects by copying an existing object, called the
prototype or template, instead of building each object from scratch.

## Scenario: reusable game characters

A game has a standard enemy configuration. Many enemies share the same
initial stats, but each instance needs its own identity and may later
change independently.

### Without the pattern

``` ts
type Enemy = {
  name: string;
  health: number;
  speed: number;
  abilities: string[];
};

function createEnemy(): Enemy {
  return {
    name: "Goblin",
    health: 100,
    speed: 5,
    abilities: ["slash", "dodge"],
  };
}

const enemyA = createEnemy();
const enemyB = createEnemy();
```

This factory is fine for a small example. However, if the base
configuration is assembled by a tool, user, or runtime process,
repeatedly rebuilding it can be inconvenient.

## Solution

Use a prototype that can clone itself.

``` ts
interface Cloneable<T> {
  clone(): T;
}

class Enemy implements Cloneable<Enemy> {
  constructor(
    public name: string,
    public health: number,
    public speed: number,
    public abilities: string[],
  ) {}

  clone(): Enemy {
    return new Enemy(
      this.name,
      this.health,
      this.speed,
      [...this.abilities],
    );
  }
}

const goblinTemplate = new Enemy(
  "Goblin",
  100,
  5,
  ["slash", "dodge"],
);

const enemyA = goblinTemplate.clone();
const enemyB = goblinTemplate.clone();

enemyA.health = 40;
enemyA.abilities.push("poison");

console.log(enemyA.health);     // 40
console.log(enemyB.health);     // 100
console.log(enemyB.abilities);  // ["slash", "dodge"]
```

### What changed?

-   The template holds a preconfigured object.
-   `clone()` creates a distinct instance.
-   The abilities array is copied, so the two enemies don't share that
    mutable array.

### When to use it

-   Creating an object from a configured template is easier than
    reconstructing it.
-   Object setup is expensive or involves runtime-generated
    configuration.
-   You need many similar instances with small differences.

### Watch out: shallow vs deep copy

The spread operator (`[...this.abilities]`) copies the array, but it
does not recursively clone objects nested inside the array. A correct
clone must define which nested values should be shared and which should
be copied. `structuredClone()` can help with supported data, but it does
not preserve arbitrary class prototypes and methods.

------------------------------------------------------------------------

# 5. Singleton

**Category:** Creational

## Definition

Singleton restricts a class to one instance and provides a shared access
point to it.

## Scenario: application configuration

Suppose multiple parts of a small application need to read the same
loaded configuration.

### Without the pattern

``` ts
class AppConfig {
  constructor(public readonly apiBaseUrl: string) {}
}

const configA = new AppConfig("https://api.example.com");
const configB = new AppConfig("https://api.example.com");

console.log(configA === configB); // false
```

Each call creates a separate object. If the configuration is meant to be
shared, repeated construction can lead to inconsistent updates or
duplicated setup.

## Solution

``` ts
class AppConfig {
  private static instance: AppConfig;

  private constructor(
    public readonly apiBaseUrl: string,
  ) {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig(
        "https://api.example.com",
      );
    }
    return AppConfig.instance;
  }
}

const configA = AppConfig.getInstance();
const configB = AppConfig.getInstance();

console.log(configA === configB); // true
```

### What changed?

-   The private constructor prevents callers from using
    `new AppConfig()`.
-   The static method controls access to the instance.
-   Repeated calls return the same instance.

### When to use it

-   One instance genuinely represents a process-wide resource or state.
-   You need a single shared registry or configuration object in a small
    application.

### Watch out

-   Singletons introduce global shared state and can make tests
    order-dependent.
-   They can hide dependencies instead of passing them explicitly.
-   In Node.js, module-level objects are often enough for process-local
    sharing.
-   This example is synchronous and intended for a normal single
    JavaScript runtime. Asynchronous initialization or cross-process
    coordination needs a different approach.
-   A Singleton is not automatically one instance across multiple server
    processes, containers, or machines.

Dependency injection is often a better choice for services because it
makes dependencies and test substitutes explicit.

------------------------------------------------------------------------

# How to choose the right pattern

  -----------------------------------------------------------------------
  If your problem is...   Consider...             Ask yourself...
  ----------------------- ----------------------- -----------------------
  One workflow needs      Factory Method          Should subclasses
  different product                               decide what gets
  implementations                                 created?

  Several related objects Abstract Factory        Do these objects form a
  must be created                                 compatible family?
  consistently                                    

  Constructing one object Builder                 Would named steps make
  requires many                                   construction clearer?
  steps/options                                   

  A configured object     Prototype               Can I safely define
  needs to be copied                              copy behavior?

  One shared instance is  Singleton               Is global shared state
  a genuine requirement                           worth the coupling?
  -----------------------------------------------------------------------

## A quick interview checklist

For each pattern, be ready to explain:

1.  **Intent:** What does the pattern do?
2.  **Problem:** What becomes difficult without it?
3.  **Participants:** Which interfaces and classes collaborate?
4.  **Trade-off:** What complexity does the pattern introduce?
5.  **Alternative:** Could a simple function, object literal, or
    dependency injection solve the problem more simply?
6.  **Real use case:** Where would you use it in a production
    application?

## TypeScript practice exercises

Try implementing these without looking at the examples first:

1.  **Factory Method:** Create a report exporter that supports PDF and
    CSV.
2.  **Abstract Factory:** Create matching AWS and Azure storage clients
    (use interfaces and mock implementations; don't call real cloud
    services).
3.  **Builder:** Build a validated HTTP request configuration with
    method, URL, headers, and optional timeout.
4.  **Prototype:** Clone a document template while ensuring its metadata
    object is not accidentally shared.
5.  **Singleton:** Implement a process-local feature-flag registry, then
    write a test that demonstrates why global state can be inconvenient.

## Final takeaway

Creational patterns are about separating **what the application wants to
do** from **how the objects it needs are created**. Prefer the simplest
design that makes the creation rules clear; introduce a pattern when it
solves a real source of coupling, inconsistency, or construction
complexity.
