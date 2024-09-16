import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-manageitems',
  templateUrl: './manageitems.component.html',
  styleUrls: ['./manageitems.component.css']
})
export class ManageitemsComponent implements OnInit {
  foodItems: any[] = [];
  filteredItems: any[] = [];
  foodTypes: string[] = [];
  selectedFoodType: string | null = null;
  showAddItemForm: boolean = false;
  editingItem: any = null; // For editing existing items
  token: any;
  showDeleteConfirmation: boolean = false;
  itemToDelete: any = null;
  notification: { message: string, type: string } | null = null; // Add type for notification
  menuVisible = true;
  showLogoutModal = false;

  newItem: any = {
    name: '',
    description: '',
    price: 0.0,
    imgUrl: '',
    foodType: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('jwtToken');
    this.loadFoodItems();
    this.showDeleteConfirmation = false; 
  }

  async loadFoodItems() {
    try {
      const response = await axios.get('http://localhost:5270/api/fooditems', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      this.foodItems = response.data;
      this.filteredItems = this.foodItems;
      this.extractFoodTypes();
    } catch (error) {
      console.error('Error loading food items', error);
    }
  }

  extractFoodTypes() {
    const types = new Set(this.foodItems.map(item => item.foodType));
    this.foodTypes = Array.from(types);
  }

  filterItemsByType(type: string | null) {
    this.selectedFoodType = type;
    this.filteredItems = type
      ? this.foodItems.filter(item => item.foodType === type)
      : this.foodItems;
  }

  toggleAddItemForm(editingItem: any = null) {
    this.showAddItemForm = !this.showAddItemForm;
    if (editingItem) {
      this.editingItem = editingItem;
      this.newItem = { ...editingItem };
    } else {
      this.resetForm();
    }
  }

  async addOrUpdateItem() {
    try {
      if (this.editingItem) {
        await axios.put(`http://localhost:5270/api/fooditems/${this.editingItem.id}`, this.newItem, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.notification = { message: 'Item updated successfully', type: 'success' };
      } else {
        const response = await axios.post('http://localhost:5270/api/FoodItems', this.newItem, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.foodItems.push(response.data); // Add new item to the list
        this.notification = { message: 'Item added successfully', type: 'success' };
      }

      this.loadFoodItems();
      this.resetForm();
      this.showNotification();
    } catch (error) {
      console.error('Error adding/updating item:', error);
      this.notification = { message: 'Error occurred', type: 'error' };
      this.showNotification();
    }
  }

  showNotification() {
    setTimeout(() => {
      this.notification = null; // Hide notification after 3 seconds
    }, 3000);
  }

  async deleteItem(id: number) {
    this.itemToDelete = id;
    this.showDeleteConfirmation = true;  // Show confirmation modal when delete is clicked
  }

  async confirmDelete() {
    if (this.itemToDelete) {
      try {
        await axios.delete(`http://localhost:5270/api/fooditems/${this.itemToDelete}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.loadFoodItems();
        this.itemToDelete = null;  // Clear item to delete
        this.showDeleteConfirmation = false;  // Close confirmation modal
        this.notification = { message: 'Item deleted successfully', type: 'success' };
        this.showNotification();
      } catch (error) {
        console.error('Error deleting food item', error);
        this.notification = { message: 'Error occurred', type: 'error' };
        this.showNotification();
      }
    }
  }

  cancelDelete() {
    this.itemToDelete = null;  // Clear item to delete
    this.showDeleteConfirmation = false;  // Close confirmation modal
  }

  getImageUrl(imgUrl: string): string {
    // Modify the logic if you have a base path or need to prepend something
    return imgUrl;
  }

  resetForm() {
    this.newItem = {
      name: '',
      description: '',
      price: 0.0,
      imgUrl: '',
      foodType: ''
    };
    this.editingItem = null;
  }

  navigateToAdminDash() {
    this.router.navigate(['/admindash']);
  }

  logout() {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    // Perform the logout action
    localStorage.removeItem('jwtToken'); // Remove the token from localStorage
    this.router.navigate(['/login']); // Redirect to the login page
    this.showLogoutModal = false; // Close the modal after logout
  }
}
