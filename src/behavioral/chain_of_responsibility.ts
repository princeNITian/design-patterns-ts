/* Without chain of responsibility */
// Imagine a company where employees submit expense reimbursement requests.

function approveExpense(amount: number): void {
    if (amount < 5000) {
        console.log(`Expense of $${amount} approved by Team Lead.`);
    } else if (amount < 25000) {
        console.log(`Expense of $${amount} approved by Manager.`);
    } else if (amount < 100000) {
        console.log(`Expense of $${amount} approved by Director.`);
    } else {
        console.log(`Expense of $${amount} approved by CEO.`);
    }
}

/* With chain of responsibility */

abstract class ExpenseApprover {
    private nextApprover?: ExpenseApprover;

    setNext(approver: ExpenseApprover): ExpenseApprover {
        this.nextApprover = approver;
        return approver;
    }

    approve(amount: number): void {
        if (this.canApprove(amount)) {
            this.processApproval(amount);
        } else if (this.nextApprover) {
            this.nextApprover.approve(amount);
        } else {
            console.log(`Expense of $${amount} cannot be approved.`);
        }
    }

    protected abstract canApprove(amount: number): boolean;

    protected abstract processApproval(amount: number): void;
}

class TeamLead extends ExpenseApprover {
    protected canApprove(amount: number): boolean {
        return amount < 5000;
    }

    protected processApproval(amount: number): void {
        console.log(`Expense of $${amount} approved by Team Lead.`);
    }
}

class Manager extends ExpenseApprover {
    protected canApprove(amount: number): boolean {
        return amount < 25000;
    }

    protected processApproval(amount: number): void {
        console.log(`Expense of $${amount} approved by Manager.`);
    }
}

class Director extends ExpenseApprover {
    protected canApprove(amount: number): boolean {
        return amount < 100000;
    }

    protected processApproval(amount: number): void {
        console.log(`Expense of $${amount} approved by Director.`);
    }
}

class CEO extends ExpenseApprover {
    protected canApprove(amount: number): boolean {
        return true; // CEO can approve any amount
    }

    protected processApproval(amount: number): void {
        console.log(`Expense of $${amount} approved by CEO.`);
    }
}

// Usage
const teamLead = new TeamLead();
const manager = new Manager();
const director = new Director();
const ceo = new CEO();

teamLead.setNext(manager).setNext(director).setNext(ceo);

teamLead.approve(3000);   // Approved by Team Lead
teamLead.approve(20000);  // Approved by Manager
teamLead.approve(50000);  // Approved by Director
teamLead.approve(150000); // Approved by CEO    