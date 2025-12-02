import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '@/app/core/services/blog.service';
import { ToastService } from '@/app/core/services/toast.service';
import { BlogFormComponent } from '../../components/blog-form/blog-form.component';

@Component({
  selector: 'app-create-blog',
  standalone: true,
  imports: [BlogFormComponent],
  templateUrl: './create-blog.page.html'
})
export class CreateBlogPage {
  private router = inject(Router);
  private blogService = inject(BlogService);
  private toastService = inject(ToastService);

  isLoading = signal(false);

  onSubmit(formData: FormData): void {
    this.isLoading.set(true);

    this.blogService.createBlog(formData).subscribe({
      next: (blog) => {
        this.toastService.success('Blog post created successfully!', 'Success');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to create blog post',
          'Error'
        );
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }
}
