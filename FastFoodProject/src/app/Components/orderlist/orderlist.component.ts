import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-orderlist',
  templateUrl: './orderlist.component.html',
  styleUrls: ['./orderlist.component.css']
})
export class OrderlistComponent implements OnInit {
  userOrders: any[] = [];
  token: string | null = null;
  isLogoutModalVisible = false;
  isCancelModalVisible = false;
  orderIdToCancel: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    if (this.token) {
      this.fetchUserOrders(); // Fetch orders only if the token is available
    } else {
      console.error('No JWT token found');
      // Handle scenario when no token is available (e.g., redirect to login)
    }
  }

  async fetchUserOrders() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User not logged in');
      return;
    }

    try {
      if (this.isTokenExpired(this.token)) {
        console.error('Token expired');
        return;
      }

      const response = await axios.get(`http://localhost:5270/api/order/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      this.userOrders = response.data;
    } catch (error) {
      console.error('Error fetching user orders', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('Unauthorized access - Token might be invalid');
      }
    }
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  }

  downloadBill(orderId: number) {
    // Existing method code
  }

  goToHome() {
    this.router.navigate(['/userdash']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    this.isLogoutModalVisible = true;
  }

  confirmLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('cart');
    localStorage.removeItem('jwtToken');
    this.isLogoutModalVisible = false;
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.isLogoutModalVisible = false;
  }

  showProfile() {
    this.router.navigate(['/user-profile']);
  }

  showLogoutModal() {
    this.isLogoutModalVisible = true;
  }

  showCancelModal(orderId: number) {
    this.orderIdToCancel = orderId;
    this.isCancelModalVisible = true;
  }

  cancelCancelModal() {
    this.isCancelModalVisible = false;
    this.orderIdToCancel = null;
  }

  confirmCancelOrder() {
    if (this.orderIdToCancel === null) return;

    axios.delete(`http://localhost:5270/api/order/${this.orderIdToCancel}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    }).then(() => {
      this.fetchUserOrders();
      this.cancelCancelModal(); // Close the modal on successful cancellation
    }).catch(error => {
      alert('Error canceling order. Please try again.');
    });
  }

  cancelOrder(orderId: number) {
    this.showCancelModal(orderId);
  }
}
