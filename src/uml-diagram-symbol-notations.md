# UML Diagram Symbol Notations and Their Meanings

UML (Unified Modeling Language) diagrams use symbols to represent classes, objects, relationships, and interactions in a software system.

This guide focuses on the UML notations commonly used in software engineering, Low-Level Design (LLD), and design pattern interviews, with TypeScript examples.

## 1. UML Class Diagram: Basic Symbols

A class is represented by a rectangle divided into three sections:

```text
┌──────────────────────────┐
│       BankAccount        │  ← Class name
├──────────────────────────┤
│ - balance: number        │  ← Properties
│ - accountId: string      │
├──────────────────────────┤
│ + deposit(amount): void  │  ← Methods
│ + getBalance(): number   │
└──────────────────────────┘
```

### Access modifier symbols

| Symbol | Meaning | TypeScript equivalent |
|---|---|---|
| `+` | Public | `public` |
| `-` | Private | `private` |
| `#` | Protected | `protected` |
| `~` | Package visibility | No direct TypeScript equivalent |

Example:

```typescript
class BankAccount {
    private balance: number = 0;

    public deposit(amount: number): void {
        this.balance += amount;
    }

    public getBalance(): number {
        return this.balance;
    }
}
```

In UML:

- `- balance: number` means a private property.
- `+ deposit(amount: number): void` means a public method.
- `+ getBalance(): number` means a public method returning a number.

### How to read a method

```text
+ deposit(amount: number): void
```

- `+` — Public
- `deposit` — Method name
- `amount: number` — Parameter name and type
- `void` — Return type

## 2. UML Relationship Symbols

Relationships between classes have different line styles and arrowheads. The direction and symbol matter.

### A. Association — A class is related to another class

**Notation:** Solid line.

```text
┌────────────┐          ┌────────────┐
│  Customer  │──────────│   Order    │
└────────────┘          └────────────┘
```

**Meaning:** A Customer is associated with an Order. For example, a customer places an order and the application maintains a relationship between them.

```typescript
class Order {
    constructor(public orderId: string) {}
}

class Customer {
    constructor(public order: Order) {}
}
```

The `Customer` class holds a reference to an `Order`.

**Remember:** Association represents a relationship between objects. It does not, by itself, specify ownership or lifecycle.

### B. Inheritance / Generalization — An “is-a” relationship

**Notation:** Solid line with a hollow triangle pointing toward the parent class.

```text
        ┌────────────────┐
        │    Employee    │
        └────────────────┘
                △
                |
        ┌────────────────┐
        │    Manager     │
        └────────────────┘
```

The triangle points toward the parent class, `Employee`.

**Meaning:** A Manager is an Employee.

```typescript
class Employee {
    work(): void {}
}

class Manager extends Employee {
    manageTeam(): void {}
}
```

**Remember:** `extends` in TypeScript typically represents inheritance in a class diagram.

### C. Realization — A class implements an interface

**Notation:** Dashed line with a hollow triangle pointing toward the interface.

```text
        ┌──────────────────┐
        │  PaymentGateway  │
        │   <<interface>>  │
        └──────────────────┘
                  △
                  |
                 - -
                  |
        ┌──────────────────┐
        │     Razorpay     │
        └──────────────────┘
```

The triangle points toward the interface.

**Meaning:** `Razorpay` implements the contract defined by `PaymentGateway`.

```typescript
interface PaymentGateway {
    pay(amount: number): void;
}

class Razorpay implements PaymentGateway {
    pay(amount: number): void {
        console.log(`Paid ${amount}`);
    }
}
```

**Remember:**
- Inheritance: `extends` a class.
- Realization: `implements` an interface.

This notation often appears in Strategy, Adapter, Factory, and Dependency Inversion Principle (DIP) examples.

### D. Dependency — One class uses another

**Notation:** Dashed arrow pointing toward the class being used.

```text
┌─────────────────┐       - - - - - >
│   OrderService  │
└─────────────────┘                   ┌──────────────┐
                                      │ EmailService │
                                      └──────────────┘
```

**Meaning:** `OrderService` depends on `EmailService`. For example, an order service might use an email service to send a confirmation.

```typescript
class EmailService {
    sendEmail(): void {}
}

class OrderService {
    placeOrder(): void {
        const emailService = new EmailService();
        emailService.sendEmail();
    }
}
```

The dashed arrow points from the dependent class to the class it uses.

**Remember:** Dependency often represents usage such as calling a method or using a parameter. Not every dependency must be temporary; the exact relationship depends on the design.

### E. Aggregation — A “has-a” relationship with independent lifecycles

**Notation:** Solid line with a hollow diamond pointing toward the whole.

```text
◇────────────────────────
Team                 Player
```

The hollow diamond is next to `Team`.

**Meaning:** A Team has Players, but Players can exist independently of the Team. If a team is dissolved, its players can still exist and join another team.

```typescript
class Player {
    constructor(public name: string) {}
}

class Team {
    constructor(public players: Player[]) {}
}
```

Here, the `Team` references existing `Player` objects.

**Remember:** Aggregation expresses a weak whole-part relationship. The diamond is placed on the whole/container side.

### F. Composition — A strong whole-part relationship

**Notation:** Solid line with a filled diamond pointing toward the whole.

```text
◆────────────────────────
House                 Room
```

The filled diamond is next to `House`.

**Meaning:** A House contains Rooms as its parts. In the usual composition model, a Room's lifecycle is tied to its owning House.

```typescript
class Room {
    constructor(public name: string) {}
}

class House {
    private rooms: Room[];

    constructor() {
        this.rooms = [
            new Room("Bedroom"),
            new Room("Kitchen")
        ];
    }
}
```

**Remember:**
- Aggregation: Parts can exist independently of the whole.
- Composition: Parts have an ownership relationship with the whole and typically share its lifecycle.

TypeScript does not automatically enforce composition or lifecycle management. This is a design relationship, not a language feature.

## 3. Quick Comparison of Relationship Symbols

| Relationship | UML notation | Meaning | TypeScript example |
|---|---|---|---|
| Association | `────────` | Objects are related | A Customer references an Order |
| Inheritance / Generalization | `──────▷` (solid line, hollow triangle) | Is-a relationship | `Manager extends Employee` |
| Realization | `- - - ▷` (dashed line, hollow triangle) | Implements a contract | `Razorpay implements PaymentGateway` |
| Dependency | `- - - →` (dashed arrow) | Uses another class | A method calls another service |
| Aggregation | `◇──────` | Weak whole-part relationship | A Team has Players |
| Composition | `◆──────` | Strong ownership relationship | A House owns Rooms |

**Arrow direction matters:**

- Inheritance: child → parent.
- Realization: implementing class → interface.
- Dependency: dependent class → class it uses.
- Aggregation and composition: diamond at the whole/container side.

The arrow shapes above are simplified text representations. In a UML diagram, use the actual arrowhead and line style.

## 4. Other UML Symbols You'll Encounter

| Symbol / notation | Meaning | Example use |
|---|---|---|
| `<<interface>>` | Interface stereotype | `PaymentGateway` |
| `<<abstract>>` | Abstract classifier notation in some UML styles | Abstract payment processor |
| `*` | Unlimited multiplicity | A customer can have many orders |
| `1` | Exactly one | An order belongs to one customer |
| `0..1` | Zero or one | An order may have one coupon |
| `1..*` | One or more | An order has one or more items |
| `0..*` | Zero or more | A customer may have no orders |
| Underlined member | Static member | `Math.max()` |
| Italicized class or operation name | Abstract class or operation in standard UML notation | Abstract `PaymentProcessor` |
| `<<enumeration>>` | Enumeration | Order status |

### Understanding multiplicity

```text
Customer 1 ───────── 0..* Order
```

Read it as: **One Customer can have zero or more Orders.**

The multiplicity written next to a class describes how many instances of that class can participate in the relationship for one instance at the opposite end.

```typescript
class Customer {
    constructor(public orders: Order[]) {}
}

class Order {
    constructor(public orderId: string) {}
}
```

The `0..*` multiplicity indicates that a customer can have no orders or many orders.

## 5. UML Sequence Diagram Symbols

A sequence diagram shows how objects communicate over time. For example, an API request that retrieves a customer's orders:

```text
  Client          OrderController       OrderService
    |                    |                    |
    |  getOrders()       |                    |
    |------------------->|                    |
    |                    |  getOrders()       |
    |                    |------------------->|
    |                    |                    |
    |                    |     Order[]        |
    |                    |<-------------------|
    |    Order[]         |                    |
    |<-------------------|                    |
    |                    |                    |
```

### Common sequence diagram notations

| Symbol | Meaning |
|---|---|
| Rectangle at the top | Participant or object |
| Vertical dashed line | Lifeline |
| Thin vertical rectangle on a lifeline | Activation / execution specification |
| Solid arrow | Message or call; exact style depends on message type |
| Dashed arrow | Often a reply or return message |
| `X` at the end of a lifeline | Destruction occurrence |
| `alt` | Alternative paths, similar to `if/else` |
| `loop` | Repeated interaction |
| `opt` | Optional interaction |

Sequence diagrams are useful for visualizing API calls, service interactions, database operations, and event-driven workflows.

## 6. The Most Important Distinction for LLD Interviews

When reading a class diagram, first identify what each line communicates.

| If you see... | Ask yourself... |
|---|---|
| Solid line | Are these classes associated? |
| Solid line + hollow triangle | Which class inherits from which? |
| Dashed line + hollow triangle | Which class implements the interface? |
| Dashed arrow | Which class depends on or uses another? |
| Hollow diamond | Which class aggregates the other? |
| Filled diamond | Which class owns the other as a composite part? |

### Example: Strategy pattern

```text
      <<interface>>
       PaymentStrategy
              △
              |
             - -
              |
      CreditCardStrategy

      CheckoutService - - - → PaymentStrategy
```

This indicates that `CreditCardStrategy` implements the `PaymentStrategy` interface, while `CheckoutService` depends on the abstraction.

This is the key idea behind programming to an interface rather than coupling a service directly to a concrete implementation.

## Final Rule

UML describes a design; it does not always map one-to-one to a programming-language feature. Use the diagram to understand the intended relationships, then check how those relationships are implemented in TypeScript.
