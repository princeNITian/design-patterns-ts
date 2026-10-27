"use strict";
/* Without chain of responsibility */
// Imagine a company where employees submit expense reimbursement requests.
Object.defineProperty(exports, "__esModule", { value: true });
function approveExpense(amount) {
    if (amount < 5000) {
        console.log(`Expense of $${amount} approved by Team Lead.`);
    }
    else if (amount < 25000) {
        console.log(`Expense of $${amount} approved by Manager.`);
    }
    else if (amount < 100000) {
        console.log(`Expense of $${amount} approved by Director.`);
    }
    else {
        console.log(`Expense of $${amount} approved by CEO.`);
    }
}
class ExpenseApprover {
    nextApprover;
    setNext(approver) {
        this.nextApprover = approver;
        return approver;
    }
    approve(amount) {
        if (this.canApprove(amount)) {
            this.processApproval(amount);
        }
        else if (this.nextApprover) {
            this.nextApprover.approve(amount);
        }
        else {
            console.log(`Expense of $${amount} cannot be approved.`);
        }
    }
}
class TeamLead extends ExpenseApprover {
    canApprove(amount) {
        return amount < 5000;
    }
    processApproval(amount) {
        console.log(`Expense of $${amount} approved by Team Lead.`);
    }
}
class Manager extends ExpenseApprover {
    canApprove(amount) {
        return amount < 25000;
    }
    processApproval(amount) {
        console.log(`Expense of $${amount} approved by Manager.`);
    }
}
class Director extends ExpenseApprover {
    canApprove(amount) {
        return amount < 100000;
    }
    processApproval(amount) {
        console.log(`Expense of $${amount} approved by Director.`);
    }
}
class CEO extends ExpenseApprover {
    canApprove(amount) {
        return true; // CEO can approve any amount
    }
    processApproval(amount) {
        console.log(`Expense of $${amount} approved by CEO.`);
    }
}
// Usage
const teamLead = new TeamLead();
const manager = new Manager();
const director = new Director();
const ceo = new CEO();
teamLead.setNext(manager).setNext(director).setNext(ceo);
teamLead.approve(3000); // Approved by Team Lead
teamLead.approve(20000); // Approved by Manager
teamLead.approve(50000); // Approved by Director
teamLead.approve(150000); // Approved by CEO    
