import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '@/app/core/services/blog.service';
import { BlogPost } from '@/app/core/models/blog/blog-post.model';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@/app/shared/components/error-message/error-message.component';


@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './blog-detail.page.html'
})
export class BlogDetailPage implements OnInit {
  private route = inject(ActivatedRoute);

  private blogService = inject(BlogService);

  blog = signal<BlogPost | null>(null);

  isLoading = signal<boolean>(true);

  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Validate ID exists
    if (!id) {
      this.error.set('Blog ID not found');
      this.isLoading.set(false);
      return;
    }

    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        // Success: Set blog data and stop loading
        this.blog.set(blog);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Error: Set error message and stop loading
        this.error.set(err.message || 'Failed to load blog post');
        this.isLoading.set(false);
      }
    });
  }
}
