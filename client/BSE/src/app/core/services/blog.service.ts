import { Injectable, signal, computed } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpService } from './http.service';
import { BlogResponseDto } from '../models/blog/blog-response.dto';
import { PaginatedResponseDto } from '../models/PaginatedResponseDto';
import { BlogPost } from '../models/blog/blog-post.model';

@Injectable({
  providedIn: 'root' 
})
export class BlogService {
  private readonly BACKEND_URL = 'http://localhost:5006';

  constructor(private http: HttpService) {}

  private blogsSignal = signal<BlogPost[]>([]);

  private currentPageSignal = signal<number>(1);

  private totalPagesSignal = signal<number>(1);

  private isLoadingSignal = signal<boolean>(false);


  private errorSignal = signal<string | null>(null);

  blogs = this.blogsSignal.asReadonly();

  currentPage = this.currentPageSignal.asReadonly();

  totalPages = this.totalPagesSignal.asReadonly();

  isLoading = this.isLoadingSignal.asReadonly();

  error = this.errorSignal.asReadonly();

  hasNextPage = computed(() =>
    this.currentPageSignal() < this.totalPagesSignal()
  );

  hasPreviousPage = computed(() =>
    this.currentPageSignal() > 1
  );

  loadBlogs(page: number = 1, pageSize: number = 6): void {
    // Set loading state
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    // Build query parameters
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Make HTTP GET request
    this.http.get<PaginatedResponseDto<BlogResponseDto>>('blogs', params)
      .pipe(
        // Transform: DTO -> Model
        map(response => ({
          ...response,
          items: response.items.map(this.mapDtoToModel)
        })),
        // Side effect: Update signals
        tap(response => {
          this.blogsSignal.set(response.items);
          this.currentPageSignal.set(response.page);
          this.totalPagesSignal.set(response.totalPages);
          this.isLoadingSignal.set(false);
        })
      )
      .subscribe({
        error: (err) => {
          this.errorSignal.set(err.message || 'Failed to load blogs');
          this.isLoadingSignal.set(false);
        }
      });
  }

  getBlogById(id: string): Observable<BlogPost> {
    return this.http.get<BlogResponseDto>(`blogs/${id}`)
      .pipe(map(this.mapDtoToModel));
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadBlogs(this.currentPageSignal() + 1);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.loadBlogs(this.currentPageSignal() - 1);
    }
  }

  createBlog(formData: FormData): Observable<BlogPost> {
    return this.http.post<FormData, BlogResponseDto>('blogs', formData)
      .pipe(map(this.mapDtoToModel));
  }

  updateBlog(id: string, formData: FormData): Observable<BlogPost> {
    return this.http.put<FormData, BlogResponseDto>(`blogs/${id}`, formData)
      .pipe(map(this.mapDtoToModel));
  }

  deleteBlog(id: string): Observable<void> {
    return this.http.delete<void, void>(`blogs/${id}`);
  }

  private mapDtoToModel = (dto: BlogResponseDto): BlogPost => {
    return {
      id: dto.id,
      title: dto.title,
      content: dto.content,
      // Create excerpt from content (first 150 chars + ...)
      excerpt: dto.content.length > 150
        ? dto.content.substring(0, 150) + '...'
        : dto.content,
      authorName: dto.authorName,
      authorEmail: dto.authorEmail,
      // Map image DTOs to models, prepending backend URL if relative
      images: dto.images.map(img => ({
        id: img.id.toString(),
        url: this.getFullImageUrl(img.imageUrl),
        // Fallback to blog title if no alt text
        altText: dto.title,
        caption: ''
      }))
    };
  };

  private getFullImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('/')) {
      return `${this.BACKEND_URL}${imageUrl}`;
    }
    return imageUrl;
  }
}
