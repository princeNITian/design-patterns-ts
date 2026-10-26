# Behavioral Design Patterns in TypeScript

A practical guide to the **11 classic Gang of Four (GoF) behavioral
design patterns**, with TypeScript examples, problems, solutions, use
cases, and interview notes.

## What are behavioral design patterns?

Behavioral patterns focus on **how objects communicate, share
responsibilities, and coordinate algorithms**.

  -----------------------------------------------------------------------
  Pattern                 Main idea               Typical use
  ----------------------- ----------------------- -----------------------
  Chain of Responsibility Pass a request through  Middleware, approval
                          handlers                workflows

  Command                 Encapsulate a request   Queues, undo/redo
                          as an object            

  Interpreter             Represent and evaluate  Rules, filters,
                          a small grammar         expressions

  Iterator                Traverse a collection   Custom collections,
                          without exposing        trees
                          storage                 

  Mediator                Centralize              UI coordination,
                          communication among     workflows
                          objects                 

  Memento                 Capture and restore     Undo, checkpoints
                          object state            

  Observer                Notify subscribers when Events, notifications
                          something changes       

  State                   Change behavior based   Order lifecycle,
                          on internal state       connections

  Strategy                Swap interchangeable    Pricing, routing
                          algorithms              

  Template Method         Define an algorithm     Import pipelines
                          skeleton with           
                          customizable steps      

  Visitor                 Add operations to a     AST analysis, document
                          stable object structure exports
  -----------------------------------------------------------------------

> Patterns are tools, not rules. Use the simplest design that keeps
> responsibilities clear.

------------------------------------------------------------------------

# 1. Chain of Responsibility

**Category:** Behavioral

## Definition

Pass a request through a sequence of handlers. Each handler can process
it, reject it, or pass it onward.

## Problem without the pattern

``` ts
type Request = {
  token?: string;
  isAdmin: boolean;
  requestsInMinute: number;
};

function handleRequest(request: Request): string {
  if (!request.token) return "401 Unauthorized";
  if (!request.isAdmin) return "403 Forbidden";
  if (request.requestsInMinute > 100) return "429 Too Many Requests";
  return "200 OK";
}
```

As checks grow, one function accumulates responsibilities and becomes
harder to extend or reorder.

## Solution

``` ts
type Request = {
  token?: string;
  isAdmin: boolean;
  requestsInMinute: number;
};

interface Handler {
  setNext(next: Handler): Handler;
  handle(request: Request): string | undefined;
}

abstract class BaseHandler implements Handler {
  private next?: Handler;

  setNext(next: Handler): Handler {
    this.next = next;
    return next;
  }

  handle(request: Request): string | undefined {
    return this.next?.handle(request);
  }
}

class AuthenticationHandler extends BaseHandler {
  handle(request: Request): string | undefined {
    if (!request.token) return "401 Unauthorized";
    return super.handle(request);
  }
}

class AuthorizationHandler extends BaseHandler {
  handle(request: Request): string | undefined {
    if (!request.isAdmin) return "403 Forbidden";
    return super.handle(request);
  }
}

class RateLimitHandler extends BaseHandler {
  handle(request: Request): string | undefined {
    if (request.requestsInMinute > 100) return "429 Too Many Requests";
    return super.handle(request);
  }
}

const auth = new AuthenticationHandler();
auth.setNext(new AuthorizationHandler())
  .setNext(new RateLimitHandler());

const result = auth.handle({
  token: "valid-token",
  isAdmin: true,
  requestsInMinute: 10,
}) ?? "200 OK";

console.log(result);
```

**Why it helps:** each handler owns one check, and the chain controls
the processing order.

**Use it for:** middleware, approval workflows, validation pipelines.

**Trade-off:** define a clear terminal behavior. Real authentication
must verify credentials rather than merely checking that a token exists.

------------------------------------------------------------------------

# 2. Command

**Category:** Behavioral

## Definition

Encapsulate a request as an object, separating the invoker from the code
that performs the action.

## Problem without the pattern

``` ts
class TextEditor {
  private text = "";

  append(value: string): void {
    this.text += value;
  }

  getText(): string {
    return this.text;
  }
}

const editor = new TextEditor();
editor.append("Hello");
```

This is fine for a tiny program, but actions are harder to queue, log,
or undo when they are only direct method calls.

## Solution

``` ts
interface Command {
  execute(): void;
  undo(): void;
}

class TextEditor {
  private text = "";

  append(value: string): void {
    this.text += value;
  }

  removeLast(length: number): void {
    this.text = this.text.slice(0, -length);
  }

  getText(): string {
    return this.text;
  }
}

class AppendTextCommand implements Command {
  constructor(private editor: TextEditor, private value: string) {}

  execute(): void {
    this.editor.append(this.value);
  }

  undo(): void {
    this.editor.removeLast(this.value.length);
  }
}

class CommandHistory {
  private history: Command[] = [];

  run(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  undoLast(): void {
    this.history.pop()?.undo();
  }
}

const editor = new TextEditor();
const history = new CommandHistory();

history.run(new AppendTextCommand(editor, "Hello"));
history.run(new AppendTextCommand(editor, " world"));
console.log(editor.getText()); // Hello world

history.undoLast();
console.log(editor.getText()); // Hello
```

**Why it helps:** commands share one interface, so an invoker can
execute them without knowing their concrete classes.

**Use it for:** undo/redo, job queues, scheduled actions, action
logging.

**Trade-off:** each command must preserve enough information to reverse
its effect safely.

------------------------------------------------------------------------

# 3. Interpreter

**Category:** Behavioral

## Definition

Represent a small grammar as expression objects and evaluate the
resulting structure.

## Problem without the pattern

``` ts
type User = { isAdmin: boolean; isActive: boolean };

function canAccess(user: User, rule: string): boolean {
  if (rule === "admin") return user.isAdmin;
  if (rule === "active") return user.isActive;
  if (rule === "admin-and-active") return user.isAdmin && user.isActive;
  throw new Error("Unknown rule");
}
```

As rules grow, string-based conditionals become difficult to extend and
validate.

## Solution

``` ts
type User = { isAdmin: boolean; isActive: boolean };

interface Expression {
  interpret(user: User): boolean;
}

class AdminExpression implements Expression {
  interpret(user: User): boolean {
    return user.isAdmin;
  }
}

class ActiveExpression implements Expression {
  interpret(user: User): boolean {
    return user.isActive;
  }
}

class AndExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret(user: User): boolean {
    return this.left.interpret(user) && this.right.interpret(user);
  }
}

const rule = new AndExpression(new AdminExpression(), new ActiveExpression());
console.log(rule.interpret({ isAdmin: true, isActive: true })); // true
```

**Why it helps:** rules can be composed from reusable expression
objects.

**Use it for:** small rule engines, filters, boolean expressions.

**Trade-off:** for a large language, a real parser and grammar tooling
are usually more appropriate.

------------------------------------------------------------------------

# 4. Iterator

**Category:** Behavioral

## Definition

Traverse a collection without exposing its internal storage
representation.

## Problem without the pattern

``` ts
class NumberStore {
  constructor(public items: number[]) {}
}

const store = new NumberStore([10, 20, 30]);
for (let i = 0; i < store.items.length; i++) {
  console.log(store.items[i]);
}
```

The caller depends directly on the collection being an array.

## Solution

``` ts
class NumberCollection implements Iterable<number> {
  constructor(private readonly items: number[]) {}

  *[Symbol.iterator](): Iterator<number> {
    for (const item of this.items) {
      yield item;
    }
  }
}

const numbers = new NumberCollection([10, 20, 30]);
for (const number of numbers) {
  console.log(number);
}
```

**Why it helps:** consumers depend on the iterable contract, not the
storage implementation.

**Use it for:** custom collections, tree traversal, lazy sequences.

**Trade-off:** don't implement a custom iterator if a normal array
already solves the problem.

------------------------------------------------------------------------

# 5. Mediator

**Category:** Behavioral

## Definition

Centralize communication between collaborating objects so they don't
need direct references to one another.

## Problem without the pattern

``` ts
class TotalDisplay {
  show(amount: number): void {
    console.log(`Total: ${amount}`);
  }
}

class CouponInput {
  constructor(private total: TotalDisplay) {}

  applyDiscount(): void {
    this.total.show(90);
  }
}
```

As more UI components interact, direct references and cross-component
logic can multiply.

## Solution

``` ts
interface CheckoutMediator {
  applyCoupon(): void;
  submitOrder(): void;
}

class TotalDisplay {
  show(amount: number): void {
    console.log(`Total: ${amount}`);
  }
}

class CouponInput {
  constructor(private mediator: CheckoutMediator) {}
  apply(): void {
    this.mediator.applyCoupon();
  }
}

class SubmitButton {
  constructor(private mediator: CheckoutMediator) {}
  click(): void {
    this.mediator.submitOrder();
  }
}

class CheckoutCoordinator implements CheckoutMediator {
  private total = 100;
  private display = new TotalDisplay();

  applyCoupon(): void {
    this.total = 90;
    this.display.show(this.total);
  }

  submitOrder(): void {
    console.log(`Submitting order for ${this.total}`);
  }
}

const checkout = new CheckoutCoordinator();
new CouponInput(checkout).apply();
new SubmitButton(checkout).click();
```

**Why it helps:** components call a coordinator, which owns the
interaction workflow.

**Use it for:** UI dialogs, checkout workflows, chat rooms.

**Trade-off:** a mediator can become a god object; split it when its
responsibilities grow too broad.

------------------------------------------------------------------------

# 6. Memento

**Category:** Behavioral

## Definition

Capture an object's state so it can be restored later, without exposing
its internal representation to the history manager.

## Problem without the pattern

``` ts
class Editor {
  text = "Hello";
  type(value: string): void {
    this.text += value;
  }
}

const editor = new Editor();
editor.type(" world");
editor.text = "Hello"; // Caller must know how to restore state.
```

External code manipulates internal state to perform a restore.

## Solution

``` ts
type EditorMemento = { readonly text: string };

class Editor {
  private text = "";

  type(value: string): void {
    this.text += value;
  }

  save(): EditorMemento {
    return { text: this.text };
  }

  restore(memento: EditorMemento): void {
    this.text = memento.text;
  }

  getText(): string {
    return this.text;
  }
}

const editor = new Editor();
editor.type("Hello");
const checkpoint = editor.save();

editor.type(" world");
console.log(editor.getText()); // Hello world

editor.restore(checkpoint);
console.log(editor.getText()); // Hello
```

**Why it helps:** the editor owns snapshot creation and restoration.

**Use it for:** undo, checkpoints, rollback of in-memory state.

**Trade-off:** snapshots can consume memory; large states may need diffs
or bounded history.

------------------------------------------------------------------------

# 7. Observer

**Category:** Behavioral

## Definition

Create a one-to-many dependency: when a subject emits an event,
subscribers are notified.

## Problem without the pattern

``` ts
class OrderService {
  ship(orderId: string): void {
    console.log(`Order ${orderId} shipped`);
    // Email, SMS, and analytics calls would accumulate here.
  }
}
```

The order service becomes coupled to every consumer of an order event.

## Solution

``` ts
type OrderEvent = { orderId: string; status: "shipped" };
type Observer = (event: OrderEvent) => void;

class OrderService {
  private observers = new Set<Observer>();

  subscribe(observer: Observer): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  ship(orderId: string): void {
    const event: OrderEvent = { orderId, status: "shipped" };
    for (const observer of this.observers) observer(event);
  }
}

const orders = new OrderService();

const unsubscribeEmail = orders.subscribe((event) => {
  console.log(`Email: ${event.orderId} shipped`);
});

orders.subscribe((event) => {
  console.log(`Analytics: ${event.status}`);
});

orders.ship("ORD-101");
unsubscribeEmail();
```

**Why it helps:** the publisher doesn't need to know its subscribers.

**Use it for:** UI updates, domain events, notification systems.

**Trade-off:** decide how subscriber errors are handled. An in-process
observer is not equivalent to a durable broker such as Kafka.

------------------------------------------------------------------------

# 8. State

**Category:** Behavioral

## Definition

Delegate behavior to state objects so an object's behavior changes when
its internal state changes.

## Problem without the pattern

``` ts
type Status = "pending" | "paid" | "shipped";

class Order {
  status: Status = "pending";

  pay(): void {
    if (this.status !== "pending") throw new Error("Cannot pay");
    this.status = "paid";
  }

  ship(): void {
    if (this.status !== "paid") throw new Error("Cannot ship");
    this.status = "shipped";
  }
}
```

As states and actions multiply, conditional checks spread throughout the
class.

## Solution

``` ts
interface OrderState {
  pay(order: Order): void;
  ship(order: Order): void;
  label(): string;
}

class PendingState implements OrderState {
  pay(order: Order): void {
    order.setState(new PaidState());
  }

  ship(): void {
    throw new Error("Pay before shipping");
  }

  label(): string {
    return "pending";
  }
}

class PaidState implements OrderState {
  pay(): void {
    throw new Error("Already paid");
  }

  ship(order: Order): void {
    order.setState(new ShippedState());
  }

  label(): string {
    return "paid";
  }
}

class ShippedState implements OrderState {
  pay(): void {
    throw new Error("Already shipped");
  }

  ship(): void {
    throw new Error("Already shipped");
  }

  label(): string {
    return "shipped";
  }
}

class Order {
  private state: OrderState = new PendingState();

  setState(state: OrderState): void {
    this.state = state;
  }

  pay(): void {
    this.state.pay(this);
  }

  ship(): void {
    this.state.ship(this);
  }

  getStatus(): string {
    return this.state.label();
  }
}

const order = new Order();
order.pay();
order.ship();
console.log(order.getStatus()); // shipped
```

**Why it helps:** each state owns the behavior and transitions valid for
that state.

**Use it for:** order lifecycle, payment lifecycle, network connections.

**Trade-off:** for very small state machines, an enum and a simple
switch may be clearer.

------------------------------------------------------------------------

# 9. Strategy

**Category:** Behavioral

## Definition

Define a family of interchangeable algorithms, encapsulate each one, and
make them selectable independently of the client.

## Problem without the pattern

``` ts
type CustomerType = "standard" | "member";

function calculateTotal(amount: number, type: CustomerType): number {
  if (type === "member") return amount * 0.9;
  return amount;
}
```

Adding seasonal, partner, or regional pricing makes this function grow.

## Solution

``` ts
interface PricingStrategy {
  calculate(amount: number): number;
}

class StandardPricing implements PricingStrategy {
  calculate(amount: number): number {
    return amount;
  }
}

class MemberPricing implements PricingStrategy {
  calculate(amount: number): number {
    return amount * 0.9;
  }
}

class Checkout {
  constructor(private pricing: PricingStrategy) {}

  setPricingStrategy(strategy: PricingStrategy): void {
    this.pricing = strategy;
  }

  total(amount: number): number {
    return this.pricing.calculate(amount);
  }
}

const checkout = new Checkout(new StandardPricing());
console.log(checkout.total(100)); // 100

checkout.setPricingStrategy(new MemberPricing());
console.log(checkout.total(100)); // 90
```

**Why it helps:** the client depends on a stable interface, not a
particular algorithm.

**Use it for:** pricing, routing, compression, sorting, payment
selection.

**Trade-off:** a simple function may be enough when there are only a few
stable cases.

------------------------------------------------------------------------

# 10. Template Method

**Category:** Behavioral

## Definition

Define an algorithm's skeleton in a base class and let subclasses
customize specific steps without changing the overall sequence.

## Problem without the pattern

``` ts
function importCsv(input: string): void {
  console.log("Read CSV");
  console.log("Parse CSV");
  console.log("Validate records");
  console.log("Save records");
}

function importJson(input: string): void {
  console.log("Read JSON");
  console.log("Parse JSON");
  console.log("Validate records");
  console.log("Save records");
}
```

The workflow is duplicated, and changes may be applied inconsistently.

## Solution

``` ts
abstract class DataImporter {
  import(input: string): void {
    const records = this.parse(input);
    this.validate(records);
    this.save(records);
  }

  protected abstract parse(input: string): string[];

  protected validate(records: string[]): void {
    if (records.length === 0) throw new Error("No records to import");
    console.log(`Validated ${records.length} records`);
  }

  protected save(records: string[]): void {
    console.log(`Saved ${records.length} records`);
  }
}

class CsvImporter extends DataImporter {
  protected parse(input: string): string[] {
    return input.split("\n").filter(Boolean);
  }
}

class JsonImporter extends DataImporter {
  protected parse(input: string): string[] {
    const parsed: unknown = JSON.parse(input);

    if (!Array.isArray(parsed) ||
        !parsed.every((item) => typeof item === "string")) {
      throw new Error("Expected a JSON array of strings");
    }

    return parsed;
  }
}

new CsvImporter().import("alpha\nbeta");
new JsonImporter().import('["alpha","beta"]');
```

**Why it helps:** the base class guarantees the workflow sequence while
subclasses customize parsing.

**Use it for:** import pipelines, report generation, build steps.

**Trade-off:** inheritance is less flexible than composition when
behaviors need to be swapped dynamically.

------------------------------------------------------------------------

# 11. Visitor

**Category:** Behavioral

## Definition

Add operations to a set of object types without putting every operation
inside those types. Each element dispatches to the matching visitor
method.

## Problem without the pattern

``` ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

This union and switch can be excellent for a small system. But as
operations multiply, many functions may repeat the same type switch.

## Solution

``` ts
interface ShapeVisitor<T> {
  visitCircle(circle: Circle): T;
  visitRectangle(rectangle: Rectangle): T;
}

interface Shape {
  accept<T>(visitor: ShapeVisitor<T>): T;
}

class Circle implements Shape {
  constructor(public radius: number) {}

  accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitCircle(this);
  }
}

class Rectangle implements Shape {
  constructor(public width: number, public height: number) {}

  accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitRectangle(this);
  }
}

class AreaVisitor implements ShapeVisitor<number> {
  visitCircle(circle: Circle): number {
    return Math.PI * circle.radius ** 2;
  }

  visitRectangle(rectangle: Rectangle): number {
    return rectangle.width * rectangle.height;
  }
}

class DescriptionVisitor implements ShapeVisitor<string> {
  visitCircle(circle: Circle): string {
    return `Circle with radius ${circle.radius}`;
  }

  visitRectangle(rectangle: Rectangle): string {
    return `Rectangle ${rectangle.width} × ${rectangle.height}`;
  }
}

const shapes: Shape[] = [new Circle(2), new Rectangle(3, 4)];

for (const shape of shapes) {
  console.log(shape.accept(new AreaVisitor()));
  console.log(shape.accept(new DescriptionVisitor()));
}
```

**Why it helps:** new operations can be added as new visitors without
modifying every shape class.

**Use it for:** compiler ASTs, document structures, static analysis.

**Trade-off:** adding a new element type usually requires updating the
visitor interface and all concrete visitors.

------------------------------------------------------------------------

# Distinguish Similar Patterns

## Strategy vs State

-   **Strategy:** select an algorithm, often from configuration or
    caller preference.
-   **State:** current state determines valid behavior, and operations
    may transition to another state.

## Observer vs Mediator

-   **Observer:** a publisher notifies multiple subscribers about an
    event.
-   **Mediator:** a coordinator manages interactions among
    collaborators.

## Command vs Strategy

-   **Command:** represents a request; it may be queued, logged, or
    undone.
-   **Strategy:** represents an interchangeable algorithm.

## Template Method vs Strategy

-   **Template Method:** inheritance customizes steps in a fixed
    algorithm.
-   **Strategy:** composition swaps an algorithm implementation.

## Chain of Responsibility vs Mediator

-   **Chain of Responsibility:** a request passes through handlers in
    sequence.
-   **Mediator:** collaborators communicate through a central
    coordinator.

## Memento vs Command

-   **Memento:** stores a snapshot of state.
-   **Command:** stores an action; undo may reverse the action or
    restore a snapshot.

------------------------------------------------------------------------

# Pattern Selection Table

  Problem                                         Pattern to consider
  ----------------------------------------------- -------------------------
  Many handlers may process a request             Chain of Responsibility
  An action needs queuing, logging, or undo       Command
  A small grammar needs an expression tree        Interpreter
  Consumers need storage-independent traversal    Iterator
  Components have too many direct references      Mediator
  Encapsulated state must be restored             Memento
  Multiple subscribers react to an event          Observer
  Behavior depends on lifecycle state             State
  Algorithms need to be interchangeable           Strategy
  Workflows share a fixed sequence                Template Method
  Many operations apply to stable element types   Visitor

# TypeScript Practice Exercises

1.  **Chain of Responsibility:** Create an expense approval chain for a
    team lead, manager, and director.
2.  **Command:** Build shopping-cart history with add-item and
    remove-item commands.
3.  **Interpreter:** Evaluate boolean rules such as
    `isMember AND hasCoupon`.
4.  **Iterator:** Implement in-order iteration for a binary search tree.
5.  **Mediator:** Coordinate chat-room messages through a room object.
6.  **Memento:** Add undo support to a drawing model.
7.  **Observer:** Notify inventory, email, and analytics subscribers
    when an order is placed.
8.  **State:** Model a payment lifecycle: created, authorized, captured,
    refunded.
9.  **Strategy:** Support fixed-price, percentage, and free-shipping
    discounts.
10. **Template Method:** Build a report pipeline with CSV and HTML
    output.
11. **Visitor:** Add area, serialization, and debugging operations to an
    abstract syntax tree.

# Interview Checklist

For each pattern, explain:

1.  **Intent:** What does it do?
2.  **Problem:** What gets difficult without it?
3.  **Participants:** Which interfaces and classes collaborate?
4.  **Control flow:** Who calls whom, and when?
5.  **Trade-offs:** What complexity does it introduce?
6.  **Alternative:** Could a function, union type, composition, or
    simple conditional be clearer?
7.  **Real-world use:** Where would it fit in a production application?

## Final Takeaway

Behavioral patterns clarify **who is responsible for an action, how
objects communicate, and how behavior changes over time**. Recognize the
design problem first; choose a pattern only when it makes the system
easier to extend, test, or reason about.
