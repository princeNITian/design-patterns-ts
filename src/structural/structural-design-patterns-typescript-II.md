# Structural Design Patterns in TypeScript

This document collects the same examples in the same order as discussed:

1.  Adapter
2.  Bridge
3.  Composite
4.  Decorator
5.  Facade
6.  Flyweight
7.  Proxy

------------------------------------------------------------------------

# 1. Adapter Pattern

The **Adapter Pattern** is a structural design pattern that allows two
incompatible interfaces to work together without changing the existing
code.

Think of it like a travel plug adapter: your charger has one type of
plug, but the wall socket accepts another. The adapter sits between them
and makes them compatible.

## Example: Payment gateway

Your application expects every payment provider to have a `charge()`
method that accepts an amount in paise. An old payment provider exposes
`makePayment()` and expects the amount in rupees.

### Step 1: Define what your application expects

``` typescript
interface PaymentGateway {
  charge(amountInPaise: number): void;
}
```

### Step 2: The existing incompatible class

``` typescript
class LegacyPaymentProvider {
  makePayment(amountInRupees: number): void {
    console.log(`Charged ₹${amountInRupees}`);
  }
}
```

The mismatch is:

-   Expected method: `charge()`
-   Available method: `makePayment()`
-   Expected unit: paise
-   Actual unit: rupees

Assume we cannot modify this legacy class.

### Step 3: Create the adapter

``` typescript
class LegacyPaymentAdapter implements PaymentGateway {
  constructor(
    private readonly provider: LegacyPaymentProvider
  ) {}

  charge(amountInPaise: number): void {
    const amountInRupees = amountInPaise / 100;

    this.provider.makePayment(amountInRupees);
  }
}
```

### Step 4: Use it

``` typescript
const legacyProvider = new LegacyPaymentProvider();

const gateway: PaymentGateway =
  new LegacyPaymentAdapter(legacyProvider);

gateway.charge(50000);
```

Output:

``` text
Charged ₹500
```

### How the calls flow

1.  `gateway.charge(50000)`
2.  The adapter receives `50000` paise.
3.  It converts `50000 / 100` to `500` rupees.
4.  It calls `provider.makePayment(500)`.

### Why is this a structural pattern?

The main problem is making two existing components fit together. The
adapter connects the application's expected interface to the legacy
provider's incompatible interface.

**Remember:** the adapter doesn't necessarily change the existing class.
It wraps that class and translates between the two interfaces.

------------------------------------------------------------------------

# 2. Bridge Pattern

The **Bridge Pattern** is a structural design pattern that separates
what something does from how it does it, so both sides can change
independently.

## Example: Notification system

Suppose your application sends notifications through two channels:

-   Email
-   SMS

And supports two kinds of notifications:

-   Normal notification
-   Urgent notification

A straightforward approach might create `EmailNotification`,
`SMSNotification`, `UrgentEmailNotification`, and
`UrgentSMSNotification`. Adding more channels and notification types
makes the number of combinations grow.

Bridge separates notification type and delivery channel into two
independent hierarchies and connects them using composition.

### Step 1: Define the delivery mechanism

``` typescript
interface NotificationSender {
  send(message: string): void;
}
```

``` typescript
class EmailSender implements NotificationSender {
  send(message: string): void {
    console.log(`Sending EMAIL: ${message}`);
  }
}

class SmsSender implements NotificationSender {
  send(message: string): void {
    console.log(`Sending SMS: ${message}`);
  }
}
```

### Step 2: Create the abstraction

``` typescript
abstract class Notification {
  constructor(
    protected readonly sender: NotificationSender
  ) {}

  abstract notify(message: string): void;
}
```

The notification represents what we want to do. It delegates the actual
delivery to a sender.

### Step 3: Add different notification types

``` typescript
class NormalNotification extends Notification {
  notify(message: string): void {
    this.sender.send(message);
  }
}

class UrgentNotification extends Notification {
  notify(message: string): void {
    this.sender.send(`URGENT: ${message}`);
  }
}
```

Neither notification class needs to know whether the message will be
sent through email or SMS.

### Step 4: Combine them

``` typescript
const normalEmail =
  new NormalNotification(new EmailSender());

normalEmail.notify("Your order has shipped");

const urgentSms =
  new UrgentNotification(new SmsSender());

urgentSms.notify("Your payment failed");

const urgentEmail =
  new UrgentNotification(new EmailSender());

urgentEmail.notify("Server is down");
```

Output:

``` text
Sending EMAIL: Your order has shipped
Sending SMS: URGENT: Your payment failed
Sending EMAIL: URGENT: Server is down
```

### Why Bridge?

You can add `PushNotificationSender` without creating a separate class
for every notification type. You can also add a `ReminderNotification`
without creating separate reminder classes for email and SMS.

**Remember:** Bridge is useful when two independent dimensions need to
evolve separately. Instead of creating a class for every possible
combination, keep two hierarchies connected through an abstraction and
an implementation interface.

------------------------------------------------------------------------

# 3. Composite Pattern

The **Composite Pattern** is a structural design pattern that lets you
treat an individual object and a group of objects in the same way.

## Example: Company organization

Imagine a company has individual employees, managers who manage several
employees, and directors who manage multiple managers and employees.

Suppose you want to calculate the total salary of everyone reporting
under a director. Composite lets an individual employee and a group use
the same operation.

### Step 1: Define a common interface

``` typescript
interface OrganizationComponent {
  getTotalSalary(): number;
}
```

Both individual employees and groups of employees implement this
interface.

### Step 2: Create the leaf --- an individual employee

``` typescript
class Employee implements OrganizationComponent {
  constructor(
    private readonly name: string,
    private readonly salary: number
  ) {}

  getTotalSalary(): number {
    return this.salary;
  }
}
```

An employee is a leaf because an individual employee doesn't contain
other employees in this model.

### Step 3: Create the composite --- a department

``` typescript
class Department implements OrganizationComponent {
  private members: OrganizationComponent[] = [];

  constructor(private readonly name: string) {}

  add(member: OrganizationComponent): void {
    this.members.push(member);
  }

  getTotalSalary(): number {
    return this.members.reduce(
      (total, member) => total + member.getTotalSalary(),
      0
    );
  }
}
```

A department can contain individual employees or other departments
because both implement `OrganizationComponent`.

### Step 4: Build the organization

``` typescript
const alice = new Employee("Alice", 50000);
const bob = new Employee("Bob", 60000);
const charlie = new Employee("Charlie", 40000);

const engineering = new Department("Engineering");
engineering.add(alice);
engineering.add(bob);

const support = new Department("Support");
support.add(charlie);

const company = new Department("Company");
company.add(engineering);
company.add(support);

console.log(alice.getTotalSalary());
// 50000

console.log(engineering.getTotalSalary());
// 110000

console.log(company.getTotalSalary());
// 150000
```

### How it works

-   Alice returns `50000`.
-   Engineering adds Alice's and Bob's salaries: `110000`.
-   Support returns Charlie's salary: `40000`.
-   Company adds the department totals: `150000`.

Without Composite, the caller might need to check whether an item is an
employee or a department. With Composite, the caller simply invokes:

``` typescript
item.getTotalSalary();
```

**Remember:** Composite means individual objects and groups share the
same interface, making hierarchical structures easier to work with.

Common examples include file systems (files and folders), UI trees
(buttons and panels), and organization hierarchies.

------------------------------------------------------------------------

# 4. Decorator Pattern

The **Decorator Pattern** is a structural design pattern that lets you
add new behavior to an object dynamically, without modifying its
original class.

## Example: Ordering coffee

Suppose plain coffee costs ₹100. Customers can add milk for ₹20 or extra
espresso for ₹40.

Creating a separate class for every combination---such as
`CoffeeWithMilk`, `CoffeeWithEspresso`, and
`CoffeeWithMilkAndEspresso`---makes the number of classes grow quickly.
Decorator solves this by wrapping an existing coffee object with
additional behavior.

### Step 1: Define a common interface

``` typescript
interface Coffee {
  getCost(): number;
  getDescription(): string;
}
```

Every coffee and every add-on implements this interface.

### Step 2: Create the base coffee

``` typescript
class PlainCoffee implements Coffee {
  getCost(): number {
    return 100;
  }

  getDescription(): string {
    return "Plain Coffee";
  }
}
```

### Step 3: Create a decorator base class

``` typescript
abstract class CoffeeDecorator implements Coffee {
  constructor(protected readonly coffee: Coffee) {}

  abstract getCost(): number;
  abstract getDescription(): string;
}
```

The decorator holds a `Coffee` object. That object could be plain coffee
or another decorated coffee.

### Step 4: Add milk

``` typescript
class MilkDecorator extends CoffeeDecorator {
  getCost(): number {
    return this.coffee.getCost() + 20;
  }

  getDescription(): string {
    return this.coffee.getDescription() + " + Milk";
  }
}
```

### Step 5: Add extra espresso

``` typescript
class EspressoDecorator extends CoffeeDecorator {
  getCost(): number {
    return this.coffee.getCost() + 40;
  }

  getDescription(): string {
    return this.coffee.getDescription() + " + Extra Espresso";
  }
}
```

### Step 6: Combine decorators

``` typescript
let coffee: Coffee = new PlainCoffee();

coffee = new MilkDecorator(coffee);
coffee = new EspressoDecorator(coffee);

console.log(coffee.getDescription());
console.log(coffee.getCost());
```

Output:

``` text
Plain Coffee + Milk + Extra Espresso
160
```

### How wrapping works

-   `PlainCoffee`: base cost ₹100.
-   `MilkDecorator`: wraps plain coffee and adds ₹20.
-   `EspressoDecorator`: wraps the milk-decorated coffee and adds ₹40.

Total: `100 + 20 + 40 = 160`.

**Remember:** Decorator composes objects by wrapping one object inside
another. Each decorator implements the same interface, holds another
object of that interface, and adds its own behavior.

------------------------------------------------------------------------

# 5. Facade Pattern

The **Facade Pattern** is a structural design pattern that provides a
simple interface to a complex system.

Think of a hotel receptionist: you don't need to contact housekeeping,
room service, and maintenance separately. You tell the receptionist what
you need, and they coordinate with the appropriate departments.

## Example: E-commerce order processing

When a customer places an order, several things need to happen:

1.  Validate the order.
2.  Process the payment.
3.  Update the inventory.
4.  Arrange shipping.
5.  Send an order confirmation.

Without a facade, the client must coordinate all these services itself.

### Step 1: Create the underlying services

``` typescript
class OrderValidator {
  validate(orderId: string): void {
    console.log(`Validating order ${orderId}`);
  }
}

class PaymentService {
  processPayment(orderId: string): void {
    console.log(`Processing payment for ${orderId}`);
  }
}

class InventoryService {
  updateStock(orderId: string): void {
    console.log(`Updating inventory for ${orderId}`);
  }
}

class ShippingService {
  arrangeShipping(orderId: string): void {
    console.log(`Arranging shipping for ${orderId}`);
  }
}
```

Each class has its own responsibility.

### Step 2: Create the facade

``` typescript
class OrderFacade {
  constructor(
    private readonly validator: OrderValidator,
    private readonly payment: PaymentService,
    private readonly inventory: InventoryService,
    private readonly shipping: ShippingService
  ) {}

  placeOrder(orderId: string): void {
    this.validator.validate(orderId);
    this.payment.processPayment(orderId);
    this.inventory.updateStock(orderId);
    this.shipping.arrangeShipping(orderId);

    console.log("Order placed successfully!");
  }
}
```

The facade coordinates the services in the required order.

### Step 3: Use it from the client

``` typescript
const orderFacade = new OrderFacade(
  new OrderValidator(),
  new PaymentService(),
  new InventoryService(),
  new ShippingService()
);

orderFacade.placeOrder("ORD-101");
```

Output:

``` text
Validating order ORD-101
Processing payment for ORD-101
Updating inventory for ORD-101
Arranging shipping for ORD-101
Order placed successfully!
```

The client makes one method call, while the facade handles the workflow.

**Production note:** this is a simplified example. Real order processing
also needs error handling, idempotency, and a strategy for failures such
as payment succeeding while an inventory update fails.

### Facade vs. Adapter

-   **Adapter:** changes the interface of an existing component so
    another component can use it.
-   **Facade:** provides a simpler interface to a collection of
    components or a complex subsystem.

**Remember:** use Facade when you want to hide subsystem complexity
behind a simple, high-level interface.

------------------------------------------------------------------------

# 6. Flyweight Pattern

The **Flyweight Pattern** is a structural design pattern that reduces
memory usage by sharing common data between many objects instead of
storing duplicate copies.

## Example: Trees in a video game

Imagine a game rendering 10,000 trees. Each tree has:

-   **Shared data:** tree type, texture, and color.
-   **Unique data:** X and Y coordinates on the map.

The Flyweight Pattern separates these into:

-   **Intrinsic state:** common, reusable data shared between objects.
-   **Extrinsic state:** unique data supplied from outside when needed.

### Step 1: Create the shared object

`TreeType` contains the data common to trees of the same type.

``` typescript
class TreeType {
  constructor(
    public readonly name: string,
    public readonly color: string,
    public readonly texture: string
  ) {}

  render(x: number, y: number): void {
    console.log(
      `Rendering ${this.name} tree (${this.color}) at (${x}, ${y})`
    );
  }
}
```

### Step 2: Create a Flyweight Factory

The factory reuses an existing `TreeType` instead of creating a
duplicate for every tree.

``` typescript
class TreeTypeFactory {
  private static treeTypes = new Map<string, TreeType>();

  static getTreeType(
    name: string,
    color: string,
    texture: string
  ): TreeType {
    const key = `${name}-${color}-${texture}`;

    if (!this.treeTypes.has(key)) {
      this.treeTypes.set(
        key,
        new TreeType(name, color, texture)
      );
    }

    return this.treeTypes.get(key)!;
  }
}
```

If the requested tree type already exists, the factory returns the same
object.

### Step 3: Store unique state separately

``` typescript
class Tree {
  constructor(
    private readonly x: number,
    private readonly y: number,
    private readonly type: TreeType
  ) {}

  render(): void {
    this.type.render(this.x, this.y);
  }
}
```

Each `Tree` stores its own coordinates but references a shared
`TreeType`.

### Step 4: Create many trees

``` typescript
const oakType = TreeTypeFactory.getTreeType(
  "Oak",
  "Green",
  "Oak Texture"
);

const tree1 = new Tree(10, 20, oakType);
const tree2 = new Tree(50, 80, oakType);

tree1.render();
tree2.render();

console.log(tree1 === tree2); // false

console.log(
  TreeTypeFactory.getTreeType(
    "Oak",
    "Green",
    "Oak Texture"
  ) === oakType
); // true
```

Output:

``` text
Rendering Oak tree (Green) at (10, 20)
Rendering Oak tree (Green) at (50, 80)
false
true
```

There are two different `Tree` objects, but both share the exact same
`TreeType` object.

**Remember:** Flyweight shares intrinsic state and keeps extrinsic state
separate. It is useful when many similar objects consume significant
memory through duplicated data. It adds complexity, so use it when
shared data is a meaningful memory cost.

Common examples include video games, text editors sharing
character-formatting information, and maps sharing icons and styles.

------------------------------------------------------------------------

# 7. Proxy Pattern

The **Proxy Pattern** is a structural design pattern that provides a
substitute object to control access to another object.

Think of it like a security guard at an office: the guard checks your
permission before allowing you into a restricted room.

A proxy can control access, delay expensive object creation, cache
results, or add logging.

## Example: Lazy-loading images

Imagine an application that displays high-resolution images. Loading
each image from a remote server is expensive. You don't want to load all
100 images in a gallery immediately; you want to load an image only when
the user views it.

### Step 1: Define a common interface

Both the real object and its proxy expose the same interface.

``` typescript
interface Image {
  display(): void;
}
```

### Step 2: Create the real object

This represents the expensive operation.

``` typescript
class RealImage implements Image {
  constructor(private readonly filename: string) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading image: ${this.filename}`);
  }

  display(): void {
    console.log(`Displaying image: ${this.filename}`);
  }
}
```

Creating a `RealImage` immediately loads the image.

### Step 3: Create the proxy

The proxy delays creating the real image until `display()` is called.

``` typescript
class ImageProxy implements Image {
  private realImage?: RealImage;

  constructor(private readonly filename: string) {}

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }

    this.realImage.display();
  }
}
```

The proxy creates the real image only when required and reuses it for
subsequent calls.

### Step 4: Use it

``` typescript
const image: Image = new ImageProxy("vacation.jpg");

console.log("Image object created");
image.display();
image.display();
```

Output:

``` text
Image object created
Loading image: vacation.jpg
Displaying image: vacation.jpg
Displaying image: vacation.jpg
```

The image loads only once, on the first call to `display()`.

### How the Proxy works

1.  The client calls `display()`.
2.  `ImageProxy` checks whether the image is loaded.
3.  If it is not loaded, the proxy creates `RealImage`.
4.  `RealImage` loads and displays the image.
5.  On later calls, the proxy reuses the real image.

### Other uses of Proxy

  -----------------------------------------------------------------------
  Type of proxy           Purpose                 Example
  ----------------------- ----------------------- -----------------------
  Virtual proxy           Delays expensive object Lazy-loading images
                          creation                

  Protection proxy        Controls permissions    Checking user
                                                  authorization

  Caching proxy           Reuses previous results Caching API responses

  Logging proxy           Records access and      Logging service
                          calls                   requests

  Remote proxy            Represents an object on Calling a remote
                          another system          service
  -----------------------------------------------------------------------

**Remember:** use Proxy when you want an intermediary object to control
access to another object without requiring the client to interact with
the real object directly.

------------------------------------------------------------------------

# Quick Revision

  -----------------------------------------------------------------------
  Pattern                 Main purpose            Simple way to remember
  ----------------------- ----------------------- -----------------------
  Adapter                 Makes incompatible      Translate
                          interfaces work         
                          together                

  Bridge                  Separates two           Separate
                          independent dimensions  
                          of a design             

  Composite               Treats individual       Tree structure
                          objects and groups      
                          uniformly               

  Decorator               Adds behavior by        Add features
                          wrapping an object      

  Facade                  Simplifies access to a  One simple entry point
                          complex subsystem       

  Flyweight               Shares common data to   Share
                          reduce memory use       

  Proxy                   Controls access to      Gatekeeper
                          another object          
  -----------------------------------------------------------------------
