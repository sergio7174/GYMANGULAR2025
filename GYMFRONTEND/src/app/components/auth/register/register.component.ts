import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { passwordMismatchValidator } from '../../../core/services/password-mismatch.directive';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../core/interfaces/auth/auth';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { bootstrapMailbox2Flag } from '@ng-icons/bootstrap-icons';
import { bootstrapKeyFill } from '@ng-icons/bootstrap-icons';
import { bootstrapPersonCircle } from '@ng-icons/bootstrap-icons';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ ReactiveFormsModule,
             CardModule,
             InputTextModule,
             CommonModule,
             PasswordModule,
             ButtonModule,
             NgIcon
],
providers: [provideIcons({ bootstrapMailbox2Flag, bootstrapKeyFill, bootstrapPersonCircle }),ToastrService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{

/********** trying to save image new procedure */
selectedFile: File | null = null;

// var to handle preview image
imagePreviewUrl: string = "";

// Declare the following property to inject the DestroyRef service:

private readonly destroyRef = inject(DestroyRef);

  // var to handle messages from backend about the register process
mensajeBackend:any=[];
dataUser:any=[];
newUser:any=[];

haveAdmin: any = '';

// inject services dependecies 
private readonly authService = inject(AuthService);
private readonly router = inject(Router);
private readonly toast = inject (ToastrService);

ngOnInit(): void { 
  
  // To call this function is for allowing the register option the first time
  // that the system runs to create the admin user, who will handle the admin section
  
  this.getThereIsAdmin();}

/*** Function to check if there is an Admin in database */
getThereIsAdmin() {

  this.authService.getAllAdmin().pipe(
    takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ( response:any ) => {

        const haveData = response;
        const HaveAdmin = haveData.haveAdmin;

        //alert("Estoy en login.component - line 86 - HaveAdmin:  "+HaveAdmin);

        if (HaveAdmin!='false') {
          this.haveAdmin = 'true';
        } else {
          this.haveAdmin = 'false';
          console.error('Error to get Admin Data.');
          this.toast.error('Error to get Admin Data.');
        }


      }}
    
  );
}




registerForm = new FormGroup(
  {
    fullName: new FormControl('', [Validators.required, Validators.min(3)]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/[a-z0-9\._%\+\-]+@[a-z0-9\.\-]+\.[a-z]{2,}$/),
    ]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    isAdmin: new FormControl('', [Validators.required]),
    image: new FormControl(this.selectedFile, [Validators.required,])
  },
  {
    validators: passwordMismatchValidator,
  }
);

onRegister() {

  /**** for testing purposes ************/
  try{
    if(this.registerForm.valid){
      alert('Profile form is valid');
    } else {
      alert('Profile form invalid');
    }
  } catch(error){}

 /**** End block for testing purposes */ 
 /**** Check if the form is invalid ****/

 if (this.registerForm.invalid) {
  this.toast.error('Error','Por favor, completa todos los campos requeridos.');
  return;
}

  const postData = { ...this.registerForm.value };
  delete postData.confirmPassword;
  this.authService.registerUser(postData as User,(this.selectedFile)).pipe(
    takeUntilDestroyed(this.destroyRef)).subscribe({
    next: (response) => {
        
        this.dataUser = response;
        this.mensajeBackend = this.dataUser.message;
        this.newUser = this.dataUser.newUser;

        alert("Estoy en register.component - line 101 - this.         mensajeBackend:  "+this.mensajeBackend);
        alert("Estoy en register.component - line 102 - this.newUser:  "
           +this.newUser);

      if (!this.newUser) {     
        if (this.mensajeBackend){
          this.toast.error(this.mensajeBackend);
        }}

 if (this.newUser) {
      this.toast.success('Registered successfully');
      this.registerForm.reset();
      // to reload page - I go to another page and later to the one that I want To go
    this.router.navigateByUrl('/home', {skipLocationChange: true})// first I go to /home
    .then(() => this.router.navigate(['register'])); // then I go to /register page
      console.log(response);
    }},
    error: (err) => {
      console.log(err);
  
      this.toast.error('Something went wrong');
    },
  });
}

get fullName() {
  return this.registerForm.controls['fullName'];
}

get email() {
  return this.registerForm.controls['email'];
}

get password() {
  return this.registerForm.controls['password'];
}

get confirmPassword() {
  return this.registerForm.controls['confirmPassword'];
}

get isAdmin() {
  return this.registerForm.controls['isAdmin'];
}

get image() { return this.registerForm.controls['image'];}

  changeImg(event:any) {this.selectedFile = event.target.files[0];

    // this is to show the image preview in vomponent view
    if (this.selectedFile) {
      // The FileReader API reads the file as a data URL, which is a string representation of the image data.
      const reader = new FileReader();
        reader.onload = (event:any) => {
          this.imagePreviewUrl = event.target.result as string; };
        reader.readAsDataURL(this.selectedFile);
      }
    }



}




