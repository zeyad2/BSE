import { BlogImage } from './blog-image.model';

export interface BlogPost {
  id: string;

  title: string;

  content: string;

  excerpt?: string;

  authorName: string;

  authorEmail: string;

  images: BlogImage[];

  createdAt?: Date;

  updatedAt?: Date;
}
