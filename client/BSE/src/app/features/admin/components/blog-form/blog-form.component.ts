import { Component, OnInit, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogPost } from '@/app/core/models/blog/blog-post.model';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './blog-form.component.html'
})
export class BlogFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  blog = input<BlogPost | null>(null);
  isLoading = input<boolean>(false);

  formSubmit = output<FormData>();
  cancel = output<void>();

  blogForm!: FormGroup;
  selectedFiles: File[] = [];

  ngOnInit(): void {
    // Initialize form
    this.blogForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]]
    });

    // If editing, prefill form
    if (this.blog()) {
      this.blogForm.patchValue({
        title: this.blog()!.title,
        content: this.blog()!.content
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  clearFiles(event: Event): void {
    event.stopPropagation(); // Prevent triggering file input click
    this.selectedFiles = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }

    // Create FormData (for multipart/form-data)
    const formData = new FormData();
    formData.append('title', this.blogForm.get('title')?.value);
    formData.append('content', this.blogForm.get('content')?.value);

    // Append all selected files
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Emit to parent component
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
