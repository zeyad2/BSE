import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '@/app/core/services/blog.service';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';
import { PaginationComponent } from '@/app/shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@/app/shared/components/error-message/error-message.component';
@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    BlogCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './blog-list.page.html'
})
export class BlogListPage implements OnInit {
  
  blogService = inject(BlogService);
  ngOnInit(): void {
    this.blogService.loadBlogs();
  }
}
