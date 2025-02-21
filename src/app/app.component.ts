
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sportiq';
  dataToUpload : any = "";
  // fileService : CouchDbService = inject(CouchDbService);

  ngOnInit(){
    console.log("Initialized");
  }
  formValue : any = "";
  readonly apiUrl = 'http://localhost:3000'; // Backend URL

  constructor(readonly http: HttpClient, readonly sanitizer: DomSanitizer) { }

  // Encrypt file
  encryptFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/encrypt`, formData);
  }

  // Decrypt file
  decryptFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    for (const [key, value] of (formData as any).entries()) {
      console.log(key, value);
    }
    
    
    console.log("Form Data");
    console.log(file);
    return this.http.post(`${this.apiUrl}/decrypt`, formData,{
      responseType: 'blob'  // <------ Ensure response is treated as a binary file, not JSON

    });
  }

  selectedFile: File | null = null;
  decryptedFileUrl: SafeUrl | null = null;
  fileType: string | null = null;


  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onEncrypt(): void {
    if (this.selectedFile) {
      this.encryptFile(this.selectedFile).subscribe(response => {
        console.log('Encrypted fileeee:', response);
        this.formValue = response
        this.dataToUpload = response.encryptedData;
        // this.fileService.addNewFile(this.dataToUpload).subscribe({
        //   next : () => {
        //     console.log("Success");
        //   },
        //   error : () => {
        //     console.log("Error");
            
        //   }
        // });
      });
    }
  }

  onDecrypt(): void {
    if (this.selectedFile) {
      this.decryptFile(this.selectedFile).subscribe(blob => {
        console.log('Decryption successful:', blob);
  
        // Determine MIME type based on file extension
        const fileExtension = this.selectedFile?.name.split('.').pop()?.toLowerCase();
        
        // Convert to a Blob with correct MIME type
        // const blob = new Blob([response], { type: mimeType });
  
        // Generate Blob URL
        const objectUrl = URL.createObjectURL(blob);
        this.decryptedFileUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  
        // Log results
        console.log("Decrypted File URL:", this.decryptedFileUrl);
        console.log("Blob URL Pasted:", objectUrl);
  
        // Detect file type
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension!)) {
          this.fileType = 'image';
        } else if (fileExtension === 'pdf') {
          this.fileType = 'pdf';
        } else {
          this.fileType = 'other';
        }
        console.log("Decrypted File URL:", objectUrl);
      }, error => {
        console.error('Decryption error:', error);
      });
    }
  }
}
