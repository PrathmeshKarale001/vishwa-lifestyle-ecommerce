# Vishwa Lifestyle: Review & Inventory System Guide

This guide explains how the newly implemented **Real Reviews** and **Automated Inventory** systems work, from a customer's purchase to admin moderation.

---

## 🛡️ 1. Automated Inventory Management
The inventory system ensures that stock levels are always accurate by linking successful payments directly to stock reduction.

### **The Workflow:**
1.  **Stock Setup**: You set initial stock levels in the **Sanity Studio** for each product (or individual size variant).
2.  **Order Placement**: When a customer completes a checkout and pays via CCAvenue, the system waits for the `payment_success` signal.
3.  **Automatic Deduction**: The moment payment is verified, the system:
    *   Identifies the product and variant purchased.
    *   Connects to the **Supabase Database**.
    *   Subtracts the purchased quantity from the current stock.
4.  **Sold Out Logic**:
    *   If stock reaches **0**, the "Add to Cart" button is automatically disabled.
    *   An "Out of Stock" badge appears on the product card.
    *   If stock is between **1 and 5**, a "Only X left" urgency badge is displayed.

> [!TIP]
> **Manual Overrides**: You can still manually adjust stock in Sanity if you restock or if a customer returns an item. The system will always use the latest number.

---

## ⭐ 2. Verified Reviews System
We implemented a "Verified Purchase" review system to ensure all feedback is authentic and trust-worthy.

### **The Customer Journey:**
1.  **Eligibility Check**: A customer can only see the "Write a Review" form if:
    *   They are logged in.
    *   They have a record of purchasing that specific product in your Supabase database.
2.  **Review Submission**: 
    *   Customers provide a star rating (1-5), a title, and their detailed feedback.
    *   **Status: Pending**: Once submitted, the review is hidden from the public site. It enters a "Pending" state for your approval.

### **The Admin Journey (Moderation):**
1.  **Dashboard**: Navigate to `/admin/reviews` (only accessible to users with the 'admin' role).
2.  **Moderation Actions**:
    *   **Approve**: Clicking approve will instantly show the review on the product page.
    *   **Reject**: Clicking reject will hide the review permanently.
3.  **Global Rating**: Approved reviews automatically update the product's "Average Rating" and "Review Count" displayed in the header and Quick View.

---

## 🛠️ How to Manage (Quick Links)

### **To Update Stock:**
*   Open **Sanity Studio** → Select **Product** → Edit **Inventory** field.

### **To Moderate Reviews:**
*   Go to: `[your-domain]/admin/reviews`
*   *Note: Ensure you are logged in with your admin account.*

---

## 🔒 Security Measures
*   **Tamper Proof**: Reviews cannot be submitted via the API without a valid user session and matching order history.
*   **Admin Protection**: The moderation dashboard uses server-side checks to prevent unauthorized access.
