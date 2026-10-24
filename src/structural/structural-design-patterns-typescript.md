# Structural Design Patterns in TypeScript

A practical guide to the **seven GoF structural design patterns**, with
TypeScript examples, problems, solutions, trade-offs, and interview
guidance.

## What are structural design patterns?

Structural patterns describe **how classes and objects are composed** to
form larger structures while keeping the design flexible.

The seven classic structural patterns are:

  -----------------------------------------------------------------------
  Pattern                 Main idea               Typical use
  ----------------------- ----------------------- -----------------------
  Adapter                 Make incompatible       Integrating a
                          interfaces work         third-party payment API
                          together                

  Bridge                  Separate an abstraction Notifications across
                          from its implementation delivery channels

  Composite               Treat individual        File systems and UI
                          objects and groups      trees
                          uniformly               

  Decorator               Add behavior by         Logging, caching,
                          wrapping an object      compression

  Facade                  Provide a simple        Checkout or media
                          interface to a complex  conversion
                          subsystem               

  Flyweight               Share common state to   Many similar particles,
                          reduce memory usage     glyphs, or map markers

  Proxy                   Control access to       Lazy loading,
                          another object          authorization, remote
                                                  access
  -----------------------------------------------------------------------

> **Key idea:** Creational patterns focus on how objects are created;
> structural patterns focus on how objects fit together. Patterns are
> optional tools, not a checklist.

------------------------------------------------------------------------

# 1. Adapter

**Category:** Structural

## Definition

Adapter converts one interface into another interface that a client
expects, allowing incompatible systems to collaborate.

## Scenario: integrating a payment provider

Your application expects every payment gateway to expose
`charge(amountInCents)`, but a third-party provider exposes
`makePayment(amountInDollars)`.

### Without the pattern

``` ts
class LegacyPaymentProvider {
  makePayment(amountInDollars: number): void {
    console.log(`Charged $${amountInDollars}`);
  }
}

class CheckoutService {
  constructor(private provider: LegacyPaymentProvider) {}

  checkout(amountInCents: number): void {
    // Checkout knows the provider's API and conversion rules.
    this.provider.makePayment(amountInCents / 100);
  }
}
```

The checkout service is tied to the provider's specific interface.
Replacing the provider or integrating a second one can spread
provider-specific logic through the application.

## Solution

Create an adapter that implements the interface your application expects
and translates calls to the provider.

``` ts
interface PaymentGateway {
  charge(amountInCents: number): void;
}

class LegacyPaymentProvider {
  makePayment(amountInDollars: number): void {
    console.log(`Charged $${amountInDollars.toFixed(2)}`);
  }
}

class LegacyPaymentAdapter implements PaymentGateway {
  constructor(private provider: LegacyPaymentProvider) {}

  charge(amountInCents: number): void {
    if (!Number.isInteger(amountInCents) || amountInCents < 0) {
      throw new Error("Amount must be a non-negative integer");
    }

    this.provider.makePayment(amountInCents / 100);
  }
}

class CheckoutService {
  constructor(private gateway: PaymentGateway) {}

  checkout(amountInCents: number): void {
    this.gateway.charge(amountInCents);
  }
}

const gateway = new LegacyPaymentAdapter(new LegacyPaymentProvider());
new CheckoutService(gateway).checkout(2599);
```

### What changed?

-   `PaymentGateway` is the interface the application wants.
-   `LegacyPaymentAdapter` translates the application's call to the
    provider's API.
-   `CheckoutService` no longer needs to know the provider's method name
    or amount format.

### When to use it

-   Integrating a legacy API or third-party SDK.
-   Adapting one interface to a domain-specific interface.
-   Keeping vendor-specific details outside business logic.

### Watch out

An adapter should translate interfaces and formats, not become a large
service full of unrelated business rules.

------------------------------------------------------------------------

# 2. Bridge

**Category:** Structural

## Definition

Bridge separates an abstraction from its implementation so both can vary
independently.

## Scenario: notifications and delivery channels

An application supports multiple notification types---alerts and
reminders---and multiple delivery channels---email and SMS.

### Without the pattern

``` ts
class NotificationService {
  sendEmailAlert(message: string): void {
    console.log(`Email alert: ${message}`);
  }

  sendSmsAlert(message: string): void {
    console.log(`SMS alert: ${message}`);
  }

  sendEmailReminder(message: string): void {
    console.log(`Email reminder: ${message}`);
  }

  sendSmsReminder(message: string): void {
    console.log(`SMS reminder: ${message}`);
  }
}
```

As notification types and channels multiply, the number of combinations
and methods grows. The class combines two independent dimensions of
change.

## Solution

Use composition: notification types hold a reference to a channel
implementation.

``` ts
interface MessageChannel {
  send(message: string): void;
}

class EmailChannel implements MessageChannel {
  send(message: string): void {
    console.log(`Email: ${message}`);
  }
}

class SmsChannel implements MessageChannel {
  send(message: string): void {
    console.log(`SMS: ${message}`);
  }
}

abstract class Notification {
  constructor(protected channel: MessageChannel) {}

  abstract notify(message: string): void;
}

class AlertNotification extends Notification {
  notify(message: string): void {
    this.channel.send(`ALERT: ${message}`);
  }
}

class ReminderNotification extends Notification {
  notify(message: string): void {
    this.channel.send(`Reminder: ${message}`);
  }
}

const alert = new AlertNotification(new SmsChannel());
alert.notify("Server CPU is high");

const reminder = new ReminderNotification(new EmailChannel());
reminder.notify("Your subscription expires tomorrow");
```

### What changed?

-   `Notification` represents the abstraction.
-   `MessageChannel` represents the implementation interface.
-   New notification types and channels can be added independently.

### When to use it

-   Two dimensions of variation would otherwise create many subclasses.
-   The abstraction and implementation need independent extension.
-   You want to switch implementations at runtime through composition.

### Watch out

Bridge and Adapter both use composition, but their intent differs:
**Adapter reconciles an existing incompatible interface; Bridge designs
two dimensions to vary independently.**

------------------------------------------------------------------------

# 3. Composite

**Category:** Structural

## Definition

Composite lets clients treat individual objects and compositions of
objects through the same interface, usually in a tree structure.

## Scenario: a file system

A file system contains files and folders. A folder can contain files and
other folders. You want to calculate size without checking each node's
concrete type in client code.

### Without the pattern

``` ts
type File = { type: "file"; name: string; size: number };
type Folder = { type: "folder"; name: string; children: (File | Folder)[] };

function getSize(node: File | Folder): number {
  if (node.type === "file") {
    return node.size;
  }

  return node.children.reduce((total, child) => total + getSize(child), 0);
}
```

This works for a small tree, but operations often accumulate type checks
and duplicated traversal logic across the application.

## Solution

Give files and folders the same component interface.

``` ts
interface FileSystemNode {
  getSize(): number;
}

class FileLeaf implements FileSystemNode {
  constructor(
    public readonly name: string,
    private readonly size: number,
  ) {}

  getSize(): number {
    return this.size;
  }
}

class FolderComposite implements FileSystemNode {
  private children: FileSystemNode[] = [];

  constructor(public readonly name: string) {}

  add(child: FileSystemNode): void {
    this.children.push(child);
  }

  remove(child: FileSystemNode): void {
    this.children = this.children.filter(item => item !== child);
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }
}

const root = new FolderComposite("root");
const documents = new FolderComposite("documents");

documents.add(new FileLeaf("resume.pdf", 120));
documents.add(new FileLeaf("notes.txt", 30));
root.add(documents);
root.add(new FileLeaf("photo.jpg", 850));

console.log(root.getSize()); // 1000
```

### What changed?

-   A file is a leaf; a folder is a composite.
-   Both implement `FileSystemNode`.
-   The caller invokes `getSize()` without caring whether it has a file
    or folder.

### When to use it

-   Representing trees such as file systems, organization charts, menus,
    or UI layouts.
-   Applying the same operation to individual items and groups.
-   Building recursive structures.

### Watch out

Consider preventing cycles when adding nodes, and decide whether every
operation makes sense for both leaves and composites.

------------------------------------------------------------------------

# 4. Decorator

**Category:** Structural

## Definition

Decorator attaches additional responsibilities to an object dynamically
by wrapping it with another object that implements the same interface.

## Scenario: adding features to a data service

A data service initially fetches data. Later, you want logging and
caching without changing the original service.

### Without the pattern

``` ts
class DataService {
  fetch(key: string): string {
    console.log(`Fetching ${key}`);
    // Cache checks and metrics could be added here too.
    return `value-for-${key}`;
  }
}
```

Every extra responsibility can make the service harder to maintain.
Subclassing for every combination---logging only, caching only, logging
plus caching---creates many classes.

## Solution

Wrap a common interface with decorators.

``` ts
interface DataSource {
  fetch(key: string): string;
}

class RemoteDataSource implements DataSource {
  fetch(key: string): string {
    console.log(`Remote fetch: ${key}`);
    return `value-for-${key}`;
  }
}

class LoggingDecorator implements DataSource {
  constructor(private inner: DataSource) {}

  fetch(key: string): string {
    console.log(`[log] fetch(${key})`);
    return this.inner.fetch(key);
  }
}

class CacheDecorator implements DataSource {
  private cache = new Map<string, string>();

  constructor(private inner: DataSource) {}

  fetch(key: string): string {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      console.log(`[cache] hit: ${key}`);
      return cached;
    }

    const value = this.inner.fetch(key);
    this.cache.set(key, value);
    return value;
  }
}

const source: DataSource = new LoggingDecorator(
  new CacheDecorator(new RemoteDataSource()),
);

console.log(source.fetch("user:42"));
console.log(source.fetch("user:42"));
```

### What changed?

-   Every decorator implements `DataSource`.
-   A decorator adds behavior before or after delegating to its wrapped
    object.
-   Features can be composed in different orders without modifying the
    original source.

### When to use it

-   Adding cross-cutting behavior such as logging, metrics, caching,
    compression, or retries.
-   Combining optional behaviors at runtime.
-   Extending an object without creating a subclass for every
    combination.

### Watch out

Decorator order can matter. In real systems, cache invalidation, error
handling, and concurrency need deliberate design. The in-memory example
is synchronous and is for illustrating the pattern.

------------------------------------------------------------------------

# 5. Facade

**Category:** Structural

## Definition

Facade provides a simple, unified interface to a complex subsystem.

## Scenario: checkout orchestration

Completing a purchase requires inventory checks, payment, and
shipping-label creation.

### Without the pattern

``` ts
class InventoryService {
  reserve(productId: string): void {
    console.log(`Reserved ${productId}`);
  }
}

class PaymentService {
  charge(orderId: string): void {
    console.log(`Charged order ${orderId}`);
  }
}

class ShippingService {
  createLabel(orderId: string): void {
    console.log(`Shipping label created for ${orderId}`);
  }
}

// Every caller must know the order and details of these calls.
const inventory = new InventoryService();
const payment = new PaymentService();
const shipping = new ShippingService();

inventory.reserve("book-1");
payment.charge("order-123");
shipping.createLabel("order-123");
```

Clients must know the subsystem components and coordinate their call
sequence. If the workflow changes, several callers may need updates.

## Solution

Provide a facade that coordinates the subsystem.

``` ts
class InventoryService {
  reserve(productId: string): void {
    console.log(`Reserved ${productId}`);
  }
}

class PaymentService {
  charge(orderId: string): void {
    console.log(`Charged order ${orderId}`);
  }
}

class ShippingService {
  createLabel(orderId: string): void {
    console.log(`Shipping label created for ${orderId}`);
  }
}

class CheckoutFacade {
  constructor(
    private inventory: InventoryService,
    private payment: PaymentService,
    private shipping: ShippingService,
  ) {}

  placeOrder(orderId: string, productId: string): void {
    this.inventory.reserve(productId);
    this.payment.charge(orderId);
    this.shipping.createLabel(orderId);
  }
}

const checkout = new CheckoutFacade(
  new InventoryService(),
  new PaymentService(),
  new ShippingService(),
);

checkout.placeOrder("order-123", "book-1");
```

### What changed?

-   The facade offers a simple `placeOrder()` operation.
-   It hides subsystem coordination from callers.
-   The underlying services remain separate.

### When to use it

-   A subsystem has many classes or a complex workflow.
-   You want a simpler API for common operations.
-   You need to reduce coupling between clients and subsystem internals.

### Watch out

A facade should not become a giant business-logic class. Real checkout
flows also need failure handling, payment idempotency, inventory
release, and transaction or saga design; the example only demonstrates
the structural pattern.

------------------------------------------------------------------------

# 6. Flyweight

**Category:** Structural

## Definition

Flyweight reduces memory use by sharing common, immutable state among
many fine-grained objects while keeping instance-specific state
separate.

## Scenario: rendering thousands of trees

A map renders many trees. Each tree has a species, color, and texture,
plus its own coordinates.

### Without the pattern

``` ts
class Tree {
  constructor(
    public x: number,
    public y: number,
    public species: string,
    public color: string,
    public texture: string,
  ) {}
}

const trees: Tree[] = [];

for (let i = 0; i < 10_000; i++) {
  trees.push(new Tree(i, i * 2, "Oak", "green", "oak-texture"));
}
```

Each tree stores repeated species, color, and texture values. At large
scale, duplicating common state wastes memory.

## Solution

Share the intrinsic state and store position separately.

``` ts
class TreeType {
  constructor(
    public readonly species: string,
    public readonly color: string,
    public readonly texture: string,
  ) {}

  draw(x: number, y: number): void {
    console.log(`Drawing ${this.species} at (${x}, ${y})`);
  }
}

class TreeTypeFactory {
  private static types = new Map<string, TreeType>();

  static getType(species: string, color: string, texture: string): TreeType {
    const key = `${species}|${color}|${texture}`;
    let type = this.types.get(key);

    if (!type) {
      type = new TreeType(species, color, texture);
      this.types.set(key, type);
    }

    return type;
  }
}

class TreeInstance {
  constructor(
    private x: number,
    private y: number,
    private type: TreeType,
  ) {}

  draw(): void {
    this.type.draw(this.x, this.y);
  }
}

const oakType = TreeTypeFactory.getType("Oak", "green", "oak-texture");

const trees = Array.from(
  { length: 10_000 },
  (_, index) => new TreeInstance(index, index * 2, oakType),
);

trees[0].draw();
console.log(trees[0] !== trees[1]); // true: different positions/instances
console.log(oakType === TreeTypeFactory.getType("Oak", "green", "oak-texture")); // true
```

### What changed?

-   `TreeType` holds shared intrinsic state.
-   `TreeInstance` holds extrinsic state such as coordinates.
-   The factory reuses the same `TreeType` for identical configurations.

### When to use it

-   A huge number of objects share repeated state.
-   Memory profiling shows per-object duplication is significant.
-   Shared state can be made immutable or safely managed.

### Watch out

Flyweight adds lookup and design complexity. Measure memory first, and
avoid placing mutable per-instance state in a shared flyweight. In
production, use a robust key strategy if fields can contain separators
or complex values.

------------------------------------------------------------------------

# 7. Proxy

**Category:** Structural

## Definition

Proxy provides a substitute object that controls access to another
object while exposing the same interface.

## Scenario: lazy-loading a large report

A report is expensive to load. The application may create a report
reference but never display it.

### Without the pattern

``` ts
class LargeReport {
  constructor() {
    console.log("Loading large report...");
  }

  display(): void {
    console.log("Displaying report");
  }
}

const report = new LargeReport(); // Loads immediately, even if never displayed.
```

Eager initialization wastes time and resources when the object is not
used.

## Solution

Use a proxy that creates the real object on first use.

``` ts
interface Report {
  display(): void;
}

class RealReport implements Report {
  constructor(private fileName: string) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading ${this.fileName}...`);
  }

  display(): void {
    console.log(`Displaying ${this.fileName}`);
  }
}

class LazyReportProxy implements Report {
  private realReport?: RealReport;

  constructor(private fileName: string) {}

  display(): void {
    if (!this.realReport) {
      this.realReport = new RealReport(this.fileName);
    }

    this.realReport.display();
  }
}

const report: Report = new LazyReportProxy("annual-report.pdf");
console.log("Proxy created; report is not loaded yet");
report.display(); // Loads, then displays
report.display(); // Reuses the loaded report
```

### What changed?

-   Both proxy and real object implement `Report`.
-   The proxy controls when the expensive object is created.
-   The caller uses the same interface without needing to know which
    implementation it has.

### Common proxy types

-   **Virtual proxy:** delays expensive object creation.
-   **Protection proxy:** checks authorization before forwarding.
-   **Remote proxy:** represents an object in another process or
    service.
-   **Caching proxy:** reuses results to avoid repeated work.

### When to use it

-   Lazy initialization of expensive resources.
-   Access control, remote calls, caching, or request instrumentation.
-   You need to control access without changing the client-facing
    interface.

### Watch out

A proxy can introduce hidden latency or failures, especially for remote
calls. Keep its behavior clear and don't assume that a local-looking
method is always cheap or synchronous.

------------------------------------------------------------------------

# How to distinguish the seven patterns

  -----------------------------------------------------------------------
  Pattern                 Core question           Main mechanism
  ----------------------- ----------------------- -----------------------
  Adapter                 How do I make these     Translate one interface
                          incompatible interfaces into another
                          work together?          

  Bridge                  How can two dimensions  Compose abstraction
                          vary independently?     with implementation

  Composite               How can I treat a leaf  Tree of
                          and a group uniformly?  shared-interface
                                                  objects

  Decorator               How can I add behavior  Wrap and delegate
                          without changing the    
                          original class?         

  Facade                  How can I simplify a    One higher-level entry
                          complex subsystem for   point
                          clients?                

  Flyweight               How can I reduce memory Share intrinsic state
                          used by repeated state? 

  Proxy                   How can I control       Stand-in with the same
                          access to an object?    interface
  -----------------------------------------------------------------------

## Common interview comparisons

### Adapter vs Decorator vs Proxy

All three can wrap another object, but their **intent** differs:

-   **Adapter:** changes the interface.
-   **Decorator:** adds responsibilities.
-   **Proxy:** controls access.

### Facade vs Adapter

-   **Facade:** simplifies a subsystem's interface.
-   **Adapter:** makes an existing interface compatible with the one a
    client expects.

### Bridge vs Strategy

They both use composition and interfaces:

-   **Bridge** separates two dimensions of a design so both can grow
    independently.
-   **Strategy** encapsulates interchangeable algorithms or behaviors.

### Composite vs Decorator

-   **Composite** organizes child components into a tree and treats
    groups like individual components.
-   **Decorator** wraps one component to add behavior while preserving
    its interface.

------------------------------------------------------------------------

# How to choose the right pattern

  If your problem is...                                        Consider...
  ------------------------------------------------------------ -------------
  A vendor API doesn't match your domain interface             Adapter
  Two independent dimensions cause a subclass explosion        Bridge
  You need tree-shaped objects and uniform operations          Composite
  Optional behaviors need to be layered around an object       Decorator
  Clients must coordinate too many subsystem classes           Facade
  Many objects repeat the same large immutable data            Flyweight
  You need lazy loading, access checks, or controlled access   Proxy

## TypeScript practice exercises

Try solving each before reading the example:

1.  **Adapter:** Wrap a third-party weather API so your app uses a
    standard `getCurrentWeather(city)` interface.
2.  **Bridge:** Support SMS, email, and push delivery for both urgent
    alerts and routine notifications.
3.  **Composite:** Build an organization chart where departments contain
    employees or other departments, and calculate total headcount.
4.  **Decorator:** Add timing and logging around a service without
    editing its original implementation.
5.  **Facade:** Design a `BookTripFacade` that coordinates flight,
    hotel, and payment services.
6.  **Flyweight:** Render many map markers while sharing immutable icon
    metadata.
7.  **Proxy:** Add authorization checks before a user can access a
    document service.

## Final takeaway

Structural patterns help you control coupling and composition. Choose
based on the problem's intent---not just the shape of the code. Wrapping
an object does not automatically make something an Adapter, Decorator,
or Proxy; the reason for wrapping determines the pattern.
