import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service'; // Adjust the path according to your project structure

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup; // Non-null assertion operator
  isModalVisible = false; // Modal visibility state
  successMessage: string = 'User Added Successfully';

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]{3,20}$')]],
      dob: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_]{4,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')]],
      role: ['User', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
      this.userService.registerUser(formData)
        .then(response => {
          console.log('User registration successful', response);
          this.signupForm.reset(); // Reset form after successful submission
          this.openModal(); // Open the success modal
        })
        .catch(error => {
          console.error('Error during user registration', error);
        });
    } else {
      console.error('Form is invalid');
    }
  }

  openModal(): void {
    this.isModalVisible = true; // Show the modal
  }

  closeModal(): void {
    this.isModalVisible = false; // Hide the modal
  }
}
