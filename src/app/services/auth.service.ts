import { Injectable, NgZone  } from '@angular/core';
import { User } from "./../classes/user";
//import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { auth } from 'firebase';
import { map } from '@firebase/util';
import { Observable } from 'rxjs';


@Injectable()
export class AuthService {
/*
fonte: https://www.positronx.io/full-angular-7-firebase-authentication-system/
*/

  userData: any; // Save logged in user data

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,  
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) { 
    // Saving user data in localstorage when 
    //logged in and setting up null when logged out
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        //this.userData.uid
        //this.userData.escola = "Escolinha Nene"
        //console.log("Escola "+this.userData.escola)

        localStorage.setItem('myclinica_user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('myclinica_user'));

        this.SetUserDataLocal(user.uid);

        this.router.navigate(['/dashboard']);
        console.log("logado");
      } else {
        localStorage.setItem('myclinica_user', null);
        JSON.parse(localStorage.getItem('myclinica_user'));
        this.router.navigate(['/']);
        console.log("deslogado");
      }
    })
  }

    //Fazer login com email/senha 
    // Sign in with email/password
    SignIn(email: string, password: string) {
      return this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then((result) => {
          this.ngZone.run(() => {
            this.SetUserData(result.user);
            this.router.navigate(['/dashboard']);
          });
          
        }).catch((error) => {
          console.log("DEU ERRO: " + error.message)
          
          //window.alert(error.message)
        })
    }

    
   //Criar conta com email/senha 
  // Sign up with email/password
  SignUp(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        // Call the SendVerificaitonMail() function when new user sign 
        //up and returns promise 
        this.SendVerificationMail();
        this.SetUserData(result.user);
      }).catch((error) => {
        window.alert(error.message)
      })
  }

   // Send email verfificaiton when new user sign up
   SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email-address']);
    })
  }

   // Reset Forggot password
   ForgotPassword(passwordResetEmail) {
    return this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email sent, check your inbox.');
    }).catch((error) => {
      window.alert(error)
    })
  }

    // Returns true when user is looged in and email is verified
    get isLoggedIn(): boolean {
      const user = JSON.parse(localStorage.getItem('myclinica_user'));
      return (user !== null && user.emailVerified !== false) ? true : false;
    }

    //Returns user info
    get get_clinica_id(): string {
      const user = JSON.parse(localStorage.getItem('myclinica_user'));
      return user.clinica_id;
    }

    //Returns user info
    get get_clinica_nome(): string {
      const user = JSON.parse(localStorage.getItem('myclinica_user'));
      return user.clinica;
    }

    get get_user_displayName(): string {
      const user = JSON.parse(localStorage.getItem('myclinica_user'));
      return user.displayName;
    }

    get get_uid(): string {
      const user = JSON.parse(localStorage.getItem('myclinica_user'));
      return user.uid;
    }

    get get_perfil(): string{
      const user = JSON.parse(localStorage.getItem('myclinica_user'));
      return user.perfil;
    }

    //get User
    get get_user(): User {
      //const user = 
      return JSON.parse(localStorage.getItem('myclinica_user')) as User ;
    }

    // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
    .then((result) => {
       this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        })
      this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  //Setting up user data when sign in with username/password, 
  //sign up with username/password and sign in with social auth  
  //provider in Firestore database using AngularFirestore + AngularFirestoreDocument service
  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      clinica: user.clinica,
      perfil: user.perfil,
      clinica_id: user.clinica_id,
      endereco: user.endereco,
      cidade: user.cidade,
      provincia: user.provincia,
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  //gravar dados do user no localstorage
  itemDoc: AngularFirestoreDocument<string>;
  item: Observable<string>;
  SetUserDataLocal(uid) {
    this.itemDoc = this.afs.doc('users/'+uid);
    this.item = this.itemDoc.valueChanges();

    console.log("uid: "+uid)

    this.itemDoc.ref.get().then(function(doc) {
      if (doc.exists) {
        var invoice = doc.data();
        console.log('Invoice data: ', doc.data());
        localStorage.setItem('myclinica_user', JSON.stringify(doc.data()));
      }else{
        console.log("user not finded")
        //localStorage.setItem('myclinica_user', JSON.stringify(doc.data()));
      }
    })
  }
  /*
  addItem(name: string) {
    // Persist a document id
    const id = this.afs.createId();
    const item: Item = { id, name };
    this.itemsCollection.doc(id).set(item);
  }
  */

   // Sign out 
   SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('myclinica_user');
      localStorage.removeItem('myclinica_user');
      this.router.navigate(['sign-in']);
    })
  }

  // Regras de autorizacao
  ///// Role-based Authorization //////

  canRead(user: User): boolean {
    const allowed = ['admin', 'editor', 'subscriber']
    return this.checkAuthorization(user, allowed)
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'editor']
    return this.checkAuthorization(user, allowed)
  }

  canDelete(user: User): boolean {
    const allowed = ['admin']
    return this.checkAuthorization(user, allowed)
  }

  // determines if user has matching role
private checkAuthorization(user: User, allowedRoles: string[]): boolean {
  if (!user) return false
  for (const role of allowedRoles) {
    if ( user.perfil[role] ) {
      return true
    }
  }
  return false
}

}
