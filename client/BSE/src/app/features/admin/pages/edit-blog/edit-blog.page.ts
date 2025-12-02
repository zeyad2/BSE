import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogService } from '@/app/core/services/blog.service';
import { ToastService } from '@/app/core/services/toast.service';
import { BlogFormComponent } from '../../components/blog-form/blog-form.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@/app/shared/components/error-message/error-message.component';
import { BlogPost } from '@/app/core/models/blog/blog-post.model';

@Component({
  selector: 'app-edit-blog',
  standalone: true,
  imports: [CommonModule, BlogFormComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './edit-blog.page.html'
})
export class EditBlogPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private toastService = inject(ToastService);

  blog = signal<BlogPost | null>(null);
  isLoadingBlog = signal(true);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Blog ID not found');
      this.isLoadingBlog.set(false);
      return;
    }

    // Load blog data
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blog.set(blog);
        this.isLoadingBlog.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load blog post');
        this.isLoadingBlog.set(false);
      }
    });
  }

  onSubmit(formData: FormData): void {
    const id = this.blog()?.id;
    if (!id) return;

    this.isSubmitting.set(true);

    this.blogService.updateBlog(id, formData).subscribe({
      next: (blog) => {
        this.toastService.success('Blog post updated successfully!', 'Success');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to update blog post',
          'Error'
        );
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }
}
