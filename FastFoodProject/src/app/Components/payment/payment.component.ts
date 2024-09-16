import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  selectedItem: any;
  token: string | null = null;
  error: string | null = null;
  paymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };
  isProcessing = false; // Flag to prevent multiple clicks

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');

    // Get the selected food item from local storage
    const storedItem = localStorage.getItem('selectedFoodItem');
    if (storedItem) {
      this.selectedItem = JSON.parse(storedItem);
    } else {
      this.router.navigate(['/userdash']); // Redirect if no item selected
    }
  }

  async payNow() {
    if (this.isProcessing) return; // Prevent multiple clicks
    this.isProcessing = true; // Set processing flag

    if (!this.selectedItem || !this.token) {
      this.error = 'Payment cannot be processed. Try again.';
      this.isProcessing = false; // Reset processing flag
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.error = 'User not logged in. Please log in first.';
        this.isProcessing = false; // Reset processing flag
        return;
      }

      // Order creation after payment
      const orderCreateModel = {
        orderNumber: `ORD-${new Date().getTime()}`, // Generate a unique order number
        totalPrice: this.selectedItem.price,
        orderTime: new Date().toISOString(),
        status: 'Pending',
        userId: userId,
        foodItemIds: [this.selectedItem.id]
      };

      const response = await axios.post('http://localhost:5270/api/order', orderCreateModel, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      // Navigate to the order confirmation page
      this.router.navigate(['/order-confirmation', response.data.id]);
    } catch (error) {
      this.error = 'Error processing payment. Please try again.';
    } finally {
      this.isProcessing = false; // Reset processing flag
    }
  }

  cancelPayment() {
    this.router.navigate(['/userdash']);
  }
}
