import { BlogImageResponseDto } from "./blog-image-response.dto";

export interface BlogResponseDto {
    id:string;
    title:string;
    content:string;
    authorName:string;
    authorEmail:string;
    images: BlogImageResponseDto[];
}