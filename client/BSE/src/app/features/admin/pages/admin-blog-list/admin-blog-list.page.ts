import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '@/app/core/services/blog.service';
import { ToastService } from '@/app/core/services/toast.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@/app/shared/components/error-message/error-message.component';
import { PaginationComponent } from '@/app/shared/components/pagination/pagination.component';
import { BlogPost } from '@/app/core/models/blog/blog-post.model';

@Component({
  selector: 'app-admin-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    PaginationComponent
  ],
  templateUrl: './admin-blog-list.page.html',
  styleUrl: './admin-blog-list.page.css'
})
export class AdminBlogListPage implements OnInit {
  blogService = inject(BlogService);
  private toastService = inject(ToastService);

  deletingBlogId = signal<string | null>(null);

  ngOnInit(): void {
    this.blogService.loadBlogs();
  }

  confirmDelete(blog: BlogPost): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${blog.title}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      this.deleteBlog(blog.id);
    }
  }

  private deleteBlog(id: string): void {
    this.deletingBlogId.set(id);

    this.blogService.deleteBlog(id).subscribe({
      next: () => {
        this.toastService.success('Blog post deleted successfully', 'Deleted');
        this.deletingBlogId.set(null);
        // Reload the current page
        this.blogService.loadBlogs(this.blogService.currentPage());
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Failed to delete blog post',
          'Delete Failed'
        );
        this.deletingBlogId.set(null);
      }
    });
  }
}
